"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */

const BRIEF = {
  brand: "AG1",
  objective: "Drive first-purchase conversions among health-curious 25–40 year-olds",
  platforms: ["Meta"],
  tone: "Confident, clean, aspirational but not preachy",
  cta: "Try AG1 risk-free — 90 day guarantee",
  budget: "$45,000 / week",
  campaign: "AG1 — Spring Push Q2",
  adSet: "Health-curious 25–40",
};

const REASONING_LINES: { type: "heading" | "line"; text: string }[] = [
  { type: "heading", text: "Reading brief" },
  { type: "line", text: "Objective is first-purchase conversions. Target demo is health-curious 25–40. Budget gives room for wide creative testing across Meta." },
  { type: "heading", text: "Mapping angles" },
  { type: "line", text: "Breaking the product story into 6 creative territories: morning routine, ingredient transparency, cost comparison, social proof, taste & texture, and lifestyle flex." },
  { type: "line", text: "Each territory gets 4 executions — different hook, format, and visual treatment. That gives us 24 unique statics." },
  { type: "heading", text: "Generating concepts" },
  { type: "line", text: "Assigning headlines, body copy, CTA overlays, and layout direction to each concept. Prioritizing scroll-stopping hooks over brand messaging in the top frame." },
  { type: "heading", text: "Rendering concepts" },
  { type: "line", text: "Each static gets a unique color grade, typography lockup, and product placement angle. Rendering now." },
];

const AD_COUNT = 24;

interface Concept {
  id: number;
  angle: string;
  hook: string;
  image: string;
}

const ANGLES = [
  "Morning Routine",
  "Ingredient Transparency",
  "Cost Comparison",
  "Social Proof",
  "Taste & Texture",
  "Lifestyle Flex",
];

const CONCEPTS: Concept[] = [
  { id: 1, angle: "Morning Routine", hook: "THE FIRST 60 SECONDS", image: "/ad-launcher/01.png" },
  { id: 2, angle: "Morning Routine", hook: "START HERE.", image: "/ad-launcher/02.png" },
  { id: 3, angle: "Morning Routine", hook: "THE DAILY RITUAL", image: "/ad-launcher/03.png" },
  { id: 4, angle: "Morning Routine", hook: "BEFORE COFFEE.", image: "/ad-launcher/04.png" },
  { id: 5, angle: "Ingredient Transparency", hook: "75 INGREDIENTS. 1 SCOOP.", image: "/ad-launcher/06.png" },
  { id: 6, angle: "Ingredient Transparency", hook: "THE LABEL IS THE PRODUCT", image: "/ad-launcher/07.png" },
  { id: 7, angle: "Ingredient Transparency", hook: "CLEAN SCIENCE", image: "/ad-launcher/08.png" },
  { id: 8, angle: "Ingredient Transparency", hook: "TRUST THE PROCESS", image: "/ad-launcher/09.png" },
  { id: 9, angle: "Cost Comparison", hook: "$3.23 PER DAY", image: "/ad-launcher/11.png" },
  { id: 10, angle: "Cost Comparison", hook: "THE ULTIMATE UPGRADE", image: "/ad-launcher/12.png" },
  { id: 11, angle: "Cost Comparison", hook: "$100 VALUE. $3 DAILY.", image: "/ad-launcher/13.png" },
  { id: 12, angle: "Cost Comparison", hook: "DITCH THE CABINET", image: "/ad-launcher/14.png" },
  { id: 13, angle: "Social Proof", hook: "4.8 STARS. 37,000+ REVIEWS.", image: "/ad-launcher/16.png" },
  { id: 14, angle: "Social Proof", hook: "TRUSTED BY THE BEST", image: "/ad-launcher/17.png" },
  { id: 15, angle: "Social Proof", hook: "THE PEOPLE HAVE SPOKEN", image: "/ad-launcher/18.png" },
  { id: 16, angle: "Social Proof", hook: "10+ YEARS OF FORMULATION", image: "/ad-launcher/19.png" },
  { id: 17, angle: "Taste & Texture", hook: "SURPRISINGLY REFRESHING", image: "/ad-launcher/21.png" },
  { id: 18, angle: "Taste & Texture", hook: "THE PERFECT MIX", image: "/ad-launcher/22.png" },
  { id: 19, angle: "Taste & Texture", hook: "NO GRIT. ALL GREEN.", image: "/ad-launcher/23.png" },
  { id: 20, angle: "Taste & Texture", hook: "VIBRANT BY NATURE", image: "/ad-launcher/24.png" },
  { id: 21, angle: "Lifestyle Flex", hook: "FOR THE HIGH-PERFORMER", image: "/ad-launcher/26.png" },
  { id: 22, angle: "Lifestyle Flex", hook: "THE FOUNDER'S SECRET", image: "/ad-launcher/27.png" },
  { id: 23, angle: "Lifestyle Flex", hook: "READY WHEN YOU ARE", image: "/ad-launcher/28.png" },
  { id: 24, angle: "Lifestyle Flex", hook: "BETTER FOR THE LONG RUN", image: "/ad-launcher/29.png" },
];

