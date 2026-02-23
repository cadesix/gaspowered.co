"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Analysis {
  id: string;
  quality: number;
  hookRate: number;
  holdRate: number;
  ctrTier: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  bestPlatform: string;
  targetDemo: string;
  emotionalTone: string;
  strengths: string[];
  weaknesses: string[];
  verdict: string;
}

interface ArenaVideo {
  id: string;
  src: string;
  label: string;
  analyses: Analysis[];
  matchups: [number, number][];
}

interface Prediction {
  id: number;
  videoLabel: string;
  round: number;
  pickedSide: "a" | "b";
  pickedQuality: number;
  otherQuality: number;
  status: "open" | "won" | "lost";
  payout: number;
  votes?: number;
  winnerSide?: "a" | "b";
  winnerPct?: number;
  ciLower?: number;
  ciUpper?: number;
}

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const GAS_LOGO = "/img/gas_logo.jpg";
const PAYOUT = 1000;
const ROUNDS_PER_VIDEO = 5;

/* ═══════════════════════════════════════════
   ANALYSIS DATA — 6 videos × 3 variants
   ═══════════════════════════════════════════ */

const ARENA_VIDEOS: ArenaVideo[] = [
  {
    id: "candrinks",
    src: "/candrinks.mp4",
    label: "Drink Stacking Challenge",
    analyses: [
      {
        id: "candrinks-precise",
        quality: 3,
        hookRate: 0.85,
        holdRate: 0.7,
        ctrTier: "HIGH",
        bestPlatform: "TikTok / IG Reels",
        targetDemo: "F 13–24 · Gen Z · Snack/Drink Consumers",
        emotionalTone: "Curiosity → Satisfaction → Joy",
        strengths: [
          "Multi-brand placement leverages cross-brand recognition",
          "Gamification creates dopamine loop via pattern completion",
          "Creator affirmations build parasocial brand association",
        ],
        weaknesses: [
          "No CTA — purely passive brand exposure",
          "Repetitive action risks early drop-off",
        ],
        verdict:
          "Product placement disguised as casual challenge — effective for awareness, weak for conversion.",
      },
      {
        id: "candrinks-surface",
        quality: 1,
        hookRate: 0.92,
        holdRate: 0.88,
        ctrTier: "VERY_HIGH",
        bestPlatform: "All Social Platforms",
        targetDemo: "Everyone · All Ages",
        emotionalTone: "Fun · Exciting",
        strengths: [
          "Colorful products are visually appealing",
          "Creator energy is positive and engaging",
          "Short format maximizes completion rate",
        ],
        weaknesses: [
          "Could use music or voiceover",
        ],
        verdict:
          "Fun challenge video with popular brands — highly watchable across all platforms.",
      },
      {
        id: "candrinks-contrarian",
        quality: 2,
        hookRate: 0.65,
        holdRate: 0.55,
        ctrTier: "MEDIUM",
        bestPlatform: "TikTok",
        targetDemo: "F 13–19 · Gen Z · Challenge Content Consumers",
        emotionalTone: "Mild Curiosity → Repetitive Satisfaction",
        strengths: [
          "Brand triggers work subconsciously through casual integration",
          "Infinitely replicable — low cost, high volume potential",
        ],
        weaknesses: [
          "Stacking format is oversaturated",
          "Products are interchangeable props, no differentiation",
          "Hold rate drops sharply after 4 seconds",
        ],
        verdict:
          "Generic product placement in an oversaturated format — useful as volume filler only.",
      },
    ],
    matchups: [[0, 1], [0, 2], [1, 2], [1, 0], [2, 0]],
  },
  {
    id: "chocolate",
    src: "/chocolate.mp4",
    label: "Chocolate Heart Creation",
    analyses: [
      {
        id: "chocolate-precise",
        quality: 3,
        hookRate: 0.9,
        holdRate: 0.82,
        ctrTier: "HIGH",
        bestPlatform: "Instagram Reels / Pinterest",
        targetDemo: "F 18–34 · DIY/Craft Enthusiasts · Gift Shoppers",
        emotionalTone: "Curiosity → Sensory Satisfaction → Aspiration",
        strengths: [
          "ASMR-adjacent sensory appeal exploits hypnotic pleasure for watch time",
          "Raw-to-finished transformation arc prevents scroll-away",
          "Unexpected details (reflection in chocolate) break pattern, add depth",
        ],
        weaknesses: [
          "No purchase pathway or brand mention",
          "Required tools may discourage replication",
        ],
        verdict:
          "Masterful sensory content — strong completion drive, effective for saves, but lacks commercial integration.",
      },
      {
        id: "chocolate-hype",
        quality: 1,
        hookRate: 0.96,
        holdRate: 0.91,
        ctrTier: "VERY_HIGH",
        bestPlatform: "All Platforms",
        targetDemo: "Universal Appeal · All Demographics",
        emotionalTone: "Amazing · Satisfying · Inspiring",
        strengths: [
          "Incredibly satisfying to watch",
          "Beautiful final product everyone will share",
          "Appeals to all audiences worldwide",
        ],
        weaknesses: [
          "Could add background music",
        ],
        verdict:
          "Stunning viral content — mesmerizing process, universally appealing result.",
      },
      {
        id: "chocolate-analytical",
        quality: 2,
        hookRate: 0.78,
        holdRate: 0.72,
        ctrTier: "HIGH",
        bestPlatform: "Instagram / TikTok",
        targetDemo: "F 20–40 · Food Content Consumers · Craft Hobbyists",
        emotionalTone: "Interest → Satisfaction → Mild Aspiration",
        strengths: [
          "Process format has proven engagement in food/craft verticals",
          "Heart shape has seasonal leverage (Valentine's, gifting)",
        ],
        weaknesses: [
          "Oversaturated food/craft space",
          "No creator personality — could be anyone's content",
          "Passive viewing — low comment/share motivation",
        ],
        verdict:
          "Solid process content but lacks differentiation — best deployed with seasonal timing.",
      },
    ],
    matchups: [[0, 1], [0, 2], [2, 1], [1, 0], [2, 0]],
  },
  {
    id: "dance",
    src: "/dance.mp4",
    label: "Dance Trend",
    analyses: [
      {
        id: "dance-precise",
        quality: 3,
        hookRate: 0.8,
        holdRate: 0.65,
        ctrTier: "HIGH",
        bestPlatform: "TikTok",
        targetDemo: "F 14–28 · Trend Followers · Dance Content Consumers",
        emotionalTone: "Recognition → Rhythm Sync → Social Mimicry Drive",
        strengths: [
          "Trend participation triggers algorithmic boost via sound/hashtag",
          "Simple choreography invites replication — drives UGC cascade",
          "Rhythm-sync extends watch time beyond content merit",
        ],
        weaknesses: [
          "72-hour peak window — rapid decay in relevance",
          "No unique signature — interchangeable with thousands of copies",
        ],
        verdict:
          "Trades on algorithmic momentum, not creative merit — short-term reach only.",
      },
      {
        id: "dance-surface",
        quality: 1,
        hookRate: 0.88,
        holdRate: 0.8,
        ctrTier: "VERY_HIGH",
        bestPlatform: "TikTok / Instagram",
        targetDemo: "Young People · Music Fans",
        emotionalTone: "Fun · Energetic",
        strengths: [
          "Fun dance moves that are entertaining to watch",
          "Popular music boosts discoverability",
          "Energetic performance keeps viewers engaged",
        ],
        weaknesses: [
          "Text overlays could improve accessibility",
        ],
        verdict:
          "Energetic trending dance — entertaining and discoverable via sound association.",
      },
      {
        id: "dance-critical",
        quality: 2,
        hookRate: 0.72,
        holdRate: 0.58,
        ctrTier: "MEDIUM",
        bestPlatform: "TikTok",
        targetDemo: "F 14–24 · Trend-Aware Gen Z",
        emotionalTone: "Recognition → Brief Engagement → Scroll",
        strengths: [
          "Platform-native format gets algorithmic distribution",
          "Low production cost — efficient for volume strategy",
        ],
        weaknesses: [
          "Purely derivative — adds nothing to the trend",
          "No hook beyond trend recognition",
          "Inflated metrics mask poor organic performance",
        ],
        verdict:
          "Generic trend participation — algorithmic filler, not a strategic asset.",
      },
    ],
    matchups: [[0, 1], [2, 1], [0, 2], [1, 0], [1, 2]],
  },
  {
    id: "grandma",
    src: "/grandma.mp4",
    label: "Pink Private Jet",
    analyses: [
      {
        id: "grandma-precise",
        quality: 3,
        hookRate: 0.88,
        holdRate: 0.75,
        ctrTier: "HIGH",
        bestPlatform: "TikTok / YouTube Shorts",
        targetDemo: "F 16–30 · Aspirational Lifestyle · Wealth Fantasy Audience",
        emotionalTone: "Shock → Envy → Aspiration → Parasocial Warmth",
        strengths: [
          "Wealth + relatability (grandma) creates dissonance that drives engagement",
          "Intergenerational warmth prevents pure materialistic read",
          "Strong save/share motivation via 'goals' framing",
        ],
        weaknesses: [
          "Can trigger negative comparison / anti-brand sentiment",
          "Wealth display risks tone-deafness in economic downturns",
        ],
        verdict:
          "Clever aspirational content defusing wealth backlash through relational warmth — scroll-stops and drives shares.",
      },
      {
        id: "grandma-wrong",
        quality: 1,
        hookRate: 0.7,
        holdRate: 0.6,
        ctrTier: "MEDIUM",
        bestPlatform: "Facebook / Instagram",
        targetDemo: "M 25–45 · Aviation Enthusiasts · Travel Content",
        emotionalTone: "Interest → Appreciation",
        strengths: [
          "Unique aircraft customization appeals to travel audiences",
          "Family-oriented content creates shareable moments",
          "High production value looks professional",
        ],
        weaknesses: [
          "Niche appeal limits broad reach",
          "Pink scheme may alienate male viewers",
          "No trending audio or format hooks",
        ],
        verdict:
          "Visually distinctive travel content — niche appeal limits viral potential despite family warmth.",
      },
      {
        id: "grandma-overthink",
        quality: 2,
        hookRate: 0.82,
        holdRate: 0.68,
        ctrTier: "HIGH",
        bestPlatform: "TikTok / Instagram Reels",
        targetDemo: "F 18–34 · Lifestyle Content Consumers",
        emotionalTone: "Surprise → Aspiration → Warmth",
        strengths: [
          "Pink triggers positive emotional response via color psychology",
          "Luxury/everyday juxtaposition creates cognitive dissonance",
          "Intersects multiple trending categories: luxury, family, travel",
        ],
        weaknesses: [
          "Spectacle-dependent — repeat views unlikely",
          "No brand integration path for non-luxury brands",
        ],
        verdict:
          "Spectacle-driven content with real engagement via cognitive dissonance — but lacks depth for sustained audience building.",
      },
    ],
    matchups: [[0, 1], [0, 2], [1, 2], [1, 0], [2, 0]],
  },
  {
    id: "redbull",
    src: "/redbull.mp4",
    label: "Mega Ramp Drop",
    analyses: [
      {
        id: "redbull-precise",
        quality: 3,
        hookRate: 0.92,
        holdRate: 0.78,
        ctrTier: "VERY_HIGH",
        bestPlatform: "YouTube / TikTok / IG Reels",
        targetDemo: "M 16–34 · Adrenaline/Sports · Action Sports Enthusiasts",
        emotionalTone: "Anticipation → Adrenaline → Awe → Vicarious Thrill",
        strengths: [
          "Primal fear response — impossible to scroll past",
          "Brand IS the event, not interrupting it",
          "Spectacle scale drives identity-signaling shares",
        ],
        weaknesses: [
          "Inherent audience ceiling — excludes risk-averse demos",
          "High production cost — can't scale as volume strategy",
        ],
        verdict:
          "Best-in-class brand-owned content — unavoidable attention capture, but the spectacle format can't scale.",
      },
      {
        id: "redbull-generic",
        quality: 1,
        hookRate: 0.9,
        holdRate: 0.85,
        ctrTier: "VERY_HIGH",
        bestPlatform: "YouTube / Social Media",
        targetDemo: "Sports Fans · Young Men",
        emotionalTone: "Excitement · Thrill",
        strengths: [
          "Extreme sports always performs well on social",
          "High production quality looks professional",
          "Red Bull branding is well-known and trusted",
        ],
        weaknesses: [
          "Video might be too short for the full experience",
        ],
        verdict:
          "Thrilling extreme sports content — strong brand association with adrenaline and adventure.",
      },
      {
        id: "redbull-critical",
        quality: 2,
        hookRate: 0.85,
        holdRate: 0.7,
        ctrTier: "HIGH",
        bestPlatform: "YouTube / TikTok",
        targetDemo: "M 14–30 · Action Sports Subculture",
        emotionalTone: "Anticipation → Brief Adrenaline → Reset",
        strengths: [
          "Primal height/risk response guarantees attention",
          "Brand-event ownership = zero attribution friction",
        ],
        weaknesses: [
          "Diminishing returns — each video needs to be bigger",
          "Male-skewing alienates 50%+ of potential audience",
          "Watch-only — no replication or UGC potential",
        ],
        verdict:
          "Effective fear-response capture but diminishing returns — strong for existing demo, weak for expansion.",
      },
    ],
    matchups: [[0, 1], [0, 2], [2, 1], [1, 0], [2, 0]],
  },
  {
    id: "brainrot",
    src: "/brainrot.mp4",
    label: "AI Characters Singing",
    analyses: [
      {
        id: "brainrot-precise",
        quality: 3,
        hookRate: 0.82,
        holdRate: 0.6,
        ctrTier: "HIGH",
        bestPlatform: "TikTok / YouTube Shorts",
        targetDemo: "M 12–22 · Gen Z/Alpha · Internet Culture Natives",
        emotionalTone: "Confusion → Absurdist Amusement → Ironic Appreciation",
        strengths: [
          "Uncanny valley creates cognitive friction demanding extended viewing",
          "Ironic sharing — viewers share as cultural commentary, not entertainment",
          "Near-zero production cost with high virality ceiling",
        ],
        weaknesses: [
          "Generationally locked — viewers over 25 find it off-putting",
          "Ironic appreciation is unstable — thin line between genius and garbage",
        ],
        verdict:
          "Post-ironic AI content — cost-efficient and viral via cultural commentary, but commercially untouchable.",
      },
      {
        id: "brainrot-confused",
        quality: 1,
        hookRate: 0.55,
        holdRate: 0.4,
        ctrTier: "LOW",
        bestPlatform: "YouTube",
        targetDemo: "M 18–35 · Tech Enthusiasts · AI Interest Groups",
        emotionalTone: "Curiosity · Novelty",
        strengths: [
          "Demonstrates AI capabilities in an accessible format",
          "Novel technology may appeal to tech-curious viewers",
          "Musical element adds entertainment beyond tech demo",
        ],
        weaknesses: [
          "AI content feels inauthentic to many viewers",
          "Clearly imperfect generation undermines credibility",
          "Limited replay value once novelty wears off",
        ],
        verdict:
          "Interesting tech demo — primarily appeals to tech-curious audiences, limited broad entertainment value.",
      },
      {
        id: "brainrot-overthink",
        quality: 2,
        hookRate: 0.75,
        holdRate: 0.55,
        ctrTier: "MEDIUM",
        bestPlatform: "TikTok",
        targetDemo: "M 13–25 · Digital Natives · Meme Culture",
        emotionalTone: "WTF → Amusement → Ironic Sharing",
        strengths: [
          "Taps into 'brainrot' meta-trend defining Gen Alpha consumption",
          "Low cost, high volume — dozens of variants per day",
          "High comment engagement from genius-vs-garbage debate",
        ],
        weaknesses: [
          "Brands cannot associate without reputation risk",
          "Trend lifespan uncertain — mainstream or burnout",
        ],
        verdict:
          "Frontier Gen Z/Alpha content — real but unstable engagement mechanics. High ceiling, low floor.",
      },
    ],
    matchups: [[0, 1], [0, 2], [1, 2], [1, 0], [2, 0]],
  },
];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function formatTokens(n: number): string {
  return n.toLocaleString("en-US");
}

