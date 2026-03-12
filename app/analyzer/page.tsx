"use client";

import { useState, useRef, useCallback } from "react";

/* ───── data types ───── */

interface Creative {
  id: string;
  name: string;
  format: string;
  status: "active" | "paused" | "learning";
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  frequency: number;
  fatigue: number;
  daily: number[];
}

interface AdSet {
  id: string;
  name: string;
  targeting: string;
  spend: number;
  cpa: number;
  roas: number;
  creatives: Creative[];
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: "active" | "paused";
  spend: number;
  cpa: number;
  roas: number;
  adSets: AdSet[];
}

/* ───── mock data ───── */

const spark = (base: number, vol: number, drift: number, n = 14): number[] => {
  const d: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.5) * vol + drift;
    d.push(Math.max(0, Math.round(v)));
  }
  return d;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "c1", name: "AG1 — Prospecting", objective: "Conversions", status: "active",
    spend: 15890, cpa: 13.21, roas: 4.5,
    adSets: [
      {
        id: "as1", name: "Health-conscious 25–34", targeting: "Interest: wellness, fitness, supplements", spend: 8420, cpa: 12.80, roas: 4.8,
        creatives: [
          { id: "cr1", name: "Morning Routine Stack", format: "UGC · 30s", status: "active", spend: 4280, conversions: 312, cpa: 13.72, roas: 4.2, frequency: 3.8, fatigue: 72, daily: spark(320, 40, -5) },
          { id: "cr2", name: "Gut Health Explainer", format: "Motion · 45s", status: "active", spend: 3150, conversions: 245, cpa: 12.86, roas: 4.8, frequency: 2.1, fatigue: 28, daily: spark(180, 30, 8) },
          { id: "cr3", name: "Fridge Restock ASMR", format: "UGC · 20s", status: "learning", spend: 680, conversions: 38, cpa: 17.89, roas: 2.8, frequency: 1.2, fatigue: 5, daily: spark(40, 15, 6) },
        ],
      },
      {
        id: "as2", name: "Supplement stackers 30–45", targeting: "Interest: biohacking, supplement reviews", spend: 7470, cpa: 13.68, roas: 4.2,
        creatives: [
          { id: "cr4", name: "75 Supplements → 1 Scoop", format: "Side-by-Side · 20s", status: "active", spend: 5620, conversions: 428, cpa: 13.13, roas: 4.5, frequency: 4.2, fatigue: 81, daily: spark(420, 50, -8) },
          { id: "cr5", name: "Travel Pack ASMR", format: "Macro · 15s", status: "paused", spend: 1890, conversions: 86, cpa: 21.98, roas: 2.1, frequency: 5.1, fatigue: 94, daily: spark(180, 20, -12) },
        ],
      },
    ],
  },
  {
    id: "c2", name: "AG1 — Retargeting", objective: "Conversions", status: "active",
    spend: 5050, cpa: 11.84, roas: 5.4,
    adSets: [
      {
        id: "as3", name: "Site visitors 7d", targeting: "Website visitors, last 7 days", spend: 2840, cpa: 11.20, roas: 5.6,
        creatives: [
          { id: "cr6", name: "Doctor Reacts to Ingredients", format: "Talking Head · 12m", status: "active", spend: 2840, conversions: 198, cpa: 14.34, roas: 3.9, frequency: 1.6, fatigue: 15, daily: spark(140, 25, 12) },
        ],
      },
      {
        id: "as4", name: "Cart abandoners 14d", targeting: "Add to cart, no purchase, 14 days", spend: 2210, cpa: 12.42, roas: 5.3,
        creatives: [
          { id: "cr7", name: "Marathon Runner's Secret", format: "Doc · 60s", status: "active", spend: 2210, conversions: 178, cpa: 12.42, roas: 5.3, frequency: 2.4, fatigue: 35, daily: spark(130, 20, 4) },
        ],
      },
    ],
  },
  {
    id: "c3", name: "AG1 — Brand Awareness", objective: "Reach", status: "active",
    spend: 3680, cpa: 12.73, roas: 5.1,
    adSets: [
      {
        id: "as5", name: "Broad 18–55", targeting: "Broad, US, 18–55", spend: 3680, cpa: 12.73, roas: 5.1,
        creatives: [
          { id: "cr8", name: "30-Day Challenge Results", format: "Documentary · 90s", status: "active", spend: 3680, conversions: 289, cpa: 12.73, roas: 5.1, frequency: 2.8, fatigue: 42, daily: spark(260, 20, 0) },
        ],
      },
    ],
  },
  {
    id: "c4", name: "AG1 — TikTok Testing", objective: "Conversions", status: "paused",
    spend: 1240, cpa: 18.50, roas: 2.4,
    adSets: [
      {
        id: "as6", name: "TikTok wellness 18–30", targeting: "Wellness, health, fitness creators", spend: 740, cpa: 16.20, roas: 2.8,
        creatives: [
          { id: "cr9", name: "What Happens Inside Your Body", format: "Motion · 30s", status: "paused", spend: 420, conversions: 22, cpa: 19.09, roas: 2.2, frequency: 1.8, fatigue: 12, daily: spark(30, 10, -2) },
          { id: "cr10", name: "Nutritionist Roasts My Diet", format: "Collab · 45s", status: "paused", spend: 320, conversions: 18, cpa: 17.78, roas: 2.5, frequency: 1.4, fatigue: 8, daily: spark(24, 8, -1) },
        ],
      },
      {
        id: "as7", name: "TikTok ASMR enthusiasts", targeting: "ASMR, oddly satisfying", spend: 500, cpa: 21.30, roas: 1.9,
        creatives: [
          { id: "cr11", name: "Unboxing the Science", format: "Unboxing · 20s", status: "paused", spend: 500, conversions: 24, cpa: 20.83, roas: 2.0, frequency: 2.2, fatigue: 18, daily: spark(38, 12, -3) },
        ],
      },
    ],
  },
];

