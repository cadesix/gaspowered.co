import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface BrandImage {
  url: string;
  base64: string;
  mimeType: string;
}

interface AnalyzedImage extends BrandImage {
  description: string;
}

/* ═══════════════════════════════════════════
   BRAND ASSET EXTRACTION
   ═══════════════════════════════════════════ */

function extractColors(html: string): string[] {
  const colorCounts = new Map<string, number>();

  const addColor = (hex: string, weight: number) => {
    const normalized = hex.toLowerCase();
    colorCounts.set(normalized, (colorCounts.get(normalized) || 0) + weight);
  };

  // Theme color meta tag (highest weight)
  const themeColor = html.match(
    /<meta[^>]*name=["']theme-color["'][^>]*content=["'](#[0-9a-fA-F]{3,8})["']/i,
  )?.[1];
  if (themeColor) addColor(themeColor, 10);

  // CSS variables matching brand-related names
  const cssVarPattern =
    /--(primary|brand|accent|secondary|main|highlight)[^:]*:\s*(#[0-9a-fA-F]{3,8})/gi;
  let match;
  while ((match = cssVarPattern.exec(html)) !== null) {
    addColor(match[2], 5);
  }

  // All hex colors from style tags and inline styles
  const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const inlineStyles = html.match(/style=["'][^"']*["']/gi) || [];
  const allStyleText = [...styleBlocks, ...inlineStyles].join(" ");

  const hexPattern = /#([0-9a-fA-F]{6})\b/g;
  while ((match = hexPattern.exec(allStyleText)) !== null) {
    addColor(match[0], 1);
  }

  // Filter out near-black and near-white
  const isNearBlackOrWhite = (hex: string): boolean => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const brightness = (r + g + b) / 3;
    return brightness < 25 || brightness > 230;
  };

  return Array.from(colorCounts.entries())
    .filter(([hex]) => hex.length === 7 && !isNearBlackOrWhite(hex))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hex]) => hex);
}

function extractImageUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const decodeEntities = (s: string) =>
    s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

  const resolve = (src: string): string | null => {
    if (!src || src.startsWith("data:")) return null;
    try {
      return new URL(decodeEntities(src), baseUrl).href;
    } catch {
      return null;
    }
  };

  // Deduplicate by base image path (ignore query params for uniqueness)
  const getImageKey = (url: string): string => {
    try {
      const u = new URL(url);
      return u.origin + u.pathname;
    } catch {
      return url;
    }
  };

  const add = (url: string | null) => {
    if (!url) return;
    const key = getImageKey(url);
    if (seen.has(key)) return;
    seen.add(key);
    urls.push(url);
  };

  // og:image first
  const ogImage = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i,
  )?.[1];
  add(resolve(ogImage || ""));

  // Parse <img> tags
  const imgPattern = /<img[^>]*>/gi;
  let match;
  while ((match = imgPattern.exec(html)) !== null) {
    const tag = match[0];

    // Skip tracking pixels and tiny images
    const src =
      tag.match(/src=["']([^"']+)["']/i)?.[1] ||
      tag.match(/data-src=["']([^"']+)["']/i)?.[1];

    if (src) {
      if (/tracking|pixel|spacer|1x1/i.test(src)) continue;
      if (src.startsWith("data:image/svg")) continue;
    }

    const width = parseInt(tag.match(/width=["']?(\d+)/i)?.[1] || "999", 10);
    const height = parseInt(tag.match(/height=["']?(\d+)/i)?.[1] || "999", 10);
    if (width < 50 || height < 50) continue;

    // Prefer a mid-resolution srcset entry over the full-res src
    const srcsetMatch = tag.match(/srcset=["']([^"']+)["']/i)?.[1];
    let bestUrl: string | null = null;

    if (srcsetMatch) {
      // Parse srcset: "url1 512w, url2 1024w, url3 2048w"
      const entries = decodeEntities(srcsetMatch)
        .split(",")
        .map((e) => e.trim().split(/\s+/))
        .filter((parts) => parts.length >= 2)
        .map(([url, descriptor]) => ({
          url,
          width: parseInt(descriptor) || 0,
        }))
        .filter((e) => e.width > 0)
        .sort((a, b) => a.width - b.width);

      // Pick the smallest entry >= 512px, or the largest available
      const midRes = entries.find((e) => e.width >= 512) || entries[entries.length - 1];
      if (midRes) bestUrl = resolve(midRes.url);
    }

    if (!bestUrl && src) {
      bestUrl = resolve(src);
    }

    add(bestUrl);
    if (urls.length >= 15) break;
  }

  return urls.slice(0, 15);
}

async function downloadImages(urls: string[]): Promise<BrandImage[]> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, {
        headers: { "User-Agent": BROWSER_UA },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) throw new Error("Not an image");

      const buffer = Buffer.from(await res.arrayBuffer());

      // Skip too small (<3KB) or too large (>2MB)
      if (buffer.length < 3 * 1024) throw new Error("Image too small");
      if (buffer.length > 2 * 1024 * 1024) throw new Error("Image too large");

      const base64 = buffer.toString("base64");
      const mimeType = contentType.split(";")[0].trim();

      return { url, base64, mimeType };
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<BrandImage> => r.status === "fulfilled",
    )
    .map((r) => r.value);
}

async function analyzeImages(images: BrandImage[]): Promise<AnalyzedImage[]> {
  if (images.length === 0) return [];

  const batchSize = 5;
  const analyzed: AnalyzedImage[] = [];

  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);

    const parts: Record<string, unknown>[] = [];
    for (const img of batch) {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.base64 },
      });
    }
    parts.push({
      text: `Describe each of the ${batch.length} images above in detail. For each image, describe:
- What it shows (product, person, logo, lifestyle scene, etc.)
- Physical attributes: shape, material, colors, textures
- Any visible text, branding, or labels (transcribe exactly)
- Size/proportions relative to other elements

Return JSON: { "descriptions": ["detailed description 1", "detailed description 2", ...] }
Return ONLY valid JSON.`,
    });

    try {
      const res = await fetch(
        `${GEMINI_API}/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );

      if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);
      const descriptions: string[] = parsed.descriptions || [];

      for (let j = 0; j < batch.length; j++) {
        analyzed.push({
          ...batch[j],
          description: descriptions[j] || "Brand image",
        });
      }
    } catch {
      // On failure, add images without descriptions
      for (const img of batch) {
        analyzed.push({ ...img, description: "Brand image" });
      }
    }
  }

  return analyzed;
}

/* ═══════════════════════════════════════════
   WEBSITE SCRAPING
   ═══════════════════════════════════════════ */

async function scrapeWebsite(url: string) {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const res = await fetch(normalizedUrl, {
    headers: { "User-Agent": BROWSER_UA },
    signal: AbortSignal.timeout(10000),
  });

  const html = await res.text();

  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  const description =
    html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i,
    )?.[1] ||
    html.match(
      /<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i,
    )?.[1] ||
    "";
  const ogImage =
    html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i,
    )?.[1] || "";
  const ogTitle =
    html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i,
    )?.[1] || "";

  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);

  const colors = extractColors(html);
  const imageUrls = extractImageUrls(html, normalizedUrl);

  return {
    url: normalizedUrl,
    title: ogTitle || title,
    description,
    ogImage,
    bodyText,
    colors,
    imageUrls,
  };
}

/* ═══════════════════════════════════════════
   AD CONCEPT GENERATION
   ═══════════════════════════════════════════ */

async function generateAdConcepts(
  siteData: {
    url: string;
    title: string;
    description: string;
    ogImage: string;
    bodyText: string;
  },
  brandAssets?: { colors: string[]; images: AnalyzedImage[] },
) {
  const parts: Record<string, unknown>[] = [];

  // Include up to 5 key brand images so the LLM can SEE the brand
  if (brandAssets?.images.length) {
    const keyImages = brandAssets.images.slice(0, 5);
    for (const img of keyImages) {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.base64 },
      });
    }
  }

  // Build catalog of all available images
  let imageCatalog = "";
  if (brandAssets?.images.length) {
    imageCatalog = `\n\nAvailable brand reference images (by number):
${brandAssets.images.map((img, i) => `  ${i}: ${img.description}`).join("\n")}

For each prompt, select which reference images (by number) should be used as visual references during image generation. Pick the most relevant 1-3 images per prompt.`;
  }

  let colorContext = "";
  if (brandAssets?.colors.length) {
    colorContext = `\n\nBrand color palette: ${brandAssets.colors.join(", ")}
Use these colors in your creative direction.`;
  }

  parts.push({
    text: `You are an elite advertising creative director at a top agency. Analyze this website/brand and create 4 compelling ad creative concepts that would perform well as paid social ads.

Website: ${siteData.url}
Title: ${siteData.title}
Description: ${siteData.description}
Content excerpt: ${siteData.bodyText.slice(0, 2000)}${colorContext}${imageCatalog}

${brandAssets?.images.length ? "Above are real images from the brand's website. Study them carefully — you need to understand exactly what the product looks like so you can describe it precisely in each ad prompt." : ""}

Think deeply about:
- The brand's core value proposition and what makes it unique
- Emotional triggers that drive purchase intent for this category
- Visual styles that perform well in paid social (bold, eye-catching, thumb-stopping)
- Different audience segments and what resonates with each
- Proven ad frameworks: before/after, social proof, urgency, aspiration, problem-solution

Return your response as JSON with this exact format:
{
  "insights": [
    "Short punchy bullet about the brand analysis or ad strategy",
    "Another concise insight",
    ... (3-5 total)
  ],
  "productDescription": "A precise physical description of the brand's main product(s) as seen in the reference images. Include: exact shape, materials, colors, any text/labels visible on packaging, size proportions. This will be used to instruct an image generation model, so be extremely specific. Example: 'A slim 12oz aluminum can with matte black finish, featuring the word JOGGY in bold white sans-serif capitals, with a green leaf accent above the J. The can has a green gradient band at the bottom.'",
  "prompts": [
    "Detailed image generation prompt 1",
    "Detailed image generation prompt 2",
    "Detailed image generation prompt 3",
    "Detailed image generation prompt 4"
  ]${
    brandAssets?.images.length
      ? `,
  "imageSelections": [
    [0, 2],
    [1],
    [0, 3],
    [2, 4]
  ]`
      : ""
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or other text.

Each insight should be one concise sentence summarizing a key observation about the brand, audience, or creative strategy.

"productDescription" MUST be based on what you actually see in the reference images above. Describe the real product precisely — shape, packaging type, colors, branding/text, materials. Do NOT invent or guess product details. If you can see multiple products, describe each.

Each prompt should be 2-4 sentences describing a specific ad visual. CRITICAL RULES for prompts:
- Each prompt MUST include the full, exact product description inline — do NOT use shorthand like "the product" or "their can". Describe exactly what the product looks like every time.
- Include specific visual composition, camera angle, lighting
- Specify the exact brand colors from the palette above
- Include specific text/copy that should appear as overlay (headline + subhead)
- Style direction: "product photography", "lifestyle shot", "bold graphic design", "editorial", "UGC-style", etc.
- Make these feel like real high-converting paid social ads, NOT stock photos
- Vary approaches across the 4 — mix product-focused, lifestyle, graphic, editorial styles`,
  });

  const res = await fetch(
    `${GEMINI_API}/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

/* ═══════════════════════════════════════════
   UNCHANGED HELPERS
   ═══════════════════════════════════════════ */

async function generateCustomPrompts(
  customPrompt: string,
  basePrompts: string[],
  count: number,
): Promise<string[]> {
  const res = await fetch(
    `${GEMINI_API}/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Combine this creative direction: '${customPrompt}' with these existing ad concepts for the brand. Generate ${count} new unique ad image prompts that blend the user's direction with the brand context.

Existing ad prompts for context:
${basePrompts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Return your response as a JSON array of ${count} prompt strings. Each prompt should be 2-4 sentences describing a specific ad visual.

IMPORTANT: Return ONLY a valid JSON array, no markdown code blocks or other text.
Example: ["prompt 1", "prompt 2", ...]`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

async function revisePrompt(prompt: string, feedback: string): Promise<string> {
  const res = await fetch(
    `${GEMINI_API}/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an advertising creative director. Revise this ad image prompt based on the user's feedback.

Original prompt: "${prompt}"

User feedback: "${feedback}"

Create a revised image generation prompt that incorporates the feedback while keeping the core concept. The revised prompt should be 2-4 sentences.

IMPORTANT: Return ONLY the revised prompt text, nothing else.`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text.trim();
}

/* ═══════════════════════════════════════════
   IMAGE GENERATION
   ═══════════════════════════════════════════ */

async function generateImage(
  prompt: string,
  referenceImages?: { base64: string; mimeType: string }[],
  productDescription?: string,
): Promise<string> {
  const parts: Record<string, unknown>[] = [];

  // Prepend reference images if provided
  if (referenceImages?.length) {
    for (const img of referenceImages) {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.base64 },
      });
    }

    const productContext = productDescription
      ? `\n\nProduct reference: ${productDescription}\nYou MUST depict this exact product faithfully — same shape, colors, labeling, and branding as shown in the reference images. Do NOT invent new product designs or modify the product appearance.`
      : "";

    parts.push({
      text: `Generate a high-quality advertisement image.

The reference images above show the REAL product and brand. You must faithfully reproduce the product's exact appearance — same packaging, colors, typography, and design. Do not invent or modify the product.${productContext}

Ad concept: ${prompt}`,
    });
  } else {
    parts.push({
      text: `Generate a high-quality advertisement image: ${prompt}`,
    });
  }

  const res = await fetch(
    `${GEMINI_API}/gemini-3.1-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Image generation failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const responseParts = data.candidates?.[0]?.content?.parts;
  if (!responseParts) throw new Error("No parts in image response");

  for (const part of responseParts) {
    if (part.inlineData) {
      const imgDir = join(process.cwd(), "public", "generated");
      await mkdir(imgDir, { recursive: true });
      const filename = `${randomUUID()}.png`;
      const buffer = Buffer.from(part.inlineData.data, "base64");
      await writeFile(join(imgDir, filename), buffer);
      return `/generated/${filename}`;
    }
  }

  throw new Error("No image data in response");
}

/* ═══════════════════════════════════════════
   POST HANDLER
   ═══════════════════════════════════════════ */

export async function POST(req: NextRequest) {
  const { url, count = 4, customPrompt, basePrompts } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        if (customPrompt && basePrompts) {
          // Custom prompt flow: skip scrape + concept generation
          send("step", { step: 3 });

          const prompts = await generateCustomPrompts(
            customPrompt,
            basePrompts,
            count,
          );

          const batchSize = 4;
          for (let b = 0; b < prompts.length; b += batchSize) {
            const batch = prompts.slice(b, b + batchSize);
            const batchPromises = batch.map(
              async (prompt: string, batchIdx: number) => {
                const i = b + batchIdx;
                try {
                  const imageUrl = await generateImage(prompt);
                  send("image", { index: i, url: imageUrl, prompt });
                } catch (err: unknown) {
                  const message =
                    err instanceof Error ? err.message : "Unknown error";
                  send("image_error", { index: i, error: message });
                }
              },
            );
            await Promise.all(batchPromises);
          }

          send("done", {});
        } else {
          // Standard flow: scrape + extract assets + concepts + images

          // Step 0: Analyze website
          send("step", { step: 0 });
          const siteData = await scrapeWebsite(url);
          send("analysis", {
            title: siteData.title,
            description: siteData.description,
          });

          // Step 1: Extract brand assets
          send("step", { step: 1 });
          const downloadedImages = await downloadImages(siteData.imageUrls);
          const analyzedImages = await analyzeImages(downloadedImages);

          send("assets", {
            colors: siteData.colors,
            images: analyzedImages.map((img) => ({
              url: img.url,
              description: img.description,
            })),
          });

          const brandAssets = {
            colors: siteData.colors,
            images: analyzedImages,
          };

          // Step 2: Generate ad concepts with brand assets
          send("step", { step: 2 });
          const concepts = await generateAdConcepts(siteData, brandAssets);
          send("concepts", {
            insights: concepts.insights,
            prompts: concepts.prompts,
          });

          // Step 3: Generate creatives with reference images
          send("step", { step: 3 });

          const prompts: string[] = concepts.prompts.slice(0, count);
          const imageSelections: number[][] = concepts.imageSelections || [];
          const productDescription: string = concepts.productDescription || "";
          const batchSize = 4;

          for (let b = 0; b < prompts.length; b += batchSize) {
            const batch = prompts.slice(b, b + batchSize);
            const batchPromises = batch.map(
              async (prompt: string, batchIdx: number) => {
                const i = b + batchIdx;

                // Select reference images for this prompt
                const selectedIndices = imageSelections[i] || [];
                const refImages = selectedIndices
                  .filter((idx) => idx >= 0 && idx < analyzedImages.length)
                  .map((idx) => ({
                    base64: analyzedImages[idx].base64,
                    mimeType: analyzedImages[idx].mimeType,
                  }));

                try {
                  const imageUrl = await generateImage(
                    prompt,
                    refImages.length > 0 ? refImages : undefined,
                    productDescription || undefined,
                  );
                  send("image", { index: i, url: imageUrl, prompt });
                } catch (err: unknown) {
                  const message =
                    err instanceof Error ? err.message : "Unknown error";
                  send("image_error", { index: i, error: message });
                }
              },
            );
            await Promise.all(batchPromises);
          }

          // Done
          send("step", { step: 4 });
          send("done", {});
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        send("error", { message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/* ═══════════════════════════════════════════
   PUT HANDLER (unchanged)
   ═══════════════════════════════════════════ */

export async function PUT(req: NextRequest) {
  try {
    const { prompt, feedback } = await req.json();

    if (!prompt || !feedback) {
      return NextResponse.json(
        { error: "Both prompt and feedback are required" },
        { status: 400 },
      );
    }

    const revisedPrompt = await revisePrompt(prompt, feedback);
    const url = await generateImage(revisedPrompt);

    return NextResponse.json({ url, prompt: revisedPrompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
