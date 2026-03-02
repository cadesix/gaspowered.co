"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const GAS_LOGO = "/img/gas_logo.jpg";

const STEPS = [
  { label: "Analyzing website", desc: "Scraping content & brand identity" },
  { label: "Crafting ad strategy", desc: "Identifying compelling angles" },
  { label: "Generating creatives", desc: "Producing ad variations" },
  { label: "Complete", desc: "Your creatives are ready" },
];

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface GeneratedImage {
  url: string;
  prompt: string;
}

/* ═══════════════════════════════════════════
   STEP PROGRESS
   ═══════════════════════════════════════════ */

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col">
      {STEPS.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div
            key={i}
            className="flex gap-4"
            style={{ alignItems: "flex-start" }}
          >
            {/* Connector */}
            <div className="flex flex-col items-center" style={{ width: 28 }}>
              <motion.div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  border: `2px solid ${
                    isComplete
                      ? "rgba(52,211,153,0.7)"
                      : isCurrent
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.1)"
                  }`,
                  background: isComplete
                    ? "rgba(52,211,153,0.1)"
                    : "transparent",
                }}
                animate={
                  isCurrent
                    ? {
                        borderColor: [
                          "rgba(255,255,255,0.3)",
                          "rgba(255,255,255,0.6)",
                          "rgba(255,255,255,0.3)",
                        ],
                      }
                    : {}
                }
                transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
              >
                {isComplete && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7l3 3 5-6"
                      stroke="rgba(52,211,153,0.9)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {isCurrent && (
                  <motion.div
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      background: "rgba(255,255,255,0.8)",
                    }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 2,
                    height: 36,
                    background: isComplete
                      ? "rgba(52,211,153,0.25)"
                      : "rgba(255,255,255,0.06)",
                  }}
                />
              )}
            </div>

            {/* Text */}
            <div
              style={{
                paddingTop: 3,
                paddingBottom: i < STEPS.length - 1 ? 20 : 0,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: isComplete
                    ? "rgba(52,211,153,0.85)"
                    : isCurrent
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.35)",
                }}
              >
                {step.label}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: isCurrent
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(255,255,255,0.25)",
                  marginTop: 2,
                }}
              >
                {step.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   LIGHTBOX
   ═══════════════════════════════════════════ */

function Lightbox({
  image,
  onClose,
  onIterate,
}: {
  image: GeneratedImage;
  onClose: () => void;
  onIterate: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-[80vw] flex flex-col gap-4 my-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt=""
          className="max-w-full max-h-[65vh] rounded object-contain"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <div className="flex items-center justify-between max-w-[600px] w-full mx-auto">
          <p
            className="font-mono flex-1"
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
            }}
          >
            {image.prompt}
          </p>
          <button
            onClick={onIterate}
            className="text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-colors px-4 py-2 rounded shrink-0 ml-4"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Iterate
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 16,
          }}
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   IMAGE GRID
   ═══════════════════════════════════════════ */

