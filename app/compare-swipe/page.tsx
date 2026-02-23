"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
} from "framer-motion";

/* ═══════════════════════════════════════════
   AD DATA
   ═══════════════════════════════════════════ */

interface Ad {
  id: string;
  src: string;
  label: string;
}

const ADS: Ad[] = [
  { id: "candrinks", src: "/candrinks.mp4", label: "Drink Stacking Challenge" },
  { id: "chocolate", src: "/chocolate.mp4", label: "Chocolate Heart Creation" },
  { id: "clavicular", src: "/clavicular.mp4", label: "Aspirational Lifestyle" },
  { id: "dance", src: "/dance.mp4", label: "Dance Trend" },
  { id: "elonrogan", src: "/elonrogan.mp4", label: "Elon on Rogan" },
  { id: "brainrot", src: "/brainrot.mp4", label: "AI Characters Singing" },
  { id: "foodgame", src: "/foodgame.mp4", label: "Blindfolded Challenge" },
  { id: "grandma", src: "/grandma.mp4", label: "Pink Private Jet" },
  { id: "haul", src: "/haul.mp4", label: "PR Haul Unboxing" },
  { id: "jonas", src: "/jonas.mp4", label: "Celebrity Couple Reveal" },
  { id: "minecraft", src: "/minecraft.mp4", label: "Minecraft Animals" },
  { id: "prank", src: "/prank.mp4", label: "Relationship Skit" },
  { id: "redbull", src: "/redbull.mp4", label: "Mega Ramp Drop" },
];

const REWARD_AMOUNT = 1000;
const GAS_LOGO = "/img/gas_logo.jpg";
const SWIPE_THRESHOLD = 100;

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function pickRandom(exclude?: string): Ad {
  const candidates = exclude ? ADS.filter((a) => a.id !== exclude) : ADS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function formatTokens(n: number): string {
  return n.toLocaleString("en-US");
}

/* ═══════════════════════════════════════════
   TOKEN PARTICLE
   ═══════════════════════════════════════════ */

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  delay: number;
}

let particleId = 0;

