#!/usr/bin/env node

/**
 * Headless demo recorder — Puppeteer + FFmpeg → MP4
 *
 * Usage:
 *   node scripts/record-demo.mjs analyzer
 *   node scripts/record-demo.mjs queue
 *   node scripts/record-demo.mjs all
 *
 * Requires: ffmpeg installed, dev server running on localhost:3000
 */

import puppeteer from "puppeteer";
import { spawn } from "child_process";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RECORDINGS_DIR = join(ROOT, "recordings");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 24;
const FRAME_INTERVAL = Math.round(1000 / FPS); // ~42ms

/* ═══════════════════════════════════════════
   DEMO DEFINITIONS
   ═══════════════════════════════════════════ */

const DEMOS = {
  analyzer: {
    path: "/analyzer",
    name: "Analyzer",
    // Target: ~25s total
    steps: [
      // --- Opening: let them see the full dashboard ---
      {
        delay: 6000,
        label: "Dashboard overview — stats, chart, campaign tree",
        action: async () => {},
      },

      // --- Interactive chart hover ---
      {
        delay: 0,
        label: "Sweep across 30-day chart",
        action: async (page) => {
          const chart = await page.$("svg[viewBox='0 0 600 180']");
          if (!chart) return;
          const parent = await chart.evaluateHandle((el) => el.parentElement);
          const pBox = await parent.boundingBox();
          if (!pBox) return;

          // Slow sweep: 60 steps at 120ms each = ~7.2s of chart interaction
          for (let i = 0; i <= 60; i++) {
            const x = pBox.x + (pBox.width * i) / 60;
            const y = pBox.y + pBox.height * 0.4;
            await page.mouse.move(x, y);
            await sleep(120);
          }
          await sleep(800);
          await page.mouse.move(pBox.x - 50, pBox.y - 50);
        },
      },

      // --- First creative: healthy one ---
      {
        delay: 1800,
        label: "Click 'Gut Health Explainer' — strong performer",
        action: async (page) => {
          await clickTextContent(page, "Gut Health Explainer");
        },
      },
      {
        delay: 5000,
        label: "Viewing: 4.8x ROAS, low fatigue, scaling opportunity",
        action: async () => {},
      },
      {
        delay: 1000,
        label: "Close drawer",
        action: async (page) => { await closeDrawer(page); },
      },

      // --- Second creative: fatigued one (contrast) ---
      {
        delay: 1500,
        label: "Click '75 Supplements → 1 Scoop' — high fatigue",
        action: async (page) => {
          await clickTextContent(page, "75 Supplements");
        },
      },
      {
        delay: 5000,
        label: "Fatigue 81/100, frequency 4.2x — agent paused this",
        action: async () => {},
      },
      {
        delay: 1000,
        label: "Close drawer",
        action: async (page) => { await closeDrawer(page); },
      },

      // --- Third creative: learning phase ---
      {
        delay: 1500,
        label: "Click 'Fridge Restock ASMR' — in learning",
        action: async (page) => {
          await clickTextContent(page, "Fridge Restock ASMR");
        },
      },
      {
        delay: 4000,
        label: "Learning phase — agent leaving untouched",
        action: async () => {},
      },
      {
        delay: 1000,
        label: "Close drawer",
        action: async (page) => { await closeDrawer(page); },
      },

      // --- Campaign tree interaction ---
      {
        delay: 1500,
        label: "Collapse 'AG1 — Prospecting'",
        action: async (page) => { await toggleCampaign(page, "AG1 — Prospecting"); },
      },
      {
        delay: 1500,
        label: "Re-expand",
        action: async (page) => { await toggleCampaign(page, "AG1 — Prospecting"); },
      },

      // --- Scroll the AI analysis ---
      {
        delay: 1500,
        label: "Scroll through agent analysis",
        action: async (page) => {
          await page.evaluate(() => {
            const panels = document.querySelectorAll("div[class*='overflow-y-auto']");
            const panel = Array.from(panels).find(
              (el) => el.classList.contains("px-6") && el.classList.contains("py-6")
            );
            if (!panel) return;
            let pos = 0;
            const interval = setInterval(() => {
              pos += 1.0;
              panel.scrollTop = pos;
              if (pos > 500) clearInterval(interval);
            }, 16);
          });
        },
      },
      {
        delay: 9500,
        label: "Reading agent actions — paused, scaled, queued new creatives",
        action: async () => {},
      },

      // --- End ---
      {
        delay: 3500,
        label: "Final hold",
        action: async () => {},
      },
    ],
  },

  "ad-launcher": {
    path: "/ad-launcher",
    name: "Ad Launcher",
    // Auto-playing demo — ~36s sequence, no interaction needed
    steps: [
      {
        delay: 2000,
        label: "Brief fades in, agent starts reading",
        action: async () => {},
      },
      {
        delay: 6000,
        label: "Agent reasoning streams word-by-word",
        action: async () => {},
      },
      {
        delay: 4000,
        label: "Concept count climbs to 24",
        action: async () => {},
      },
      {
        delay: 50000,
        label: "Thumbnails populate one by one (24 × 2000ms)",
        action: async () => {},
      },
      {
        delay: 4000,
        label: "Staging → launch confirmation",
        action: async () => {},
      },
      {
        delay: 3000,
        label: "Final hold — 24 ads launched",
        action: async () => {},
      },
    ],
  },

  queue: {
    path: "/queue",
    name: "Queue",
    // Target: ~25s total
    steps: [
      {
        delay: 3000,
        label: "Kanban overview",
        action: async () => {},
      },
      {
        delay: 1500,
        label: "Click 'Morning Routine Stack' card",
        action: async (page) => {
          await clickTextContent(page, "Morning Routine Stack");
        },
      },
      {
        delay: 2000,
        label: "Scroll through card details",
        action: async (page) => {
          await page.evaluate(() => {
            const drawers = document.querySelectorAll("div[class*='fixed'][class*='overflow-y-auto']");
            const drawer = Array.from(drawers).find((el) => el.style.width === "480px" || el.style.borderLeft);
            if (!drawer) return;
            let pos = 0;
            const interval = setInterval(() => {
              pos += 1.5;
              drawer.scrollTop = pos;
              if (pos > 300) clearInterval(interval);
            }, 16);
          });
        },
      },
      {
        delay: 3000,
        label: "View hook, script, references",
        action: async () => {},
      },
      {
        delay: 800,
        label: "Close drawer",
        action: async (page) => { await closeDrawer(page); },
      },
      {
        delay: 2000,
        label: "Open menu",
        action: async (page) => {
          await page.evaluate(() => {
            const btns = document.querySelectorAll("header button");
            const menuBtn = Array.from(btns).find((b) => b.querySelector("svg"));
            if (menuBtn) menuBtn.click();
          });
        },
      },
      {
        delay: 1500,
        label: "Deploy Agents",
        action: async (page) => {
          await page.evaluate(() => {
            const btn = document.querySelector("div[class*='absolute right-0'] button");
            if (btn) btn.click();
          });
        },
      },
      {
        delay: 5000,
        label: "Watch agents move cards through pipeline",
        action: async () => {},
      },
      {
        delay: 2500,
        label: "Cards shipping to done",
        action: async () => {},
      },
      {
        delay: 2000,
        label: "Click a shipped card",
        action: async (page) => {
          await page.evaluate(() => {
            const columns = document.querySelectorAll("div[class*='flex-1 flex flex-col min-w-0']");
            if (columns.length >= 4) {
              const cards = columns[3].querySelectorAll("div[class*='rounded-lg']");
              if (cards.length > 0) cards[0].click();
            }
          });
        },
      },
      {
        delay: 3000,
        label: "View shipped card details",
        action: async () => {},
      },
      {
        delay: 800,
        label: "Close drawer",
        action: async (page) => { await closeDrawer(page); },
      },
      {
        delay: 2000,
        label: "Final overview",
        action: async () => {},
      },
    ],
  },
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clickTextContent(page, text) {
  await page.evaluate((t) => {
    const els = document.querySelectorAll("div.group, div[class*='cursor-pointer']");
    const target = Array.from(els).find((el) => el.textContent?.includes(t));
    if (target) target.click();
  }, text);
}

async function closeDrawer(page) {
  await page.evaluate(() => {
    const backdrops = document.querySelectorAll("div.fixed");
    backdrops.forEach((el) => {
      const bg = el.style.background || "";
      if (bg.includes("rgba(0,0,0,0.5)") || bg.includes("rgba(0,0,0,0.6)") || bg.includes("rgba(0, 0, 0")) {
        el.click();
      }
    });
  });
}

async function toggleCampaign(page, name) {
  await page.evaluate((n) => {
    const rows = Array.from(document.querySelectorAll("div[class*='cursor-pointer']"));
    const target = rows.find((el) => el.textContent?.includes(n) && el.classList.contains("px-1"));
    if (target) target.click();
  }, name);
}

/* ═══════════════════════════════════════════
   RECORDING ENGINE
   Timed screenshots at fixed FPS → FFmpeg → MP4
   ═══════════════════════════════════════════ */

async function recordDemo(demoId) {
  const demo = DEMOS[demoId];
  if (!demo) {
    console.error(`Unknown demo: ${demoId}. Available: ${Object.keys(DEMOS).join(", ")}`);
    process.exit(1);
  }

  await mkdir(RECORDINGS_DIR, { recursive: true });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const outFile = join(RECORDINGS_DIR, `${demoId}-${timestamp}.mp4`);

  // Calculate expected duration
  const totalDelay = demo.steps.reduce((sum, s) => sum + s.delay, 0);
  const estSeconds = Math.round((totalDelay + 2000) / 1000); // +2s for load + final

  console.log(`\n  Recording: ${demo.name}`);
  console.log(`  Output:    ${outFile}`);
  console.log(`  Size:      ${WIDTH}x${HEIGHT} @ ${FPS}fps`);
  console.log(`  Est:       ~${estSeconds}s\n`);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: WIDTH, height: HEIGHT },
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
      "--disable-infobars",
      "--hide-scrollbars",
      "--no-first-run",
      "--disable-extensions",
      "--force-device-scale-factor=1",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  // Navigate and wait for page to fully load
  console.log(`  Loading ${BASE_URL}${demo.path}...`);
  await page.goto(`${BASE_URL}${demo.path}`, { waitUntil: "networkidle2" });
  await sleep(1500);

  // Start FFmpeg process — reads raw PNG frames from stdin
  const ffmpeg = spawn("ffmpeg", [
    "-y",
    "-f", "image2pipe",
    "-framerate", String(FPS),
    "-i", "pipe:0",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-vf", `scale=${WIDTH}:${HEIGHT}`,
    outFile,
  ], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  ffmpeg.stderr.on("data", () => {});

  const ffmpegDone = new Promise((resolve, reject) => {
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  // Screenshot capture loop — runs in background at fixed FPS
  let capturing = true;
  let frameCount = 0;

  const captureLoop = async () => {
    while (capturing) {
      const start = Date.now();
      try {
        const buf = await page.screenshot({ type: "png", encoding: "binary" });
        if (capturing && ffmpeg.stdin.writable) {
          ffmpeg.stdin.write(buf);
          frameCount++;
        }
      } catch {
        // page might be navigating
      }
      const elapsed = Date.now() - start;
      const wait = Math.max(0, FRAME_INTERVAL - elapsed);
      if (wait > 0) await sleep(wait);
    }
  };

  // Start capturing
  const capturePromise = captureLoop();

  console.log("  Recording started\n");

  // Execute demo steps
  for (let i = 0; i < demo.steps.length; i++) {
    const step = demo.steps[i];
    const progress = `  [${String(i + 1).padStart(2)}/${demo.steps.length}]`;
    console.log(`${progress} ${step.label}`);

    if (step.delay > 0) await sleep(step.delay);

    try {
      await step.action(page);
    } catch (err) {
      console.warn(`         ⚠ Step failed: ${err.message}`);
    }
  }

  // Final hold
  await sleep(500);

  // Stop capture
  capturing = false;
  await capturePromise;

  const duration = (frameCount / FPS).toFixed(1);
  console.log(`\n  Captured ${frameCount} frames (${duration}s)`);
  console.log("  Encoding MP4...");

  ffmpeg.stdin.end();
  await ffmpegDone;

  await browser.close();

  console.log(`  Done → ${outFile}\n`);
}

/* ═══════════════════════════════════════════
   CLI
   ═══════════════════════════════════════════ */

const arg = process.argv[2];

if (!arg) {
  console.log("\nUsage: node scripts/record-demo.mjs <demo|all>\n");
  console.log("Available demos:");
  for (const [id, demo] of Object.entries(DEMOS)) {
    console.log(`  ${id.padEnd(12)} ${demo.name}`);
  }
  console.log(`  ${"all".padEnd(12)} Record all demos\n`);
  process.exit(0);
}

if (arg === "all") {
  for (const id of Object.keys(DEMOS)) {
    await recordDemo(id);
  }
} else {
  await recordDemo(arg);
}