const ACCOUNT_DAILY = Array.from({ length: 30 }, (_, i) => {
  const base = 1800 + Math.sin(i / 4) * 400;
  const wknd = (i % 7 === 5 || i % 7 === 6) ? 0.75 : 1;
  const spend = Math.round((base + (Math.random() - 0.5) * 300) * wknd);
  const conv = Math.round(spend * (0.018 + Math.random() * 0.008 + (i > 20 ? -0.003 : 0)) / 12);
  const d = new Date(2026, 1, i + 1);
  return { spend, conv, label: `${d.toLocaleString("en", { month: "short" })} ${d.getDate()}` };
});

/* ───── analysis content ───── */

interface AnalysisBlock {
  type: "heading" | "paragraph" | "action";
  text: string;
}

const ANALYSIS: AnalysisBlock[] = [
  { type: "heading", text: "Scanning account" },
  { type: "paragraph", text: "Pulling 30-day performance across 8 active creatives on Meta and TikTok. Total spend is $24.3k at a blended 4.1x ROAS — above the 4.0x target. But I'm seeing efficiency decline week-over-week. Two of the top three spenders are showing fatigue signals. Digging in." },
  { type: "heading", text: "Fatigue analysis" },
  { type: "paragraph", text: "\"75 Supplements → 1 Scoop\" is the biggest issue. Frequency at 4.2x, CTR down 34% in seven days, running unchanged for 28 days. It's still converting but CPA is rising fast — diminishing returns. I'm going to kill this one." },
  { type: "paragraph", text: "\"Morning Routine Stack\" is close behind. Was the best performer two weeks ago at $11.40 CPA. Now $13.72 and climbing. Frequency 3.8x. This creative is entering its final useful days — I'll keep it running through the weekend but it's on the chopping block." },
  { type: "paragraph", text: "\"Travel Pack ASMR\" was already paused — 94/100 fatigue, fully exhausted. Good call, nothing to do here." },
  { type: "heading", text: "Scaling opportunities" },
  { type: "paragraph", text: "\"Marathon Runner's Secret\" is the most efficient active creative — $12.42 CPA, 5.3x ROAS, only 35/100 fatigue after 11 days. This has headroom. Pushing budget up 25%." },
  { type: "paragraph", text: "\"Doctor Reacts\" is 4 days in with low frequency and climbing volume. Early signal is strong but it's still in learning. I'm leaving this untouched — Meta needs consistent signal to optimize. Will revisit next week." },
  { type: "paragraph", text: "\"Gut Health Explainer\" is a sleeper — 4.8x ROAS, low fatigue, and the motion graphics format is resonating in a way the UGC isn't right now. Flagging this as a template for the next batch of creatives." },
  { type: "heading", text: "Weekend adjustment" },
  { type: "paragraph", text: "CPAs historically rise 15–22% on weekends for this account. Pulling non-learning campaign budgets down 20% through Monday, restoring Tuesday. Exception: \"Fridge Restock ASMR\" stays steady — it's still in learning and needs consistent signal." },
  { type: "heading", text: "Actions taken" },
  { type: "action", text: "Paused \"75 Supplements → 1 Scoop\" — fatigue too high, CPA accelerating" },
  { type: "action", text: "Scaled \"Marathon Runner's Secret\" budget +25% — strong efficiency, low fatigue" },
  { type: "action", text: "Reduced weekend budgets 20% across non-learning campaigns" },
  { type: "action", text: "Queued 3 new creatives: creator-swap on Morning Routine, shorter cut of 75 Supplements, new motion graphics piece based on Gut Health Explainer format" },
  { type: "paragraph", text: "Projected impact: –8% spend, +12% conversions over the next 7 days. I'll re-evaluate Tuesday morning." },
];