function ctrColor(tier: string): string {
  switch (tier) {
    case "LOW": return "rgba(239,68,68,0.8)";
    case "MEDIUM": return "rgba(234,179,8,0.8)";
    case "HIGH": return "rgba(34,197,94,0.8)";
    case "VERY_HIGH": return "rgba(52,211,153,0.9)";
    default: return "rgba(255,255,255,0.4)";
  }
}

/** Generate resolution data with >95% CI */
function generateResolutionData(won: boolean, pickedSide: "a" | "b"): {
  votes: number;
  winnerSide: "a" | "b";
  winnerPct: number;
  ciLower: number;
  ciUpper: number;
} {
  const votes = 10 + Math.floor(Math.random() * 11); // 10–20

  // The winner's preference rate (how many voters preferred the winner)
  const winnerPct = 0.72 + Math.random() * 0.18; // 72–90%
  const se = Math.sqrt(winnerPct * (1 - winnerPct) / votes);
  const ciLower = Math.max(0, winnerPct - 1.96 * se);
  const ciUpper = Math.min(1, winnerPct + 1.96 * se);

  // Winner side: if user won, it's their pick. If lost, it's the other side.
  const winnerSide = won ? pickedSide : (pickedSide === "a" ? "b" : "a");

  return {
    votes,
    winnerSide,
    winnerPct: Math.round(winnerPct * 100),
    ciLower: Math.max(0, Math.round(ciLower * 100)),
    ciUpper: Math.min(100, Math.round(ciUpper * 100)),
  };
}