function TokenParticle({
  particle,
  onDone,
}: {
  particle: Particle;
  onDone: (id: number) => void;
}) {
  useEffect(() => {
    const t = setTimeout(
      () => onDone(particle.id),
      1200 + particle.delay * 1000,
    );
    return () => clearTimeout(t);
  }, [particle, onDone]);

  // Spray down and slightly left from origin (the balance)
  const endX = -40 - Math.random() * 80;
  const endY = 120 + Math.random() * 160;
  const midX = endX * 0.3 + (Math.random() - 0.5) * 60;
  const midY = endY * 0.25;

  return (
    <motion.div
      className="fixed pointer-events-none z-[100]"
      style={{ left: particle.x, top: particle.y }}
      initial={{ opacity: 1, scale: 0.8, x: 0, y: 0 }}
      animate={{
        opacity: [1, 0.9, 0],
        scale: [0.8, 1.1, 0.3],
        x: [0, midX, endX],
        y: [0, midY, endY],
      }}
      transition={{
        duration: 1.1,
        delay: particle.delay,
        ease: [0.1, 0.6, 0.3, 1],
        times: [0, 0.4, 1],
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GAS_LOGO}
        alt=""
        className="w-6 h-6 rounded-full"
        style={{
          border: "1.5px solid rgba(255,255,255,0.5)",
          boxShadow: "0 0 12px rgba(255,255,255,0.2)",
        }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   +1K POPUP
   ═══════════════════════════════════════════ */

interface RewardPopup {
  id: number;
  x: number;
  y: number;
}

let popupId = 0;

function RewardPopupEl({
  popup,
  onDone,
}: {
  popup: RewardPopup;
  onDone: (id: number) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone(popup.id), 1400);
    return () => clearTimeout(t);
  }, [popup, onDone]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[101] flex items-center gap-1.5"
      style={{ left: popup.x, top: popup.y }}
      initial={{ opacity: 1, y: 0, scale: 0.8 }}
      animate={{ opacity: [1, 1, 0], y: 60, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <span className="text-[18px] font-mono font-bold text-white drop-shadow-lg">
        +1k
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GAS_LOGO}
        alt=""
        className="w-5 h-5 rounded-full"
        style={{
          border: "1.5px solid rgba(255,255,255,0.5)",
        }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════ */

function AnimatedBalance({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;

    const start = performance.now();
    const duration = 600;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span className="font-mono tabular-nums text-[18px] font-semibold text-white/90">
      {formatTokens(display)}
    </span>
  );
}

/* ═══════════════════════════════════════════
   SWIPE VERDICT STAMP
   ═══════════════════════════════════════════ */

function SwipeStamp({
  direction,
  opacity,
}: {
  direction: "left" | "right";
  opacity: number;
}) {
  const isGood = direction === "right";
  return (
    <div
      className="absolute top-8 z-10 px-4 py-2 rounded-sm font-mono text-[22px] font-black uppercase tracking-wider"
      style={{
        [isGood ? "left" : "right"]: 20,
        border: `3px solid ${isGood ? "#22c55e" : "#ef4444"}`,
        color: isGood ? "#22c55e" : "#ef4444",
        opacity,
        transform: `rotate(${isGood ? -15 : 15}deg)`,
      }}
    >
      {isGood ? "FIRE" : "SKIP"}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SWIPEABLE CARD
   ═══════════════════════════════════════════ */

function SwipeCard({
  ad,
  onSwipe,
  isTop,
}: {
  ad: Ad;
  onSwipe: (dir: "left" | "right") => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const rightStampOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftStampOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isTop) return;
    v.src = ad.src;
    v.load();
    v.play().catch(() => {});
  }, [ad.src, isTop]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
        onSwipe(offset > 0 ? "right" : "left");
      }
    },
    [onSwipe],
  );

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 0.92, opacity: 0.5 }}
        animate={{ scale: 0.95, opacity: 0.7 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full h-full rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/[0.06]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        rotate: x.get() > 0 ? 25 : -25,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/[0.08]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay
        />

        {/* Gradient overlay at bottom for label */}
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }}
        />

        {/* Ad label */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white font-mono text-[15px] font-medium tracking-wide">
            {ad.label}
          </p>
          <p className="text-white/60 font-mono text-[12px] mt-1 uppercase tracking-widest">
            {ad.id}
          </p>
        </div>

        {/* Swipe stamps */}
        <motion.div style={{ opacity: rightStampOpacity }}>
          <SwipeStamp direction="right" opacity={1} />
        </motion.div>
        <motion.div style={{ opacity: leftStampOpacity }}>
          <SwipeStamp direction="left" opacity={1} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function CompareSwipePage() {
  const [stack, setStack] = useState<Ad[]>(() => {
    const first = pickRandom();
    const second = pickRandom(first.id);
    return [first, second];
  });
  const [balance, setBalance] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [popups, setPopups] = useState<RewardPopup[]>([]);
  const [balancePop, setBalancePop] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right">("right");
  const balanceRef = useRef<HTMLDivElement>(null);
  const cardAreaRef = useRef<HTMLDivElement>(null);
  const [walletAddress] = useState(() => {
    const chars = "0123456789abcdef";
    let addr = "0x";
    for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
    return addr;
  });

  const truncatedWallet = useMemo(
    () => `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    [walletAddress],
  );

  const spawnParticles = useCallback(() => {
    const balanceEl = balanceRef.current;
    const originX = balanceEl
      ? balanceEl.getBoundingClientRect().left +
        balanceEl.getBoundingClientRect().width / 2
      : window.innerWidth - 80;
    const originY = balanceEl ? balanceEl.getBoundingClientRect().bottom : 48;

    const count = 6;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: ++particleId,
        x: originX,
        y: originY,
        targetX: 0,
        targetY: 0,
        delay: i * 0.05,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    setPopups((prev) => [
      ...prev,
      { id: ++popupId, x: originX - 30, y: originY - 10 },
    ]);
  }, []);

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removePopup = useCallback((id: number) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleSwipe = useCallback(
    (dir: "left" | "right") => {
      setExitDir(dir);

      spawnParticles();

      setTimeout(() => {
        setBalance((b) => b + REWARD_AMOUNT);
        setBalancePop(true);
        setTimeout(() => setBalancePop(false), 400);
      }, 500);

      setComparisons((c) => c + 1);

      // Advance the stack
      setStack((prev) => {
        const next = pickRandom(prev[1]?.id);
        return [prev[1], next];
      });
    },
    [spawnParticles],
  );

  // Button handlers for manual voting
  const handleButton = useCallback(
    (dir: "left" | "right") => {
      spawnParticles();
      setExitDir(dir);

      setTimeout(() => {
        setBalance((b) => b + REWARD_AMOUNT);
        setBalancePop(true);
        setTimeout(() => setBalancePop(false), 400);
      }, 500);

      setComparisons((c) => c + 1);

      setStack((prev) => {
        const next = pickRandom(prev[1]?.id);
        return [prev[1], next];
      });
    },
    [spawnParticles],
  );

  return (
    <div
      className="h-[100dvh] overflow-hidden relative flex flex-col"
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

      {/* Floating particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <TokenParticle key={p.id} particle={p} onDone={removeParticle} />
        ))}
      </AnimatePresence>

      {/* +1k popups */}
      <AnimatePresence>
        {popups.map((p) => (
          <RewardPopupEl key={p.id} popup={p} onDone={removePopup} />
        ))}
      </AnimatePresence>

      {/* Header — compact for mobile */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] shrink-0 relative z-40">
        <div className="flex items-center gap-3">
          <span
            className="text-[18px] font-semibold tracking-[0.2em] text-white/90"
            style={{ fontFamily: '"PPMondwest", sans-serif' }}
          >
            GAS
          </span>
          <div className="hidden sm:flex items-center gap-2 text-[12px] font-mono text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {truncatedWallet}
          </div>
        </div>

        <div
          ref={balanceRef}
          className="flex items-center gap-2 px-3 py-1.5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GAS_LOGO}
            alt=""
            className="w-5 h-5 rounded-full"
            style={{
              border: "1.5px solid rgba(255,255,255,0.15)",
            }}
          />
          <motion.div
            animate={balancePop ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <AnimatedBalance value={balance} />
          </motion.div>
          <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider">
            GAS
          </span>
        </div>
      </div>

      {/* Card stack area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 py-3 gap-3">
        {/* Swipe hints */}
        {/* <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[380px] px-2">
          <span className="text-[12px] font-mono text-red-400/70 uppercase tracking-wider">
            ← Skip
          </span>
          <span className="text-[12px] font-mono text-white/40 uppercase tracking-wider">
            Swipe to rate
          </span>
          <span className="text-[12px] font-mono text-emerald-400/70 uppercase tracking-wider">
            Fire →
          </span>
        </div> */}

        {/* Card container */}
        <div
          ref={cardAreaRef}
          className="relative w-full max-w-[340px] sm:max-w-[380px] flex-1 max-h-[70dvh]"
          style={{ aspectRatio: "9 / 16" }}
        >
          <AnimatePresence initial={false} custom={exitDir}>
            {stack.map((ad, i) => (
              <SwipeCard
                key={ad.id + "-" + (comparisons + i)}
                ad={ad}
                onSwipe={handleSwipe}
                isTop={i === 0}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-1">
          <motion.button
            className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              border: "2px solid rgba(239,68,68,0.6)",
              background: "rgba(239,68,68,0.1)",
            }}
            whileHover={{ scale: 1.1, background: "rgba(239,68,68,0.2)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButton("left")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(239,68,68,0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>

          <motion.button
            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              border: "2px solid rgba(34,197,94,0.6)",
              background: "rgba(34,197,94,0.1)",
            }}
            whileHover={{ scale: 1.1, background: "rgba(34,197,94,0.2)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButton("right")}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(34,197,94,0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.button>
        </div>

        {/* Stats */}
        {/* <div className="flex items-center gap-3">
          <span className="text-[12px] font-mono text-white/50">
            {comparisons} rated
          </span>
          <span className="text-[12px] font-mono text-white/30">·</span>
          <span className="text-[12px] font-mono text-white/50">
            +{formatTokens(REWARD_AMOUNT)} GAS per swipe
          </span>
        </div> */}
      </div>

      {/* Keyboard shortcuts (desktop) */}
      <KeyboardHandler onSwipe={handleSwipe} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   KEYBOARD HANDLER
   ═══════════════════════════════════════════ */

function KeyboardHandler({
  onSwipe,
}: {
  onSwipe: (dir: "left" | "right") => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a") {
        onSwipe("left");
      } else if (e.key === "ArrowRight" || e.key === "d") {
        onSwipe("right");
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onSwipe]);

  return null;
}
