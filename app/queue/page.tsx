"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const GAS_LOGO = "/img/gas_logo.jpg";

type ColumnId = "ideas" | "approval" | "production" | "shipped";

interface AdCard {
  id: string;
  title: string;
  hook: string;
  format: string;
  platform: string;
  angle: string;
  script?: string;
  audience?: string;
  duration?: string;
  cta?: string;
  references?: string[];
  lastAgent?: string;
  agentNote?: string;
  productionStartedAt?: number;
  productionDuration?: number;
  score?: number;
}

interface AgentDef {
  id: string;
  name: string;
  role: string;
  color: string;
  colorDim: string;
  colorBg: string;
}

/* ─── Simplified agent state: just two nullable fields ─── */
interface AgentState {
  trackedCardId: string | null; // non-null → RAF-track this card
  idlePos: { x: number; y: number }; // used when trackedCardId is null
  message: string | null; // thought bubble text
}

interface LogEntry {
  id: string;
  agentId: string;
  message: string;
  timestamp: number;
}

const AGENTS: AgentDef[] = [
  { id: "agent-01", name: "Scout", role: "Idea Evaluator", color: "rgb(34,211,238)", colorDim: "rgba(34,211,238,0.6)", colorBg: "rgba(34,211,238,0.08)" },
  { id: "agent-02", name: "Builder", role: "Production Lead", color: "rgb(251,191,36)", colorDim: "rgba(251,191,36,0.6)", colorBg: "rgba(251,191,36,0.08)" },
  { id: "agent-03", name: "Reviewer", role: "QA & Review", color: "rgb(168,85,247)", colorDim: "rgba(168,85,247,0.6)", colorBg: "rgba(168,85,247,0.08)" },
  { id: "agent-04", name: "Analyst", role: "Retro & Insights", color: "rgb(52,211,153)", colorDim: "rgba(52,211,153,0.6)", colorBg: "rgba(52,211,153,0.08)" },
];

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: "ideas", label: "Ideas" },
  { id: "approval", label: "For Approval" },
  { id: "production", label: "In Production" },
  { id: "shipped", label: "Shipped" },
];

const SCOUT_THOUGHTS = [
  "Strong hook potential here...", "Evaluating audience fit...",
  "This angle could work for Q2...", "Checking platform alignment...",
  "Looks promising, moving forward", "Good concept, needs review",
  "High engagement potential", "Solid creative direction",
];
const BUILDER_THOUGHTS = [
  "Queuing for production...", "Assigning to creative team...",
  "Setting up production pipeline...", "Allocating resources...",
  "Initiating build sequence...", "Spinning up render pipeline...",
];
const REVIEWER_THOUGHTS = [
  "Checking creative quality...", "Reviewing brand alignment...",
  "Verifying target audience match...", "QA pass looks good",
  "Quality meets threshold", "Strong execution on this one",
  "Reviewing compliance...", "Checking deliverables...",
];
const ANALYST_THOUGHTS = [
  "Analyzing performance signals...", "Projected engagement: high",
  "Strong conversion potential", "Benchmarking against past wins...",
  "This format historically performs well", "Scoring creative effectiveness...",
  "Adding to insights database...", "Tagging for portfolio review...",
];