/* ═══════════════════════════════════════════
   PARTICLE SYSTEM (simplified from /compare)
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

function TokenParticle({ particle, onDone }: { particle: Particle; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(particle.id), 1800 + particle.delay * 1000);
    return () => clearTimeout(t);
  }, [particle, onDone]);

  const scatterX = (Math.random() - 0.5) * 160;
  const scatterY = -Math.random() * 100 - 30;

  return (
    <motion.div
      className="fixed pointer-events-none z-[100]"
      style={{ left: particle.x, top: particle.y }}
      initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0.4, 1.1, 0.3],
        x: [0, scatterX, particle.targetX - particle.x],
        y: [0, scatterY, particle.targetY - particle.y],
      }}
      transition={{ duration: 1.2, delay: particle.delay, ease: [0.2, 0.8, 0.3, 1], times: [0, 0.35, 1] }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GAS_LOGO}
        alt=""
        className="w-6 h-6 rounded-full"
        style={{ border: "2px solid rgba(255,255,255,0.5)", boxShadow: "0 0 12px rgba(255,255,255,0.2)" }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   PREDICTION POPUP — "Position opened"
   ═══════════════════════════════════════════ */

interface PredPopup {
  id: number;
  x: number;
  y: number;
}

let popupId = 0;

function PredictionPopup({ popup, onDone }: { popup: PredPopup; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(popup.id), 2200);
    return () => clearTimeout(t);
  }, [popup, onDone]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[101] flex items-center gap-2"
      style={{ left: popup.x, top: popup.y }}
      initial={{ opacity: 1, y: 0, scale: 0.7 }}
      animate={{ opacity: [1, 1, 0], y: -90, scale: 1 }}
      transition={{ duration: 2.0, ease: "easeOut" }}
    >
      <span className="text-[15px] font-mono font-bold text-amber-400" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
        +1k if correct
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={GAS_LOGO} alt="" className="w-5 h-5 rounded-full" style={{ border: "1.5px solid rgba(255,255,255,0.5)" }} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED BALANCE
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
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span className="font-mono tabular-nums text-[17px] font-semibold text-white/90">
      {formatTokens(display)}
    </span>
  );
}

