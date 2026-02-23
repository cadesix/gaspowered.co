"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function pickNewOpponent(keep: Ad): Ad {
  const candidates = ADS.filter((a) => a.id !== keep.id);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickPair(): [Ad, Ad] {
  const shuffled = [...ADS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function formatTokens(n: number): string {
  return n.toLocaleString("en-US");
}

/* ═══════════════════════════════════════════
   TOKEN PARTICLE — gas logo flying to balance
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
      1800 + particle.delay * 1000,
    );
    return () => clearTimeout(t);
  }, [particle, onDone]);

  const scatterX = (Math.random() - 0.5) * 200;
  const scatterY = -Math.random() * 140 - 40;

  return (
    <motion.div
      className="fixed pointer-events-none z-[100]"
      style={{ left: particle.x, top: particle.y }}
      initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0.5, 1.3, 0.4],
        x: [0, scatterX, particle.targetX - particle.x],
        y: [0, scatterY, particle.targetY - particle.y],
      }}
      transition={{
        duration: 1.35,
        delay: particle.delay,
        ease: [0.2, 0.8, 0.3, 1],
        times: [0, 0.35, 1],
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GAS_LOGO}
        alt=""
        className="w-8 h-8 rounded-full"
        style={{
          border: "2px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 0 16px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)",
        }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   +1K POPUP — floats up from button on click
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
    const t = setTimeout(() => onDone(popup.id), 2100);
    return () => clearTimeout(t);
  }, [popup, onDone]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[101] flex items-center gap-1.5"
      style={{ left: popup.x, top: popup.y }}
      initial={{ opacity: 1, y: 0, scale: 0.7 }}
      animate={{ opacity: [1, 1, 0], y: -100, scale: 1.1 }}
      transition={{ duration: 2.0, ease: "easeOut" }}
    >
      <span
        className="text-[22px] font-mono font-bold text-white"
        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
      >
        +1k
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GAS_LOGO}
        alt=""
        className="w-6 h-6 rounded-full"
        style={{
          border: "2px solid rgba(255,255,255,0.6)",
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
   VIDEO SLOT — handles dim/pullback + swap
   ═══════════════════════════════════════════ */

type TransitionPhase = "idle" | "judging" | "swapping";

function VideoSlot({
  ad,
  phase,
  isLoser,
}: {
  ad: Ad;
  phase: TransitionPhase;
  isLoser: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.src = ad.src;
    v.load();
    v.play().catch(() => {});
  }, [ad.src]);

  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{ aspectRatio: "9 / 16", maxHeight: "calc(100vh - 180px)" }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={ad.id}
          className="absolute inset-0"
          initial={{ opacity: 0, y: "100%" }}
          animate={{
            opacity: phase === "judging" ? 0.35 : 1,
            scale: phase === "judging" ? 0.94 : 1,
            filter: phase === "judging" ? "brightness(0.3)" : "brightness(1)",
            y: "0%",
          }}
          exit={
            isLoser
              ? { opacity: 0, y: "-100%", filter: "brightness(0.15)" }
              : { opacity: 0 }
          }
          transition={{
            duration: phase === "judging" ? 0.375 : 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.div
            className="relative w-full h-full overflow-hidden"
            animate={{
              borderColor:
                phase === "judging" && !isLoser
                  ? "rgba(34,197,94,0.8)"
                  : "rgba(255,255,255,0.2)",
              boxShadow:
                phase === "judging" && !isLoser
                  ? "0 0 20px rgba(34,197,94,0.15), inset 0 0 20px rgba(34,197,94,0.05)"
                  : "0 0 0px rgba(34,197,94,0), inset 0 0 0px rgba(34,197,94,0)",
            }}
            transition={{ duration: phase === "idle" ? 0.8 : 0.3, ease: "easeOut" }}
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover p-1"
              muted
              loop
              playsInline
              autoPlay
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function ComparePage() {
  const [pair, setPair] = useState<[Ad, Ad]>(() => pickPair());
  const [balance, setBalance] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [loserSide, setLoserSide] = useState<"left" | "right" | "both" | null>(
    null,
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const [popups, setPopups] = useState<RewardPopup[]>([]);
  const [balancePop, setBalancePop] = useState(false);
  const balanceRef = useRef<HTMLDivElement>(null);
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

  const spawnParticles = useCallback((originX: number, originY: number) => {
    const balanceEl = balanceRef.current;
    const targetX = balanceEl
      ? balanceEl.getBoundingClientRect().left +
        balanceEl.getBoundingClientRect().width / 2
      : window.innerWidth - 100;
    const targetY = balanceEl
      ? balanceEl.getBoundingClientRect().top +
        balanceEl.getBoundingClientRect().height / 2
      : 24;

    const count = 10;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: ++particleId,
        x: originX,
        y: originY,
        targetX,
        targetY,
        delay: i * 0.07,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    // Also spawn the "+1k" popup
    setPopups((prev) => [
      ...prev,
      { id: ++popupId, x: originX - 30, y: originY - 20 },
    ]);
  }, []);

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removePopup = useCallback((id: number) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleVote = useCallback(
    (choice: "left" | "right" | "bad", e: React.MouseEvent) => {
      if (isTransitioning) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top;

      spawnParticles(originX, originY);

      // Delay balance update so particles arrive first
      setTimeout(() => {
        setBalance((b) => b + REWARD_AMOUNT);
        setBalancePop(true);
        setTimeout(() => setBalancePop(false), 500);
      }, 1000);

      setComparisons((c) => c + 1);
      setIsTransitioning(true);

      // Phase 1: Both dim and pull back
      setPhase("judging");
      setLoserSide(
        choice === "left" ? "right" : choice === "right" ? "left" : "both",
      );

      // Phase 2: After dim, swap the loser out
      setTimeout(() => {
        setPhase("swapping");
        if (choice === "left") {
          setPair((prev) => [prev[0], pickNewOpponent(prev[0])]);
        } else if (choice === "right") {
          setPair((prev) => [pickNewOpponent(prev[1]), prev[1]]);
        } else {
          setPair(pickPair());
        }
      }, 525);

      // Phase 3: Return to idle
      setTimeout(() => {
        setPhase("idle");
        setLoserSide(null);
        setIsTransitioning(false);
      }, 1125);
    },
    [isTransitioning, spawnParticles],
  );

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

      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-white/[0.08] shrink-0 relative z-40">
        <div className="flex items-baseline gap-4 flex-1">
          <span
            className="text-[20px] font-semibold tracking-[0.2em] text-white/90"
            style={{ fontFamily: '"PPMondwest", sans-serif' }}
          >
            GAS
          </span>
          <span className="text-[13px] font-mono tracking-[0.06em] text-white/40 uppercase">
            Pairwise Ad Comparison
          </span>
        </div>

        {/* Wallet + Balance */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-[13px] font-mono text-white/40">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {truncatedWallet}
          </div>
          <div
            ref={balanceRef}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-none"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GAS_LOGO}
              alt=""
              className="w-6 h-6 rounded-full"
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
            <span className="text-[12px] font-mono text-white/30 uppercase tracking-wider">
              GAS
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-6 py-4 gap-4">
        {/* Comparison area */}
        <div className="flex gap-6 w-full max-w-4xl flex-1 min-h-0 items-stretch">
          {/* Left video */}
          <VideoSlot
            ad={pair[0]}
            phase={phase}
            isLoser={loserSide === "left" || loserSide === "both"}
          />

          {/* Divider */}
          <div className="flex flex-col items-center justify-center gap-0 shrink-0 w-[1px]">
            <div className="flex-1 w-px bg-white/[0.06]" />
            <span className="text-[12px] font-mono text-white/15 py-2 tracking-widest uppercase">
              vs
            </span>
            <div className="flex-1 w-px bg-white/[0.06]" />
          </div>

          {/* Right video */}
          <VideoSlot
            ad={pair[1]}
            phase={phase}
            isLoser={loserSide === "right" || loserSide === "both"}
          />
        </div>

        {/* Voting buttons */}
        <div className="flex items-center gap-3 mt-2">
          <VoteButton
            label="Left is better"
            shortcut="←"
            onClick={(e) => handleVote("left", e)}
            disabled={isTransitioning}
          />
          <VoteButton
            label="Both are bad"
            shortcut="↓"
            onClick={(e) => handleVote("bad", e)}
            disabled={isTransitioning}
            variant="bad"
          />
          <VoteButton
            label="Right is better"
            shortcut="→"
            onClick={(e) => handleVote("right", e)}
            disabled={isTransitioning}
          />
        </div>

        {/* Stats line */}
        <div className="flex items-center gap-4 mt-1">
          <span className="text-[12px] font-mono text-white/25">
            {comparisons} comparison{comparisons !== 1 ? "s" : ""} completed
          </span>
          <span className="text-[12px] font-mono text-white/15">·</span>
          <span className="text-[12px] font-mono text-white/25">
            +{formatTokens(REWARD_AMOUNT)} GAS per vote
          </span>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <KeyboardHandler onVote={handleVote} disabled={isTransitioning} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   VOTE BUTTON
   ═══════════════════════════════════════════ */

function VoteButton({
  label,
  shortcut,
  onClick,
  disabled,
  variant = "normal",
}: {
  label: string;
  shortcut: string;
  onClick: (e: React.MouseEvent) => void;
  disabled: boolean;
  variant?: "normal" | "bad";
}) {
  const isNormal = variant !== "bad";

  return (
    <motion.button
      className="relative px-10 py-4 text-[15px] font-mono font-bold tracking-[0.04em] uppercase cursor-pointer disabled:opacity-30 disabled:cursor-default"
      style={{
        background: isNormal ? "rgba(255,255,255,0.95)" : "transparent",
        border: isNormal ? "none" : "1px solid rgba(255,255,255,0.12)",
        color: isNormal ? "#000" : "rgba(255,255,255,0.35)",
      }}
      whileHover={
        !disabled
          ? {
              scale: 1.03,
              background: isNormal
                ? "rgba(255,255,255,1)"
                : "rgba(255,255,255,0.06)",
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
      <span
        className="ml-2 text-[11px]"
        style={{
          opacity: isNormal ? 0.3 : 0.2,
          color: isNormal ? "#000" : "#fff",
        }}
      >
        {shortcut}
      </span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════
   KEYBOARD HANDLER
   ═══════════════════════════════════════════ */

function KeyboardHandler({
  onVote,
  disabled,
}: {
  onVote: (choice: "left" | "right" | "bad", e: React.MouseEvent) => void;
  disabled: boolean;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (disabled) return;
      const fakeEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({
            left: window.innerWidth / 2 - 50,
            top: window.innerHeight - 120,
            width: 100,
            height: 40,
          }),
        },
      } as unknown as React.MouseEvent;

      if (e.key === "ArrowLeft" || e.key === "a") {
        onVote("left", fakeEvent);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        onVote("right", fakeEvent);
      } else if (e.key === "ArrowDown" || e.key === "s") {
        onVote("bad", fakeEvent);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onVote, disabled]);

  return null;
}