function ImageGrid({
  images,
  onSelect,
}: {
  images: (GeneratedImage | null)[];
  onSelect: (img: GeneratedImage) => void;
}) {
  const cols = images.length > 4 ? "repeat(4, 1fr)" : "repeat(2, 1fr)";

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: cols }}>
      {images.map((img, i) => (
        <motion.div
          key={i}
          className="relative aspect-square rounded overflow-hidden cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
          whileHover={img ? { scale: 1.02 } : {}}
          onClick={() => img && onSelect(img)}
        >
          {img ? (
            <motion.img
              src={img.url}
              alt=""
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: "rgba(255,255,255,0.15)",
                }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function InstantCreativesPage() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [domain, setDomain] = useState<string>("");
  const [siteTitle, setSiteTitle] = useState<string>("");
  const [insights, setInsights] = useState<string[]>([]);
  const [basePrompts, setBasePrompts] = useState<string[]>([]);
  const [images, setImages] = useState<(GeneratedImage | null)[]>(
    Array(4).fill(null),
  );
  const [imageCount, setImageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(
    null,
  );
  const [morePrompt, setMorePrompt] = useState("");
  const [moreLoading, setMoreLoading] = useState(false);
  const [iterateTarget, setIterateTarget] = useState<GeneratedImage | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);

  const extractDomain = (input: string) => {
    try {
      const withProto = input.startsWith("http") ? input : `https://${input}`;
      return new URL(withProto).hostname;
    } catch {
      return input;
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!url.trim()) return;

    const d = extractDomain(url.trim());
    setDomain(d);
    setFavicon(`https://www.google.com/s2/favicons?domain=${d}&sz=64`);
    setPhase("processing");
    setCurrentStep(0);
    setInsights([]);
    setBasePrompts([]);
    setImages(Array(4).fill(null));
    setImageCount(0);
    setError(null);
    setSiteTitle("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/instant-creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              switch (currentEvent) {
                case "step":
                  if (data.step === 3) {
                    setCurrentStep(4);
                    setPhase("done");
                  } else {
                    setCurrentStep(data.step);
                  }
                  break;
                case "analysis":
                  setSiteTitle(data.title || "");
                  break;
                case "concepts":
                  if (data.insights) setInsights(data.insights);
                  if (data.prompts) setBasePrompts(data.prompts);
                  break;
                case "image":
                  setImages((prev) => {
                    const next = [...prev];
                    next[data.index] = {
                      url: data.url,
                      prompt: data.prompt,
                    };
                    return next;
                  });
                  setImageCount((c) => c + 1);
                  break;
                case "error":
                  setError(data.message);
                  break;
              }
            } catch {
              // skip malformed JSON
            }
            currentEvent = "";
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [url]);

  const handlePromptSubmit = useCallback(async () => {
    if (!morePrompt.trim() || moreLoading) return;
    setMoreLoading(true);

    if (iterateTarget) {
      // Iterate on a specific image
      try {
        const res = await fetch("/api/instant-creatives", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: iterateTarget.prompt,
            feedback: morePrompt.trim(),
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();
        const newImage: GeneratedImage = { url: data.url, prompt: data.prompt };

        setImages((prev) =>
          prev.map((img) =>
            img &&
            img.url === iterateTarget.url &&
            img.prompt === iterateTarget.prompt
              ? newImage
              : img,
          ),
        );
        setMorePrompt("");
        setIterateTarget(null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setMoreLoading(false);
      }
      return;
    }

    // +4 more images flow
    const startIndex = images.length;
    setImages((prev) => [...prev, ...Array(4).fill(null)]);

    try {
      const res = await fetch("/api/instant-creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customPrompt: morePrompt.trim(),
          basePrompts,
          count: 4,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "image") {
                const idx = startIndex + data.index;
                setImages((prev) => {
                  const next = [...prev];
                  next[idx] = {
                    url: data.url,
                    prompt: data.prompt,
                  };
                  return next;
                });
                setImageCount((c) => c + 1);
              }
            } catch {
              // skip malformed JSON
            }
            currentEvent = "";
          }
        }
      }

      setMorePrompt("");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      setImages((prev) => prev.slice(0, startIndex));
    } finally {
      setMoreLoading(false);
    }
  }, [morePrompt, moreLoading, images.length, basePrompts, iterateTarget]);

  const handleReset = () => {
    abortRef.current?.abort();
    setPhase("idle");
    setUrl("");
    setCurrentStep(0);
    setFavicon(null);
    setDomain("");
    setSiteTitle("");
    setInsights([]);
    setBasePrompts([]);
    setImages(Array(4).fill(null));
    setImageCount(0);
    setError(null);
    setMorePrompt("");
    setIterateTarget(null);
  };

  const totalSlots = images.length;

  return (
    <div
      className="h-screen overflow-hidden relative flex flex-col"
      style={{
        background: "#000000",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <Lightbox
            image={lightboxImage}
            onClose={() => setLightboxImage(null)}
            onIterate={() => {
              setIterateTarget(lightboxImage);
              setLightboxImage(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-white/[0.08] shrink-0 relative z-40">
        <div className="flex items-baseline gap-4 flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GAS_LOGO}
            alt=""
            className="w-6 h-6 rounded-full self-center object-cover shrink-0"
            style={{ border: "1.5px solid rgba(255,255,255,0.15)" }}
          />
          <span
            className="text-[20px] font-semibold tracking-[0.2em] text-white/90"
            style={{ fontFamily: '"PPMondwest", sans-serif' }}
          >
            GAS
          </span>
          <span className="text-[13px] font-mono tracking-[0.06em] text-white/40 uppercase">
            Instant Creatives
          </span>
        </div>

        {phase !== "idle" && (
          <div className="flex items-center gap-4">
            {favicon && (
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={favicon}
                  alt=""
                  className="w-5 h-5 rounded object-contain shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <span className="text-[13px] font-mono text-white/50">
                  {domain}
                </span>
              </div>
            )}
            {phase === "processing" && (
              <div className="flex items-center gap-2 text-[12px] font-mono text-white/25">
                <motion.div
                  className="w-2 h-2 rounded-full bg-amber-400"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {imageCount}/{totalSlots} images
              </div>
            )}
            {phase === "done" && (
              <div className="flex items-center gap-2 text-[12px] font-mono text-emerald-400/70">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                {imageCount}/{totalSlots} complete
              </div>
            )}
            <button
              onClick={handleReset}
              className="text-[11px] font-mono text-white/25 hover:text-white/50 uppercase tracking-wider cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ─── IDLE STATE: URL INPUT ─── */}
          {phase === "idle" && (
            <motion.div
              key="idle"
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col items-center gap-8 w-full max-w-[520px] px-6">
                <div className="flex flex-col items-center gap-3">
                  <h1
                    className="text-[32px] font-semibold tracking-tight text-white/90"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Instant Creatives
                  </h1>
                  <p className="text-[14px] font-mono text-white/55 text-center leading-relaxed">
                    Enter any website. We&apos;ll analyze the brand and generate
                    ad creatives in seconds.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="drinkag1.com"
                      className="flex-1 bg-transparent outline-none text-[15px] font-mono text-white/80 placeholder:text-white/20"
                    />
                  </div>
                  <motion.button
                    onClick={handleSubmit}
                    className="w-full py-3.5 text-[14px] font-mono font-bold tracking-[0.06em] uppercase cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.93)",
                      color: "#000",
                    }}
                    whileHover={{
                      scale: 1.01,
                      background: "rgba(255,255,255,1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Generate Creatives
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PROCESSING / RESULTS STATE ─── */}
          {phase !== "idle" && (
            <motion.div
              key="active"
              className="flex-1 flex min-h-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Left sidebar: progress + insights */}
              <div
                className="w-[340px] shrink-0 flex flex-col border-r overflow-y-auto"
                style={{
                  borderColor: "rgba(255,255,255,0.06)",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.08) transparent",
                }}
              >
                {/* Brand identity */}
                <div
                  className="px-5 py-5 border-b flex items-center gap-3"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  {favicon && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 20 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={favicon}
                        alt=""
                        className="w-10 h-10 rounded-lg object-contain shrink-0"
                        style={{
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.05)",
                        }}
                      />
                    </motion.div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-mono text-white/80 font-medium truncate">
                      {siteTitle || domain}
                    </span>
                    <span className="text-[11px] font-mono text-white/30 truncate">
                      {domain}
                    </span>
                  </div>
                </div>

                {/* Step progress */}
                <div
                  className="px-5 py-5 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <StepProgress currentStep={currentStep} />
                </div>

                {/* Insights */}
                <AnimatePresence>
                  {insights.length > 0 && (
                    <motion.div
                      className="px-5 py-5 flex-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className="text-[11px] font-mono uppercase tracking-wider mb-3"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        Creative Strategy
                      </div>
                      <ul className="flex flex-col gap-2">
                        {insights.map((insight, i) => (
                          <li
                            key={i}
                            className="font-mono flex gap-2.5"
                            style={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.6)",
                              lineHeight: 1.6,
                            }}
                          >
                            <span
                              className="shrink-0 mt-[2px]"
                              style={{ color: "rgba(255,255,255,0.2)" }}
                            >
                              -
                            </span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                  <div className="px-5 py-4">
                    <div
                      className="px-3 py-2.5 rounded font-mono"
                      style={{
                        fontSize: 12,
                        color: "rgba(239,68,68,0.8)",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}
                    >
                      {error}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Image grid + sticky prompt */}
              <div className="flex-1 flex flex-col min-h-0">
                <div
                  className="flex-1 p-5 overflow-y-auto"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.08) transparent",
                  }}
                >
                  <ImageGrid images={images} onSelect={setLightboxImage} />
                </div>

                {/* Sticky bottom prompt */}
                {phase === "done" && (
                  <motion.div
                    className="shrink-0 px-5 py-3 flex flex-col gap-2 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {/* Iterate target attachment */}
                    <AnimatePresence>
                      {iterateTarget && (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div
                            className="flex items-center gap-2 px-2 py-1.5 rounded"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={iterateTarget.url}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                            <button
                              onClick={() => setIterateTarget(null)}
                              className="text-white/30 hover:text-white/60 transition-colors cursor-pointer ml-1"
                              style={{ fontSize: 14, lineHeight: 1 }}
                            >
                              ×
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${iterateTarget ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        <input
                          type="text"
                          value={morePrompt}
                          onChange={(e) => setMorePrompt(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handlePromptSubmit()
                          }
                          placeholder={
                            iterateTarget
                              ? "Describe changes to this image..."
                              : "Describe what you want to see more of..."
                          }
                          className="flex-1 bg-transparent outline-none text-[13px] font-mono text-white/80 placeholder:text-white/20"
                          disabled={moreLoading}
                        />
                      </div>
                      <button
                        onClick={handlePromptSubmit}
                        disabled={moreLoading || !morePrompt.trim()}
                        className="px-5 py-3 text-[12px] font-mono font-bold uppercase tracking-wider cursor-pointer rounded transition-colors shrink-0"
                        style={{
                          background: moreLoading
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.1)",
                          color: moreLoading
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {moreLoading ? (
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          >
                            Generating...
                          </motion.span>
                        ) : iterateTarget ? (
                          "Iterate"
                        ) : (
                          "+4 More"
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
