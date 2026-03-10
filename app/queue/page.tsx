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
  progress?: number;
  productionStartedAt?: number;
  productionDuration?: number;
}

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: "ideas", label: "Ideas" },
  { id: "approval", label: "For Approval" },
  { id: "production", label: "In Production" },
  { id: "shipped", label: "Shipped" },
];

const INITIAL_CARDS: Record<ColumnId, AdCard[]> = {
  ideas: [
    {
      id: "c1", title: "Morning Routine Stack", format: "UGC Video", platform: "TikTok",
      angle: "Lifestyle Integration", duration: "30s", audience: "Health-conscious millennials, 25–34",
      cta: "Link in bio — first order + free starter kit",
      hook: "\"I used to hate mornings until I found this one thing...\"",
      script: "Open on creator dragging themselves out of bed. Cut to them mixing AG1 with water. Montage of energy throughout the day — gym, work, cooking. End on creator looking at camera: \"One scoop changed everything.\" CTA overlay.",
      references: ["Huberman morning routine clips", "Typical \"day in my life\" TikToks with 2M+ views"],
    },
    {
      id: "c2", title: "Gut Health Explainer", format: "Motion Graphics", platform: "Instagram",
      angle: "Science / Education", duration: "45s", audience: "Biohackers, wellness-curious 28–40",
      cta: "Tap to learn more — subscribe & save 20%",
      hook: "Your gut has 100 trillion bacteria. Most of them are starving.",
      script: "Animated cross-section of the gut microbiome. Zoom into villi, show bacteria populations. Introduce AG1's prebiotic and probiotic blend with ingredient callouts. Data points on absorption rates. Clean outro with product shot.",
      references: ["Kurzgesagt visual style", "ZOE gut health content", "Medical animation accounts"],
    },
    {
      id: "c3", title: "75 Supplements → 1 Scoop", format: "Side-by-Side", platform: "Meta",
      angle: "Value Proposition", duration: "20s", audience: "Supplement stackers spending $150+/mo, 30–45",
      cta: "Try AG1 risk-free — 90 day money-back guarantee",
      hook: "I was spending $300/month on supplements. Then I did the math.",
      script: "Split screen: left side shows a counter full of supplement bottles with price tags adding up. Right side: single AG1 pouch. Calculator animation showing cost comparison. Testimonial overlay from real user. Product hero shot.",
      references: ["Dollar Shave Club \"Our Blades Are F***ing Great\" energy", "Before/after comparison ads"],
    },
    {
      id: "c4", title: "Doctor Reacts to Ingredients", format: "Talking Head", platform: "YouTube",
      angle: "Authority / Trust", duration: "8–12min", audience: "Research-driven buyers, 30–50, high intent",
      cta: "Link in description — first 5 ingredients breakdown PDF",
      hook: "A doctor breaks down every ingredient in AG1. No sponsorship.",
      script: "Doctor at desk with AG1 label on screen. Goes through key ingredient categories: vitamins, minerals, probiotics, adaptogens. Explains bioavailability. Addresses common skepticism. Honest pros and cons. Subscribe CTA.",
      references: ["Dr. Mike ingredient reviews", "Jeff Nippard supplement tier lists", "Lab Door testing format"],
    },
    {
      id: "c5", title: "Travel Pack ASMR", format: "Macro Video", platform: "TikTok",
      angle: "Product Experience", duration: "15s", audience: "Frequent travelers, digital nomads, 22–35",
      cta: "Get your travel packs — link in bio",
      hook: "The most satisfying morning sound",
      script: "Close-up hands tearing open AG1 travel pack. Slow-mo powder pouring into glass. Ice water pour. Stir with metal spoon — crisp clink sounds. First sip reaction. Airport lounge background. No voiceover, just textures and sound.",
      references: ["Satisfying ASMR food accounts (15M+ views)", "Apple product unboxing tactile shots"],
    },
    {
      id: "c6", title: "30-Day Challenge Results", format: "Documentary", platform: "Meta",
      angle: "Transformation", duration: "60–90s", audience: "Skeptics on the fence, 28–42",
      cta: "Start your own 30-day trial — link below",
      hook: "I drank AG1 every day for 30 days. Here's what actually happened.",
      script: "Day 1: skeptical creator unboxing. Week 1 check-in: nothing dramatic. Week 2: sleep quality improving. Week 3: skin clearing up, energy stable. Day 30: side-by-side comparison photos. Blood work comparison if available. Honest review.",
      references: ["Yes Theory challenge format", "30-day transformation content (cold plunge, no sugar, etc.)"],
    },
    {
      id: "c7", title: "Gym Bros Try AG1", format: "Remix", platform: "TikTok",
      angle: "Social Proof / Humor", duration: "30s", audience: "Gym culture, fitness bros, 20–30",
      cta: "Link in bio — taste it yourself",
      hook: "We made the biggest skeptics in our gym try AG1 for a week",
      script: "Group of gym regulars reacting to AG1 taste for the first time. Cut to them a week later — \"okay I actually bought my own.\" Funny banter, authentic reactions. End with group cheers-ing their AG1 glasses. Trend audio underneath.",
      references: ["NELK Boys energy but cleaner", "Buff Dudes supplement reviews", "Gym reaction content"],
    },
    {
      id: "c8", title: "What's Actually In It", format: "Carousel", platform: "Instagram",
      angle: "Ingredient Transparency", duration: "10 slides", audience: "Label readers, clean-eating community, 25–40",
      cta: "Save this post — full ingredient list at link in bio",
      hook: "Slide 1: \"AG1 has 75 ingredients. Here are the 10 that matter most.\"",
      script: "Each slide features one key ingredient with: name, dosage, what it does, clinical backing. Clean typography on green/white backgrounds. Final slide: \"All in one scoop. Link in bio.\" Saveable, shareable format.",
      references: ["@the.holistic.psychologist carousel format", "Examine.com data presentations"],
    },
    {
      id: "c9", title: "CEO Morning Routine", format: "POV Video", platform: "YouTube",
      angle: "Aspirational Lifestyle", duration: "4–6min", audience: "Entrepreneurs, aspiring founders, 25–40",
      cta: "AG1 link in description — fuel the grind",
      hook: "5 AM with a founder who's scaled to $100M",
      script: "POV camera follows a founder through their morning. AG1 is the first thing they reach for — not positioned as an ad, but as part of the routine. Workout, cold plunge, journaling. AG1 appears naturally. Subtle product placement throughout.",
      references: ["Lex Fridman daily routine", "Ali Abdaal productivity vlogs", "Casey Neistat morning energy"],
    },
    {
      id: "c10", title: "Taste Test Tournament", format: "UGC Video", platform: "TikTok",
      angle: "Entertainment / Comparison", duration: "45s", audience: "Curious buyers doing research, 22–35",
      cta: "Comment which one you'd pick — link in bio to try AG1",
      hook: "AG1 vs every green powder on Amazon. Blind taste test.",
      script: "Creator sets up 5 unmarked green drinks. Friends taste-test and rank them. Reveal which is AG1. Discuss taste, texture, mixability. Show ingredient comparison chart at end. AG1 doesn't have to win taste — it wins on nutrition.",
      references: ["BuzzFeed taste test format", "Good Mythical Morning blind tests", "Ranked-style content"],
    },
    {
      id: "c11", title: "Pediatrician Mom's Pick", format: "Interview", platform: "Meta",
      angle: "Family / Trust", duration: "60s", audience: "Health-conscious parents, moms 30–45",
      cta: "Learn more — AG1 for the whole family",
      hook: "\"As a pediatrician, I'm extremely careful about what I put in my body\"",
      script: "Interview-style with a doctor who's also a mom. She explains her supplement research process. Why she landed on AG1 after trying others. Shows her morning routine with her kids. Warm, authentic, no hard sell. Logo lockup at end.",
      references: ["@mamadoctorjones style", "Honest Company brand feel", "Pampers trust-building ads"],
    },
    {
      id: "c12", title: "Green Powder Tier List", format: "Listicle", platform: "TikTok",
      angle: "Comparison / Hot Take", duration: "60s", audience: "Supplement-curious, comparison shoppers, 20–35",
      cta: "Full ranking breakdown — link in bio",
      hook: "Ranking every green powder from S-tier to trash",
      script: "Creator with tier list board. Reviews Athletic Greens competitors one by one — ingredients, taste, price. Places each on the tier list with commentary. AG1 goes last for dramatic effect. Data-backed reasoning for S-tier placement.",
      references: ["Tier list TikTok trend format", "Marques Brownlee tech tier lists", "Food tier list creators"],
    },
    {
      id: "c13", title: "What Happens Inside Your Body", format: "Motion Graphics", platform: "YouTube",
      angle: "Science / Visual Storytelling", duration: "90s", audience: "Visual learners, science-curious adults, 22–38",
      cta: "See the full ingredient breakdown — link in description",
      hook: "Here's what happens 30 minutes after you drink AG1",
      script: "CG animation following AG1 through the digestive tract. Show nutrient absorption at the cellular level. Time-lapse style: 5 min — stomach breakdown. 15 min — nutrient absorption begins. 30 min — energy pathways activate. Clean, medical-grade visuals. End with product shot.",
      references: ["TED-Ed biology animations", "Osmosis medical videos", "How It's Made pacing"],
    },
    {
      id: "c14", title: "Fridge Restock ASMR", format: "UGC Video", platform: "TikTok",
      angle: "Aesthetic / Lifestyle", duration: "20s", audience: "Organization & lifestyle aesthetics fans, 18–30",
      cta: "Restock your routine — link in bio",
      hook: "The most satisfying fridge restock you'll see today",
      script: "Crisp overhead shots: hands organizing fridge. Fruits, vegetables, sparkling water being placed neatly. AG1 canister placed on top shelf with a satisfying thud. Close-up of scooping powder. Glass of green AG1 placed front-and-center. No voiceover — just sounds and a trending ambient track.",
      references: ["@cleanwithkay fridge restocks", "ASMR restock compilations (50M+ views)", "Glossier product placement style"],
    },
    {
      id: "c15", title: "Marathon Runner's Secret", format: "Documentary Short", platform: "Meta",
      angle: "Performance / Endurance", duration: "45s", audience: "Runners, endurance athletes, 25–45",
      cta: "Fuel your next PR — try AG1 risk-free",
      hook: "She ran a 2:58 marathon. This is what she drinks every morning.",
      script: "Dawn shots of runner stretching. Kitchen counter: AG1 being mixed. Running montage through city streets. Interview snippets about recovery and nutrition. Race day footage. Finish line celebration. Quiet moment post-race mixing AG1. Product lockup.",
      references: ["Nike running campaign intimacy", "Tracksmith brand films", "Strava community stories"],
    },
    {
      id: "c16", title: "Nutritionist Roasts My Diet", format: "Collab Video", platform: "TikTok",
      angle: "Entertainment / Education", duration: "60s", audience: "Young adults with poor diets who know it, 20–30",
      cta: "Fix the gap in your diet — link in bio",
      hook: "I let a nutritionist roast everything I ate this week",
      script: "Creator shows their actual meals: fast food, skipped breakfast, late-night snacks. Nutritionist reacts with honest (funny) commentary. Points out specific nutrient gaps. Introduces AG1 as a baseline — \"you still need to eat better, but this helps.\" Authentic, not preachy.",
      references: ["@nutritionbabe reaction style", "Abbey Sharp diet review format", "Roast me TikTok trend"],
    },
    {
      id: "c17", title: "Pilot Morning Routine", format: "POV Video", platform: "YouTube",
      angle: "Aspirational / Niche Lifestyle", duration: "3–5min", audience: "Aviation enthusiasts, professionals with demanding schedules, 28–45",
      cta: "Start your day like a pro — AG1 link in description",
      hook: "4:30 AM with an airline pilot. Every minute counts.",
      script: "Alarm goes off in hotel room. Pilot gets ready — precise, efficient. AG1 travel pack mixed in hotel glass. Drive to airport. Walk through terminal. Cockpit prep. Takeoff footage. AG1 is woven in naturally as part of the discipline. No hard sell.",
      references: ["@pilot_lindy vlogs", "Casey Neistat travel energy", "Day-in-the-life with real professionals"],
    },
    {
      id: "c18", title: "Unboxing the Science", format: "Unboxing", platform: "Instagram",
      angle: "Transparency / Education", duration: "30s", audience: "Detail-oriented buyers who read labels, 30–45",
      cta: "See what's inside — link in bio for full lab results",
      hook: "Let's actually read what's in this thing",
      script: "Clean desk. AG1 pouch centered. Creator opens it, pulls out the packet. Pours powder into clear glass — satisfying green pour. Then flips to label, going ingredient by ingredient with text overlays showing clinical dosages. Ends: \"75 ingredients. One scoop. No filler.\"",
      references: ["Lab Muffin Beauty ingredient breakdowns", "Unboxing Therapy clean format", "Consumer Reports visual style"],
    },
    {
      id: "c19", title: "Mom vs. Dad Taste Test", format: "UGC Video", platform: "TikTok",
      angle: "Family / Humor", duration: "30s", audience: "Millennial parents, couples, 28–40",
      cta: "Settle the debate — try AG1 together",
      hook: "Making my parents try AG1 for the first time",
      script: "Creator sets up two glasses. Mom and Dad try AG1 blind — no label shown. Capture genuine reactions. Mom: loves it. Dad: suspicious but finishes it. Playful argument about taste. Reveal it's AG1. Show them the ingredient list. Dad is impressed. Wholesome family moment.",
      references: ["Parents react TikTok format", "Family taste test compilations", "The McFarlands family content"],
    },
    {
      id: "c20", title: "Night Shift Nurse", format: "Mini Documentary", platform: "Meta",
      angle: "Real People / Grit", duration: "60s", audience: "Healthcare workers, night shift professionals, 25–40",
      cta: "Give your body what it needs — AG1 link below",
      hook: "She works 12-hour night shifts. This is how she stays sharp.",
      script: "Dark hospital corridors. Nurse checks on patients, reviews charts. Break room: she mixes AG1 under fluorescent lights. Interview: talks about how hard it is to eat well with her schedule. AG1 isn't a miracle — it's a baseline. Raw, real, respectful of the profession.",
      references: ["Humans of New York storytelling", "Night shift nurse TikTok community", "Patagonia worker profiles"],
    },
    {
      id: "c21", title: "Split Screen: With vs Without", format: "Side-by-Side", platform: "Meta",
      angle: "Before/After", duration: "25s", audience: "On-the-fence buyers, 25–40",
      cta: "Feel the difference — 90 day guarantee",
      hook: "Two mornings. One with AG1. One without.",
      script: "Split screen, same person: Left side — sluggish, coffee-dependent morning. Groaning alarm, dragging to kitchen. Right side — smooth, energized morning. AG1 mixed, stretching, out the door. Both sides play simultaneously. Text overlay at end: \"Same person. Different foundation.\"",
      references: ["Apple Watch health campaign split screens", "Peloton motivation ads", "Clear app comparison format"],
    },
    {
      id: "c22", title: "The $3.23 Breakdown", format: "Talking Head", platform: "TikTok",
      angle: "Cost Objection Handling", duration: "40s", audience: "Price-sensitive potential buyers, 22–35",
      cta: "Less than your morning coffee — link in bio",
      hook: "\"AG1 is too expensive.\" Let me do some math real quick.",
      script: "Creator at desk with calculator. Breaks down per-serving cost vs buying each ingredient individually. Shows receipts from Whole Foods, Amazon. Running tally on screen. Punchline: buying everything separately costs 8x more. \"$3.23 a day for 75 ingredients. Your iced latte costs more.\"",
      references: ["Financial TikTok breakdown format", "Graham Stephan cost analysis style", "Frugal living content"],
    },
  ],
  approval: [],
  production: [],
  shipped: [],
};

