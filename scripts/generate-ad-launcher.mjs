import { writeFile, mkdir, access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { constants } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "ad-launcher");
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyB28qcqbCHHDkYUgbM1CTYf4ppej9TLLdk";

/* ═══════════════════════════════════════════
   STEP 1: Generate 35 concept prompts for AG1
   ═══════════════════════════════════════════ */

async function generateConceptPrompts() {
  console.log("Step 1: Generating 35 concept prompts for AG1...");

  const res = await fetch(
    `${GEMINI_API}/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a world-class creative director and typographic obsessive who makes premium paid social ads for AG1 (Athletic Greens).

AG1 is a daily nutritional supplement — a single scoop green powder with 75 vitamins, minerals, probiotics, and adaptogens. It costs ~$3.23/day. The brand is premium, clean, health-forward, aspirational but grounded. Target demo: health-curious adults 25–40. Platforms: Meta, TikTok, Instagram.

Generate 35 unique ad image prompts across these 7 creative territories (5 each):

1. MORNING ROUTINE — lifestyle shots of real mornings, the ritual of mixing AG1, energy and clarity
2. INGREDIENT TRANSPARENCY — close-ups of ingredients, scientific visuals, label reads, "what's inside"
3. COST COMPARISON — "$300 of supplements vs one scoop", value prop visualizations, math
4. SOCIAL PROOF — star ratings, review quotes, user counts, "50k+ sold", before/after
5. TASTE & TEXTURE — ASMR-style, powder pouring, mixing, color of the green, satisfying rituals
6. LIFESTYLE FLEX — aspirational people (runners, founders, nurses, pilots), AG1 woven into real life
7. SCIENCE EXPLAINER — gut health, nutrient absorption, cellular visuals, "what happens in 30 minutes"

Return JSON: { "prompts": [ { "index": 1, "angle": "Morning Routine", "hook": "headline text for the ad", "prompt": "detailed image generation prompt" }, ... ] }

IMPORTANT: Return ONLY valid JSON. 35 items total.

Each prompt must be 4-6 sentences describing a specific ad image. Rules:
- AG1 product must be described physically every time: a matte white pouch with green "AG1" branding, or a clear glass of vibrant green liquid, or the single-serve travel packs
- TYPOGRAPHY IS THE HERO: Every prompt must include extremely detailed typographic direction. Specify: exact style of letterforms (grotesque, geometric, humanist, display, stencil, etc.), weight (hairline, light, bold, black, ultra-heavy), tracking (ultra-tight, normal, wide), case (all-caps, lowercase, mixed), scale (oversized, small, mixed hierarchy), position (bleeding off edges, centered, asymmetric, overlapping product), and any effects (outlined, filled, knockout, layered, dimensional). The typography should look like it came from a $200 font license — think SSENSE editorial, Highsnobiety campaigns, Kith lookbooks.
- Include the exact headline + subhead copy that should appear in the ad
- Specify composition, camera angle, lighting, color palette (AG1 green #486B3E, cream/off-white, near-black)
- Make these feel like real high-converting paid social ads designed by a top-tier agency
- Vary layouts: some product-hero, some lifestyle, some editorial, some data-driven
- The hook field should be the primary headline text that appears on the ad`,
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
    throw new Error(`Concept generation failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  let text = data.candidates[0].content.parts[0].text;
  // Extract JSON object if there's surrounding text
  const objStart = text.indexOf("{");
  const objEnd = text.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1) {
    text = text.slice(objStart, objEnd + 1);
  }
  const parsed = JSON.parse(text);
  console.log(`  Got ${parsed.prompts.length} concept prompts`);
  return parsed.prompts;
}

/* ═══════════════════════════════════════════
   STEP 2: DR refinement pass
   ═══════════════════════════════════════════ */

async function refineForDR(concepts) {
  console.log("Step 2: Refining for direct response...");

  // Process in batches of ~12 to avoid token limits
  const batches = [];
  for (let i = 0; i < concepts.length; i += 12) {
    batches.push(concepts.slice(i, i + 12));
  }

  const allRefined = [];

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    console.log(`  Refining batch ${b + 1}/${batches.length} (${batch.length} prompts)...`);

    const res = await fetch(
      `${GEMINI_API}/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an elite performance creative strategist for AG1 (Athletic Greens). You understand that the best-performing paid social ads marry beautiful brand creative with direct response fundamentals.

Take these ${batch.length} ad image prompts and rewrite each so the resulting ads will actually CONVERT on Meta/TikTok. Keep the brand polish and design-forward typography — but inject direct response DNA into every frame.

${batch.map((c, i) => `${i + 1}. [${c.angle}] Hook: "${c.hook}"
Prompt: ${c.prompt}`).join("\n\n")}

REWRITE each prompt applying these direct response principles:
- HOOK IN THE FIRST SECOND: The headline text must stop the scroll. Use proven DR patterns — bold claims, specific numbers, pattern interrupts, "us vs them", before/after framing, social proof callouts
- CLEAR VALUE PROP: Immediately understand what AG1 does and why you need it. Concrete benefits, not abstract brand poetry
- CTA ENERGY: Should feel like it's asking you to do something — "Try it risk-free", "90 day guarantee"
- THUMB-STOPPING LAYOUT: High contrast, bold type that reads at tiny sizes, product front and center, minimal clutter
- SOCIAL PROOF / CREDIBILITY: Trust signals — star ratings, review quotes, "trusted by X", awards

BUT keep it elevated. Premium typography, intentional color, tasteful composition. Think: Glossier's creative team hitting ROAS targets.

Keep all typographic detail and visual direction from the originals. The AG1 product (matte white pouch with green branding, or vibrant green liquid in a clear glass) must be clearly described in every prompt.

Return ONLY a valid JSON array of ${batch.length} rewritten prompt strings, in the same order.`,
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
    let text = data.candidates[0].content.parts[0].text;
    // Sometimes Gemini returns text with trailing junk — extract the JSON array
    const arrStart = text.indexOf("[");
    const arrEnd = text.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd !== -1) {
      text = text.slice(arrStart, arrEnd + 1);
    }
    let refined;
    try {
      refined = JSON.parse(text);
    } catch {
      // If JSON is broken, skip DR refinement for this batch and use originals
      console.log(`  Warning: DR refinement JSON parse failed for batch ${b + 1}, using original prompts`);
      refined = batch.map((c) => c.prompt);
    }
    allRefined.push(...refined);
  }

  console.log(`  Got ${allRefined.length} refined prompts`);
  return allRefined;
}

/* ═══════════════════════════════════════════
   STEP 3: Generate images
   ═══════════════════════════════════════════ */

async function generateImage(prompt, index, retries = 2) {
  const padded = String(index + 1).padStart(2, "0");
  console.log(`  Generating image ${padded}/35...`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

  let res;
  try {
    res = await fetch(
      `${GEMINI_API}/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a high-quality advertisement image for AG1 (Athletic Greens) with exceptional, design-forward typography. This should look like a real, professional ad creative from a top-tier agency.

TYPOGRAPHY IS CRITICAL: The text in this image must look like it was set by a professional graphic designer using premium typefaces. Pay extreme attention to: letterform quality, consistent weight, precise tracking/kerning, intentional scale hierarchy, and clean rendering. No generic or default-looking type. The typography should be the most striking element of the composition — think award-winning editorial design, not template advertising. Crisp, sharp, well-spaced letterforms. If the type is large, it should command the frame. If it's small, it should be perfectly precise.

The AG1 product is a matte white pouch with green "AG1" branding, or a clear glass filled with vibrant green liquid. The brand colors are deep green (#486B3E), cream/off-white, and near-black.

${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio: "4:5",
            },
          },
        }),
      },
    );
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      if (retries > 0) {
        console.log(`  Timeout for ${padded}, retrying...`);
        await new Promise((r) => setTimeout(r, 3000));
        return generateImage(prompt, index, retries - 1);
      }
      throw new Error(`Timeout generating image ${padded}`);
    }
    throw err;
  }
  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.text();
    if (retries > 0 && (res.status === 429 || res.status >= 500)) {
      console.log(`  ${res.status} for ${padded}, retrying in 10s...`);
      await new Promise((r) => setTimeout(r, 10000));
      return generateImage(prompt, index, retries - 1);
    }
    throw new Error(`Image generation failed for ${padded}: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error(`No parts in response for ${padded}`);

  for (const part of parts) {
    if (part.inlineData) {
      const filename = `${padded}.png`;
      const buffer = Buffer.from(part.inlineData.data, "base64");
      await writeFile(join(OUT_DIR, filename), buffer);
      console.log(`  Saved ${filename} (${Math.round(buffer.length / 1024)}KB)`);
      return filename;
    }
  }

  if (retries > 0) {
    console.log(`  No image data for ${padded}, retrying...`);
    await new Promise((r) => setTimeout(r, 3000));
    return generateImage(prompt, index, retries - 1);
  }
  throw new Error(`No image data for ${padded}`);
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Step 1: Generate concepts
  const concepts = await generateConceptPrompts();

  // Step 2: DR refinement
  const refinedPrompts = await refineForDR(concepts);

  // Step 3: Generate images (sequentially to avoid rate limits)
  console.log("Step 3: Generating 35 images...");

  const results = [];
  const failed = [];

  for (let i = 0; i < refinedPrompts.length; i++) {
    const padded = String(i + 1).padStart(2, "0");
    const existingPath = join(OUT_DIR, `${padded}.png`);

    // Skip if already generated
    try {
      await access(existingPath, constants.F_OK);
      console.log(`  Skipping ${padded}.png (already exists)`);
      results.push({
        index: i,
        filename: `${padded}.png`,
        angle: concepts[i].angle,
        hook: concepts[i].hook,
        prompt: refinedPrompts[i],
      });
      continue;
    } catch {
      // File doesn't exist, generate it
    }

    try {
      const filename = await generateImage(refinedPrompts[i], i);
      results.push({
        index: i,
        filename,
        angle: concepts[i].angle,
        hook: concepts[i].hook,
        prompt: refinedPrompts[i],
      });
    } catch (err) {
      console.error(`  FAILED ${padded}: ${err.message}`);
      failed.push(i);
    }

    // Delay between requests to avoid rate limits
    if (i < refinedPrompts.length - 1) {
      await new Promise((r) => setTimeout(r, 2500));
    }
  }

  // Save manifest
  await writeFile(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify({ generated: new Date().toISOString(), results, failed }, null, 2),
  );

  console.log(`\nDone! ${results.length}/35 images generated.`);
  if (failed.length > 0) {
    console.log(`Failed indices: ${failed.join(", ")} — re-run to retry.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
