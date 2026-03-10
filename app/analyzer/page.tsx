"use client";

import { useState, useEffect, useRef } from "react";

/* ───── mock data ───── */

interface AdMetric {
  id: string;
  name: string;
  status: "active" | "paused" | "learning";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roas: number;
  ctr: number;
  frequency: number;
  sparkline: number[]; // 14 days of spend
  convSparkline: number[]; // 14 days of conversions
  trend: "up" | "down" | "flat";
  fatigue: number; // 0-100
  daysSinceCreative: number;
}

const generateSparkline = (base: number, volatility: number, trend: number, len = 14): number[] => {
  const data: number[] = [];
  let val = base;
  for (let i = 0; i < len; i++) {
    val += (Math.random() - 0.5) * volatility + trend;
    data.push(Math.max(0, Math.round(val * 100) / 100));
  }
  return data;
};

const ADS: AdMetric[] = [
  {
    id: "ad1", name: "Morning Routine Stack — UGC 30s", status: "active",
    spend: 4280, impressions: 892000, clicks: 18400, conversions: 312,
    cpa: 13.72, roas: 4.2, ctr: 2.06, frequency: 3.8, fatigue: 72,
    daysSinceCreative: 21,
    trend: "down",
    sparkline: generateSparkline(320, 40, -5),
    convSparkline: generateSparkline(28, 6, -1.2),
  },
  {
    id: "ad2", name: "Gut Health Explainer — Motion 45s", status: "active",
    spend: 3150, impressions: 654000, clicks: 11200, conversions: 245,
    cpa: 12.86, roas: 4.8, ctr: 1.71, frequency: 2.1, fatigue: 28,
    daysSinceCreative: 7,
    trend: "up",
    sparkline: generateSparkline(180, 30, 8),
    convSparkline: generateSparkline(12, 4, 1.5),
  },
  {
    id: "ad3", name: "75 Supplements → 1 Scoop — Side-by-Side", status: "active",
    spend: 5620, impressions: 1240000, clicks: 24800, conversions: 428,
    cpa: 13.13, roas: 4.5, ctr: 2.0, frequency: 4.2, fatigue: 81,
    daysSinceCreative: 28,
    trend: "down",
    sparkline: generateSparkline(420, 50, -8),
    convSparkline: generateSparkline(38, 8, -2),
  },
  {
    id: "ad4", name: "Doctor Reacts — Talking Head 12min", status: "active",
    spend: 2840, impressions: 412000, clicks: 8900, conversions: 198,
    cpa: 14.34, roas: 3.9, ctr: 2.16, frequency: 1.6, fatigue: 15,
    daysSinceCreative: 4,
    trend: "up",
    sparkline: generateSparkline(140, 25, 12),
    convSparkline: generateSparkline(8, 3, 2),
  },
  {
    id: "ad5", name: "Travel Pack ASMR — Macro 15s", status: "paused",
    spend: 1890, impressions: 328000, clicks: 4920, conversions: 86,
    cpa: 21.98, roas: 2.1, ctr: 1.5, frequency: 5.1, fatigue: 94,
    daysSinceCreative: 35,
    trend: "down",
    sparkline: generateSparkline(180, 20, -12),
    convSparkline: generateSparkline(10, 3, -2),
  },
  {
    id: "ad6", name: "30-Day Challenge — Documentary 90s", status: "active",
    spend: 3680, impressions: 780000, clicks: 15600, conversions: 289,
    cpa: 12.73, roas: 5.1, ctr: 2.0, frequency: 2.8, fatigue: 42,
    daysSinceCreative: 14,
    trend: "flat",
    sparkline: generateSparkline(260, 20, 0),
    convSparkline: generateSparkline(20, 4, 0.2),
  },
  {
    id: "ad7", name: "Fridge Restock ASMR — UGC 20s", status: "learning",
    spend: 680, impressions: 124000, clicks: 2100, conversions: 38,
    cpa: 17.89, roas: 2.8, ctr: 1.69, frequency: 1.2, fatigue: 5,
    daysSinceCreative: 2,
    trend: "up",
    sparkline: generateSparkline(40, 15, 6),
    convSparkline: generateSparkline(2, 2, 1),
  },
  {
    id: "ad8", name: "Marathon Runner's Secret — Doc 60s", status: "active",
    spend: 2210, impressions: 489000, clicks: 9300, conversions: 178,
    cpa: 12.42, roas: 5.3, ctr: 1.9, frequency: 2.4, fatigue: 35,
    daysSinceCreative: 11,
    trend: "up",
    sparkline: generateSparkline(130, 20, 4),
    convSparkline: generateSparkline(10, 3, 1),
  },
];