/* ═══════════════════════════════════════════
   TIMING
   ═══════════════════════════════════════════ */

const BRIEF_APPEAR = 300;
const REASONING_START = 800;
const WORDS_PER_SECOND = 48;
const CONCEPTS_DELAY_AFTER_REASONING = 400;
const CONCEPT_INTERVAL = 60;
const THUMBNAILS_DELAY_AFTER_CONCEPTS = 500;
const THUMBNAIL_INTERVAL = 950;
const THUMBNAIL_LOAD_DURATION = 700;
const LAUNCH_DELAY_AFTER_LAST = 2200;

/* ═══════════════════════════════════════════
   STREAMING TEXT
   ═══════════════════════════════════════════ */

function StreamingText({
  text,
  startTime,
  now,
  style,
  className,
}: {
  text: string;
  startTime: number;
  now: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const words = useMemo(() => text.split(" "), [text]);
  const elapsed = now - startTime;
  const msPerWord = 1000 / WORDS_PER_SECOND;
  const visibleCount = Math.min(words.length, Math.floor(elapsed / msPerWord));

  if (visibleCount <= 0) return null;

  return (
    <span className={className} style={style}>
      {words.slice(0, visibleCount).join(" ")}
      {visibleCount < words.length && (
        <span
          style={{
            display: "inline-block",
            width: 5,
            height: 13,
            background: "rgba(255,255,255,0.4)",
            marginLeft: 2,
            verticalAlign: "text-bottom",
            animation: "cursor-blink 0.8s step-end infinite",
          }}
        />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════
   STATIC THUMBNAIL
   ═══════════════════════════════════════════ */

function StaticThumbnail({ concept, index }: { concept: Concept; index: number }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), THUMBNAIL_LOAD_DURATION);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="group"
      style={{
        borderRadius: 6,
        aspectRatio: "4 / 5",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
        position: "relative",
        background: "#0d0d0d",
      }}
    >
      {/* Loading shimmer */}
      {!revealed && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "30%",
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.02), transparent)",
                animation: "thumb-scan 1.4s ease-in-out infinite",
              }}
            />
          </div>
          <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.06)", letterSpacing: "0.1em" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={concept.image}
          alt={concept.hook}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </motion.div>

      {/* Hover overlay */}
      {revealed && (
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "16px 8px 6px",
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
            opacity: 0, transition: "opacity 0.2s",
          }}
          className="group-hover:!opacity-100"
        >
          <div style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.2, marginBottom: 2 }}>
            {concept.hook}
          </div>
          <div className="font-mono" style={{ fontSize: 6, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            AG1 &middot; {concept.angle}
          </div>
        </div>
      )}

      {/* Number badge */}
      {revealed && (
        <div
          className="font-mono"
          style={{
            position: "absolute", top: 4, right: 4,
            fontSize: 7, color: "rgba(255,255,255,0.5)",
            background: "rgba(0,0,0,0.5)", borderRadius: 3, padding: "1px 4px",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function AdLauncherPage() {
  const [briefVisible, setBriefVisible] = useState(false);
  const [now, setNow] = useState(0);
  const [conceptCount, setConceptCount] = useState(0);
  const [visibleThumbs, setVisibleThumbs] = useState(0);
  const [launched, setLaunched] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0);

  // Compute reasoning schedule from word counts
  const reasoningSchedule = useMemo(() => {
    const schedule: { startTime: number; endTime: number }[] = [];
    let t = REASONING_START;
    for (const line of REASONING_LINES) {
      const wordCount = line.text.split(" ").length;
      const duration = (wordCount / WORDS_PER_SECOND) * 1000;
      const gap = line.type === "heading" ? 200 : 80;
      schedule.push({ startTime: t, endTime: t + duration });
      t += duration + gap;
    }
    return schedule;
  }, []);

  const reasoningEnd = reasoningSchedule[reasoningSchedule.length - 1].endTime;
  const conceptsStart = reasoningEnd + CONCEPTS_DELAY_AFTER_REASONING;
  const conceptsEnd = conceptsStart + AD_COUNT * CONCEPT_INTERVAL;
  const thumbnailsStart = conceptsEnd + THUMBNAILS_DELAY_AFTER_CONCEPTS;

  // Tick for streaming text
  useEffect(() => {
    startRef.current = performance.now();
    const id = setInterval(() => {
      setNow(performance.now() - startRef.current);
    }, 40);
    return () => clearInterval(id);
  }, []);

  // Schedule events
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setBriefVisible(true), BRIEF_APPEAR));

    for (let i = 1; i <= AD_COUNT; i++) {
      timers.push(setTimeout(() => setConceptCount(i), conceptsStart + i * CONCEPT_INTERVAL));
    }

    for (let i = 1; i <= AD_COUNT; i++) {
      timers.push(setTimeout(() => setVisibleThumbs(i), thumbnailsStart + i * THUMBNAIL_INTERVAL));
    }

    const launchTime = thumbnailsStart + AD_COUNT * THUMBNAIL_INTERVAL + LAUNCH_DELAY_AFTER_LAST;
    timers.push(setTimeout(() => setLaunched(true), launchTime));

    return () => timers.forEach(clearTimeout);
  }, [conceptsStart, thumbnailsStart]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [now]);

  return (
    <div className="h-screen w-full flex flex-col" style={{ background: "#090909", color: "#e5e5e5" }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes thumb-scan { 0% { top: -30%; } 100% { top: 100%; } }
        @keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em" }}>GAS</span>
          <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 18 }}>/</span>
          <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>Ad Launcher</span>
        </div>

        <div className="flex items-center gap-3">
          {!launched && conceptCount > 0 && (
            <div className="flex items-center gap-2">
              <motion.div
                className="rounded-full"
                style={{ width: 5, height: 5, background: "rgba(251,191,36,0.8)" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="font-mono" style={{ fontSize: 10, color: "rgba(251,191,36,0.6)" }}>GENERATING</span>
            </div>
          )}
          {launched && (
            <div className="flex items-center gap-2">
              <div className="rounded-full" style={{ width: 5, height: 5, background: "rgba(52,211,153,0.8)" }} />
              <span className="font-mono" style={{ fontSize: 10, color: "rgba(52,211,153,0.6)" }}>READY</span>
            </div>
          )}
        </div>
      </header>

      {/* Main split */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT — Agent reasoning */}
        <div className="flex flex-col" style={{ width: "38%", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-5 py-5">
            {/* Brief card */}
            <AnimatePresence>
              {briefVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 0,
                    padding: "16px 18px",
                    marginBottom: 24,
                  }}
                >
                  <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                    Creative Brief
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.9)", marginBottom: 10, lineHeight: 1.35 }}>
                    {BRIEF.objective}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { label: "Brand", value: BRIEF.brand },
                      { label: "Budget", value: BRIEF.budget },
                      { label: "Platforms", value: BRIEF.platforms.join(", ") },
                      { label: "Tone", value: BRIEF.tone },
                    ].map((f) => (
                      <div key={f.label}>
                        <div className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{f.label}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agent thought stream */}
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 16 }}>
              <div>
                {REASONING_LINES.map((line, i) => {
                  const sched = reasoningSchedule[i];
                  if (now < sched.startTime) return null;

                  if (line.type === "heading") {
                    return (
                      <div key={i} style={{ marginTop: i === 0 ? 0 : 20, marginBottom: 8 }}>
                        <StreamingText
                          text={line.text}
                          startTime={sched.startTime}
                          now={now}
                          className="font-mono"
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <StreamingText
                        text={line.text}
                        startTime={sched.startTime}
                        now={now}
                        style={{
                          fontSize: 13,
                          lineHeight: 1.65,
                          color: "rgba(255,255,255,0.7)",
                        }}
                      />
                    </div>
                  );
                })}

                {/* Concept counter */}
                {conceptCount > 0 && !launched && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 mt-4"
                    style={{
                      padding: "10px 14px",
                      background: "rgba(251,191,36,0.04)",
                      border: "1px solid rgba(251,191,36,0.1)",
                      borderRadius: 8,
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: 22, fontWeight: 600, color: "rgba(251,191,36,0.9)", letterSpacing: "-0.02em" }}>
                      {conceptCount}
                    </span>
                    <span className="font-mono" style={{ fontSize: 11, color: "rgba(251,191,36,0.5)" }}>
                      / {AD_COUNT} concepts
                    </span>
                    {conceptCount < AD_COUNT && (
                      <svg width="14" height="14" viewBox="0 0 16 16" style={{ color: "rgba(251,191,36,0.5)", animation: "spin 1.2s linear infinite" }}>
                        <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                        <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </motion.div>
                )}

                {/* Upload button */}
                <AnimatePresence>
                  {launched && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ marginTop: 28 }}
                    >
                      <div className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                        {AD_COUNT} statics ready &middot; {BRIEF.campaign} &rarr; {BRIEF.adSet}
                      </div>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        style={{
                          width: "100%",
                          padding: "11px 18px",
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          letterSpacing: "0.01em",
                          cursor: "pointer",
                        }}
                      >
                        Upload to Ads Manager
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Static grid + launch panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Stats bar */}
          <div className="flex items-center gap-6 px-5 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-baseline gap-2">
              <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Concepts</span>
              <span className="font-mono" style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{conceptCount}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Rendered</span>
              <span className="font-mono" style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{visibleThumbs}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Platform</span>
              <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Meta</span>
            </div>

            <div className="ml-auto">
              {launched ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 rounded-md"
                  style={{ padding: "6px 14px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-6" stroke="rgba(52,211,153,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: "rgba(52,211,153,0.8)" }}>READY</span>
                </motion.div>
              ) : visibleThumbs > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded-md"
                  style={{ padding: "6px 14px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" style={{ color: "rgba(251,191,36,0.6)", animation: "spin 1.2s linear infinite" }}>
                    <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                    <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-mono" style={{ fontSize: 11, color: "rgba(251,191,36,0.6)" }}>RENDERING...</span>
                </motion.div>
              ) : null}
            </div>
          </div>

          {/* Thumbnail grid */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {CONCEPTS.map((concept, i) => {
                if (i >= visibleThumbs) {
                  return (
                    <div
                      key={concept.id}
                      style={{
                        aspectRatio: "4 / 5",
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px dashed rgba(255,255,255,0.06)",
                      }}
                    />
                  );
                }
                return <StaticThumbnail key={concept.id} concept={concept} index={i} />;
              })}
            </div>

            {/* Angle legend */}
            <div className="flex flex-wrap gap-3 mt-4 px-1" style={{ paddingBottom: 12 }}>
              {ANGLES.map((angle) => (
                <div key={angle} className="flex items-center gap-1.5">
                  <div className="rounded-sm" style={{ width: 8, height: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{angle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