/* ═══════════════════════════════════════════
   CARD
   ═══════════════════════════════════════════ */

function KanbanCard({
  card,
  columnId,
  onDragStart,
  onCardClick,
}: {
  card: AdCard;
  columnId: ColumnId;
  onDragStart: (cardId: string, fromCol: ColumnId) => void;
  onCardClick: (card: AdCard, columnId: ColumnId) => void;
}) {
  return (
    <motion.div
      layout
      layoutId={card.id}
      transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
      draggable
      onDragStart={(e) => {
        const evt = e as unknown as React.DragEvent;
        evt.dataTransfer?.setData("text/plain", card.id);
        onDragStart(card.id, columnId);
      }}
      onClick={() => onCardClick(card, columnId)}
      className="rounded-lg"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 14px",
        marginBottom: 6,
        cursor: "grab",
      }}
    >
      <div className="mb-1.5">
        <span
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}
        >
          AG1
        </span>
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, marginBottom: 4 }}>
        {card.title}
      </div>

      <span
        className="font-mono inline-block rounded"
        style={{ fontSize: 10, padding: "1px 6px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
      >
        {card.format}
      </span>

      {columnId === "production" && (
        <div className="mt-2.5 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 16 16" className="spin-slow" style={{ color: "rgba(251,191,36,0.6)" }}>
            <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="font-mono" style={{ fontSize: 10, color: "rgba(251,191,36,0.5)" }}>
            Producing...
          </span>
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
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   DRAWER
   ═══════════════════════════════════════════ */

function CardDrawer({
  card,
  columnId,
  onClose,
  onApprove,
  onReject,
}: {
  card: AdCard;
  columnId: ColumnId;
  onClose: () => void;
  onApprove?: (cardId: string) => void;
  onReject?: (cardId: string) => void;
}) {
  const statusLabel =
    columnId === "ideas" ? "Idea" :
    columnId === "approval" ? "Pending Approval" :
    columnId === "production" ? "In Production" :
    "Shipped";

  const statusColor =
    columnId === "ideas" ? "rgba(255,255,255,0.4)" :
    columnId === "approval" ? "rgba(168,85,247,0.8)" :
    columnId === "production" ? "rgba(251,191,36,0.8)" :
    "rgba(52,211,153,0.8)";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.6)" }}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 36 }}
        className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto"
        style={{
          width: 480,
          maxWidth: "100vw",
          background: "#111",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            {columnId === "production" ? (
              <svg width="10" height="10" viewBox="0 0 16 16" className="spin-slow" style={{ color: statusColor }}>
                <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <div className="rounded-full" style={{ width: 7, height: 7, background: statusColor }} />
            )}
            <span className="font-mono" style={{ fontSize: 11, color: statusColor }}>{statusLabel}</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5">
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 6, lineHeight: 1.3 }}>
            {card.title}
          </h2>

          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono rounded" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              {card.format}
            </span>
          </div>

          {/* Hook */}
          <div className="mb-6">
            <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Hook
            </div>
            <div style={{
              fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontStyle: "italic",
              padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8,
              borderLeft: "2px solid rgba(255,255,255,0.1)",
            }}>
              {card.hook}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {card.duration && (
              <div>
                <div className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Duration</div>
                <div className="font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{card.duration}</div>
              </div>
            )}
            <div>
              <div className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Platform</div>
              <div className="font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{card.platform}</div>
            </div>
            <div>
              <div className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Angle</div>
              <div className="font-mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{card.angle}</div>
            </div>
          </div>

          {/* Target audience */}
          {card.audience && (
            <div className="mb-6">
              <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Target Audience
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                {card.audience}
              </div>
            </div>
          )}

          {/* Script */}
          {card.script && (
            <div className="mb-6">
              <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Script / Concept
              </div>
              <div style={{
                fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65,
                padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                {card.script}
              </div>
            </div>
          )}

          {/* CTA */}
          {card.cta && (
            <div className="mb-6">
              <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Call to Action
              </div>
              <div style={{
                fontSize: 13, color: "rgba(52,211,153,0.8)", lineHeight: 1.5,
                padding: "10px 14px", background: "rgba(52,211,153,0.04)", borderRadius: 8,
                border: "1px solid rgba(52,211,153,0.1)",
              }}>
                {card.cta}
              </div>
            </div>
          )}

          {/* References */}
          {card.references && card.references.length > 0 && (
            <div className="mb-6">
              <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                References / Inspiration
              </div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {card.references.map((ref, i) => (
                  <li key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Production spinner */}
          {columnId === "production" && (
            <div className="mb-6 flex items-center gap-3 rounded-lg" style={{ padding: "14px 16px", background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" className="spin-slow" style={{ color: "rgba(251,191,36,0.7)" }}>
                <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-mono" style={{ fontSize: 12, color: "rgba(251,191,36,0.6)" }}>Currently being produced...</span>
            </div>
          )}
        </div>

        {/* Approval footer */}
        {columnId === "approval" && onApprove && onReject && (
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              onClick={() => { onApprove(card.id); onClose(); }}
              className="flex-1 font-mono rounded"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "10px 0",
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.25)",
                color: "rgba(52,211,153,0.9)",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              Approve
            </button>
            <button
              onClick={() => { onReject(card.id); onClose(); }}
              className="flex-1 font-mono rounded"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "10px 0",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "rgba(239,68,68,0.8)",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              Reject
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function QueuePage() {
  const [columns, setColumns] = useState<Record<ColumnId, AdCard[]>>(INITIAL_CARDS);
  const [isRunning, setIsRunning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shippedCount, setShippedCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Drag state
  const [dragFrom, setDragFrom] = useState<{ cardId: string; col: ColumnId } | null>(null);
  const [dropTarget, setDropTarget] = useState<ColumnId | null>(null);

  // Drawer state
  const [drawerCard, setDrawerCard] = useState<{ card: AdCard; columnId: ColumnId } | null>(null);

  const isDragging = useRef(false);

  const handleDragStart = useCallback((cardId: string, col: ColumnId) => {
    isDragging.current = true;
    setDragFrom({ cardId, col });
  }, []);

  const handleDrop = useCallback((targetCol: ColumnId) => {
    if (!dragFrom || dragFrom.col === targetCol) {
      setDragFrom(null);
      setDropTarget(null);
      return;
    }

    setColumns((prev) => {
      const next = { ...prev };
      const sourceCards = [...prev[dragFrom.col]];
      const cardIdx = sourceCards.findIndex((c) => c.id === dragFrom.cardId);
      if (cardIdx === -1) return prev;

      const [card] = sourceCards.splice(cardIdx, 1);
      const targetCards = [...prev[targetCol]];

      const movedCard = { ...card };
      if (targetCol === "production") {
        movedCard.progress = 0;
        movedCard.productionStartedAt = Date.now();
        movedCard.productionDuration = (Math.random() * 20 + 10) * 1000;
      } else {
        movedCard.progress = undefined;
        movedCard.productionStartedAt = undefined;
        movedCard.productionDuration = undefined;
      }

      targetCards.unshift(movedCard);
      next[dragFrom.col] = sourceCards;
      next[targetCol] = targetCards;
      return next;
    });

    setDragFrom(null);
    setDropTarget(null);
  }, [dragFrom]);

  const handleCardClick = useCallback((card: AdCard, columnId: ColumnId) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    setDrawerCard({ card, columnId });
  }, []);

  const handleApprove = useCallback((cardId: string) => {
    setColumns((prev) => {
      const next = { ...prev, approval: [...prev.approval], production: [...prev.production] };
      const idx = next.approval.findIndex((c) => c.id === cardId);
      if (idx === -1) return prev;
      const [card] = next.approval.splice(idx, 1);
      const duration = (Math.random() * 20 + 10) * 1000;
      next.production.unshift({ ...card, progress: 0, productionStartedAt: Date.now(), productionDuration: duration });
      return next;
    });
  }, []);

  const handleReject = useCallback((cardId: string) => {
    setColumns((prev) => {
      const next = { ...prev, approval: [...prev.approval], ideas: [...prev.ideas] };
      const idx = next.approval.findIndex((c) => c.id === cardId);
      if (idx === -1) return prev;
      const [card] = next.approval.splice(idx, 1);
      next.ideas.push(card);
      return next;
    });
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    setColumns((prev) => {
      const next = {
        ideas: [...prev.ideas],
        approval: [...prev.approval],
        production: [...prev.production],
        shipped: [...prev.shipped],
      };

      // Ship cards whose production timer has elapsed
      const doneIdx = next.production.findIndex((c) =>
        c.productionStartedAt && c.productionDuration && now - c.productionStartedAt >= c.productionDuration
      );
      if (doneIdx !== -1) {
        const card = next.production.splice(doneIdx, 1)[0];
        next.shipped.unshift({ ...card, progress: undefined, productionStartedAt: undefined, productionDuration: undefined });
        return next;
      }

      // Move approved cards → production
      if (next.approval.length > 0 && next.production.length < 3) {
        const card = next.approval.shift()!;
        const duration = (Math.random() * 20 + 10) * 1000; // 10–30s
        next.production.push({ ...card, progress: 0, productionStartedAt: now, productionDuration: duration });
        return next;
      }

      // Move ideas → approval
      if (next.ideas.length > 0 && next.approval.length < 4) {
        const card = next.ideas.shift()!;
        next.approval.push(card);
        return next;
      }

      return next;
    });
  }, []);

  // Auto-ship production cards after their timer expires
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    for (const card of columns.production) {
      if (card.productionStartedAt && card.productionDuration) {
        const remaining = card.productionStartedAt + card.productionDuration - Date.now();
        if (remaining <= 0) {
          // Already elapsed, ship immediately
          setColumns((prev) => {
            const idx = prev.production.findIndex((c) => c.id === card.id);
            if (idx === -1) return prev;
            const next = { ...prev, production: [...prev.production], shipped: [...prev.shipped] };
            const [done] = next.production.splice(idx, 1);
            next.shipped.unshift({ ...done, progress: undefined, productionStartedAt: undefined, productionDuration: undefined });
            return next;
          });
        } else {
          timers.push(setTimeout(() => {
            setColumns((prev) => {
              const idx = prev.production.findIndex((c) => c.id === card.id);
              if (idx === -1) return prev;
              const next = { ...prev, production: [...prev.production], shipped: [...prev.shipped] };
              const [done] = next.production.splice(idx, 1);
              next.shipped.unshift({ ...done, progress: undefined, productionStartedAt: undefined, productionDuration: undefined });
              return next;
            });
          }, remaining));
        }
      }
    }
    return () => timers.forEach(clearTimeout);
  }, [columns.production]);

  // Track shipped count
  const prevColumnsRef = useRef(columns);
  useEffect(() => {
    const prev = prevColumnsRef.current;
    prevColumnsRef.current = columns;

    for (const card of columns.shipped) {
      if (!prev.shipped.find((c) => c.id === card.id)) {
        setShippedCount((c) => c + 1);
      }
    }
  }, [columns]);

  const startAgents = useCallback(() => {
    setIsRunning(true);
    setMenuOpen(false);
    tick();
    intervalRef.current = setInterval(tick, 1800);
  }, [tick]);

  const stopAgents = useCallback(() => {
    setIsRunning(false);
    setMenuOpen(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // Keep drawer card in sync with column state
  const activeDrawerCard = drawerCard
    ? (() => {
        for (const colId of COLUMNS.map((c) => c.id)) {
          const found = columns[colId].find((c) => c.id === drawerCard.card.id);
          if (found) return { card: found, columnId: colId };
        }
        return drawerCard;
      })()
    : null;

  const totalCards = columns.ideas.length + columns.approval.length + columns.production.length + columns.shipped.length;

  return (
    <div className="h-screen w-full flex flex-col" style={{ background: "#0a0a0a", color: "#fff" }}>
      <style>{`.spin-slow { animation: spin 1.2s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <img src={GAS_LOGO} alt="GAS" className="rounded" style={{ width: 24, height: 24 }} />
          <div>
            <div className="font-mono" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.85)" }}>
              AD PRODUCTION QUEUE
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
              {totalCards} concepts &middot; {shippedCount} shipped
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && (
            <div className="flex items-center gap-2">
              <motion.div
                className="rounded-full"
                style={{ width: 5, height: 5, background: "rgba(52,211,153,0.8)" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="font-mono" style={{ fontSize: 10, color: "rgba(52,211,153,0.6)" }}>LIVE</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center rounded"
              style={{
                width: 32, height: 32,
                background: menuOpen ? "rgba(255,255,255,0.06)" : "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1 rounded overflow-hidden z-50"
                  style={{ background: "rgba(18,18,18,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", minWidth: 180 }}
                >
                  <button
                    onClick={isRunning ? stopAgents : startAgents}
                    className="w-full text-left px-3 py-2.5 font-mono"
                    style={{
                      fontSize: 12,
                      color: isRunning ? "rgba(239,68,68,0.8)" : "rgba(52,211,153,0.8)",
                      background: "transparent", border: "none", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {isRunning ? "Stop Agents" : "Deploy Agents"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex flex-1 min-h-0">
        <LayoutGroup>
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="flex-1 flex flex-col min-w-0"
              style={{
                borderRight: "1px solid rgba(255,255,255,0.04)",
                background: dropTarget === col.id ? "rgba(255,255,255,0.02)" : "transparent",
                transition: "background 0.15s",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(col.id);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.id);
              }}
            >
              <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="font-mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
                  {col.label}
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>
                  {columns[col.id].length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: "none" }}>
                {columns[col.id].map((card) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    columnId={col.id}
                    onDragStart={handleDragStart}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </LayoutGroup>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {activeDrawerCard && (
          <CardDrawer
            card={activeDrawerCard.card}
            columnId={activeDrawerCard.columnId}
            onClose={() => setDrawerCard(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