// Daily spend/conv data for the main chart (last 30 days)
const DAILY_DATA = Array.from({ length: 30 }, (_, i) => {
  const base = 1800 + Math.sin(i / 4) * 400;
  const weekend = (i % 7 === 5 || i % 7 === 6) ? 0.75 : 1;
  const spend = Math.round((base + (Math.random() - 0.5) * 300) * weekend);
  const convRate = 0.018 + Math.random() * 0.008 + (i > 20 ? -0.003 : 0);
  const conversions = Math.round(spend * convRate / 12);
  return {
    day: i + 1,
    date: `Feb ${i + 1}`,
    spend,
    conversions,
    cpa: Math.round((spend / Math.max(conversions, 1)) * 100) / 100,
    roas: Math.round((conversions * 58 / Math.max(spend, 1)) * 10) / 10,
  };
});

/* ───── AI Analysis messages ───── */

const ANALYSIS_SEGMENTS = [
  { type: "header" as const, text: "Account Health Overview" },
  { type: "body" as const, text: "Scanning 8 active creatives across Meta and TikTok. Total 30-day spend: $24,350. Blended ROAS: 4.1x. Account is performing above target but showing signs of creative fatigue on top spenders." },
  { type: "header" as const, text: "Creative Fatigue Alert" },
  { type: "body" as const, text: "\"75 Supplements → 1 Scoop\" has a fatigue score of 81/100. Frequency has hit 4.2x — well above the 3.0x threshold. CTR has declined 34% over the past 7 days. Recommend pausing this creative and rotating in a fresh variant." },
  { type: "body" as const, text: "\"Morning Routine Stack\" is also deteriorating. Fatigue at 72/100, frequency 3.8x. CPA has risen from $11.40 to $13.72 in 14 days. This was your top performer — prioritize 2-3 new UGC angles to replace it." },
  { type: "body" as const, text: "\"Travel Pack ASMR\" is already paused at 94/100 fatigue. Good call — this creative was fully exhausted." },
  { type: "header" as const, text: "Top Performers to Scale" },
  { type: "body" as const, text: "\"Doctor Reacts\" is only 4 days old with a $14.34 CPA and climbing conversion volume. Frequency is just 1.6x. Recommend increasing daily budget by 20-30% — this creative has significant runway." },
  { type: "body" as const, text: "\"Marathon Runner's Secret\" is quietly strong: $12.42 CPA, 5.3x ROAS, only 11 days in. Low fatigue at 35/100. This is your most efficient spend right now." },
  { type: "header" as const, text: "Weekend Spend Strategy" },
  { type: "body" as const, text: "It's Sunday. Historical data shows your CPAs rise 15-22% on weekends due to lower purchase intent. Recommend reducing spend by 20% today and Monday, then scaling back up Tuesday when conversion rates normalize." },
  { type: "body" as const, text: "Exception: \"Fridge Restock ASMR\" is still in learning phase (2 days). Keep this one steady — Meta's algorithm needs consistent data to optimize." },
  { type: "header" as const, text: "Iteration Recommendations" },
  { type: "body" as const, text: "Queue up new angles for your fatigued creatives. Specifically: test a creator-swap on \"Morning Routine Stack\" (same script, different face), and try a shorter 15s cut of \"75 Supplements\" focusing only on the price comparison moment." },
  { type: "body" as const, text: "The \"Gut Health Explainer\" motion graphics style is resonating (4.8x ROAS, low fatigue). Consider producing 2 more educational motion pieces — perhaps ingredient deep-dives or \"what happens in your body\" angles." },
  { type: "header" as const, text: "Summary" },
  { type: "body" as const, text: "Action items: (1) Pause \"75 Supplements\" creative, (2) Scale \"Doctor Reacts\" +25%, (3) Cut weekend budgets 20%, (4) Queue 3 new creatives to replace fatigued units. Projected impact: -8% spend, +12% conversions over next 7 days." },
];

/* ───── SVG chart components ───── */