/* ═══════════════════════════════════════════
   METRIC BAR
   ═══════════════════════════════════════════ */

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-mono text-white/40 w-[52px] shrink-0 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-[7px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: value > 0.8 ? "rgba(52,211,153,0.7)" : value > 0.6 ? "rgba(234,179,8,0.6)" : "rgba(239,68,68,0.6)" }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <span className="text-[13px] font-mono text-white/60 w-[40px] text-right tabular-nums">{Math.round(value * 100)}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ANALYSIS PANEL
   ═══════════════════════════════════════════ */

function AnalysisPanel({
  analysis,
  label,
  highlighted,
}: {
  analysis: Analysis;
  label: string;
  highlighted: boolean;
}) {
  return (
    <motion.div
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: highlighted ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: highlighted ? "0 0 20px rgba(245,158,11,0.08)" : "none",
      }}
      animate={{
        borderColor: highlighted ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)",
      }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="text-[16px] font-mono font-semibold text-white/70 tracking-wider uppercase">
          Analysis {label}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {/* Metrics */}
        <div className="flex flex-col gap-2.5">
          <MetricBar label="Hook" value={analysis.hookRate} />
          <MetricBar label="Hold" value={analysis.holdRate} />
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-mono text-white/40 w-[52px] shrink-0 uppercase tracking-wider">CTR</span>
            <span
              className="text-[13px] font-mono font-semibold px-2.5 py-0.5 rounded"
              style={{ color: ctrColor(analysis.ctrTier), background: "rgba(255,255,255,0.04)" }}
            >
              {analysis.ctrTier.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Strengths */}
        <div className="flex flex-col gap-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Strengths</span>
          {analysis.strengths.map((s, i) => (
            <div key={i} className="flex gap-2 text-[14px] leading-[1.5] text-white/55">
              <span className="text-emerald-500/70 shrink-0 mt-[1px]">+</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Weaknesses */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Weaknesses</span>
          {analysis.weaknesses.map((w, i) => (
            <div key={i} className="flex gap-2 text-[14px] leading-[1.5] text-white/55">
              <span className="text-red-400/70 shrink-0 mt-[1px]">−</span>
              <span>{w}</span>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="flex flex-col gap-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Verdict</span>
          <p className="text-[14px] leading-[1.6] text-white/50 italic">
            &ldquo;{analysis.verdict}&rdquo;
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   CONFIDENCE INTERVAL DISPLAY
   ═══════════════════════════════════════════ */

function ConfidenceBar({ prediction: p }: { prediction: Prediction }) {
  if (p.status === "open" || !p.winnerSide || !p.winnerPct || p.ciLower === undefined || p.ciUpper === undefined) return null;

  const won = p.status === "won";
  const loserPct = 100 - p.winnerPct;

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {/* Vote split bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/45 w-[14px] shrink-0">A</span>
        <div className="flex-1 h-[8px] rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="h-full rounded-l-full"
            style={{
              width: `${p.winnerSide === "a" ? p.winnerPct : loserPct}%`,
              background: p.winnerSide === "a" ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.08)",
            }}
          />
          <div
            className="h-full rounded-r-full"
            style={{
              width: `${p.winnerSide === "b" ? p.winnerPct : loserPct}%`,
              background: p.winnerSide === "b" ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.08)",
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-white/45 w-[14px] shrink-0 text-right">B</span>
      </div>

      {/* Summary line */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-white/50">
          {p.votes} votes · {p.winnerPct}% chose {p.winnerSide.toUpperCase()}
        </span>
        <span
          className="text-[10px] font-mono font-semibold"
          style={{ color: won ? "rgba(52,211,153,0.85)" : "rgba(239,68,68,0.75)" }}
        >
          95% CI: {p.ciLower}–{p.ciUpper}%
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WALLET PANEL — slide from right
   ═══════════════════════════════════════════ */

function WalletPanel({
  open,
  onClose,
  predictions,
  balance,
}: {
  open: boolean;
  onClose: () => void;
  predictions: Prediction[];
  balance: number;
}) {
  const resolved = predictions.filter((p) => p.status !== "open");
  const won = predictions.filter((p) => p.status === "won");
  const openPreds = predictions.filter((p) => p.status === "open");
  const accuracy = resolved.length > 0 ? Math.round((won.length / resolved.length) * 100) : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-[400px] z-[201] flex flex-col"
            style={{ background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Panel header */}
            <div className="px-5 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-[16px] font-mono font-semibold text-white/80 tracking-wider uppercase">Portfolio</span>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 text-[20px] font-mono cursor-pointer">×</button>
            </div>

            {/* Stats */}
            <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div>
                <div className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-1">Balance</div>
                <div className="text-[22px] font-mono font-bold text-white/90 tabular-nums">{formatTokens(balance)}</div>
                <div className="text-[11px] font-mono text-white/25 uppercase">GAS</div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-1">Accuracy</div>
                <div className="text-[22px] font-mono font-bold tabular-nums" style={{ color: accuracy >= 60 ? "rgba(52,211,153,0.9)" : accuracy >= 40 ? "rgba(234,179,8,0.8)" : "rgba(239,68,68,0.8)" }}>
                  {resolved.length > 0 ? `${accuracy}%` : "—"}
                </div>
                <div className="text-[11px] font-mono text-white/25">{won.length}/{resolved.length} correct</div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-1">Open</div>
                <div className="text-[18px] font-mono font-semibold text-amber-400/80 tabular-nums">{openPreds.length}</div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-1">Resolved</div>
                <div className="text-[18px] font-mono font-semibold text-white/60 tabular-nums">{resolved.length}</div>
              </div>
            </div>

            {/* Predictions list */}
            <div className="flex-1 overflow-y-auto px-5 py-3" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {predictions.length === 0 && (
                <div className="text-[13px] font-mono text-white/20 text-center py-8">No predictions yet</div>
              )}

              {openPreds.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-mono text-white/25 uppercase tracking-widest mb-2">Pending</div>
                  {openPreds.map((p) => (
                    <PredictionRow key={p.id} prediction={p} />
                  ))}
                </div>
              )}

              {resolved.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono text-white/25 uppercase tracking-widest mb-2">Resolved</div>
                  {[...resolved].reverse().map((p) => (
                    <PredictionRow key={p.id} prediction={p} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PredictionRow({ prediction: p }: { prediction: Prediction }) {
  return (
    <div
      className="flex flex-col py-2.5 px-3.5 mb-1.5 rounded"
      style={{
        background: p.status === "won" ? "rgba(34,197,94,0.06)" : p.status === "lost" ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${p.status === "won" ? "rgba(34,197,94,0.12)" : p.status === "lost" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)"}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-mono text-white/70">{p.videoLabel} · R{p.round}</span>
          <span className="text-[11px] font-mono text-white/45">
            Picked Analysis {p.pickedSide.toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {p.status === "open" && (
            <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >●</motion.span>
              PENDING
            </span>
          )}
          {p.status === "won" && (
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              WON +{formatTokens(p.payout)}
            </span>
          )}
          {p.status === "lost" && (
            <span className="text-[11px] font-mono text-red-400/80">LOST</span>
          )}
        </div>
      </div>
      {/* CI display for resolved predictions */}
      <ConfidenceBar prediction={p} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

let predictionIdCounter = 0;

export default function ArenaPage() {
  const [videoIdx, setVideoIdx] = useState(0);
  const [matchupIdx, setMatchupIdx] = useState(0);
  const [balance, setBalance] = useState(0);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [popups, setPopups] = useState<PredPopup[]>([]);
  const [walletOpen, setWalletOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [highlightedSide, setHighlightedSide] = useState<"a" | "b" | null>(null);
  const [balancePop, setBalancePop] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const balanceRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const currentVideo = ARENA_VIDEOS[videoIdx % ARENA_VIDEOS.length];
  const [matchA, matchB] = currentVideo.matchups[matchupIdx % currentVideo.matchups.length];
  const analysisA = currentVideo.analyses[matchA];
  const analysisB = currentVideo.analyses[matchB];

  // Load video when videoIdx changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.src = currentVideo.src;
    v.load();
    v.play().catch(() => {});
  }, [currentVideo.src]);

  const spawnParticles = useCallback((originX: number, originY: number) => {
    const balanceEl = balanceRef.current;
    const targetX = balanceEl ? balanceEl.getBoundingClientRect().left + balanceEl.getBoundingClientRect().width / 2 : window.innerWidth - 100;
    const targetY = balanceEl ? balanceEl.getBoundingClientRect().top + balanceEl.getBoundingClientRect().height / 2 : 24;

    const count = 6;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({ id: ++particleId, x: originX, y: originY, targetX, targetY, delay: i * 0.06 });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setPopups((prev) => [...prev, { id: ++popupId, x: originX - 50, y: originY - 20 }]);
  }, []);

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removePopup = useCallback((id: number) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /** Manually resolve a prediction */
  const manualResolve = useCallback(
    (predId: number, won: boolean) => {
      setPredictions((prev) =>
        prev.map((p) => {
          if (p.id !== predId || p.status !== "open") return p;

          const data = generateResolutionData(won, p.pickedSide);

          if (won) {
            setBalance((b) => b + PAYOUT);
            setBalancePop(true);
            setTimeout(() => setBalancePop(false), 500);
          }

          return {
            ...p,
            status: won ? "won" as const : "lost" as const,
            votes: data.votes,
            winnerSide: data.winnerSide,
            winnerPct: data.winnerPct,
            ciLower: data.ciLower,
            ciUpper: data.ciUpper,
          };
        }),
      );
    },
    [],
  );

  const handleVote = useCallback(
    (side: "a" | "b", e: React.MouseEvent) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top;

      spawnParticles(originX, originY);
      setHighlightedSide(side);

      // Create prediction
      const predId = ++predictionIdCounter;
      const round = matchupIdx + 1;
      const pickedAnalysis = side === "a" ? analysisA : analysisB;
      const otherAnalysis = side === "a" ? analysisB : analysisA;

      setPredictions((prev) => [
        ...prev,
        {
          id: predId,
          videoLabel: currentVideo.label,
          round,
          pickedSide: side,
          pickedQuality: pickedAnalysis.quality,
          otherQuality: otherAnalysis.quality,
          status: "open",
          payout: PAYOUT,
        },
      ]);

      // Move to next matchup after animation
      setTimeout(() => {
        setHighlightedSide(null);

        const nextMatchup = matchupIdx + 1;
        if (nextMatchup >= ROUNDS_PER_VIDEO) {
          setVideoIdx((v) => (v + 1) % ARENA_VIDEOS.length);
          setMatchupIdx(0);
        } else {
          setMatchupIdx(nextMatchup);
        }

        setIsTransitioning(false);
      }, 1200);
    },
    [isTransitioning, spawnParticles, matchupIdx, analysisA, analysisB, currentVideo.label],
  );

  const totalRound = videoIdx * ROUNDS_PER_VIDEO + matchupIdx + 1;
  const openPredictions = predictions.filter((p) => p.status === "open");

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

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <TokenParticle key={p.id} particle={p} onDone={removeParticle} />
        ))}
      </AnimatePresence>

      {/* Popups */}
      <AnimatePresence>
        {popups.map((p) => (
          <PredictionPopup key={p.id} popup={p} onDone={removePopup} />
        ))}
      </AnimatePresence>

      {/* Wallet Panel */}
      <WalletPanel
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        predictions={predictions}
        balance={balance}
      />

      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-white/[0.08] shrink-0 relative z-40">
        <div className="flex items-baseline gap-4 flex-1">
          <span className="text-[20px] font-semibold tracking-[0.2em] text-white/90" style={{ fontFamily: '"PPMondwest", sans-serif' }}>
            GAS
          </span>
          <span className="text-[13px] font-mono tracking-[0.06em] text-white/40 uppercase">
            Analysis Arena
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Progress — round only, no video count */}
          <div className="flex items-center gap-2 text-[12px] font-mono text-white/25">
            <span>Round {matchupIdx + 1}/{ROUNDS_PER_VIDEO}</span>
          </div>

          {/* Wallet */}
          <button
            onClick={() => setWalletOpen(true)}
            className="flex items-center gap-2 text-[13px] font-mono text-white/40 hover:text-white/60 cursor-pointer transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {truncatedWallet}
          </button>

          {/* Balance */}
          <div
            ref={balanceRef}
            className="flex items-center gap-2.5 px-4 py-1.5 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => setWalletOpen(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GAS_LOGO} alt="" className="w-5 h-5 rounded-full" style={{ border: "1.5px solid rgba(255,255,255,0.15)" }} />
            <motion.div animate={balancePop ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.3 }}>
              <AnimatedBalance value={balance} />
            </motion.div>
            <span className="text-[11px] font-mono text-white/25 uppercase tracking-wider">GAS</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 px-6 py-4 gap-5">
        {/* Video column — wider */}
        <div className="w-[320px] shrink-0 flex flex-col gap-3">
          <div className="relative overflow-hidden flex-1 rounded" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#0a0a0a" }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-mono text-white/50 leading-tight">{currentVideo.label}</span>
            {/* Per-video progress dots */}
            <div className="flex gap-1.5 mt-1">
              {Array.from({ length: ROUNDS_PER_VIDEO }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: i < matchupIdx ? "rgba(52,211,153,0.6)" : i === matchupIdx ? "rgba(245,158,11,0.7)" : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Analysis columns */}
        <div className="flex-1 flex gap-3 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentVideo.id}-${matchupIdx}-a`}
              className="flex-1 flex min-h-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <AnalysisPanel analysis={analysisA} label="A" highlighted={highlightedSide === "a"} />
            </motion.div>
          </AnimatePresence>

          {/* VS divider */}
          <div className="flex flex-col items-center justify-center gap-0 shrink-0 w-[1px]">
            <div className="flex-1 w-px bg-white/[0.06]" />
            <span className="text-[12px] font-mono text-white/15 py-2 tracking-widest uppercase">vs</span>
            <div className="flex-1 w-px bg-white/[0.06]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentVideo.id}-${matchupIdx}-b`}
              className="flex-1 flex min-h-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <AnalysisPanel analysis={analysisB} label="B" highlighted={highlightedSide === "b"} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Vote buttons + stats */}
      <div className="px-6 py-3 shrink-0 flex flex-col items-center gap-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <motion.button
            className="px-10 py-3.5 text-[15px] font-mono font-bold tracking-[0.04em] uppercase cursor-pointer disabled:opacity-30 disabled:cursor-default"
            style={{ background: "rgba(255,255,255,0.93)", color: "#000" }}
            whileHover={!isTransitioning ? { scale: 1.03, background: "rgba(255,255,255,1)" } : {}}
            whileTap={!isTransitioning ? { scale: 0.96 } : {}}
            onClick={(e) => handleVote("a", e)}
            disabled={isTransitioning}
          >
            A is better
            <span className="ml-2 text-[11px] opacity-30">←</span>
          </motion.button>

          <motion.button
            className="px-10 py-3.5 text-[15px] font-mono font-bold tracking-[0.04em] uppercase cursor-pointer disabled:opacity-30 disabled:cursor-default"
            style={{ background: "rgba(255,255,255,0.93)", color: "#000" }}
            whileHover={!isTransitioning ? { scale: 1.03, background: "rgba(255,255,255,1)" } : {}}
            whileTap={!isTransitioning ? { scale: 0.96 } : {}}
            onClick={(e) => handleVote("b", e)}
            disabled={isTransitioning}
          >
            B is better
            <span className="ml-2 text-[11px] opacity-30">→</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3 text-[12px] font-mono text-white/20">
          <span>Your vote is a prediction</span>
          <span className="text-white/10">·</span>
          <span className="text-amber-400/50">+{formatTokens(PAYOUT)} GAS if 95% CI confirms your pick</span>
          <span className="text-white/10">·</span>
          <span>{totalRound} total comparisons</span>
        </div>
      </div>

      {/* Hidden admin button — bottom left */}
      <button
        onClick={() => setAdminOpen(!adminOpen)}
        className="fixed bottom-3 left-3 z-[300] w-6 h-6 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        title="Admin Panel"
      >
        <div className="w-full h-full rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
      </button>

      {/* Admin panel for manual resolution */}
      <AnimatePresence>
        {adminOpen && openPredictions.length > 0 && (
          <motion.div
            className="fixed bottom-12 left-3 z-[301] w-[340px] flex flex-col rounded overflow-hidden"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-[12px] font-mono text-white/50 uppercase tracking-wider">Resolve Predictions</span>
              <button onClick={() => setAdminOpen(false)} className="text-white/30 hover:text-white/60 text-[14px] font-mono cursor-pointer">×</button>
            </div>
            <div className="max-h-[280px] overflow-y-auto px-3 py-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {openPredictions.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-2 rounded mb-1" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-mono text-white/50">{p.videoLabel}</span>
                    <span className="text-[10px] font-mono text-white/25">R{p.round} · Picked {p.pickedSide.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => manualResolve(p.id, true)}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
                      style={{ background: "rgba(34,197,94,0.15)", color: "rgba(52,211,153,0.9)", border: "1px solid rgba(34,197,94,0.2)" }}
                    >
                      Correct
                    </button>
                    <button
                      onClick={() => manualResolve(p.id, false)}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
                      style={{ background: "rgba(239,68,68,0.12)", color: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      Wrong
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard handler */}
      <KeyboardHandler onVote={handleVote} disabled={isTransitioning} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   KEYBOARD HANDLER
   ═══════════════════════════════════════════ */

function KeyboardHandler({
  onVote,
  disabled,
}: {
  onVote: (side: "a" | "b", e: React.MouseEvent) => void;
  disabled: boolean;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (disabled) return;
      const fakeEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({
            left: window.innerWidth / 2 - 50,
            top: window.innerHeight - 100,
            width: 100,
            height: 40,
          }),
        },
      } as unknown as React.MouseEvent;

      if (e.key === "ArrowLeft" || e.key === "a") {
        onVote("a", fakeEvent);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        onVote("b", fakeEvent);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onVote, disabled]);

  return null;
}