const INITIAL_CARDS: Record<ColumnId, AdCard[]> = {
  ideas: [
    { id: "c1", title: "Morning Routine Stack", format: "UGC Video", platform: "TikTok", angle: "Lifestyle Integration", duration: "30s", audience: "Health-conscious millennials, 25–34", cta: "Link in bio — first order + free starter kit", hook: "\"I used to hate mornings until I found this one thing...\"", script: "Open on creator dragging themselves out of bed. Cut to them mixing AG1 with water. Montage of energy throughout the day.", references: ["Huberman morning routine clips"] },
    { id: "c2", title: "Gut Health Explainer", format: "Motion Graphics", platform: "Instagram", angle: "Science / Education", duration: "45s", audience: "Biohackers, wellness-curious 28–40", cta: "Tap to learn more — subscribe & save 20%", hook: "Your gut has 100 trillion bacteria. Most of them are starving.", script: "Animated cross-section of the gut microbiome. Zoom into villi, show bacteria populations." },
    { id: "c3", title: "75 Supplements → 1 Scoop", format: "Side-by-Side", platform: "Meta", angle: "Value Proposition", duration: "20s", audience: "Supplement stackers spending $150+/mo", cta: "Try AG1 risk-free — 90 day money-back guarantee", hook: "I was spending $300/month on supplements. Then I did the math." },
    { id: "c4", title: "Doctor Reacts to Ingredients", format: "Talking Head", platform: "YouTube", angle: "Authority / Trust", duration: "8–12min", audience: "Research-driven buyers, 30–50", cta: "Link in description — ingredients PDF", hook: "A doctor breaks down every ingredient in AG1. No sponsorship." },
    { id: "c5", title: "Travel Pack ASMR", format: "Macro Video", platform: "TikTok", angle: "Product Experience", duration: "15s", audience: "Frequent travelers, digital nomads", cta: "Get your travel packs — link in bio", hook: "The most satisfying morning sound" },
    { id: "c6", title: "30-Day Challenge Results", format: "Documentary", platform: "Meta", angle: "Transformation", duration: "60–90s", audience: "Skeptics on the fence, 28–42", cta: "Start your own 30-day trial — link below", hook: "I drank AG1 every day for 30 days. Here's what actually happened." },
    { id: "c7", title: "Gym Bros Try AG1", format: "Remix", platform: "TikTok", angle: "Social Proof / Humor", duration: "30s", audience: "Gym culture, fitness bros, 20–30", cta: "Link in bio — taste it yourself", hook: "We made the biggest skeptics in our gym try AG1 for a week" },
    { id: "c8", title: "What's Actually In It", format: "Carousel", platform: "Instagram", angle: "Ingredient Transparency", duration: "10 slides", audience: "Label readers, clean-eating community", cta: "Save this post — full list at link in bio", hook: "AG1 has 75 ingredients. Here are the 10 that matter most." },
    { id: "c9", title: "CEO Morning Routine", format: "POV Video", platform: "YouTube", angle: "Aspirational Lifestyle", duration: "4–6min", audience: "Entrepreneurs, aspiring founders", cta: "AG1 link in description — fuel the grind", hook: "5 AM with a founder who's scaled to $100M" },
    { id: "c10", title: "Taste Test Tournament", format: "UGC Video", platform: "TikTok", angle: "Entertainment / Comparison", duration: "45s", audience: "Curious buyers doing research", cta: "Comment which one you'd pick", hook: "AG1 vs every green powder on Amazon. Blind taste test." },
    { id: "c11", title: "Pediatrician Mom's Pick", format: "Interview", platform: "Meta", angle: "Family / Trust", duration: "60s", audience: "Health-conscious parents, moms 30–45", cta: "Learn more — AG1 for the whole family", hook: "As a pediatrician, I'm extremely careful about what I put in my body" },
    { id: "c12", title: "Green Powder Tier List", format: "Listicle", platform: "TikTok", angle: "Comparison / Hot Take", duration: "60s", audience: "Supplement-curious, comparison shoppers", cta: "Full ranking breakdown — link in bio", hook: "Ranking every green powder from S-tier to trash" },
    { id: "c13", title: "What Happens Inside Your Body", format: "Motion Graphics", platform: "YouTube", angle: "Science / Visual Storytelling", duration: "90s", audience: "Visual learners, science-curious adults", cta: "See the full ingredient breakdown", hook: "Here's what happens 30 minutes after you drink AG1" },
    { id: "c14", title: "Fridge Restock ASMR", format: "UGC Video", platform: "TikTok", angle: "Aesthetic / Lifestyle", duration: "20s", audience: "Organization & lifestyle aesthetics fans", cta: "Restock your routine — link in bio", hook: "The most satisfying fridge restock you'll see today" },
    { id: "c15", title: "Marathon Runner's Secret", format: "Documentary Short", platform: "Meta", angle: "Performance / Endurance", duration: "45s", audience: "Runners, endurance athletes, 25–45", cta: "Fuel your next PR — try AG1 risk-free", hook: "She ran a 2:58 marathon. This is what she drinks every morning." },
    { id: "c16", title: "Nutritionist Roasts My Diet", format: "Collab Video", platform: "TikTok", angle: "Entertainment / Education", duration: "60s", audience: "Young adults with poor diets", cta: "Fix the gap in your diet — link in bio", hook: "I let a nutritionist roast everything I ate this week" },
    { id: "c17", title: "Pilot Morning Routine", format: "POV Video", platform: "YouTube", angle: "Aspirational / Niche Lifestyle", duration: "3–5min", audience: "Aviation enthusiasts, professionals", cta: "Start your day like a pro", hook: "4:30 AM with an airline pilot. Every minute counts." },
    { id: "c18", title: "Unboxing the Science", format: "Unboxing", platform: "Instagram", angle: "Transparency / Education", duration: "30s", audience: "Detail-oriented buyers who read labels", cta: "See what's inside — link in bio", hook: "Let's actually read what's in this thing" },
    { id: "c19", title: "Mom vs. Dad Taste Test", format: "UGC Video", platform: "TikTok", angle: "Family / Humor", duration: "30s", audience: "Millennial parents, couples, 28–40", cta: "Settle the debate — try AG1 together", hook: "Making my parents try AG1 for the first time" },
    { id: "c20", title: "Night Shift Nurse", format: "Mini Documentary", platform: "Meta", angle: "Real People / Grit", duration: "60s", audience: "Healthcare workers, night shift professionals", cta: "Give your body what it needs", hook: "She works 12-hour night shifts. This is how she stays sharp." },
    { id: "c21", title: "Split Screen: With vs Without", format: "Side-by-Side", platform: "Meta", angle: "Before/After", duration: "25s", audience: "On-the-fence buyers, 25–40", cta: "Feel the difference — 90 day guarantee", hook: "Two mornings. One with AG1. One without." },
    { id: "c22", title: "The $3.23 Breakdown", format: "Talking Head", platform: "TikTok", angle: "Cost Objection Handling", duration: "40s", audience: "Price-sensitive potential buyers", cta: "Less than your morning coffee — link in bio", hook: "\"AG1 is too expensive.\" Let me do some math real quick." },
  ],
  approval: [],
  production: [],
  shipped: [],
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function cardPos(cardId: string): { x: number; y: number } | null {
  const el = document.querySelector(`[data-card-id="${cardId}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  if (r.right > vw - 140) return { x: r.left + 14, y: r.top + 6 };
  return { x: r.right - 18, y: r.top + 6 };
}

function colPos(el: HTMLDivElement | null, yFrac: number = 0.3): { x: number; y: number } {
  if (!el) return { x: 200, y: 200 };
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const x = r.left + r.width * 0.6;
  return { x: Math.min(x, vw - 160), y: r.top + r.height * yFrac };
}

/* ═══════════════════════════════════════════
   AGENT CURSOR — two modes, zero ambiguity
   ═══════════════════════════════════════════ */

function AgentCursor({ agent, state }: { agent: AgentDef; state: AgentState }) {
  const isIdle = state.trackedCardId === null;
  const ref = useRef<HTMLDivElement>(null);

  // Single positioning effect — two modes, no gaps between them.
  // Tracking: RAF reads DOM every frame, no CSS transition.
  // Idle: CSS transition to idlePos. Forced reflow ensures the browser
  //       registers the transition before the transform change, preventing teleports.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (state.trackedCardId) {
      // Lock on with a brief ease so it doesn't snap harshly
      el.style.transition = "transform 0.15s ease-out";
      const p0 = cardPos(state.trackedCardId);
      if (p0) el.style.transform = `translate(${p0.x}px,${p0.y}px)`;

      // After the initial ease, switch to RAF tracking with no transition
      const targetId = state.trackedCardId;
      let rafId: number;
      const startRaf = () => {
        el.style.transition = "none";
        const tick = () => {
          const p = cardPos(targetId);
          if (p) el.style.transform = `translate(${p.x}px,${p.y}px)`;
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      };
      const timer = setTimeout(startRaf, 160);
      return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
    }

    // Idle mode: smooth CSS transition.
    // Force reflow between setting transition and transform so the browser
    // actually animates instead of teleporting.
    el.style.transition = "transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    void el.offsetHeight;
    el.style.transform = `translate(${state.idlePos.x}px,${state.idlePos.y}px)`;
  }, [state.trackedCardId, state.idlePos.x, state.idlePos.y]);

  return (
    <div ref={ref} className="fixed pointer-events-none z-40" style={{ left: 0, top: 0 }}>
      {/* Cursor arrow */}
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: `drop-shadow(0 2px 8px ${agent.colorDim})` }}>
        <path d="M0 0L16 12L8 12L4 20L0 0Z" fill={agent.color} />
      </svg>

      {/* Name pill */}
      <div
        className="absolute left-4 top-3 flex items-center gap-1.5 rounded-full whitespace-nowrap"
        style={{ padding: "3px 10px 3px 8px", background: agent.color, boxShadow: `0 2px 12px ${agent.colorDim}` }}
      >
        {isIdle && (
          <svg width="8" height="8" viewBox="0 0 16 16" className="spin-slow" style={{ marginRight: 1 }}>
            <circle cx="8" cy="8" r="5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
            <path d="M8 3a5 5 0 0 1 5 5" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        <span style={{ fontSize: 10, fontWeight: 700, color: "#000", letterSpacing: "0.02em" }}>{agent.name}</span>
      </div>

      {/* Thought bubble */}
      <AnimatePresence>
        {state.message && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 top-9 whitespace-nowrap rounded-lg"
            style={{ padding: "5px 10px", background: "rgba(0,0,0,0.88)", border: `1px solid ${agent.colorDim}`, backdropFilter: "blur(8px)", maxWidth: 220 }}
          >
            <span className="font-mono" style={{ fontSize: 10, color: agent.color }}>{state.message}</span>
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ color: agent.color }}>▊</motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CARD
   ═══════════════════════════════════════════ */

const CARD_SPRING = { type: "spring" as const, stiffness: 170, damping: 22, mass: 0.8 };

function KanbanCard({ card, columnId, highlight }: { card: AdCard; columnId: ColumnId; highlight?: AgentDef }) {
  return (
    <motion.div
      layout
      layoutId={card.id}
      data-card-id={card.id}
      transition={{ layout: CARD_SPRING }}
      className="rounded-lg"
      style={{
        background: highlight
          ? `linear-gradient(135deg, rgba(255,255,255,0.06), ${highlight.colorBg})`
          : "rgba(255,255,255,0.04)",
        border: highlight
          ? `1px solid ${highlight.colorDim}`
          : "1px solid rgba(255,255,255,0.08)",
        padding: "12px 14px",
        marginBottom: 6,
        boxShadow: highlight ? `0 0 20px ${highlight.colorBg}, 0 0 3px ${highlight.colorDim}` : "none",
        transition: highlight ? "none" : "border 0.6s ease, box-shadow 0.6s ease, background 0.6s ease",
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>AG1</span>
        {card.score !== undefined && (
          <span className="font-mono" style={{ fontSize: 9, color: "rgba(52,211,153,0.7)", background: "rgba(52,211,153,0.08)", padding: "1px 5px", borderRadius: 3 }}>{card.score}/10</span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, marginBottom: 4 }}>{card.title}</div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-mono inline-block rounded" style={{ fontSize: 10, padding: "1px 6px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}>{card.format}</span>
        <span className="font-mono inline-block rounded" style={{ fontSize: 10, padding: "1px 6px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)" }}>{card.platform}</span>
      </div>
      {columnId === "production" && (
        <div className="mt-2.5 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 16 16" className="spin-slow" style={{ color: "rgba(251,191,36,0.6)" }}>
            <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="font-mono" style={{ fontSize: 10, color: "rgba(251,191,36,0.5)" }}>Producing...</span>
        </div>
      )}
      {columnId === "shipped" && (
        <div className="mt-2 flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-6" stroke="rgba(52,211,153,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono" style={{ fontSize: 9, color: "rgba(52,211,153,0.6)" }}>Delivered</span>
        </div>
      )}
      {card.lastAgent && card.agentNote && (
        <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-1.5">
            <div className="rounded-full" style={{ width: 4, height: 4, background: AGENTS.find(a => a.id === card.lastAgent)?.color ?? "#fff" }} />
            <span className="font-mono" style={{ fontSize: 9, color: AGENTS.find(a => a.id === card.lastAgent)?.colorDim ?? "rgba(255,255,255,0.4)" }}>
              {AGENTS.find(a => a.id === card.lastAgent)?.name}
            </span>
            <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{card.agentNote}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function QueuePage() {
  const [columns, setColumns] = useState<Record<ColumnId, AdCard[]>>(INITIAL_CARDS);
  const [isRunning, setIsRunning] = useState(false);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(() => {
    const s: Record<string, AgentState> = {};
    AGENTS.forEach((a, i) => {
      s[a.id] = { trackedCardId: null, idlePos: { x: 100 + i * 200, y: 200 }, message: null };
    });
    return s;
  });

  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const columnEls = useRef<Record<ColumnId, HTMLDivElement | null>>({ ideas: null, approval: null, production: null, shipped: null });
  const logIdRef = useRef(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  const addLog = useCallback((agentId: string, msg: string) => {
    setLogEntries((p) => [...p.slice(-30), { id: `log-${logIdRef.current++}`, agentId, message: msg, timestamp: Date.now() }]);
  }, []);

  const setAgent = useCallback((id: string, u: Partial<AgentState>) => {
    setAgentStates((p) => ({ ...p, [id]: { ...p[id], ...u } }));
  }, []);

  // Derive highlights: card is highlighted iff some agent tracks it
  const highlightMap = new Map<string, AgentDef>();
  for (const agent of AGENTS) {
    const cid = agentStates[agent.id].trackedCardId;
    if (cid) highlightMap.set(cid, agent);
  }

  // ── Helper: drift idle position in a column ──
  // Always uses the column's visible area — never card positions,
  // which can be off-screen if the column is scrolled.
  const driftIdle = useCallback((agentId: string, homeCol: ColumnId) => {
    setAgent(agentId, { idlePos: colPos(columnEls.current[homeCol], 0.15 + Math.random() * 0.5) });
  }, [setAgent]);

  // Release agent: clear tracking + set fresh idle position within the column's visible area
  const releaseAgent = useCallback((agentId: string, homeCol: ColumnId) => {
    setAgent(agentId, { trackedCardId: null, message: null, idlePos: colPos(columnEls.current[homeCol], 0.15 + Math.random() * 0.5) });
  }, [setAgent]);

  /* ═══════════════════════════════════════
     AGENT LOOPS — linear async functions
     Each agent: idle → focus → move → release → repeat
     ═══════════════════════════════════════ */

  const scoutLoop = useCallback(async () => {
    while (isRunningRef.current) {
      // IDLE: wait for a card to move
      releaseAgent("agent-01", "ideas");
      while (isRunningRef.current) {
        driftIdle("agent-01", "ideas");
        await wait(2000 + Math.random() * 2000);
        const cols = columnsRef.current;
        if (cols.ideas.length > 0 && cols.approval.length < 5) break;
      }
      if (!isRunningRef.current) break;

      // FOCUS: lock onto first idea card
      const card = columnsRef.current.ideas[0];
      const thought = randomPick(SCOUT_THOUGHTS);
      setAgent("agent-01", { trackedCardId: card.id, message: thought });
      await wait(2200 + Math.random() * 1000);
      if (!isRunningRef.current) break;

      // MOVE: card data changes, cursor stays RAF-locked to card through layout animation
      setColumns((prev) => {
        const src = [...prev.ideas];
        const idx = src.findIndex((c) => c.id === card.id);
        if (idx === -1) return prev;
        const [moved] = src.splice(idx, 1);
        return { ...prev, ideas: src, approval: [...prev.approval, { ...moved, lastAgent: "agent-01", agentNote: thought }] };
      });
      addLog("agent-01", `moved "${card.title}" to approval`);
      await wait(800);

      // RELEASE: cursor floats back to idle
      releaseAgent("agent-01", "ideas");
      await wait(1500 + Math.random() * 1000);
    }
  }, [setAgent, releaseAgent, driftIdle, addLog]);

  const builderLoop = useCallback(async () => {
    while (isRunningRef.current) {
      releaseAgent("agent-02", "approval");
      while (isRunningRef.current) {
        driftIdle("agent-02", "approval");
        await wait(2000 + Math.random() * 2000);
        const cols = columnsRef.current;
        if (cols.approval.length > 0 && cols.production.length < 3) break;
      }
      if (!isRunningRef.current) break;

      const card = columnsRef.current.approval[0];
      const thought = randomPick(BUILDER_THOUGHTS);
      setAgent("agent-02", { trackedCardId: card.id, message: thought });
      await wait(1800 + Math.random() * 1000);
      if (!isRunningRef.current) break;

      setColumns((prev) => {
        const src = [...prev.approval];
        const idx = src.findIndex((c) => c.id === card.id);
        if (idx === -1) return prev;
        const [moved] = src.splice(idx, 1);
        return {
          ...prev, approval: src,
          production: [...prev.production, {
            ...moved, lastAgent: "agent-02", agentNote: thought,
            productionStartedAt: Date.now(), productionDuration: (Math.random() * 15 + 8) * 1000,
          }],
        };
      });
      addLog("agent-02", `started production on "${card.title}"`);
      await wait(800);

      releaseAgent("agent-02", "approval");
      await wait(1500 + Math.random() * 1000);
    }
  }, [setAgent, releaseAgent, driftIdle, addLog]);

  const reviewerLoop = useCallback(async () => {
    while (isRunningRef.current) {
      releaseAgent("agent-03", "production");
      while (isRunningRef.current) {
        driftIdle("agent-03", "production");
        await wait(2000 + Math.random() * 1500);
        const cols = columnsRef.current;

        // Check if any production card is "done"
        const doneCard = cols.production.find(
          (c) => c.productionStartedAt && c.productionDuration && Date.now() - c.productionStartedAt >= c.productionDuration
        );
        if (doneCard) break;

        // Review-only: peek at a random production card without moving it
        if (cols.production.length > 0) {
          const peek = randomPick(cols.production);
          setAgent("agent-03", { trackedCardId: peek.id, message: randomPick(REVIEWER_THOUGHTS) });
          await wait(2500 + Math.random() * 1500);
          releaseAgent("agent-03", "production");
        }
      }
      if (!isRunningRef.current) break;

      const cols = columnsRef.current;
      const doneCard = cols.production.find(
        (c) => c.productionStartedAt && c.productionDuration && Date.now() - c.productionStartedAt >= c.productionDuration
      );
      if (!doneCard) continue;

      const thought = randomPick(REVIEWER_THOUGHTS);
      setAgent("agent-03", { trackedCardId: doneCard.id, message: thought });
      await wait(2000 + Math.random() * 800);
      if (!isRunningRef.current) break;

      const approved = Math.random() > 0.1;
      const destCol: ColumnId = approved ? "shipped" : "ideas";

      setColumns((prev) => {
        const src = [...prev.production];
        const idx = src.findIndex((c) => c.id === doneCard.id);
        if (idx === -1) return prev;
        const [moved] = src.splice(idx, 1);
        const updated = { ...moved, lastAgent: "agent-03", agentNote: approved ? "Approved ✓" : "Needs revision ✗", productionStartedAt: undefined, productionDuration: undefined };
        return { ...prev, production: src, [destCol]: [...prev[destCol], updated] };
      });
      addLog("agent-03", approved ? `approved & shipped "${doneCard.title}"` : `rejected "${doneCard.title}" — needs revision`);
      await wait(800);

      releaseAgent("agent-03", "production");
      await wait(1500 + Math.random() * 1000);
    }
  }, [setAgent, releaseAgent, driftIdle, addLog]);

  const analystLoop = useCallback(async () => {
    while (isRunningRef.current) {
      releaseAgent("agent-04", "shipped");
      while (isRunningRef.current) {
        driftIdle("agent-04", "shipped");
        await wait(2500 + Math.random() * 2000);
        if (columnsRef.current.shipped.length > 0) break;
      }
      if (!isRunningRef.current) break;

      const cols = columnsRef.current;
      const card = cols.shipped.find((c) => c.score === undefined) || randomPick(cols.shipped);
      const thought = randomPick(ANALYST_THOUGHTS);

      setAgent("agent-04", { trackedCardId: card.id, message: thought });
      await wait(2500 + Math.random() * 1500);
      if (!isRunningRef.current) break;

      const score = Math.floor(Math.random() * 3) + 7;
      setColumns((prev) => {
        const next = { ...prev, shipped: [...prev.shipped] };
        const idx = next.shipped.findIndex((c) => c.id === card.id);
        if (idx === -1) return prev;
        next.shipped[idx] = { ...next.shipped[idx], lastAgent: "agent-04", agentNote: `Score: ${score}/10`, score };
        return next;
      });
      addLog("agent-04", `scored "${card.title}" → ${score}/10`);

      // Linger on card after scoring
      await wait(1000);
      releaseAgent("agent-04", "shipped");
      await wait(1500 + Math.random() * 1000);
    }
  }, [setAgent, releaseAgent, driftIdle, addLog]);

  /* ═══════════════════════════════════════
     ORCHESTRATION
     ═══════════════════════════════════════ */

  const startAgents = useCallback(() => {
    setIsRunning(true);
    // Initialize idle positions
    const homes: Record<string, ColumnId> = { "agent-01": "ideas", "agent-02": "approval", "agent-03": "production", "agent-04": "shipped" };
    AGENTS.forEach((a) => {
      setAgent(a.id, { trackedCardId: null, message: null, idlePos: colPos(columnEls.current[homes[a.id]], 0.3) });
    });
    // Stagger starts — the loops self-sustain via while(isRunningRef)
    setTimeout(() => scoutLoop(), 800);
    setTimeout(() => builderLoop(), 2200);
    setTimeout(() => reviewerLoop(), 3500);
    setTimeout(() => analystLoop(), 5500);
  }, [setAgent, scoutLoop, builderLoop, reviewerLoop, analystLoop]);

  const stopAgents = useCallback(() => {
    setIsRunning(false);
    const homes: Record<string, ColumnId> = { "agent-01": "ideas", "agent-02": "approval", "agent-03": "production", "agent-04": "shipped" };
    AGENTS.forEach((a) => releaseAgent(a.id, homes[a.id]));
  }, [releaseAgent]);

  const totalCards = columns.ideas.length + columns.approval.length + columns.production.length + columns.shipped.length;

  return (
    <div className="h-screen w-full flex flex-col" style={{ background: "#0a0a0a", color: "#fff", overflow: "hidden" }}>
      <style>{`
        .spin-slow { animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Cursors */}
      {isRunning && AGENTS.map((a) => <AgentCursor key={a.id} agent={a} state={agentStates[a.id]} />)}

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 shrink-0 z-30" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
        <div className="flex items-center gap-3">
          <img src={GAS_LOGO} alt="GAS" className="rounded" style={{ width: 24, height: 24 }} />
          <div>
            <div className="font-mono" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.85)" }}>AD PRODUCTION QUEUE</div>
            <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{totalCards} concepts &middot; {columns.shipped.length} shipped</div>
          </div>
        </div>

        <button
          onClick={isRunning ? stopAgents : startAgents}
          style={{ width: 32, height: 32, background: "transparent", border: "none", cursor: "pointer", opacity: 0 }}
          aria-label={isRunning ? "Stop Agents" : "Deploy Agents"}
        />
      </header>

      {/* Board */}
      <div className="flex flex-1 min-h-0">
        <LayoutGroup>
          {COLUMNS.map((col) => (
            <div key={col.id} ref={(el) => { columnEls.current[col.id] = el; }} className="flex-1 flex flex-col min-w-0" style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="font-mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{col.label}</span>
                <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>{columns[col.id].length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: "none" }}>
                {columns[col.id].map((card) => (
                  <KanbanCard key={card.id} card={card} columnId={col.id} highlight={highlightMap.get(card.id)} />
                ))}
              </div>
            </div>
          ))}
        </LayoutGroup>
      </div>
    </div>
  );
}