function SpendChart({ data }: { data: typeof DAILY_DATA }) {
  const maxSpend = Math.max(...data.map((d) => d.spend));
  const maxConv = Math.max(...data.map((d) => d.conversions));
  const w = 720;
  const h = 200;
  const pad = { top: 20, right: 40, bottom: 30, left: 50 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * cw;
  const ySpend = (v: number) => pad.top + ch - (v / maxSpend) * ch;
  const yConv = (v: number) => pad.top + ch - (v / maxConv) * ch;

  const spendPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${ySpend(d.spend)}`).join(" ");
  const convPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yConv(d.conversions)}`).join(" ");
  const areaPath = spendPath + ` L${xScale(data.length - 1)},${pad.top + ch} L${xScale(0)},${pad.top + ch} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* grid */}
      {yTicks.map((t) => (
        <line
          key={t}
          x1={pad.left}
          x2={w - pad.right}
          y1={pad.top + ch * (1 - t)}
          y2={pad.top + ch * (1 - t)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}
      {/* y-axis labels spend */}
      {yTicks.map((t) => (
        <text
          key={`ys-${t}`}
          x={pad.left - 6}
          y={pad.top + ch * (1 - t) + 4}
          textAnchor="end"
          fill="rgba(255,255,255,0.3)"
          fontSize={9}
          fontFamily="var(--font-geist-mono)"
        >
          ${Math.round(maxSpend * t / 1000)}k
        </text>
      ))}
      {/* y-axis labels conv */}
      {yTicks.map((t) => (
        <text
          key={`yc-${t}`}
          x={w - pad.right + 6}
          y={pad.top + ch * (1 - t) + 4}
          textAnchor="start"
          fill="rgba(52,211,153,0.4)"
          fontSize={9}
          fontFamily="var(--font-geist-mono)"
        >
          {Math.round(maxConv * t)}
        </text>
      ))}
      {/* x-axis */}
      {data.filter((_, i) => i % 5 === 0).map((d) => (
        <text
          key={d.day}
          x={xScale(d.day - 1)}
          y={h - 6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize={9}
          fontFamily="var(--font-geist-mono)"
        >
          {d.date}
        </text>
      ))}
      {/* spend area */}
      <path d={areaPath} fill="rgba(255,255,255,0.03)" />
      {/* spend line */}
      <path d={spendPath} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      {/* conv line */}
      <path d={convPath} fill="none" stroke="rgba(52,211,153,0.7)" strokeWidth={1.5} strokeDasharray="4 3" />
      {/* weekend shading */}
      {data.map((_, i) => {
        if (i % 7 === 5 || i % 7 === 6) {
          const barW = cw / data.length;
          return (
            <rect
              key={`we-${i}`}
              x={xScale(i) - barW / 2}
              y={pad.top}
              width={barW}
              height={ch}
              fill="rgba(255,255,255,0.02)"
            />
          );
        }
        return null;
      })}
    </svg>
  );
}

function MiniSparkline({ data, color = "rgba(255,255,255,0.4)", width = 64, height = 20 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="block">
      <path d={path} fill="none" stroke={color} strokeWidth={1.2} />
    </svg>
  );
}

function FatigueBar({ value }: { value: number }) {
  const color = value > 70 ? "rgba(239,68,68,0.8)" : value > 40 ? "rgba(234,179,8,0.7)" : "rgba(52,211,153,0.7)";
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 48, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span className="font-mono" style={{ fontSize: 10, color }}>{value}</span>
    </div>
  );
}

function CPADistributionChart({ ads }: { ads: AdMetric[] }) {
  const sorted = [...ads].sort((a, b) => a.cpa - b.cpa);
  const maxCpa = Math.max(...sorted.map((a) => a.cpa));
  const barH = 22;
  const gap = 4;
  const h = sorted.length * (barH + gap);

  return (
    <div style={{ height: h }} className="relative w-full">
      {sorted.map((ad, i) => {
        const pct = (ad.cpa / maxCpa) * 100;
        const color = ad.cpa < 13 ? "rgba(52,211,153,0.6)" : ad.cpa < 16 ? "rgba(234,179,8,0.5)" : "rgba(239,68,68,0.5)";
        return (
          <div
            key={ad.id}
            className="absolute flex items-center gap-2"
            style={{ top: i * (barH + gap), height: barH, left: 0, right: 0 }}
          >
            <div
              className="font-mono truncate"
              style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", width: 180, flexShrink: 0 }}
            >
              {ad.name.split("—")[0].trim()}
            </div>
            <div className="flex-1 relative" style={{ height: 12, background: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
            </div>
            <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", width: 42, textAlign: "right" }}>
              ${ad.cpa.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ROASDonut({ ads }: { ads: AdMetric[] }) {
  const avgRoas = ads.reduce((s, a) => s + a.roas, 0) / ads.length;
  const r = 38;
  const stroke = 8;
  const circumference = 2 * Math.PI * r;
  const target = 4.0;
  const pct = Math.min(avgRoas / (target * 1.5), 1);
  const color = avgRoas >= target ? "rgba(52,211,153,0.8)" : "rgba(234,179,8,0.7)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={48}
          cy={48}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circumference * pct} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
        <text x={48} y={45} textAnchor="middle" fill="white" fontSize={18} fontFamily="var(--font-geist-mono)" fontWeight={600}>
          {avgRoas.toFixed(1)}x
        </text>
        <text x={48} y={59} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="var(--font-geist-mono)">
          ROAS
        </text>
      </svg>
      <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
        target: {target.toFixed(1)}x
      </span>
    </div>
  );
}

/* ───── Typing animation for AI analysis ───── */

function useTypingAnalysis(segments: typeof ANALYSIS_SEGMENTS) {
  const [displayText, setDisplayText] = useState("");
  const [currentSegIdx, setCurrentSegIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTyping || currentSegIdx >= segments.length) {
      if (currentSegIdx >= segments.length) setIsTyping(false);
      return;
    }

    const seg = segments[currentSegIdx];
    const fullText = seg.text;

    if (currentCharIdx >= fullText.length) {
      // Move to next segment after a pause
      const delay = seg.type === "header" ? 400 : 150;
      const timer = setTimeout(() => {
        setCurrentSegIdx((prev) => prev + 1);
        setCurrentCharIdx(0);
      }, delay);
      return () => clearTimeout(timer);
    }

    // Type characters
    const speed = seg.type === "header" ? 18 : 8;
    const timer = setTimeout(() => {
      setCurrentCharIdx((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentSegIdx, currentCharIdx, isTyping, segments]);

  // Build display text from completed segments + current
  useEffect(() => {
    let text = "";
    for (let i = 0; i < currentSegIdx; i++) {
      const s = segments[i];
      if (s.type === "header") {
        text += `\n▍ ${s.text}\n`;
      } else {
        text += `${s.text}\n\n`;
      }
    }
    if (currentSegIdx < segments.length) {
      const s = segments[currentSegIdx];
      const partial = s.text.slice(0, currentCharIdx);
      if (s.type === "header") {
        text += `\n▍ ${partial}`;
      } else {
        text += partial;
      }
    }
    setDisplayText(text);
  }, [currentSegIdx, currentCharIdx, segments]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayText]);

  return { displayText, isTyping, containerRef };
}

/* ───── Main component ───── */

export default function AnalyzerPage() {
  const { displayText, isTyping, containerRef } = useTypingAnalysis(ANALYSIS_SEGMENTS);
  const [selectedAd, setSelectedAd] = useState<string | null>(null);

  const totalSpend = ADS.reduce((s, a) => s + a.spend, 0);
  const totalConversions = ADS.reduce((s, a) => s + a.conversions, 0);
  const blendedCPA = totalSpend / totalConversions;
  const blendedROAS = ADS.reduce((s, a) => s + a.roas * a.spend, 0) / totalSpend;
  const activeCount = ADS.filter((a) => a.status === "active").length;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="font-mono font-semibold text-white" style={{ fontSize: 13, letterSpacing: "0.08em" }}>GAS</div>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
          <span className="font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>ad account analyzer</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>AG1 — Meta + TikTok</span>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}
          >
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(52,211,153,0.8)" }} />
            <span className="font-mono" style={{ fontSize: 10, color: "rgba(52,211,153,0.7)" }}>Live</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* AI Analysis Box */}
        <div
          className="mb-5 rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              {isTyping && (
                <div className="flex items-center gap-1">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(52,211,153,0.6)" }} className="animate-pulse" />
                </div>
              )}
              <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>
                {isTyping ? "Analyzing account..." : "Analysis complete"}
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              Last updated: just now
            </span>
          </div>
          <div
            ref={containerRef}
            className="px-4 py-3 overflow-y-auto font-mono"
            style={{ maxHeight: 200, fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", whiteSpace: "pre-wrap" }}
          >
            {displayText.split("\n").map((line, i) => {
              if (line.startsWith("▍ ")) {
                return (
                  <div key={i} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, marginTop: 8, marginBottom: 4, fontSize: 12 }}>
                    {line}
                  </div>
                );
              }
              return <div key={i}>{line || "\u00A0"}</div>;
            })}
            {isTyping && (
              <span className="inline-block" style={{ width: 6, height: 14, background: "rgba(255,255,255,0.5)", marginLeft: 1, animation: "blink 1s step-end infinite" }} />
            )}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Spend", value: `$${(totalSpend / 1000).toFixed(1)}k`, sub: "30 days" },
            { label: "Conversions", value: totalConversions.toLocaleString(), sub: `${activeCount} active ads` },
            { label: "Blended CPA", value: `$${blendedCPA.toFixed(2)}`, sub: "target: $14.00" },
            { label: "Blended ROAS", value: `${blendedROAS.toFixed(1)}x`, sub: "target: 4.0x" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg px-4 py-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {kpi.label}
              </div>
              <div className="font-mono mt-1" style={{ fontSize: 22, color: "white", fontWeight: 600 }}>
                {kpi.value}
              </div>
              <div className="font-mono mt-0.5" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Spend + Conversions Chart */}
          <div
            className="lg:col-span-2 rounded-lg overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Spend & Conversions — 30 days</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 12, height: 2, background: "rgba(255,255,255,0.5)" }} />
                  <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Spend</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 12, height: 2, background: "rgba(52,211,153,0.7)", borderTop: "1px dashed rgba(52,211,153,0.7)" }} />
                  <span className="font-mono" style={{ fontSize: 9, color: "rgba(52,211,153,0.4)" }}>Conv.</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <SpendChart data={DAILY_DATA} />
            </div>
          </div>

          {/* Right column: ROAS donut + CPA distribution */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
            >
              <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Blended ROAS</span>
              </div>
              <div className="flex justify-center py-4">
                <ROASDonut ads={ADS} />
              </div>
            </div>

            <div
              className="rounded-lg overflow-hidden flex-1"
              style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
            >
              <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>CPA by Creative</span>
              </div>
              <div className="p-4">
                <CPADistributionChart ads={ADS} />
              </div>
            </div>
          </div>
        </div>

        {/* Ad Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Creative Performance</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Creative", "Status", "Spend", "CPA", "ROAS", "CTR", "Freq.", "Fatigue", "Trend"].map((h) => (
                    <th
                      key={h}
                      className="font-mono text-left px-4 py-2.5 font-normal"
                      style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em", textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ADS.map((ad) => (
                  <tr
                    key={ad.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: selectedAd === ad.id ? "rgba(255,255,255,0.03)" : "transparent",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedAd === ad.id ? "rgba(255,255,255,0.03)" : "transparent"; }}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                        {ad.name.split("—")[0].trim()}
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                        {ad.name.split("—")[1]?.trim() || ""}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="font-mono inline-block px-1.5 py-0.5 rounded"
                        style={{
                          fontSize: 10,
                          background:
                            ad.status === "active" ? "rgba(52,211,153,0.08)" :
                            ad.status === "learning" ? "rgba(234,179,8,0.08)" :
                            "rgba(255,255,255,0.04)",
                          color:
                            ad.status === "active" ? "rgba(52,211,153,0.7)" :
                            ad.status === "learning" ? "rgba(234,179,8,0.7)" :
                            "rgba(255,255,255,0.35)",
                          border: `1px solid ${
                            ad.status === "active" ? "rgba(52,211,153,0.15)" :
                            ad.status === "learning" ? "rgba(234,179,8,0.15)" :
                            "rgba(255,255,255,0.08)"
                          }`,
                        }}
                      >
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                      ${ad.spend.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ fontSize: 12, color: ad.cpa < 13 ? "rgba(52,211,153,0.8)" : ad.cpa < 16 ? "rgba(255,255,255,0.7)" : "rgba(239,68,68,0.8)" }}>
                      ${ad.cpa.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ fontSize: 12, color: ad.roas >= 4 ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.7)" }}>
                      {ad.roas.toFixed(1)}x
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                      {ad.ctr.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ fontSize: 12, color: ad.frequency > 3 ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.6)" }}>
                      {ad.frequency.toFixed(1)}x
                    </td>
                    <td className="px-4 py-2.5">
                      <FatigueBar value={ad.fatigue} />
                    </td>
                    <td className="px-4 py-2.5">
                      <MiniSparkline
                        data={ad.sparkline}
                        color={ad.trend === "up" ? "rgba(52,211,153,0.6)" : ad.trend === "down" ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.3)"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>

      {/* Blink cursor animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
