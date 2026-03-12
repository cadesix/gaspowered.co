"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface BatchImage {
  index: number;
  brandIndex: number;
  brandName: string;
  brandColors: string[];
  url: string;
  prompt: string;
}

/* ═══════════════════════════════════════════
   LIGHTBOX
   ═══════════════════════════════════════════ */

function Lightbox({
  image,
  saved,
  onToggleSave,
  onClose,
}: {
  image: BatchImage;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {image.brandColors?.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            <span className="text-[13px] font-mono text-white/60">{image.brandName}</span>
          </div>
          <button
            onClick={onToggleSave}
            className="px-4 py-2 text-[12px] font-mono font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
            style={{
              background: saved ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.08)",
              color: saved ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.6)",
              border: `1px solid ${saved ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {saved ? "Saved ✓" : "Save to Portfolio"}
          </button>
        </div>
        <p
          className="font-mono max-w-[600px]"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}
        >
          {image.prompt}
        </p>
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
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function FakeStaticsPage() {
  const [phase, setPhase] = useState<"idle" | "generating" | "done">("idle");
  const [direction, setDirection] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [batchImages, setBatchImages] = useState<(BatchImage | null)[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [portfolio, setPortfolio] = useState<BatchImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<BatchImage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isInPortfolio = useCallback(
    (img: BatchImage) => portfolio.some((p) => p.url === img.url),
    [portfolio],
  );

  const togglePortfolio = useCallback((img: BatchImage) => {
    setPortfolio((prev) => {
      const exists = prev.some((p) => p.url === img.url);
      if (exists) return prev.filter((p) => p.url !== img.url);
      return [...prev, img];
    });
  }, []);

  const handleGenerate = useCallback(
    async (steer?: string) => {
      setPhase("generating");
      setBatchImages(Array(10).fill(null));
      setImageCount(0);
      setError(null);
      setStatusMessage("Inventing brands...");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/fakestatics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction: steer || undefined }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

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
                    setStatusMessage(data.message || "");
                    break;
                  case "image": {
                    const img: BatchImage = {
                      index: data.index,
                      brandIndex: data.brandIndex,
                      brandName: data.brandName,
                      brandColors: data.brandColors,
                      url: data.url,
                      prompt: data.prompt,
                    };
                    setBatchImages((prev) => {
                      const next = [...prev];
                      next[data.index] = img;
                      return next;
                    });
                    setImageCount((c) => c + 1);
                    break;
                  }
                  case "done":
                    setPhase("done");
                    setStatusMessage("");
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
    },
    [],
  );

  const handleNewBatch = useCallback(() => {
    handleGenerate(direction.trim() || undefined);
  }, [handleGenerate, direction]);

  const totalSlots = batchImages.length;

  return (
    <div
      className="h-screen overflow-hidden relative flex flex-col"
      style={{ background: "#000000", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
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
            saved={isInPortfolio(lightboxImage)}
            onToggleSave={() => togglePortfolio(lightboxImage)}
            onClose={() => setLightboxImage(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-white/[0.08] shrink-0 relative z-40">
        <div className="flex items-baseline gap-4 flex-1">
          <span className="text-[20px] font-semibold tracking-[0.2em] text-white/90" style={{ fontFamily: '"PPMondwest", sans-serif' }}>
            GAS
          </span>
          <span className="text-[13px] font-mono tracking-[0.06em] text-white/40 uppercase">
            Fake Statics
          </span>
        </div>

        <div className="flex items-center gap-4">
          {portfolio.length > 0 && (
            <span className="text-[12px] font-mono text-white/35">
              {portfolio.length} saved
            </span>
          )}
          {phase === "generating" && (
            <div className="flex items-center gap-2 text-[12px] font-mono text-white/25">
              <motion.div
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {imageCount}/{totalSlots}
            </div>
          )}
          {phase === "done" && (
            <div className="flex items-center gap-2 text-[12px] font-mono text-emerald-400/70">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              {imageCount}/{totalSlots} complete
            </div>
          )}
        </div>
      </div>

      {/* Portfolio strip */}
      <AnimatePresence>
        {portfolio.length > 0 && (
          <motion.div
            className="shrink-0 border-b border-white/[0.06] px-6 py-3 flex items-center gap-3 overflow-x-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[11px] font-mono text-white/25 uppercase tracking-wider shrink-0">
              Portfolio
            </span>
            {portfolio.map((img) => (
              <motion.div
                key={img.url}
                className="relative w-12 h-12 rounded overflow-hidden shrink-0 cursor-pointer group"
                style={{ border: "1px solid rgba(52,211,153,0.3)" }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                onClick={() => setLightboxImage(img)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePortfolio(img);
                  }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/70 text-xs"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ─── IDLE STATE ─── */}
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
                  <h1 className="text-[32px] font-semibold tracking-tight text-white/90" style={{ letterSpacing: "-0.02em" }}>
                    Fake Statics
                  </h1>
                  <p className="text-[14px] font-mono text-white/55 text-center leading-relaxed">
                    Generate 10 ad creatives across 5 brands. Save the ones you like, regenerate until you have a portfolio.
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <input
                      type="text"
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate(direction.trim() || undefined)}
                      placeholder="Optional: steer the brands (e.g. 'more beverage brands', 'luxury aesthetic')..."
                      className="flex-1 bg-transparent outline-none text-[15px] font-mono text-white/80 placeholder:text-white/20"
                    />
                  </div>

                  <motion.button
                    onClick={() => handleGenerate(direction.trim() || undefined)}
                    className="w-full py-3.5 text-[14px] font-mono font-bold tracking-[0.06em] uppercase cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.93)",
                      color: "#000",
                    }}
                    whileHover={{ scale: 1.01, background: "rgba(255,255,255,1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Generate Batch
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── GENERATING / RESULTS ─── */}
          {(phase === "generating" || phase === "done") && (
            <motion.div
              key="active"
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Status bar */}
              {phase === "generating" && statusMessage && (
                <div className="px-6 py-2.5 border-b border-white/[0.06] flex items-center gap-3">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="text-[12px] font-mono text-white/40">{statusMessage}</span>
                </div>
              )}

              {/* Image grid */}
              <div
                className="flex-1 p-5 overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
              >
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {batchImages.map((img, i) => {
                    const saved = img ? isInPortfolio(img) : false;
                    return (
                      <motion.div
                        key={i}
                        className="relative aspect-square rounded overflow-hidden cursor-pointer group"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: `1px solid ${saved ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.06)"}`,
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03, duration: 0.4 }}
                        whileHover={img ? { scale: 1.02 } : {}}
                        onClick={() => img && setLightboxImage(img)}
                      >
                        {img ? (
                          <>
                            <motion.img
                              src={img.url}
                              alt=""
                              className="w-full h-full object-cover"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                            />
                            {/* Brand label */}
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-mono text-white/70">{img.brandName}</span>
                            </div>
                            {/* Save button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePortfolio(img);
                              }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              style={{
                                background: saved ? "rgba(52,211,153,0.2)" : "rgba(0,0,0,0.6)",
                                border: `1px solid ${saved ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.15)"}`,
                                color: saved ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.6)",
                                fontSize: 13,
                              }}
                            >
                              {saved ? "✓" : "+"}
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <motion.div
                              className="rounded-full"
                              style={{ width: 6, height: 6, background: "rgba(255,255,255,0.15)" }}
                              animate={{ opacity: [0.2, 0.6, 0.2] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {error && (
                  <div
                    className="mt-4 px-3 py-2.5 rounded font-mono"
                    style={{ fontSize: 12, color: "rgba(239,68,68,0.8)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                  >
                    {error}
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              {phase === "done" && (
                <motion.div
                  className="shrink-0 px-5 py-3 flex items-center gap-3 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div
                    className="flex-1 flex items-center gap-3 px-4 py-3 rounded"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <input
                      type="text"
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNewBatch()}
                      placeholder="Steer the next batch (optional)..."
                      className="flex-1 bg-transparent outline-none text-[13px] font-mono text-white/80 placeholder:text-white/20"
                    />
                  </div>
                  <button
                    onClick={handleNewBatch}
                    className="px-5 py-3 text-[12px] font-mono font-bold uppercase tracking-wider cursor-pointer rounded transition-colors shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.93)",
                      color: "#000",
                    }}
                  >
                    New Batch
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
