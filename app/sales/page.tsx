"use client";

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

function MarchingVLine({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"}`}
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

function MarchingRect({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <rect
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          fill="none"
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="5 5"
          className="animate-march-h"
          rx="0"
        />
      </svg>
      {children}
    </div>
  );
}

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Saans', sans-serif" }}>
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
          animation: weight-breathe 4s ease-in-out 0.3s forwards;
          font-variation-settings: "wght" 300;
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
      `}</style>

      {/* Marquee Banner */}
      <div className="w-full bg-white overflow-hidden py-3.5">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-black text-base font-mono mx-8">
              Gas is a first of its kind advertising agency architected with agentic AI at its core.
            </span>
          ))}
        </div>
      </div>

      {/* Spacer above hero */}
      <div className="h-20 md:h-28" />

      {/* Full-width dashed top stroke */}
      <MarchingHLine />

      {/* Hero Section with dashed left/right borders */}
      <section className="relative max-w-6xl mx-auto">
        <MarchingVLine side="left" />
        <MarchingVLine side="right" />

        <div className="pt-24 pb-12 px-10 md:px-16 lg:px-24">
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-white">
            <span className="font-normal">Ad Campaigns that</span>
            <br />
            <span className="animate-weight">Improve Themselves</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-neutral-300 whitespace-nowrap">
            We help businesses 10x creative output and{" "}
            <strong className="text-white font-semibold">profitably</strong>{" "}
            scale with AI systems.
          </p>
        </div>

        <MarchingHLine />

        {/* Logo Row */}
        <div className="py-10 px-10 md:px-16 lg:px-24 flex items-center justify-between">
          <p className="text-sm text-neutral-500 whitespace-nowrap">
            Built by marketers and engineers from
          </p>
          <div className="flex items-center gap-8">
            <img src="/logos/image 40.png" alt="Apple" className="h-5 opacity-70" />
            <img src="/logos/image 41.png" alt="Spark" className="h-5 opacity-70" />
            <img src="/logos/image 42.png" alt="Y Combinator" className="h-5 opacity-70" />
            <img src="/logos/image 43.png" alt="Ramp" className="h-5 opacity-70" />
          </div>
        </div>
      </section>

      {/* Full-width dashed bottom stroke */}
      <MarchingHLine />

      {/* TODO: Pill Badges - More Creatives, Better Performance, Faster Iteration */}

      {/* Retro Dialog Box */}
      <div className="max-w-xl mx-auto mt-20 px-6">
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
            <div className="flex items-center justify-between px-3 py-2" style={{ background: '#0D2395' }}>
              <span className="text-white font-normal tracking-widest uppercase font-mono" style={{ fontSize: 21 }}>
                Stuck in the Stone Age?
              </span>
              <div className="flex gap-1.5">
                <button
                  className="retro-btn-sm w-9 h-9 flex items-center justify-center text-black text-lg font-bold leading-none"
                  style={{
                    background: '#C0C0C0',
                    boxShadow: 'inset 1px 1px 0px #fff, inset -1px -1px 0px #808080',
                  }}
                >
                  ‒
                </button>
                <button
                  className="retro-btn-sm w-9 h-9 flex items-center justify-center text-black text-lg font-bold leading-none"
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
                <h2 className="text-black tracking-tight uppercase whitespace-nowrap" style={{ fontSize: 28 }}>
                  Come with us!
                </h2>

                <div className="mt-6">
                  <button
                    className="retro-btn px-6 py-2.5 text-black uppercase tracking-tight"
                    style={{
                      fontSize: 20,
                      fontFamily: "'PPMondwest', serif",
                      background: '#D9D9D9',
                      boxShadow: 'inset 2px 2px 0px #fff, inset -2px -2px 0px #808080, 2px 2px 0px rgba(0,0,0,0.7)',
                    }}
                  >
                    Join Waitlist
                  </button>
                </div>
              </div>

              <img
                src="/images/hand.png"
                alt="Hand reaching out"
                className="object-contain mr-[-6px]"
                style={{ height: 150 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-40" />
    </div>
  );
}