/* ───── sparkline ───── */

function Spark({ data, w = 56, h = 20 }: { data: number[]; w?: number; h?: number }) {
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const rng = mx - mn || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 1 - ((v - mn) / rng) * (h - 2);
    return `${x},${y}`;
  });
  const up = data[data.length - 1] > data[0];
  return (
    <svg width={w} height={h} className="block flex-shrink-0">
      <polyline points={pts.join(" ")} fill="none" stroke={up ? "#4ade80" : "#f87171"} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

/* ───── interactive chart ───── */

function AccountChart({ data }: { data: { spend: number; conv: number; label: string }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const w = 600;
  const h = 180;
  const py = 8;
  const ch = h - py * 2;
  const maxSpend = Math.max(...data.map(d => d.spend));
  const maxConv = Math.max(...data.map(d => d.conv));
  const barW = w / data.length;

  const convY = (conv: number) => py + ch - (conv / maxConv) * ch;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const idx = Math.min(Math.max(Math.round(pct * (data.length - 1)), 0), data.length - 1);
    setHoverIdx(idx);
  }, [data.length]);

  const hoverData = hoverIdx !== null ? data[hoverIdx] : null;
  const hoverX = hoverIdx !== null ? (hoverIdx / (data.length - 1)) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIdx(null)}
      style={{ cursor: hoverIdx !== null ? "crosshair" : "default" }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full block" preserveAspectRatio="none" style={{ height: 160 }}>
        {data.map((d, i) => {
          const bh = (d.spend / maxSpend) * ch;
          const x = i * barW + 1;
          const y = py + ch - bh;
          const isWeekend = i % 7 === 5 || i % 7 === 6;
          const isHovered = i === hoverIdx;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={Math.max(barW - 2, 1)}
              height={bh}
              fill={isHovered ? "rgba(255,255,255,0.18)" : isWeekend ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"}
              rx={1}
            />
          );
        })}
        <polyline
          points={data.map((d, i) => `${i * barW + barW / 2},${convY(d.conv)}`).join(" ")}
          fill="none"
          stroke="white"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {hoverIdx !== null && hoverData && (
          <circle cx={hoverIdx * barW + barW / 2} cy={convY(hoverData.conv)} r={3.5} fill="white" />
        )}
      </svg>

      {hoverIdx !== null && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: `${hoverX}%`, width: 1, background: "rgba(255,255,255,0.15)" }}
        />
      )}

      {hoverIdx !== null && hoverData && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: -6,
            left: `${hoverX}%`,
            transform: hoverX > 75 ? "translateX(-100%)" : hoverX < 25 ? "translateX(0)" : "translateX(-50%)",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            padding: "6px 10px",
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-geist-mono)", marginBottom: 3 }}>
            {hoverData.label}
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", color: "rgba(255,255,255,0.85)" }}>
              ${hoverData.spend.toLocaleString()}
            </span>
            <span style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", color: "white" }}>
              {hoverData.conv} conv
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── tree components ───── */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      className="flex-shrink-0"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
    >
      <path d="M5 3L9 7L5 11" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CreativeRow({ creative, depth, onSelect }: { creative: Creative; depth: number; onSelect: (c: Creative) => void }) {
  const fatigueColor = creative.fatigue > 70 ? "#f87171" : creative.fatigue > 40 ? "#fbbf24" : "#4ade80";
  const isPaused = creative.status === "paused";

  return (
    <div
      className="flex items-center py-2 group cursor-pointer"
      style={{
        paddingLeft: depth * 22 + 6,
        color: isPaused ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(creative); }}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <svg width={15} height={15} viewBox="0 0 15 15" className="flex-shrink-0" style={{ opacity: isPaused ? 0.3 : 0.4 }}>
          <rect x={1.5} y={1} width={12} height={13} rx={2} fill="none" stroke="currentColor" strokeWidth={1.2} />
          <line x1={4.5} y1={5} x2={10.5} y2={5} stroke="currentColor" strokeWidth={0.9} />
          <line x1={4.5} y1={8} x2={8.5} y2={8} stroke="currentColor" strokeWidth={0.9} />
        </svg>

        <span className="truncate" style={{ fontSize: 15 }}>{creative.name}</span>

        {creative.status !== "active" && (
          <span style={{
            fontSize: 14, fontFamily: "var(--font-geist-mono)", textTransform: "uppercase", letterSpacing: "0.05em",
            color: creative.status === "learning" ? "rgba(251,191,36,0.8)" : "rgba(255,255,255,0.35)",
            flexShrink: 0,
          }}>
            {creative.status}
          </span>
        )}
      </div>

      <div className="flex" style={{ flexShrink: 0 }}>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", width: 58, textAlign: "right", fontFamily: "var(--font-geist-mono)" }}>
          ${(creative.spend / 1000).toFixed(1)}k
        </span>

        <span style={{
          fontSize: 14, width: 58, textAlign: "right", fontFamily: "var(--font-geist-mono)",
          color: creative.cpa <= 13 ? "#4ade80" : creative.cpa > 18 ? "#f87171" : "rgba(255,255,255,0.7)",
        }}>
          ${creative.cpa.toFixed(2)}
        </span>

        <span style={{
          fontSize: 14, width: 46, textAlign: "right", fontFamily: "var(--font-geist-mono)",
          color: creative.roas >= 4.5 ? "#4ade80" : "rgba(255,255,255,0.6)",
        }}>
          {creative.roas.toFixed(1)}x
        </span>

        {creative.fatigue > 50 ? (
          <span style={{ fontSize: 14, color: fatigueColor, width: 28, textAlign: "right", fontFamily: "var(--font-geist-mono)", opacity: 0.8 }}>
            {creative.fatigue}
          </span>
        ) : (
          <span style={{ width: 28 }} />
        )}

        <div style={{ width: 56, display: "flex", justifyContent: "flex-end" }}>
          <Spark data={creative.daily} />
        </div>
      </div>
    </div>
  );
}

