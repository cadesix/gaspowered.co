"use client";

import { useState, useEffect, useCallback } from "react";
import Script from "next/script";

function MarchingHLine({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height: 1 }}>
      <svg width="100%" height="1" className="block">
        <line
          x1="0"
          y1="0.5"
          x2="100%"
          y2="0.5"
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="5 5"
          className="animate-march-h"
        />
      </svg>
    </div>
  );
}

function MarchingVLine({ side, className = "" }: { side: "left" | "right"; className?: string }) {
  return (
    <div
      className={`absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"} ${className}`}
      style={{ width: 1 }}
    >
      <svg width="1" height="100%" className="block h-full">
        <line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100%"
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="5 5"
          className="animate-march-v"
        />
      </svg>
    </div>
  );
}

const LINE_DURATION = 300;
const HLINE_START = 0;
const VLINE_START = LINE_DURATION;
const INNER_HLINES_START = VLINE_START + LINE_DURATION;
const TEXT_LINE1_START = INNER_HLINES_START + 200;
const TEXT_LINE2_START = TEXT_LINE1_START + 300;
const CONTENT_START = TEXT_LINE2_START + 400;
const DIALOG_START = CONTENT_START + 3000;

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

export default function SalesPage() {
  const [phase, setPhase] = useState(0);
  // 0: nothing, 1: top hline, 2: vlines, 3: inner hlines, 4: line1, 5: line2, 6: content, 7: dialog

  const openCalendly = useCallback(() => {
    window.Calendly?.initPopupWidget({
      url: 'https://calendly.com/cade-gaspowered/30min',
    });
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), HLINE_START),
      setTimeout(() => setPhase(2), VLINE_START),
      setTimeout(() => setPhase(3), INNER_HLINES_START),
      setTimeout(() => setPhase(4), TEXT_LINE1_START),
      setTimeout(() => setPhase(5), TEXT_LINE2_START),
      setTimeout(() => setPhase(6), CONTENT_START),
      setTimeout(() => setPhase(7), DIALOG_START),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Saans', sans-serif" }}>
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <style>{`
        @font-face {
          font-family: 'PPMondwest';
          src: url('/fonts/PPMondwest-Regular.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Saans';
          src: url('/fonts/SaansCollectionVF-TRIAL.ttf') format('truetype');
          font-weight: 300 900;
          font-style: normal;
          font-display: swap;
        }
        @keyframes march-h {
          to { stroke-dashoffset: -10; }
        }
        @keyframes march-v {
          to { stroke-dashoffset: -10; }
        }
        .animate-march-h {
          animation: march-h 0.5s linear infinite;
        }
        .animate-march-v {
          animation: march-v 0.5s linear infinite;
        }
        @keyframes weight-breathe {
          from { font-variation-settings: "wght" 300; }
          to { font-variation-settings: "wght" 900; }
        }
        .animate-weight {
          font-variation-settings: "wght" 300;
        }
        .animate-weight.active {
          animation: weight-breathe 4s ease-in-out 0.3s forwards;
        }
        .retro-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .retro-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: inset 2px 2px 0px #fff, inset -2px -2px 0px #808080, 3px 3px 0px rgba(0,0,0,0.7) !important;
        }
        .retro-btn-sm {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .retro-btn-sm:hover {
          transform: translate(-1px, -1px);
          box-shadow: inset 1px 1px 0px #fff, inset -1px -1px 0px #808080, 2px 2px 0px rgba(0,0,0,0.5) !important;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }

        /* Entry animations */
        @keyframes draw-h {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }
        @keyframes draw-v {
          from { clip-path: inset(0 0 100% 0); }
          to { clip-path: inset(0 0 0 0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.85) translateY(20px) rotate(0deg); }
          60% { opacity: 1; transform: scale(1.02) translateY(-3px) rotate(3deg); }
          80% { transform: scale(0.99) translateY(1px) rotate(1.5deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotate(2deg); }
        }
        .draw-h {
          clip-path: inset(0 100% 0 0);
        }
        .draw-h.active {
          animation: draw-h 0.3s ease-out forwards;
        }
        .draw-v {
          clip-path: inset(0 0 100% 0);
        }
        .draw-v.active {
          animation: draw-v 0.3s ease-out forwards;
        }
        @keyframes weight-reveal-light {
          from { opacity: 0; font-variation-settings: "wght" 100; }
          to { opacity: 1; font-variation-settings: "wght" 400; }
        }
        @keyframes weight-reveal-heavy {
          from { opacity: 0; font-variation-settings: "wght" 100; }
          to { opacity: 1; font-variation-settings: "wght" 700; }
        }
        .weight-reveal-light {
          opacity: 0;
          font-variation-settings: "wght" 100;
        }
        .weight-reveal-light.active {
          animation: weight-reveal-light 1s ease-out forwards;
        }
        .weight-reveal-heavy {
          opacity: 0;
          font-variation-settings: "wght" 100;
        }
        .weight-reveal-heavy.active {
          animation: weight-reveal-heavy 1s ease-out forwards;
        }
        .fade-in {
          opacity: 0;
        }
        .fade-in.active {
          animation: fade-in 0.5s ease-out forwards;
        }
        .bounce-in {
          opacity: 0;
        }
        .bounce-in.active {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>

      {/* Marquee Banner */}
      <div className="w-full bg-white overflow-hidden py-3.5">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-black text-xs md:text-base font-mono mx-6 md:mx-8">
              Gas is a first of its kind advertising agency architected with agentic AI at its core.
            </span>
          ))}
        </div>
      </div>

      {/* Spacer above hero */}
      <div className="h-20 md:h-28" />

      {/* Full-width dashed top stroke */}
      <div className={`draw-h ${phase >= 1 ? "active" : ""}`}>
        <MarchingHLine />
      </div>

      {/* Hero Section with dashed left/right borders */}
      <section className="relative max-w-6xl mx-auto">
        <MarchingVLine side="left" className={`draw-v ${phase >= 2 ? "active" : ""}`} />
        <MarchingVLine side="right" className={`draw-v ${phase >= 2 ? "active" : ""}`} />

        <div className="pt-12 pb-12 px-6 md:pt-24 md:px-16 lg:px-24">
          <h1 className="text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-white">
            <span className={`weight-reveal-light ${phase >= 4 ? "active" : ""} inline-block`}>
              Ad Campaigns that
            </span>
            <br />
            <span className={`weight-reveal-heavy ${phase >= 5 ? "active" : ""} inline-block`}>
              Improve Themselves
            </span>
          </h1>
          <div className={`fade-in ${phase >= 6 ? "active" : ""}`}>
            <p className="mt-8 text-base md:text-xl text-neutral-300">
              We help businesses 10x creative output and{" "}
              <strong className="text-white font-semibold">profitably</strong>{" "}
              scale with AI systems.
            </p>
          </div>
        </div>

        <div className={`draw-h ${phase >= 3 ? "active" : ""}`}>
          <MarchingHLine />
        </div>

        {/* Logo Row */}
        <div className={`fade-in ${phase >= 6 ? "active" : ""}`}>
          <div className="py-8 px-6 md:py-10 md:px-16 lg:px-24 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs md:text-sm text-neutral-500">
              Built by marketers and engineers from
            </p>
            <div className="flex items-center gap-6 md:gap-8">
              <img src="/logos/image 41.png" alt="Spark" className="h-4 md:h-5 opacity-70" />
              <img src="/logos/image 42.png" alt="Y Combinator" className="h-4 md:h-5 opacity-70" />
              <img src="/logos/image 43.png" alt="Ramp" className="h-4 md:h-5 opacity-70" />
              <img src="/logos/image 40.png" alt="Apple" className="h-5 md:h-6 opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Full-width dashed bottom stroke */}
      <div className={`draw-h ${phase >= 3 ? "active" : ""}`}>
        <MarchingHLine />
      </div>

      {/* TODO: Pill Badges - More Creatives, Better Performance, Faster Iteration */}

      {/* Retro Dialog Box - overlaps hero content */}
      <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none pt-[10vh] md:pt-[35vh]">
        <div className={`bounce-in ${phase >= 7 ? "active" : ""} max-w-md w-full px-4 md:px-6 pointer-events-auto`}>
        <div
          className="relative"
          style={{
            background: '#D9D9D9',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
          }}
        >
          {/* Inner shadow overlay - sits on top of everything */}
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              boxShadow: 'inset 6px 6px 0px #fff, inset -6px -6px 0px #808080',
            }}
          />

          {/* Content inside the bevel */}
          <div className="p-[6px]">
            {/* Title Bar */}
            <div className="flex items-center justify-between px-2 py-1.5 md:px-3 md:py-2" style={{ background: '#0D2395' }}>
              <span className="text-white font-normal tracking-wide md:tracking-widest uppercase font-mono text-sm md:text-[13px]">
                Stuck in the Stone Age?
              </span>
              <div className="flex gap-1 md:gap-1.5">
                <button
                  className="retro-btn-sm w-7 h-7 md:w-7 md:h-7 flex items-center justify-center text-black text-sm md:text-sm font-bold leading-none"
                  style={{
                    background: '#C0C0C0',
                    boxShadow: 'inset 1px 1px 0px #fff, inset -1px -1px 0px #808080',
                  }}
                >
                  ‒
                </button>
                <button
                  className="retro-btn-sm w-7 h-7 md:w-7 md:h-7 flex items-center justify-center text-black text-sm md:text-sm font-bold leading-none"
                  style={{
                    background: '#C0C0C0',
                    boxShadow: 'inset 1px 1px 0px #fff, inset -1px -1px 0px #808080',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="relative flex items-center justify-between overflow-hidden">
              <div className="p-6 md:p-8 relative z-10" style={{ fontFamily: "'PPMondwest', serif" }}>
                <h2 className="text-black tracking-tight uppercase whitespace-nowrap text-2xl md:text-[22px]">
                  Come with us!
                </h2>

                <div className="mt-4 md:mt-6">
                  <button
                    onClick={openCalendly}
                    className="retro-btn px-5 py-2.5 md:px-5 md:py-2 text-black uppercase tracking-tight text-lg md:text-[16px] cursor-pointer"
                    style={{
                      fontFamily: "'PPMondwest', serif",
                      background: '#D9D9D9',
                      boxShadow: 'inset 2px 2px 0px #fff, inset -2px -2px 0px #808080, 2px 2px 0px rgba(0,0,0,0.7)',
                    }}
                  >
                    Book a Call
                  </button>
                </div>
              </div>

              <img
                src="/images/hand.png"
                alt="Hand reaching out"
                className="object-contain mr-[-6px] h-[110px] md:h-[120px]"
              />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-40" />
    </div>
  );
}
