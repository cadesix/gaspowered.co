import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

/* ═══════════════════════════════════════════
   BATCH BRAND + PROMPT GENERATION
   5 brands × 2 prompts = 10 ads in one call
   ═══════════════════════════════════════════ */

async function generateBatch(direction?: string) {
  const steer = direction
    ? `Creative direction from the user: "${direction}". Use this to influence the types of brands, industries, or aesthetics you generate — but still create variety.`
    : "";

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
                text: `You are a world-class brand strategist, creative director, and typographic obsessive who is deeply plugged into what's actually trending in the market right now.

Generate 5 fictional but hyper-realistic brands, each with 2 ad creative prompts (10 ads total). These brands should feel like real companies you'd see on your Instagram feed, in a TechCrunch article, or on the shelf at Erewhon.

${steer}

Ground every brand in REAL, trending market categories:
- DTC/CPG: functional beverages, adaptogen snacks, premium personal care, clean beauty, gut health, protein everything, luxury pet brands, better-for-you alcohol alternatives
- SaaS/Tech: AI-powered tools for specific verticals, creator economy platforms, fintech for niche audiences, vertical SaaS, developer tools, workflow automation
- Services: boutique fitness concepts, membership-based experiences, modern healthcare/telehealth, premium meal delivery
- Lifestyle: streetwear-adjacent brands, modern home goods, sustainable fashion, niche fragrance houses

DO NOT generate sci-fi, cyberpunk, futuristic, or fantasy brands. Names should sound like real brands (think: Olipop, Linear, Aesop, Surreal, Ghia, Arc'teryx, Notion).

Return JSON with this exact format:
{
  "brands": [
    {
      "name": "Brand Name",
      "product": "What they sell — one line",
      "tagline": "A catchy tagline",
      "colors": ["#hex1", "#hex2"],
      "vibe": "2-3 word aesthetic descriptor",
      "productDescription": "Extremely detailed physical description of the product for image generation. Include: exact shape, materials, colors, textures, any text/labels on packaging, size proportions. Be hyper-specific.",
      "prompts": [
        "Detailed ad image prompt 1",
        "Detailed ad image prompt 2"
      ]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON.

Each of the 5 brands must be in a DIFFERENT industry/category. Max variety.

Each prompt should be 3-5 sentences describing a specific ad visual. Rules:
- Each prompt MUST include the full product description inline — describe exactly what the product looks like every time
- Include specific visual composition, camera angle, lighting
- Use the brand colors from the palette
- TYPOGRAPHY IS THE HERO: Every prompt must include extremely detailed typographic direction. Specify: exact style of letterforms (grotesque, geometric, humanist, display, stencil, etc.), weight (hairline, light, bold, black, ultra-heavy), tracking (ultra-tight, normal, wide), case (all-caps, lowercase, mixed), scale (oversized, small, mixed hierarchy), position (bleeding off edges, centered, asymmetric, overlapping product), and any effects (outlined, filled, knockout, layered, warped, dimensional). The typography should feel like it came from a $200 font license, not a free Google Font. Think: It's Nice That, SSENSE editorial, Highsnobiety campaigns, Kith lookbooks.
- Include text/copy that should appear — specify the exact words for headline + subhead
- Vary style direction: one prompt per brand should be product-focused, the other more lifestyle/editorial
- Make these feel like real high-converting paid social ads designed by a top-tier agency`,
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

/* ═══════════════════════════════════════════
   DIRECT RESPONSE REFINEMENT (batch)
   ═══════════════════════════════════════════ */

interface BatchAd {
  brandName: string;
  product: string;
  tagline: string;
  prompt: string;
}

async function refineForDirectResponse(ads: BatchAd[]): Promise<string[]> {
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
                text: `You are an elite performance creative strategist. You've spent years at the intersection of brand and direct response — you understand that the best-performing paid social ads marry beautiful brand creative with direct response fundamentals.

Your job: take these ${ads.length} ad image prompts (across multiple brands) and rewrite each so the resulting ads will actually CONVERT on Meta/TikTok/YouTube. Keep the brand polish and design-forward typography — but inject direct response DNA into every frame.

${ads.map((a, i) => `${i + 1}. [${a.brandName}] ${a.product} — "${a.tagline}"
Prompt: ${a.prompt}`).join("\n\n")}

REWRITE each prompt applying these direct response principles:
- HOOK IN THE FIRST SECOND: The headline text must stop the scroll. Use proven DR patterns — bold claims, specific numbers, pattern interrupts, "us vs them", before/after framing, social proof callouts ("50k+ sold", "rated #1"), scarcity/urgency cues
- CLEAR VALUE PROP: Immediately understand what this product does and why you need it. Concrete benefits, not abstract brand poetry
- CTA ENERGY: Should feel like it's asking you to do something — "Try it free", "Shop now", "See why X switched"
- THUMB-STOPPING LAYOUT: High contrast, bold type that reads at tiny sizes, product front and center, minimal clutter
- SOCIAL PROOF / CREDIBILITY: Trust signals — star ratings, review quotes, user counts, awards

BUT keep it elevated. NOT cheap dropshipping ads. Premium typography, intentional color, tasteful composition. Think: Glossier's creative team hitting ROAS targets. Apple designers making DTC ads.

Vary DR angles across the batch — mix of: hero product + bold claim, social proof, problem → solution, urgency/scarcity, before/after, "us vs them".

Keep all typographic detail and visual direction from the originals.

Return ONLY a valid JSON array of ${ads.length} prompt strings, in the same order.`,
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
    throw new Error(`DR refinement failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

/* ═══════════════════════════════════════════
   IMAGE GENERATION
   ═══════════════════════════════════════════ */

async function generateImage(prompt: string): Promise<string> {
  const res = await fetch(
    `${GEMINI_API}/gemini-3.1-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a high-quality advertisement image with exceptional, design-forward typography. This is for a fictional brand — make it look like a real, professional ad creative from a top-tier agency.

TYPOGRAPHY IS CRITICAL: The text in this image must look like it was set by a professional graphic designer using premium typefaces. Pay extreme attention to: letterform quality, consistent weight, precise tracking/kerning, intentional scale hierarchy, and clean rendering. No generic or default-looking type. The typography should be the most striking element of the composition — think award-winning editorial design, not template advertising. Crisp, sharp, well-spaced letterforms. If the type is large, it should command the frame. If it's small, it should be perfectly precise.

${prompt}`,
              },
            ],
          },
        ],
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
  const body = await req.json();
  const { direction } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        // Step 1: Generate 5 brands × 2 prompts
        send("step", { step: "brands", message: "Inventing brands..." });

        const batch = await generateBatch(direction || undefined);
        const brands = batch.brands || [];

        send("brands", { brands });

        // Flatten into ad list for DR refinement
        const adList: { brandIndex: number; promptIndex: number; ad: BatchAd; prompt: string }[] = [];
        for (let bi = 0; bi < brands.length; bi++) {
          const brand = brands[bi];
          for (let pi = 0; pi < (brand.prompts?.length || 0); pi++) {
            adList.push({
              brandIndex: bi,
              promptIndex: pi,
              ad: {
                brandName: brand.name,
                product: brand.product,
                tagline: brand.tagline,
                prompt: brand.prompts[pi],
              },
              prompt: brand.prompts[pi],
            });
          }
        }

        // Step 2: DR refinement pass
        send("step", { step: "refine", message: "Optimizing for direct response..." });

        const refinedPrompts = await refineForDirectResponse(
          adList.map((a) => a.ad),
        );

        // Step 3: Generate all images in parallel
        send("step", { step: "images", message: `Generating ${refinedPrompts.length} creatives...` });

        const imagePromises = refinedPrompts.map(async (prompt, i) => {
          const { brandIndex } = adList[i];
          try {
            const imageUrl = await generateImage(prompt);
            send("image", {
              index: i,
              brandIndex,
              brandName: brands[brandIndex].name,
              brandColors: brands[brandIndex].colors,
              url: imageUrl,
              prompt,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            send("image_error", { index: i, brandIndex, error: message });
          }
        });

        await Promise.all(imagePromises);
        send("done", {});
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