function AdSetNode({ adSet, depth, onSelectCreative }: { adSet: AdSet; depth: number; onSelectCreative: (c: Creative) => void }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div
        className="flex items-center py-2 cursor-pointer"
        style={{ paddingLeft: depth * 22 + 6 }}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span style={{ color: "rgba(255,255,255,0.45)" }}><ChevronIcon open={open} /></span>
          <svg width={15} height={15} viewBox="0 0 15 15" className="flex-shrink-0" style={{ opacity: 0.35 }}>
            <path d="M1.5 4C1.5 3.4 1.9 3 2.5 3H5.5L7 4.5H12.5C13.1 4.5 13.5 4.9 13.5 5.5V11.5C13.5 12.1 13.1 12.5 12.5 12.5H2.5C1.9 12.5 1.5 12.1 1.5 11.5V4Z" fill="none" stroke="currentColor" strokeWidth={1.1} />
          </svg>
          <span className="truncate" style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}>{adSet.name}</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-geist-mono)", flexShrink: 0 }}>
            {adSet.creatives.length} creative{adSet.creatives.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex" style={{ flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", width: 58, textAlign: "right", fontFamily: "var(--font-geist-mono)" }}>
            ${(adSet.spend / 1000).toFixed(1)}k
          </span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", width: 58, textAlign: "right", fontFamily: "var(--font-geist-mono)" }}>
            ${adSet.cpa.toFixed(2)}
          </span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", width: 46, textAlign: "right", fontFamily: "var(--font-geist-mono)" }}>
            {adSet.roas.toFixed(1)}x
          </span>
          <span style={{ width: 84 }} />
        </div>
      </div>
      {open && adSet.creatives.map(cr => (
        <CreativeRow key={cr.id} creative={cr} depth={depth + 1} onSelect={onSelectCreative} />
      ))}
    </div>
  );
}

