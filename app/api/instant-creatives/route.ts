import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

async function scrapeWebsite(url: string) {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const res = await fetch(normalizedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
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

  return {
    url: normalizedUrl,
    title: ogTitle || title,
    description,
    ogImage,
    bodyText,
  };
}

async function generateAdConcepts(siteData: {
  url: string;
  title: string;
  description: string;
  ogImage: string;
  bodyText: string;
}) {
  const res = await fetch(
    `${GEMINI_API}/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an elite advertising creative director at a top agency. Analyze this website/brand and create 4 compelling ad creative concepts that would perform well as paid social ads.

Website: ${siteData.url}
Title: ${siteData.title}
Description: ${siteData.description}
Content excerpt: ${siteData.bodyText.slice(0, 2000)}

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
  "prompts": [
    "Detailed image generation prompt 1",
    "Detailed image generation prompt 2",
    "Detailed image generation prompt 3",
    "Detailed image generation prompt 4"
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or other text.

Each insight should be one concise sentence summarizing a key observation about the brand, audience, or creative strategy.

Each prompt should be 2-4 sentences describing a specific ad visual. Include:
- Specific visual composition and layout
- Color palette and mood
- Typography style cues if relevant
- The product/brand integration
- Style direction: "product photography", "lifestyle shot", "bold graphic design", "editorial", "UGC-style", etc.

Make these feel like real high-converting ads, not stock photos. Vary the approaches across the 4 — mix product-focused, lifestyle, graphic, editorial, UGC-style, etc.`,
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

async function generateCustomPrompts(
  customPrompt: string,
  basePrompts: string[],
  count: number,
): Promise<string[]> {
  const res = await fetch(
    `${GEMINI_API}/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    `${GEMINI_API}/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
                text: `Generate a high-quality advertisement image: ${prompt}`,
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
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No parts in image response");

  for (const part of parts) {
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
          send("step", { step: 2 });

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
          // Standard flow: scrape + concepts + images
          // Step 1: Analyze website
          send("step", { step: 0 });
          const siteData = await scrapeWebsite(url);
          send("analysis", {
            title: siteData.title,
            description: siteData.description,
          });

          // Step 2: Generate ad concepts with Gemini
          send("step", { step: 1 });
          const concepts = await generateAdConcepts(siteData);
          send("concepts", {
            insights: concepts.insights,
            prompts: concepts.prompts,
          });

          // Step 3: Generate creatives
          send("step", { step: 2 });

          const prompts: string[] = concepts.prompts.slice(0, count);
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

          // Done
          send("step", { step: 3 });
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