function CampaignNode({ campaign, onSelectCreative }: { campaign: Campaign; onSelectCreative: (c: Creative) => void }) {
  const [open, setOpen] = useState(true);
  const isPaused = campaign.status === "paused";

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div
        className="flex items-center py-3 cursor-pointer px-1"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span style={{ color: "rgba(255,255,255,0.5)" }}><ChevronIcon open={open} /></span>
          <span className="truncate" style={{ fontSize: 16, color: isPaused ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.95)", fontWeight: 500 }}>
            {campaign.name}
          </span>
          {isPaused && (
            <span style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
              paused
            </span>
          )}
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-geist-mono)", flexShrink: 0 }}>
            {campaign.objective}
          </span>
        </div>
        <div className="flex" style={{ flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: isPaused ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", width: 58, textAlign: "right", fontFamily: "var(--font-geist-mono)" }}>
            ${(campaign.spend / 1000).toFixed(1)}k
          </span>
          <span style={{ fontSize: 14, color: isPaused ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", width: 58, textAlign: "right", fontFamily: "var(--font-geist-mono)" }}>
            ${campaign.cpa.toFixed(2)}
          </span>
          <span style={{ fontSize: 14, color: isPaused ? "rgba(255,255,255,0.3)" : (campaign.roas >= 4.5 ? "#4ade80" : "rgba(255,255,255,0.7)"), width: 46, textAlign: "right", fontFamily: "var(--font-geist-mono)" }}>
            {campaign.roas.toFixed(1)}x
          </span>
          <span style={{ width: 84 }} />
        </div>
      </div>
      {open && (
        <div style={{ paddingBottom: 6 }}>
          {campaign.adSets.map(as => (
            <AdSetNode key={as.id} adSet={as} depth={1} onSelectCreative={onSelectCreative} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── creative drawer ───── */

function CreativeDrawer({ creative, onClose }: { creative: Creative; onClose: () => void }) {
  const fatigueColor = creative.fatigue > 70 ? "#f87171" : creative.fatigue > 40 ? "#fbbf24" : "#4ade80";
  const statusColor = creative.status === "active" ? "#4ade80" : creative.status === "learning" ? "#fbbf24" : "rgba(255,255,255,0.4)";
  const daily = creative.daily;
  const mn = Math.min(...daily);
  const mx = Math.max(...daily);
  const avg = Math.round(daily.reduce((a, b) => a + b, 0) / daily.length);
  const trend = daily[daily.length - 1] - daily[0];
  const trendPct = daily[0] > 0 ? Math.round((trend / daily[0]) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto hide-scrollbar"
        style={{
          width: 420,
          background: "#111",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          animation: "drawer-in 0.2s ease-out",
        }}
      >
        <style>{`
          @keyframes drawer-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="min-w-0 flex-1">
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "white", marginBottom: 6 }}>{creative.name}</h2>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{creative.format}</span>
              <span style={{
                fontSize: 12, fontFamily: "var(--font-geist-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
                color: statusColor, background: `${statusColor}15`, padding: "2px 8px", borderRadius: 4,
              }}>
                {creative.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 mt-1"
            style={{ color: "rgba(255,255,255,0.4)", cursor: "pointer", background: "none", border: "none" }}
          >
            <svg width={18} height={18} viewBox="0 0 18 18">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Metrics grid */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {[
              { label: "Spend", value: `$${creative.spend.toLocaleString()}` },
              { label: "Conversions", value: creative.conversions.toLocaleString() },
              { label: "CPA", value: `$${creative.cpa.toFixed(2)}`, color: creative.cpa <= 13 ? "#4ade80" : creative.cpa > 18 ? "#f87171" : undefined },
              { label: "ROAS", value: `${creative.roas.toFixed(1)}x`, color: creative.roas >= 4.5 ? "#4ade80" : undefined },
              { label: "Frequency", value: creative.frequency.toFixed(1), color: creative.frequency > 3.5 ? "#f87171" : creative.frequency > 2.5 ? "#fbbf24" : undefined },
              { label: "Fatigue", value: `${creative.fatigue}/100`, color: fatigueColor },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--font-geist-mono)", color: m.color || "white", letterSpacing: "-0.02em" }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fatigue bar */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Creative fatigue
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
            <div style={{ height: 6, width: `${creative.fatigue}%`, background: fatigueColor, borderRadius: 3, transition: "width 0.3s" }} />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-geist-mono)" }}>Fresh</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-geist-mono)" }}>Exhausted</span>
          </div>
        </div>

        {/* Daily performance chart */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Daily conversions
            </span>
            <span style={{
              fontSize: 13, fontFamily: "var(--font-geist-mono)",
              color: trendPct >= 0 ? "#4ade80" : "#f87171",
            }}>
              {trendPct >= 0 ? "+" : ""}{trendPct}%
            </span>
          </div>
          <Spark data={daily} w={372} h={80} />
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-geist-mono)" }}>Avg</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-geist-mono)" }}>{avg}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-geist-mono)" }}>Min</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-geist-mono)" }}>{mn}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-geist-mono)" }}>Max</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-geist-mono)" }}>{mx}</span>
            </div>
          </div>
        </div>

        {/* Efficiency note */}
        <div className="px-6 py-5">
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Efficiency
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
            {creative.fatigue > 70
              ? `This creative is fatigued. Frequency at ${creative.frequency.toFixed(1)}x suggests the audience has seen it too many times. Consider pausing or rotating in a fresh variant.`
              : creative.fatigue > 40
              ? `Performance is holding but showing early signs of fatigue. Monitor frequency closely — you have roughly 5–7 days before efficiency drops meaningfully.`
              : creative.status === "learning"
              ? `Still in the learning phase. Avoid making budget or targeting changes until the platform has enough signal to optimize delivery.`
              : `This creative is performing well with low fatigue. There's room to scale spend if the audience segment supports it.`
            }
          </div>
        </div>
      </div>
    </>
  );
}

/* ───── page ───── */

export default function AnalyzerPage() {
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const totalSpend = CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const allCreatives = CAMPAIGNS.flatMap(c => c.adSets.flatMap(as => as.creatives));
  const totalConv = allCreatives.reduce((s, cr) => s + cr.conversions, 0);
  const blendedCPA = totalSpend / totalConv;
  const blendedROAS = allCreatives.reduce((s, cr) => s + cr.roas * cr.spend, 0) / totalSpend;

  return (
    <div className="min-h-screen" style={{ background: "#090909", color: "#e5e5e5" }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* Nav */}
      <nav className="flex items-center px-6 h-13" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--font-geist-mono)" }}>GAS</span>
          <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 18 }}>/</span>
          <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>Analyzer</span>
        </div>
      </nav>

      {/* Two-column layout */}
      <div className="flex" style={{ minHeight: "calc(100vh - 52px)" }}>

        {/* LEFT — Chat */}
        <div className="flex-shrink-0 flex flex-col" style={{ width: "42%", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-6" style={{ maxHeight: "calc(100vh - 120px)" }}>
            <div className="flex gap-3.5 mb-4">
              <div className="flex-shrink-0 mt-1" style={{ width: 26, height: 26, borderRadius: 5, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={14} height={14} viewBox="0 0 14 14">
                  <circle cx={7} cy={4.5} r={1.8} fill="rgba(255,255,255,0.5)" />
                  <circle cx={3.5} cy={10} r={1.4} fill="rgba(255,255,255,0.3)" />
                  <circle cx={10.5} cy={10} r={1.4} fill="rgba(255,255,255,0.3)" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {ANALYSIS.map((block, bi) => {
                  if (block.type === "heading") {
                    return (
                      <h3
                        key={bi}
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.6)",
                          marginTop: bi === 0 ? 0 : 28,
                          marginBottom: 10,
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {block.text}
                      </h3>
                    );
                  }
                  if (block.type === "action") {
                    return (
                      <div key={bi} className="flex gap-2.5" style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>
                        <span style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>→</span>
                        <span>{block.text}</span>
                      </div>
                    );
                  }
                  return (
                    <p key={bi} style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", marginBottom: 14 }}>
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat input */}
          <div className="px-6 pb-5 pt-2">
            <div
              className="flex items-center gap-2.5 px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
              }}
            >
              <input
                type="text"
                placeholder="Override agent decisions..."
                className="flex-1 bg-transparent outline-none placeholder-[rgba(255,255,255,0.35)]"
                style={{ fontSize: 15, color: "rgba(255,255,255,0.8)" }}
              />
              <button
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 10px",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                <svg width={16} height={16} viewBox="0 0 16 16">
                  <path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Data */}
        <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ maxHeight: "calc(100vh - 52px)" }}>
          {/* Stats */}
          <div className="flex items-baseline gap-10 px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { label: "Spend", val: `$${(totalSpend / 1000).toFixed(1)}k` },
              { label: "Conv.", val: totalConv.toLocaleString() },
              { label: "CPA", val: `$${blendedCPA.toFixed(2)}` },
              { label: "ROAS", val: `${blendedROAS.toFixed(1)}x` },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-2.5">
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-geist-mono)" }}>{s.label}</span>
                <span style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-geist-mono)", color: "white", letterSpacing: "-0.02em" }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="px-6 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Daily spend & conversions — 30 days</span>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div style={{ width: 10, height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 2 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono)" }}>spend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: 10, height: 2, background: "white", borderRadius: 1 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono)" }}>conv</span>
                </div>
              </div>
            </div>
            <AccountChart data={ACCOUNT_DAILY} />
          </div>

          {/* Campaign tree */}
          <div className="px-6 pt-5">
            <div className="flex items-center mb-3 px-1">
              <span className="flex-1" style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Campaigns</span>
              <div className="flex" style={{ flexShrink: 0 }}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-geist-mono)", width: 58, textAlign: "right" }}>Spend</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-geist-mono)", width: 58, textAlign: "right" }}>CPA</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-geist-mono)", width: 46, textAlign: "right" }}>ROAS</span>
                <span style={{ width: 84 }} />
              </div>
            </div>
            {CAMPAIGNS.map(c => (
              <CampaignNode key={c.id} campaign={c} onSelectCreative={setSelectedCreative} />
            ))}
          </div>

          <div className="h-8" />
        </div>
      </div>

      {selectedCreative && (
        <CreativeDrawer creative={selectedCreative} onClose={() => setSelectedCreative(null)} />
      )}
    </div>
  );
}
