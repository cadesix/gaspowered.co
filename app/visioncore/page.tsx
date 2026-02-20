"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Observation {
  t: number;
  type: string;
  text: string;
  detail: string;
  tag: string;
}

interface CreativeSummary {
  hookRate: number;
  holdRate: number;
  ctrTier: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  bestPlatform: string;
  targetDemo: string;
  creatorType: string;
  productCategory: string;
  emotionalTone: string;
  contentFormat: string;
  density: number;
  strengths: string[];
  weaknesses: string[];
  verdict: string;
}

interface VideoEntry {
  id: string;
  src: string;
  label: string;
  observations: Observation[];
  summary: CreativeSummary;
}

/* ═══════════════════════════════════════════
   VIDEO DATA
   New videos from /public
   ═══════════════════════════════════════════ */

const VIDEOS: VideoEntry[] = [
  {
    id: "candrinks",
    src: "/candrinks.mp4",
    label: "Drink Stacking Challenge: Air Heads, Skittles, Prime",
    observations: [
      {
          t: 0,
          type: "action",
          text: "Stacking challenge starts.",
          detail: "Abrupt 'Go' initiates action. Novelty and urgency stop scroll, create curiosity.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "product",
          text: "Air Heads Soda cans shown.",
          detail: "Bright cans feature prominently. Triggers brand recognition, nostalgia, links product to fun/sweetness.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 1.5,
          type: "technique",
          text: "Fast, precise can stacking.",
          detail: "Quick, effortless stacking builds mild suspense, accomplishment. Engages viewer via simple, satisfying visual.",
          tag: "TECHNIQUE",
        },
      {
          t: 3,
          type: "emotion",
          text: "Creator's 'Got it!' and smile.",
          detail: "Exclamation and smile trigger vicarious satisfaction, positive reinforcement. Builds parasocial intimacy, shared achievement.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 4,
          type: "product",
          text: "Skittles Drinks bottles appear.",
          detail: "New, colorful Skittles drinks appear. Maintains visual novelty, broadens product placement, uses brand familiarity.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 6,
          type: "action",
          text: "Repetitive stacking.",
          detail: "Consistent, successful stacking creates predictable rhythm. Exploits pattern completion, delivers dopamine hits.",
          tag: "ACTION",
        },
      {
          t: 7,
          type: "emotion",
          text: "Second 'Got it!' and smile.",
          detail: "Repeated affirmation reinforces approachable persona. Deepens parasocial connection, links products to joy/ease.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 8,
          type: "product",
          text: "Prime Hydration cans appear.",
          detail: "Third popular, youth-oriented brand (Prime) introduced. Expands product appeal, uses brand hype, perceived coolness.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 9.5,
          type: "action",
          text: "Final rapid stacking.",
          detail: "Quick, successful completion of last stack provides closure. Reinforces creator 'skill', activity ease.",
          tag: "ACTION",
        },
      {
          t: 11.5,
          type: "engagement",
          text: "Creator's final smile.",
          detail: "Creator's smile is manufactured authenticity. Makes product interaction seem enjoyable, encourages viewer emulation/desire.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.85,
      holdRate: 0.7,
      ctrTier: "HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "F 13–24 · Gen Z · Snack/Drink Consumers · Casual Gamers",
      creatorType: "Female 18–25 · Approachable · Positive Affect",
      productCategory: "Beverages · Multi-brand Stacking Challenge",
      emotionalTone: "Curiosity → Satisfaction → Joy",
      contentFormat: "Product challenge · 12s · Audio cues · No speech",
      density: 0.83,
      strengths: [
        "Uses popular, colorful brands for recognition.",
        "Gamification creates low-stakes, satisfying challenge.",
        "Creator's positive demeanor builds parasocial connection.",
        "Rapid cuts, quick successes create dopamine loop.",
      ],
      weaknesses: [
        "No clear call to action or product benefit.",
        "Repetitive action may cause early drop-off.",
        "No unique twist or narrative beyond stacking.",
      ],
      verdict: "This content is multi-brand product placement disguised as a casual challenge. It commodifies simple satisfaction and aspirational fun, using popular brands and a relatable creator to drive passive product desire and brand familiarity among young demographics.",
    },
  },
  {
    id: "chocolate",
    src: "/chocolate.mp4",
    label: "Chocolate Heart Creation",
    observations: [
      {
          t: 0,
          type: "action",
          text: "Chocolate poured.",
          detail: "Visual spectacle, immediate action. Triggers curiosity, 'what's next?' dopamine hit, stops scroll.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "technique",
          text: "Viscous chocolate flow close-up.",
          detail: "Sensory appeal, satisfying flow. Exploits ASMR-like visual pleasure, increases watch time via hypnotic effect.",
          tag: "TECHNIQUE",
        },
      {
          t: 1.5,
          type: "action",
          text: "Chocolate spread with roller.",
          detail: "Precision, control in satisfying motion. Triggers satisfaction from order, mastery, reinforces perceived professionalism.",
          tag: "ACTION",
        },
      {
          t: 3,
          type: "insight",
          text: "Creator reflection in chocolate.",
          detail: "Unexpected visual detail. Creates pause, breaks pattern, subtly increases watch time via depth.",
          tag: "CONTEXT",
        },
      {
          t: 4,
          type: "product",
          text: "Heart template on chocolate.",
          detail: "Clear intent, outcome anticipation. Builds suspense, desire for final product, makes process seem achievable.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 5.5,
          type: "action",
          text: "Chocolate cut with precision tool.",
          detail: "Precision, satisfying transformation. Reinforces effortless perfection, triggers aspiration for similar skill.",
          tag: "ACTION",
        },
      {
          t: 7,
          type: "emotion",
          text: "Creators' thumbs up, smiles.",
          detail: "Validation, shared success. Builds parasocial intimacy, positive process association, encourages viewer identification.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 8,
          type: "product",
          text: "Chocolate heart revealed.",
          detail: "Clear, aesthetically pleasing result. Triggers envy for similar skill or outcome, drives aspiration.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 9,
          type: "technique",
          text: "Chocolate edges torched.",
          detail: "Unexpected method, curiosity. Introduces novelty, prevents scroll, implies advanced, professional technique.",
          tag: "TECHNIQUE",
        },
      {
          t: 10,
          type: "action",
          text: "Chocolate lifted, clean edges revealed.",
          detail: "Satisfying reveal of perfect result. Exploits 'oddly satisfying' trend, creates dopamine loop, reinforces mastery.",
          tag: "ACTION",
        },
      {
          t: 11,
          type: "product",
          text: "Final chocolate heart.",
          detail: "Reinforces aspirational outcome. Makes complex process appear simple, achievable.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 12,
          type: "engagement",
          text: "Creators' positive expressions.",
          detail: "Positive reinforcement, parasocial connection. Encourages liking/sharing via shared positive emotion, perceived authenticity.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.85,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "F 25–45 · Baking · DIY · Lifestyle · Food Consumers",
      creatorType: "Male 30–40 · Professional · Skilled",
      productCategory: "Confectionery · Baking Tools · Chocolate Art",
      emotionalTone: "Curiosity → Satisfaction → Aspiration",
      contentFormat: "Process demo · 15s · No speech · Music",
      density: 1,
      strengths: [
        "Visual spectacle, satisfying process hooks viewers.",
        "Clear, aspirational outcome triggers envy, desire for similar results.",
        "Creators' perceived professionalism, skill build trust.",
        "Unexpected techniques maintain curiosity, prevent scroll.",
      ],
      weaknesses: [ "No direct call to action or product ID.", "Relies on visual appeal; misses verbal engagement." ],
      verdict: "This content commodifies desire for mastery and aesthetic perfection in baking. It sells the fantasy of effortless professional results, triggering envy and aspiration for similar skills or tools. The content uses satisfying visuals and perceived expertise to create aspirational pull.",
    },
  },
  {
    id: "clavicular",
    src: "/clavicular.mp4",
    label: "Aspirational Lifestyle: Restaurant Vibe",
    observations: [
      {
          t: 0,
          type: "hook",
          text: "Attractive men, trending audio hook.",
          detail: "Visually appealing men, recognizable trending audio. Triggers instant scroll-stop via novelty, parasocial interest.",
          tag: "HOOK",
        },
      {
          t: 0,
          type: "context",
          text: "Vibrant restaurant/bar setting.",
          detail: "Establishes desirable, aspirational lifestyle context. Triggers envy, desire for similar experiences (FOMO).",
          tag: "CONTEXT",
        },
      {
          t: 0.5,
          type: "action",
          text: "Man puts on blue mirrored sunglasses.",
          detail: "Slow, deliberate action enhances perceived 'coolness', mystery. Uses 'cool guy' archetype for aspirational ID.",
          tag: "ACTION",
        },
      {
          t: 1,
          type: "technique",
          text: "Direct, intense gaze at camera.",
          detail: "Creates direct address, intimacy. Builds parasocial connection, makes viewer feel acknowledged, increases watch time.",
          tag: "TECHNIQUE",
        },
      {
          t: 1.5,
          type: "product",
          text: "Luxury watch, Moncler polo visible.",
          detail: "Product placement disguised as organic wealth/status display. Triggers envy, aspirational desire for luxury goods, implies success.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 2,
          type: "product",
          text: "Refreshing drinks with lime.",
          detail: "Attractive beverages create desire for consumption. Associates with fun, social atmosphere; subtly promotes venue/drink.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 2.5,
          type: "action",
          text: "Man claps, maintains eye contact.",
          detail: "Subtle, confident gesture reinforces 'cool' persona. Maintains attention via slight, unexpected movement, preventing disengagement.",
          tag: "ACTION",
        },
      {
          t: 3,
          type: "emotion",
          text: "Confident, aloof demeanor.",
          detail: "Projects self-assuredness, desirability. Triggers aspirational ID, desire to emulate perceived social status.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 4,
          type: "technique",
          text: "Sustained trending audio.",
          detail: "Uses familiarity, cultural relevance to maintain engagement. Creates dopamine loop via recognition, trend association.",
          tag: "TECHNIQUE",
        },
      {
          t: 5,
          type: "insight",
          text: "Curated 'effortless luxury' aesthetic.",
          detail: "Manufactured authenticity triggers envy, aspirational consumption. Positions creators as lifestyle influencers whose choices merit emulation.",
          tag: "TECHNIQUE",
        },
      {
          t: 6,
          type: "engagement",
          text: "Reinforced parasocial connection.",
          detail: "Sustained direct gaze, confident posture solidify parasocial bond. Encourages repeat views, follower conversion by making viewers feel 'seen', part of exclusive world.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.85,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "F 18–34 · Lifestyle · Aspiration · Social Status",
      creatorType: "Male 20–30 · 'Cool Guy' Aesthetic · Lifestyle Influencer",
      productCategory: "Lifestyle · Aspirational Social Experience / Luxury Goods",
      emotionalTone: "Curiosity → Aspiration → Envy → Desire",
      contentFormat: "Lifestyle vignette · 10s · Trending audio · No speech",
      density: 1.1,
      strengths: [
        "Strong creator visual appeal.",
        "Effective trending audio for instant recognition.",
        "Curated aspirational lifestyle context.",
        "Direct gaze builds parasocial intimacy.",
      ],
      weaknesses: [ "No explicit call to action.", "Missed direct product integration/tagging." ],
      verdict: "This content commodifies aspirational lifestyle and social status. It sells the fantasy of effortless cool and success, using parasocial intimacy to drive engagement and implicit desire for associated luxury goods and experiences.",
    },
  },
  {
    id: "dance",
    src: "/dance.mp4",
    label: "Dance Trend: Casual Bedroom",
    observations: [
      {
          t: 0,
          type: "HOOK",
          text: "Direct gaze, smile, head tilt.",
          detail: "Triggers parasocial intimacy, curiosity. Direct eye contact creates immediate personal connection, makes viewer feel acknowledged, increases watch time.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "CONTEXT",
          text: "Casual bedroom setting, natural light.",
          detail: "Establishes manufactured authenticity. 'At home' vibe reduces perceived production value, makes content relatable, less overt ad. Builds trust.",
          tag: "CONTEXT",
        },
      {
          t: 1,
          type: "TECHNIQUE",
          text: "Dynamic hair flip, body rotation.",
          detail: "Creates dopamine loop via visual dynamism. Rapid, fluid movement stimulates visually, prevents scroll, maintains attention with continuous novelty.",
          tag: "TECHNIQUE",
        },
      {
          t: 2,
          type: "EMOTION_SHIFT",
          text: "Playful wink, confident smirk.",
          detail: "Cultivates aspirational envy. Creator's self-assured, carefree expression projects idealized state, prompts desire for similar confidence/lifestyle.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 3,
          type: "ACTION",
          text: "Energetic arm movements, swaying.",
          detail: "Reinforces trend participation, FOMO. Popular dance trend positions creator as current, desirable. Subtly pressures viewers to engage with similar content.",
          tag: "ACTION",
        },
      {
          t: 4,
          type: "PRODUCT_DETECT",
          text: "Belly button piercing, necklace visible.",
          detail: "Product placement disguised as organic self-expression. Accessories presented as natural style, subtly influence viewers to consider similar purchases.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 5,
          type: "TECHNIQUE",
          text: "Smooth dance move transitions.",
          detail: "Enhances perceived effortlessness, aspirational appeal. Seamless movement makes dance appear easy, natural. Reinforces effortless cool lifestyle.",
          tag: "TECHNIQUE",
        },
      {
          t: 6,
          type: "EMOTION_SHIFT",
          text: "Bright smile, direct eye contact.",
          detail: "Deepens parasocial bond, emotional resonance. Consistent positive affect, direct gaze build friendship/trust. Makes creator recommendations/lifestyle more influential.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 7,
          type: "ACTION",
          text: "Clapping hands, music synchronized.",
          detail: "Increases engagement via rhythmic entrainment. Synchronized clapping encourages unconscious tapping, creates participation, makes content memorable.",
          tag: "ACTION",
        },
      {
          t: 8,
          type: "INSIGHT",
          text: "Body confidence, athletic build.",
          detail: "Triggers aspirational body image, self-improvement desire. Creator's fit physique, confident presentation subtly promotes desire for similar physical attributes, potentially leads to fitness/lifestyle product interest.",
          tag: "INSIGHT",
        },
      {
          t: 9,
          type: "CREATOR_ID",
          text: "Consistent red hair, distinct style.",
          detail: "Builds creator brand recognition, loyalty. Unique visual identifiers establish memorable personal brand, encourage repeat viewership, build dedicated audience.",
          tag: "CREATOR_ID",
        },
      {
          t: 10,
          type: "ENGAGEMENT",
          text: "Manipulation playbook: Aspirational lifestyle, parasocial intimacy, trend participation, subtle product influence.",
          detail: "Video uses creator appeal, trend relevance to sell idealized identity of youthful confidence, effortless style. Drives engagement via emotional connection, subtle emulation triggers.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.8,
      ctrTier: "HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "F 16–28 · Lifestyle · Dance · Body Positivity",
      creatorType: "Female 18–25 · Energetic · Approachable",
      productCategory: "Athleisure · Lifestyle · Personal Accessories",
      emotionalTone: "Playfulness → Aspiration → Connection",
      contentFormat: "Dance trend · 10s · Music overlay · No speech",
      density: 1.2,
      strengths: [
        "Strong creator appeal, parasocial intimacy.",
        "Effective trending audio and dance use.",
        "Aspirational lifestyle, body confidence triggers.",
        "Subtle accessory product placement.",
      ],
      weaknesses: [
        "No explicit call to action or product focus.",
        "Relies heavily on creator's existing audience.",
        "Limited narrative or educational value.",
      ],
      verdict: "This content commodifies aspirational youth and effortless confidence. It sells an idealized identity of carefree, trendy living via parasocial intimacy and subtle emulation, not a specific product. Primary goal: audience engagement, creator brand building.",
    },
  },
  {
    id: "elonrogan",
    src: "/elonrogan.mp4",
    label: "Elon Musk on Running Companies",
    observations: [
      {
          t: 0,
          type: "action",
          text: "Direct question hook.",
          detail: "Question 'WHAT KEEPS YOU UP AT NIGHT?' triggers curiosity, self-reflection. Creates instant personal connection, stops scroll.",
          tag: "HOOK",
        },
      {
          t: 0,
          type: "context",
          text: "Elon Musk's presence.",
          detail: "Immediate recognition of Elon Musk uses celebrity authority, parasocial intimacy. Compels viewers to listen to insights.",
          tag: "CONTEXT",
        },
      {
          t: 0.5,
          type: "creator_id",
          text: "Joe Rogan's voice.",
          detail: "Joe Rogan's distinct voice, presence establish familiar, trusted interview setting. Increases perceived conversation authenticity.",
          tag: "CREATOR_ID",
        },
      {
          t: 2,
          type: "emotion",
          text: "Elon's pensive, vulnerable expression.",
          detail: "Musk's thoughtful pause, expression humanize billionaire. Builds empathy, relatability by showing genuine struggle.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 2.5,
          type: "insight",
          text: "Difficulty of running companies acknowledged.",
          detail: "Musk's statement 'WELL IT'S QUITE HARD TO RUN COMPANIES' validates aspiring entrepreneurs' struggles. Creates shared experience, aspiration.",
          tag: "INSIGHT",
        },
      {
          t: 4,
          type: "technique",
          text: "Text overlay: 'RUN COMPANIES'.",
          detail: "Visual reinforcement of key phrase aids sound-off comprehension. Provides dopamine loop via visual confirmation of spoken words.",
          tag: "TECHNIQUE",
        },
      {
          t: 5.5,
          type: "insight",
          text: "Specificity: 'ESPECIALLY CAR COMPANIES'.",
          detail: "Specificity about 'car companies' implies unique, heightened challenge. Triggers curiosity about reasons, increases perceived expertise.",
          tag: "INSIGHT",
        },
      {
          t: 7,
          type: "technique",
          text: "Text overlay: 'CAR COMPANIES'.",
          detail: "Visual emphasis on specific challenge reinforces message, improves retention for scanning viewers.",
          tag: "TECHNIQUE",
        },
      {
          t: 8,
          type: "creator_id",
          text: "Joe Rogan validates difficulty.",
          detail: "Joe Rogan's affirmation 'THE CAR BUSINESS IS THE HARDEST ONE' provides expert validation. Confirms challenge severity, builds credibility for Musk's statement.",
          tag: "CREATOR_ID",
        },
      {
          t: 9,
          type: "technique",
          text: "Text overlay: 'THE HARDEST ONE'.",
          detail: "Final text overlay provides conclusive visual punch. Reinforces core message, creates shared understanding, closure.",
          tag: "TECHNIQUE",
        },
      {
          t: 11,
          type: "engagement",
          text: "Celebrity struggle fuels aspiration.",
          detail: "Video uses celebrity authority, relatable struggle to create shared vulnerability, aspiration. Positions entrepreneurship challenges as badge of honor, path to success.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.85,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels / YouTube Shorts",
      targetDemo: "M 25–55 · Entrepreneurship · Business · Self-improvement",
      creatorType: "Male 50s · Podcast Host (Joe Rogan) / Male 50s · Tech CEO (Elon Musk)",
      productCategory: "Business / Entrepreneurship Insights",
      emotionalTone: "Curiosity → Validation → Aspiration",
      contentFormat: "Interview clip · 11s · Text overlay · Speech",
      density: 1,
      strengths: [
        "Uses celebrity authority for instant credibility.",
        "Direct, relatable question triggers curiosity.",
        "Validates common struggles, builds empathy and connection.",
        "Concise delivery with visual text reinforcement.",
      ],
      weaknesses: [
        "No explicit call to action or content promotion.",
        "Slightly longer, more detailed insight could deepen engagement.",
      ],
      verdict: "This content commodifies high-achiever struggle. It offers a glimpse into their challenges, creating shared experience and aspiration. It sells the idea that success involves difficulty, making achievements more attainable or struggles more relatable. Builds parasocial connection, validates viewer's entrepreneurial journey.",
    },
  },
  {
    id: "brainrot",
    src: "/brainrot.mp4",
    label: "AI Characters Singing: Surreal Performance",
    observations: [
      {
          t: 0,
          type: "hook",
          text: "Unusual character design stops scroll.",
          detail: "Immediate visual of wooden man, coffee cup woman triggers novelty bias. Forces brain to process unexpected image, prevents swipe-away.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "context",
          text: "Characters hold microphones, imply performance.",
          detail: "Familiar musical performance context, despite surreal characters, creates narrative expectation. Encourages viewer to stay, understand 'story' or purpose.",
          tag: "CONTEXT",
        },
      {
          t: 1.5,
          type: "technique",
          text: "High-quality 3D animation.",
          detail: "Polished, detailed CGI activates aesthetic pleasure, implies high production value. Brain associates with premium content, increases perceived value, watch time.",
          tag: "TECHNIQUE",
        },
      {
          t: 2.5,
          type: "emotion",
          text: "Smiling, positive character expressions.",
          detail: "Characters' joyful expressions trigger mirror neurons, induce positive emotional state in viewer. Creates subconscious association of happiness with content.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 3.5,
          type: "technique",
          text: "Upbeat, catchy background music.",
          detail: "Pleasant, melodic tune creates auditory dopamine loop. Enhances positive mood from visuals, makes content enjoyable, memorable.",
          tag: "TECHNIQUE",
        },
      {
          t: 4.5,
          type: "insight",
          text: "Surreal combination of elements.",
          detail: "Juxtaposition of wooden man, coffee cup woman, piano-playing shark exploits cognitive dissonance. Creates 'what just happened?' moment, compels re-watching/sharing for social validation.",
          tag: "INSIGHT",
        },
      {
          t: 6,
          type: "action",
          text: "Characters sing in unison.",
          detail: "Synchronized performance creates harmony, collaboration. Inherently appealing, reinforces positive/entertaining vibe, builds shared experience.",
          tag: "ACTION",
        },
      {
          t: 7,
          type: "context",
          text: "Shark plays piano in background.",
          detail: "Unexpected shark pianist amplifies absurdity, novelty. Serves as secondary hook, rewards continued viewing, reinforces video's unique identity.",
          tag: "CONTEXT",
        },
      {
          t: 8.5,
          type: "technique",
          text: "Warm, focused stage lighting.",
          detail: "Professional lighting directs attention to performers. Creates intimate, theatrical atmosphere, enhances immersion, makes surreal scene feel 'real', engaging.",
          tag: "TECHNIQUE",
        },
      {
          t: 9.5,
          type: "engagement",
          text: "AI-generated novelty for shareability.",
          detail: "Video uses AI-generated surrealism to create shareable content. Bizarre yet aesthetically pleasing characters, scenario trigger curiosity, social sharing. Drives viral reach via manufactured authenticity.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.85,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "M/F 16-35 · AI Art Enthusiasts · Meme Culture · Pop Culture",
      creatorType: "AI Artist · Trend Follower · Viral Content Creator",
      productCategory: "Digital Art · AI Generated Content",
      emotionalTone: "Curiosity → Amusement → Delight",
      contentFormat: "Short-form animation · 10s · Music overlay · No speech",
      density: 1,
      strengths: [
        "Novelty bias exploitation via unique character design.",
        "High production quality enhances perceived value.",
        "Surreal elements create strong shareability.",
        "Positive emotional tone builds viewer goodwill.",
      ],
      weaknesses: [
        "No clear call to action or brand integration.",
        "Relies on novelty; potential for quick fatigue.",
        "No direct product or service promoted.",
      ],
      verdict: "This content masters AI-driven novelty for engagement. It commodifies curiosity and amusement, using bizarre character design and high-quality animation to create a dopamine loop that encourages sharing. The 'product' is viral potential and creator's ability to generate attention via manufactured authenticity.",
    },
  },
  {
    id: "foodgame",
    src: "/foodgame.mp4",
    label: "Blindfolded Strawberry Challenge",
    observations: [
      {
          t: 0,
          type: "hook",
          text: "Blindfolded men, forks, strawberry.",
          detail: "Sets up 'blind taste test' or 'challenge' immediately. Triggers curiosity, 'what happens next?' dopamine loop.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "action",
          text: "Left creator taps fork on plate.",
          detail: "Creates auditory anticipation, playful struggle. Invites viewer empathy.",
          tag: "ACTION",
        },
      {
          t: 1,
          type: "emotion",
          text: "Both creators smile.",
          detail: "Establishes positive, non-threatening tone. Builds parasocial intimacy, makes content feel safe, enjoyable.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 2,
          type: "technique",
          text: "ASMR-like fork tapping sounds.",
          detail: "Uses sensory triggers for calming/satisfying effect. Increases watch time via auditory engagement.",
          tag: "TECHNIQUE",
        },
      {
          t: 3,
          type: "context",
          text: "Surgical masks as blindfolds.",
          detail: "Adds manufactured authenticity, relatability. Uses common items for playful setup.",
          tag: "CONTEXT",
        },
      {
          t: 4,
          type: "creator_id",
          text: "Left creator's manicured nails, ring.",
          detail: "Establishes distinct aesthetic, identity. Appeals to viewers valuing specific fashion or self-expression.",
          tag: "CREATOR_ID",
        },
      {
          t: 5,
          type: "action",
          text: "Left creator opens mouth, anticipates food.",
          detail: "Exaggerated reaction creates humor, relatability. Invites viewers to share anticipation.",
          tag: "ACTION",
        },
      {
          t: 6,
          type: "emotion_shift",
          text: "Left creator makes 'shocked' face.",
          detail: "Amplifies comedic effect, triggers amusement. Reinforces lighthearted challenge nature.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 7,
          type: "technique",
          text: "Exaggerated facial expressions.",
          detail: "Performance-driven content designed to elicit strong emotional responses (laughter, surprise). Boosts shareability.",
          tag: "TECHNIQUE",
        },
      {
          t: 8,
          type: "context",
          text: "Single strawberry on white plate.",
          detail: "Simplicity focuses attention on challenge. Easy to understand, follow; reduces cognitive load.",
          tag: "CONTEXT",
        },
      {
          t: 9,
          type: "action",
          text: "Right creator maintains joyful expression.",
          detail: "Reinforces positive vibe, duo dynamic. Builds camaraderie between creators and viewers.",
          tag: "ACTION",
        },
      {
          t: 10,
          type: "engagement",
          text: "Challenge format for comments/shares.",
          detail: "Content is engagement bait. Designed to elicit reactions, predictions, shares. Extends reach via social proof.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.8,
      ctrTier: "HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "Gen Z / Young Millennials · Lifestyle · Entertainment · Challenge content",
      creatorType: "Male 20-30 · Duo · Playful · Aesthetic",
      productCategory: "N/A",
      emotionalTone: "Curiosity → Amusement → Lightheartedness",
      contentFormat: "Challenge · 10s · No speech",
      density: 1.1,
      strengths: [
        "Blindfolded challenge novelty captures attention.",
        "Humor, exaggerated reactions create strong emotional engagement.",
        "Parasocial intimacy built by creators' positive dynamic.",
        "Low barrier to understanding/mental participation in challenge.",
      ],
      weaknesses: [
        "No explicit call to action or viewer next step.",
        "Short duration limits deeper narrative or emotional investment.",
        "No specific product/brand integration misses monetization opportunity.",
      ],
      verdict: "This content sells entertainment and parasocial intimacy. It commodifies shared amusement, creator personalities, using a simple challenge format to drive views, engagement. Primary goal: cultivate loyal audience via relatable, lighthearted content.",
    },
  },
  {
    id: "grandma",
    src: "/grandma.mp4",
    label: "Luxury Fashion: Pink Private Jet",
    observations: [
      {
          t: 0,
          type: "HOOK",
          text: "Pink private jet, matching outfit.",
          detail: "Incongruity bias: Lavish pink private jet, older woman in full pink fur stops scroll. Visual shock, aspirational fantasy bait.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "CONTEXT",
          text: "Luxury setting: private jet on tarmac.",
          detail: "Aspirational trigger: Private jet establishes extreme wealth, exclusivity. Activates envy, desire for similar lifestyle.",
          tag: "CONTEXT",
        },
      {
          t: 1,
          type: "PRODUCT",
          text: "Chanel quilted flap bag.",
          detail: "Product placement disguised as organic. Iconic luxury bag displayed prominently. Uses brand recognition, status signaling.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 2,
          type: "CREATOR_ID",
          text: "Older woman's confident, playful dance.",
          detail: "Parasocial intimacy: Creator's uninhibited, joyful movement builds connection, admiration. Makes persona relatable, aspirational.",
          tag: "CREATOR_ID",
        },
      {
          t: 3,
          type: "TECHNIQUE",
          text: "Text 'Granny Spills' on jet.",
          detail: "Brand building: Unique, memorable name on jet creates distinct personal brand. Triggers curiosity, encourages search behavior.",
          tag: "TECHNIQUE",
        },
      {
          t: 4,
          type: "EMOTION",
          text: "Exaggerated luxury aesthetic.",
          detail: "Dopamine loop: Overwhelming pink, fur, luxury items create visually stimulating, fantasy-like experience. Releases dopamine, encourages re-watches.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 5,
          type: "PRODUCT",
          text: "Pink leather gloves, gold bracelets.",
          detail: "Detail-oriented product placement: Specific accessories highlighted. Allows viewers to identify, seek similar luxury items, fuels consumer desire.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 6,
          type: "ACTION",
          text: "Repetitive, simple dance moves.",
          detail: "Engagement bait: Easy-to-follow, rhythmic movements designed for shareability, mimicry. Increases UGC likelihood, platform virality.",
          tag: "ACTION",
        },
      {
          t: 7,
          type: "CONTEXT",
          text: "Snowy tarmac at night.",
          detail: "Contrast, exclusivity: Harsh, cold environment juxtaposed with warm, vibrant pink luxury. Amplifies unique privilege, aspirational escape.",
          tag: "CONTEXT",
        },
      {
          t: 8,
          type: "INSIGHT",
          text: "Consistent 'Granny Spills' branding.",
          detail: "Identity reinforcement: Repeated branding solidifies creator's unique persona. Makes content recognizable, builds loyal following.",
          tag: "CREATOR_ID",
        },
      {
          t: 9,
          type: "PRODUCT",
          text: "Full pink fur coat.",
          detail: "Aspirational product display: Luxurious fur coat is clear status symbol. Triggers desire, associates creator's wealth with product.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 10,
          type: "EMOTION",
          text: "Confident, self-assured demeanor.",
          detail: "Empowerment by proxy: Creator's confident posture, expression project self-made success, joy. Viewers vicariously experience, aspire to this.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 11.5,
          type: "ENGAGEMENT",
          text: "Aspirational luxury lifestyle bait.",
          detail: "Video uses novelty, aspirational fantasy, parasocial intimacy to create dopamine loop. Commodifies desire for wealth, unique self-expression.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.85,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "F 25–55 · Luxury Lifestyle · Fashion · Aspiration",
      creatorType: "Older Female · Eccentric · Wealthy Persona",
      productCategory: "Luxury Fashion · Multi-brand Accessories & Apparel",
      emotionalTone: "Curiosity → Envy → Aspiration",
      contentFormat: "Short-form dance · 12s · Text overlay · Music",
      density: 1.08,
      strengths: [
        "Extreme visual novelty, incongruity.",
        "Strong aspirational lifestyle fantasy.",
        "Clear, memorable personal brand ID.",
        "Effective luxury product placement.",
      ],
      weaknesses: [
        "Niche appeal limits broader demographic reach.",
        "No explicit call to action or product tagging.",
        "Relies heavily on existing product brand recognition.",
      ],
      verdict: "This content is aspirational lifestyle marketing. It commodifies desire for wealth, luxury, eccentric self-expression. It sells a fantasy of uninhibited opulence via a unique, memorable persona. Drives engagement by triggering envy, curiosity, not direct product sales.",
    },
  },
  {
    id: "haul",
    src: "/haul.mp4",
    label: "PR Haul Unboxing: Influencer Lifestyle",
    observations: [
      {
          t: 0,
          type: "HOOK",
          text: "Rapid box stacking creates visual chaos.",
          detail: "Quick, rhythmic stacking of numerous boxes triggers curiosity, dopamine loop. Creates strong pattern interrupt, immediate anticipation.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "TECHNIQUE",
          text: "Accelerated video speed, sound effects.",
          detail: "Fast-forwarding stacking with exaggerated thud sounds amplifies abundance, excitement. Rewards viewer with rapid visual progression.",
          tag: "TECHNIQUE",
        },
      {
          t: 2,
          type: "CONTEXT",
          text: "Text overlay: 'PR HAUL UNBOXING'.",
          detail: "Explicit label immediately establishes content's value proposition. Triggers FOMO, aspiration among viewers desiring exclusive influencer perks.",
          tag: "CONTEXT",
        },
      {
          t: 4,
          type: "CREATOR_ID",
          text: "Creator appears, casual in robe, wet hair.",
          detail: "Creator's relaxed, 'just woke up' appearance in plush robe builds parasocial intimacy, manufactured authenticity. Makes her seem relatable, aspirational.",
          tag: "CREATOR_ID",
        },
      {
          t: 5,
          type: "EMOTION_SHIFT",
          text: "Creator speaks directly, calm tone.",
          detail: "Direct address, conversational tone build trust, personal connection. Makes viewer feel part of exclusive reveal.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 6,
          type: "CONTEXT",
          text: "Explains absence: 'gone for two weeks'.",
          detail: "Justification for large haul implies busy, important lifestyle. Subtly triggers envy, reinforces creator's successful influencer status.",
          tag: "CONTEXT",
        },
      {
          t: 7,
          type: "ACTION",
          text: "Points to stacked boxes.",
          detail: "Direct gesture to boxes reinforces haul scale. Visually confirms abundance, amplifies unboxing anticipation.",
          tag: "ACTION",
        },
      {
          t: 8,
          type: "CONTEXT",
          text: "Declares 'self-care day' for unboxing.",
          detail: "Framing unboxing as 'self-care day' commodifies wellness. Positions receiving PR packages as luxurious, deserved reward. Fuels aspirational desires.",
          tag: "CONTEXT",
        },
      {
          t: 9,
          type: "ENGAGEMENT",
          text: "Implied unboxing continuation.",
          detail: "Video ends with unboxing promise. Creates cliffhanger, encourages viewers to follow, like, or seek next content for delayed gratification.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.75,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "F 18–34 · Beauty · Lifestyle · Aspiration · Influencer Culture Consumers",
      creatorType: "Female 20–28 · Casual · Approachable · Lifestyle Influencer",
      productCategory: "Multi-brand PR Haul · Beauty · Fashion · Lifestyle",
      emotionalTone: "Curiosity → Anticipation → Envy → Aspiration",
      contentFormat: "Short-form video · 10s · Text overlay · Creator speech",
      density: 0.947,
      strengths: [
        "Strong visual hook with rapid stacking.",
        "Establishes clear value proposition (PR haul).",
        "Builds parasocial intimacy with casual creator persona.",
        "Triggers aspiration, FOMO for exclusive products.",
      ],
      weaknesses: [
        "No actual products shown; relies on implied value.",
        "Short duration limits detailed product engagement.",
        "Assumes viewer familiarity with 'PR haul' concept.",
      ],
      verdict: "This content manipulates aspirational desires, disguised as 'self-care.' It commodifies perceived exclusivity and abundance of influencer life, selling an identity of effortless luxury and constant newness, not specific products. Primary goal: drive engagement, cultivate loyal following via envy and future reveals.",
    },
  },
  {
    id: "jonas",
    src: "/jonas.mp4",
    label: "Celebrity Couple Reveal: Formal Attire",
    observations: [
      {
          t: 0,
          type: "action",
          text: "Direct gaze, bow tie adjustment.",
          detail: "Creates immediate parasocial intimacy, curiosity. Close-up, direct eye contact trigger personal connection. Makes viewer feel addressed, increases watch time.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "context",
          text: "Nick Jonas in formal attire.",
          detail: "Establishes celebrity status, aspirational lifestyle. Formal wear suggests exclusive event, triggers FOMO, desire for insider access.",
          tag: "CREATOR_ID",
        },
      {
          t: 1,
          type: "technique",
          text: "Confident pose, playful finger point.",
          detail: "Uses non-verbal cues to project charisma, authority. Gesture creates playful interaction, builds positive emotional association with creator.",
          tag: "TECHNIQUE",
        },
      {
          t: 2,
          type: "emotion",
          text: "Head turn, subtle smirk.",
          detail: "Builds anticipation, intrigue. Slight shift in gaze, expression suggests hidden narrative or reveal. Uses curiosity to maintain attention.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 6,
          type: "action",
          text: "Priyanka Chopra's entrance.",
          detail: "Introduces second high-status celebrity, doubles star power. Uses 'power couple' dynamic. Triggers social comparison, aspirational envy.",
          tag: "ACTION",
        },
      {
          t: 7,
          type: "context",
          text: "Celebrity couple's intimate pose.",
          detail: "Reinforces aspirational relationship goals, manufactured authenticity. Intimate pose creates shared private moment. Builds parasocial intimacy, envy.",
          tag: "CONTEXT",
        },
      {
          t: 8,
          type: "emotion",
          text: "Shared gaze, subtle smiles.",
          detail: "Projects happiness, relationship success. Triggers desire for similar emotional states. Synchronized smiles create positive emotional contagion, makes viewer feel good by proxy.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 9,
          type: "engagement",
          text: "Final confident couple shot.",
          detail: "Leaves viewer with strong impression of aspirational lifestyle, celebrity glamour. Video's manipulation playbook: commodify celebrity intimacy, trigger envy for perceived perfect life.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.8,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "F 18–34 · Celebrity Culture · Lifestyle · Aspiration",
      creatorType: "Celebrity Couple · High Status · Aspirational",
      productCategory: "Lifestyle · Celebrity Endorsement · Aspirational Content",
      emotionalTone: "Curiosity → Intrigue → Envy → Aspiration",
      contentFormat: "Celebrity reveal · 9s · Music overlay · No speech",
      density: 0.88,
      strengths: [
        "Uses celebrity parasocial intimacy.",
        "Triggers aspirational envy.",
        "Creates strong emotional contagion.",
        "High production value implied by attire/setting.",
      ],
      weaknesses: [
        "No direct call to action or product integration.",
        "Relies on celebrity appeal; limited broader applicability.",
        "Short duration limits deeper narrative development.",
      ],
      verdict: "This content commodifies celebrity intimacy and aspirational lifestyle. It sells the fantasy of a perfect, glamorous life via parasocial connection, triggering envy and desire for similar status. Primary product is celebrity brand, reinforced by perceived relationship success.",
    },
  },
  {
    id: "minecraft",
    src: "/minecraft.mp4",
    label: "Minecraft Animals Compilation",
    observations: [
      {
          t: 0,
          type: "action",
          text: "Player feeds chickens, hearts appear.",
          detail: "Triggers immediate positive emotional response via familiar, wholesome gameplay loop. Uses nostalgia, 'cute animal' bias for instant scroll-stop. Creates comfort, familiarity.",
          tag: "HOOK",
        },
      {
          t: 1,
          type: "technique",
          text: "Quick cut to new scene.",
          detail: "Uses rapid editing for high pace. Prevents viewer boredom, sustains dopamine loop. Crucial for short-form content retention.",
          tag: "TECHNIQUE",
        },
      {
          t: 2,
          type: "product",
          text: "Chicken transforms into a duck.",
          detail: "Creates 'surprise and delight.' Visual gag or modded content generates curiosity, mild dopamine hit from unexpected novelty. Encourages continued viewing, hints at customization.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 3,
          type: "technique",
          text: "Seamless transition to new animal.",
          detail: "Smooth, quick transition maintains flow, prevents cognitive load. Keeps viewer immersed in positive visual stream.",
          tag: "TECHNIQUE",
        },
      {
          t: 4,
          type: "product",
          text: "Sheep with two baby sheep.",
          detail: "Reinforces 'cute animal' bias, evokes warmth and innocence. Emotional resonance builds parasocial intimacy with game world. Makes content comforting, shareable.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 5,
          type: "technique",
          text: "Focus on animal interaction.",
          detail: "Centering frame on animals, simple actions exploits human anthropomorphism. Builds emotional connection with digital creatures.",
          tag: "TECHNIQUE",
        },
      {
          t: 6,
          type: "product",
          text: "Mooshroom cow by water reflection.",
          detail: "Showcases unique, recognizable Minecraft mob in aesthetic setting. Water reflection adds visual interest, artistic flair. Appeals to viewers appreciating game aesthetics, novelty.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 7,
          type: "context",
          text: "Natural environment with large mushroom.",
          detail: "Highlights diverse, imaginative Minecraft biomes. Triggers exploration, wonder. Subtly promotes game's expansive world as source of endless discovery.",
          tag: "CONTEXT",
        },
      {
          t: 8,
          type: "emotion",
          text: "Cow in field at sunset.",
          detail: "Establishes serene, aspirational mood. Sunset lighting triggers positive emotional associations with peace, beauty. Enhances perceived value of game's environment as tranquil escape.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 9,
          type: "engagement",
          text: "Short, wholesome Minecraft animal compilation.",
          detail: "Video uses 'cute animal' bias, Minecraft nostalgia to create low-effort, high-dopamine content loop. Designed for passive consumption, positive emotional reinforcement. Drives watch time, shares via feel-good content.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.85,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels / YouTube Shorts",
      targetDemo: "M/F 8-35 · Minecraft Players · Casual Gamers · Animal Lovers · Nostalgia Seekers",
      creatorType: "Casual Gamer · Mod User · Aesthetic Enthusiast · Wholesome Content Creator",
      productCategory: "Video Game Content · Minecraft Mods/Texture Packs · Wholesome Entertainment · Digital Escapism",
      emotionalTone: "Nostalgia → Delight → Serenity → Comfort",
      contentFormat: "Gameplay compilation · 9s · Music overlay · No speech",
      density: 1.11,
      strengths: [
        "Uses strong nostalgia for Minecraft.",
        "Exploits 'cute animal' bias for instant emotional connection.",
        "Rapid cuts maintain dopamine loop, prevent boredom.",
        "Aesthetic visuals (sunset, reflections) enhance perceived quality, aspiration.",
      ],
      weaknesses: [
        "No clear call to action or product link.",
        "Lacks narrative depth or unique creator personality.",
        "Relies on visual appeal; limits long-term engagement beyond passive viewing.",
      ],
      verdict: "This content commodifies nostalgia, universal cuteness appeal within a gaming context. It's a low-effort, high-return strategy for generating passive watch time and positive sentiment. Effectively sells idyllic digital escape, game customization potential.",
    },
  },
  {
    id: "prank",
    src: "/prank.mp4",
    label: "Relationship Skit: Baddie GF",
    observations: [
      {
          t: 0,
          type: "hook",
          text: "Text overlay sets up relatable scenario.",
          detail: "Text 'when i get mad at my gf but she's a baddie' creates immediate relatability, curiosity. Triggers social comparison, 'what happens next' dopamine loop.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "action",
          text: "Man's exaggerated 'mad' reaction.",
          detail: "Over-the-top acting creates humor, manufactured authenticity. Makes scenario feel relatable, comedic. Engagement bait.",
          tag: "ACTION",
        },
      {
          t: 1.5,
          type: "product",
          text: "Backpack prominently displayed.",
          detail: "Black backpack clearly visible as man grabs it. Suggests lifestyle or brand affiliation. Product placement disguised as organic action, uses aspirational identity.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 2.5,
          type: "action",
          text: "Man storms off dramatically.",
          detail: "Dramatic exit builds tension, activates viewer's 'story completion' bias. Setup for inevitable reversal, keeps viewer watching.",
          tag: "ACTION",
        },
      {
          t: 3.5,
          type: "context",
          text: "Girlfriend's 'baddie' reveal.",
          detail: "Girlfriend's appearance confirms 'baddie' claim. Uses sex appeal, aspirational beauty standards. Triggers envy, social comparison.",
          tag: "CONTEXT",
        },
      {
          t: 4,
          type: "emotion",
          text: "Girlfriend's soft, pleading tone.",
          detail: "Her 'Please stay' creates power dynamic shift, contrasts with man's anger. Manipulates viewer empathy, reinforces 'baddie's' irresistible influence.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 5,
          type: "action",
          text: "Man immediately returns, drops bag.",
          detail: "Quick reversal provides immediate gratification, fulfills viewer's expectation of 'baddie's' power. Dopamine loop, rewards continued viewing.",
          tag: "ACTION",
        },
      {
          t: 6,
          type: "emotion",
          text: "Man's capitulation and smile.",
          detail: "Immediate change of mind, smile confirm 'baddie' narrative. Reinforces fantasy of irresistible charm. Wish fulfillment, parasocial intimacy.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 7,
          type: "engagement",
          text: "Manufactured scenario for emotional response.",
          detail: "Entire sequence designed to elicit amusement, relatability, aspirational fantasy. Drives shares, comments via clear, quick payoff and manufactured authenticity.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.9,
      holdRate: 0.85,
      ctrTier: "HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "M/F 18–30 · Relationship humor · Lifestyle · Aspirational beauty",
      creatorType: "Male 20-25 · Humorous · Relatable. Female 20-25 · Aspirational · 'Baddie'",
      productCategory: "Lifestyle · Relationship content · Soft product placement (backpack)",
      emotionalTone: "Frustration → Amusement → Satisfaction",
      contentFormat: "Skit · 7s · Text overlay · Dialogue",
      density: 1.28,
      strengths: [
        "Relatable humor via common relationship dynamics.",
        "Clear, concise narrative with quick payoff.",
        "Aspirational elements ('baddie' girlfriend).",
        "Manufactured authenticity drives engagement.",
      ],
      weaknesses: [
        "Limited direct product integration beyond visual placement.",
        "Short duration limits deeper emotional investment.",
      ],
      verdict: "This content commodifies relationship dynamics, aspirational beauty standards. It sells a fantasy of irresistible charm and its humor. Drives engagement via manufactured authenticity, wish fulfillment. Underlying message reinforces physical attractiveness power in interpersonal dynamics.",
    },
  },
  {
    id: "redbull",
    src: "/redbull.mp4",
    label: "POV Skateboard Mega Ramp Drop: Red Bull",
    observations: [
      {
          t: 0,
          type: "hook",
          text: "Extreme POV from massive ramp top.",
          detail: "Immediate novelty, danger trigger. Forces scroll stop via visual shock, height vertigo.",
          tag: "HOOK",
        },
      {
          t: 0.5,
          type: "context",
          text: "Skater's feet, board on steep drop-in.",
          detail: "Establishes extreme sport context. Sets expectations for high-stakes action, physical prowess.",
          tag: "CONTEXT",
        },
      {
          t: 1,
          type: "product",
          text: "Red Bull logo on ramp.",
          detail: "Direct product placement disguised as organic environment. Associates brand with peak performance, extreme events.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 2,
          type: "action",
          text: "Skater adjusts board, prepares to drop.",
          detail: "Builds anticipation via 'calm before storm' narrative. Creates dopamine loop as viewer expects payoff.",
          tag: "ACTION",
        },
      {
          t: 3,
          type: "emotion",
          text: "Crowd noise audible, tension increases.",
          detail: "Social proof, FOMO bait. Implies significant event, shared excitement. Makes viewer want to experience it.",
          tag: "EMOTION_SHIFT",
        },
      {
          t: 4,
          type: "technique",
          text: "Fisheye lens distorts perspective, exaggerates height.",
          detail: "Amplifies perceived danger, scale. Enhances thrill, makes feat seem impressive. Triggers awe.",
          tag: "TECHNIQUE",
        },
      {
          t: 5,
          type: "insight",
          text: "Ramp scale implies high-stakes event.",
          detail: "Aspirational content. Positions brand, athlete within exclusive, high-achievement domain. Triggers envy, desire for similar experiences.",
          tag: "CONTEXT",
        },
      {
          t: 6,
          type: "creator_id",
          text: "POV shot creates parasocial intimacy.",
          detail: "Viewer feels like the athlete, experiences adrenaline firsthand. Builds deeper, personal connection to brand's identity.",
          tag: "CREATOR_ID",
        },
      {
          t: 7,
          type: "product",
          text: "Red Bull branding on helmet.",
          detail: "Reinforces brand omnipresence, identity. Subtly embeds product into athlete's persona, equipment.",
          tag: "PRODUCT_DETECT",
        },
      {
          t: 8,
          type: "action",
          text: "Skater leans forward, ready to commit.",
          detail: "Peak anticipation, commitment trigger. Creates cliffhanger, exploits Zeigarnik effect, leaves viewer wanting resolution.",
          tag: "ACTION",
        },
      {
          t: 9,
          type: "engagement",
          text: "Video ends before drop, cliffhanger.",
          detail: "Dopamine loop, engagement bait. Forces viewers to rewatch, comment, or search for full video. Drives further interaction, brand recall.",
          tag: "ENGAGEMENT",
        },
    ],
    summary: {
      hookRate: 0.95,
      holdRate: 0.9,
      ctrTier: "VERY_HIGH",
      bestPlatform: "TikTok / IG Reels",
      targetDemo: "M 16–35 · Extreme Sports · Adrenaline Seekers · Brand Loyalists (Red Bull)",
      creatorType: "Male 20–30 · Extreme Athlete · High-Risk Performer",
      productCategory: "Energy Drink · Brand Lifestyle Association",
      emotionalTone: "Curiosity → Anticipation → Frustration (cliffhanger) → Desire (more content)",
      contentFormat: "POV Extreme Sport · 9s · No speech · Crowd audio",
      density: 1.22,
      strengths: [
        "Extreme POV creates immediate visual shock, immersion.",
        "Strong, consistent brand association with high-stakes action.",
        "Cliffhanger ending exploits Zeigarnik effect for engagement.",
        "Aspirational content triggers envy, desire for similar experiences.",
      ],
      weaknesses: [
        "No direct product call to action or benefit articulation.",
        "Relies heavily on existing brand recognition, audience interest.",
      ],
      verdict: "This content is a pure brand play. It commodifies adrenaline and aspirational identity. It sells the Red Bull lifestyle, not just the drink, by associating it with extreme, high-stakes experiences. Uses a cliffhanger to drive engagement and search. Manipulation creates desire for 'Red Bull experience,' not the product.",
    },
  },
];

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const PAUSE_BETWEEN_VIDEOS_MS = 10000;

const TAG_COLORS: Record<string, string> = {
  HOOK: "#FFB800",
  CONTEXT: "#8B8BFF",
  CREATOR_ID: "#FF6B9D",
  TECHNIQUE: "#00D4AA",
  PRODUCT_DETECT: "#FF6B2C",
  ACTION: "#7CB3FF",
  EMOTION_SHIFT: "#E879F9",
  ENGAGEMENT: "#FFB800",
};

/* ═══════════════════════════════════════════
   HOOK: Video sync with multi-video support
   ═══════════════════════════════════════════ */

function useVideoPlayback(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(0);
  const hasEndedRef = useRef(false);

  const activeVideo = VIDEOS[activeIdx];
  const totalVideos = VIDEOS.length;
  const isLastVideo = activeIdx === totalVideos - 1;

  // Mount flag
  useEffect(() => { setMounted(true); }, []);

  // Attach video event listeners for time sync (replaces RAF)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => {
      if (video.duration && isFinite(video.duration)) setDuration(video.duration);
    };
    const onLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) setDuration(video.duration);
    };
    const onEnded = () => {
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;

      if (isLastVideo) {
        setIsPaused(true);
        return;
      }

      setIsPaused(true);
      setPauseCountdown(PAUSE_BETWEEN_VIDEOS_MS);

      const interval = setInterval(() => {
        setPauseCountdown((prev) => {
          const next = prev - 100;
          if (next <= 0) {
            clearInterval(interval);
            setIsPaused(false);
            setActiveIdx((i) => Math.min(i + 1, totalVideos - 1));
            return 0;
          }
          return next;
        });
      }, 100);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);

    // Also run a slower interval as fallback for smoother progress
    const fallback = setInterval(() => {
      if (video && !video.paused) {
        setCurrentTime(video.currentTime);
      }
    }, 50);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
      clearInterval(fallback);
    };
  }, [videoRef, isLastVideo, totalVideos, mounted]);

  // When activeIdx changes, load new video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mounted) return;
    hasEndedRef.current = false;
    video.src = VIDEOS[activeIdx].src;
    video.load();
    video.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  // Initial autoplay
  useEffect(() => {
    if (!mounted) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const goToVideo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalVideos || idx === activeIdx) return;
      setIsPaused(false);
      setPauseCountdown(0);
      setActiveIdx(idx);
    },
    [activeIdx, totalVideos],
  );

  return {
    currentTime,
    duration,
    mounted,
    activeIdx,
    activeVideo,
    totalVideos,
    isPaused,
    pauseCountdown,
    goToVideo,
    videoEnded: isPaused && pauseCountdown === 0,
  };
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

function ObservationRow({ obs, isNew, onSeek }: { obs: Observation; isNew: boolean; onSeek?: (t: number) => void }) {
  const tagColor = TAG_COLORS[obs.tag] || "#888";

  return (
    <motion.div
      className="relative flex gap-3 py-2.5 group cursor-pointer border-b border-white/[0.08]"
      onClick={() => onSeek?.(obs.t)}
      initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      layout
    >
      {/* Timestamp */}
      <div className="w-[42px] flex-shrink-0 pt-0.5">
        <span className="text-[10px] font-mono tabular-nums text-white/20">
          {obs.t.toFixed(1)}s
        </span>
      </div>

      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0 w-[14px] pt-1">
        <motion.div
          className="w-[5px] h-[5px] rounded-full"
          style={{ background: tagColor }}
          initial={{ scale: 2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="flex-1 w-px bg-white/[0.08] mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-0.5">
          <span
            className="text-[7px] font-semibold tracking-[0.12em] uppercase px-1.5 py-[1px] rounded shrink-0"
            style={{
              color: tagColor,
              background: `${tagColor}10`,
              border: `1px solid ${tagColor}18`,
            }}
          >
            {obs.tag.replace(/_/g, " ")}
          </span>
        </div>
        <div className="text-[18px] text-white/80 font-medium leading-snug mt-1" style={{ fontFamily: '"PPMondwest", sans-serif' }}>
          {obs.text}
        </div>
        <div className="text-[11px] text-white/60 font-mono leading-relaxed mt-0.5">
          {obs.detail}
        </div>
      </div>

      {/* New indicator flash */}
      {isNew && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `${tagColor}06`,
            border: `1px solid ${tagColor}10`,
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}

function TimelineBar({
  currentTime,
  duration,
  observations,
  videoRef,
}: {
  currentTime: number;
  duration: number;
  observations: Observation[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const pct = Math.min(100, (currentTime / duration) * 100);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoveredObs, setHoveredObs] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const seekToX = useCallback(
    (clientX: number) => {
      if (!trackRef.current || !videoRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      videoRef.current.currentTime = ratio * duration;
    },
    [duration, videoRef],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      seekToX(e.clientX);
    },
    [seekToX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) seekToX(e.clientX);
    },
    [isDragging, seekToX],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={trackRef}
      className="relative h-[48px] w-full cursor-pointer select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Track */}
      <div className="absolute top-[22px] left-0 right-0 h-[2px] bg-white/[0.08] rounded-full" />

      {/* Progress */}
      <div
        className="absolute top-[22px] left-0 h-[2px] bg-white/40 rounded-full"
        style={{
          width: `${pct}%`,
          transition: isDragging ? "none" : "width 0.1s",
        }}
      />

      {/* Observation markers */}
      {observations.map((obs, i) => {
        const x = (obs.t / duration) * 100;
        const active = currentTime >= obs.t;
        const tagColor = TAG_COLORS[obs.tag] || "#888";
        const isHovered = hoveredObs === i;
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2"
            style={{ left: `${x}%`, top: 0, width: 14, height: 48 }}
            onMouseEnter={() => setHoveredObs(i)}
            onMouseLeave={() => setHoveredObs(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) videoRef.current.currentTime = obs.t;
            }}
          >
            {/* Visible marker pip */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-[1px] transition-all duration-150"
              style={{
                top: isHovered ? 16 : 19,
                width: isHovered ? 6 : 4,
                height: isHovered ? 12 : 8,
                background: isHovered
                  ? tagColor
                  : active
                    ? tagColor
                    : "rgba(255,255,255,0.06)",
                opacity: isHovered ? 1 : active ? 0.7 : 0.3,
                boxShadow: isHovered ? `0 0 8px 2px ${tagColor}30` : "none",
              }}
            />

            {/* Hover tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-40 pointer-events-none"
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    className="rounded-lg px-3 py-2 whitespace-nowrap"
                    style={{
                      background: "#16161E",
                      border: `1px solid ${tagColor}25`,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[6px] font-bold tracking-[0.12em] uppercase px-1 py-[0.5px] rounded"
                        style={{ color: tagColor, background: `${tagColor}15` }}
                      >
                        {obs.tag.replace(/_/g, " ")}
                      </span>
                      <span className="text-[8px] font-mono text-white/20 tabular-nums">
                        {obs.t.toFixed(1)}s
                      </span>
                    </div>
                    <div className="text-[10px] text-white/60 font-medium max-w-[240px] leading-snug">
                      {obs.text}
                    </div>
                    <div className="text-[8px] text-white/25 mt-0.5 max-w-[240px] leading-relaxed">
                      {obs.detail}
                    </div>
                  </div>
                  {/* Arrow */}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "4px solid #16161E",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Playhead */}
      <div
        className="absolute top-[17px] w-[2px] h-[12px] -translate-x-1/2 bg-white rounded-full pointer-events-none z-10"
        style={{
          left: `${pct}%`,
          transition: isDragging ? "none" : "left 0.1s",
        }}
      />
    </div>
  );
}

function StatCounter({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-[5px] h-[5px] rounded-full"
        style={{ background: color }}
      />
      <span className="text-[9px] font-mono text-white/20">{label}</span>
      <span className="text-[10px] font-mono tabular-nums" style={{ color }}>
        {count}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VIDEO SWITCHER — vertical up/down nav
   ═══════════════════════════════════════════ */

function VideoSwitcher({
  videos,
  activeIdx,
  onSelect,
}: {
  videos: VideoEntry[];
  activeIdx: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-[44px] shrink-0">
      {/* Up arrow */}
      <button
        onClick={() => onSelect(activeIdx - 1)}
        disabled={activeIdx === 0}
        className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer disabled:cursor-default disabled:opacity-[0.08] hover:bg-white/[0.06]"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Video dots */}
      <div className="flex flex-col items-center gap-2">
        {videos.map((v, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={v.id}
              onClick={() => onSelect(i)}
              className="group relative flex items-center justify-center cursor-pointer"
            >
              <motion.div
                className="rounded-full transition-all duration-200"
                style={{
                  width: isActive ? 8 : 5,
                  height: isActive ? 8 : 5,
                  background: isActive
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.15)",
                  boxShadow: "none",
                }}
                layout
              />
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div
                  className="rounded px-2 py-1 text-[9px] font-mono"
                  style={{
                    background: "#16161E",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
                  }}
                >
                  {v.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Down arrow */}
      <button
        onClick={() => onSelect(activeIdx + 1)}
        disabled={activeIdx === videos.length - 1}
        className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer disabled:cursor-default disabled:opacity-[0.08] hover:bg-white/[0.06]"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Counter */}
      <div className="text-[8px] font-mono tabular-nums text-white/50 mt-1">
        {activeIdx + 1}/{videos.length}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CREATIVE ANALYSIS CARD
   Appears at the end of the observation feed.
   ═══════════════════════════════════════════ */

function CreativeAnalysisCard({
  summary,
  onNext,
  hasNext,
}: {
  summary: CreativeSummary;
  onNext?: () => void;
  hasNext?: boolean;
}) {
  return (
    <motion.div
      className="rounded-none overflow-hidden"
      style={{
        background: "#000000",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-[5px] h-[5px] rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-white/80">
            Creative Analysis
          </span>
        </div>
      </div>

      {/* Scores — single row */}
      <div className="px-4 py-2.5 flex items-center gap-4 border-b border-white/[0.08]">
        {[
          { label: "Hook", value: summary.hookRate ? `${(summary.hookRate * 100).toFixed(0)}%` : "—" },
          { label: "Retention", value: summary.holdRate ? `${(summary.holdRate * 100).toFixed(0)}%` : "—" },
          { label: "CTR", value: summary.ctrTier?.replace("_", " ") },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/30">{s.label}</span>
            <span className="text-[10px] font-mono font-semibold tabular-nums text-white/70">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Attributes — compact 2-col */}
      <div className="px-4 py-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
        {[
          { key: "Platform", val: summary.bestPlatform },
          { key: "Audience", val: summary.targetDemo },
          { key: "Creator", val: summary.creatorType },
          { key: "Category", val: summary.productCategory },
        ].map(({ key, val }) => (
          <div key={key}>
            <div className="text-[8px] font-mono text-white/25 mb-0.5">{key}</div>
            <div className="text-[10px] font-mono text-white/60 leading-snug">{val}</div>
          </div>
        ))}
      </div>

      {/* Next CTA */}
      {hasNext && onNext && (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={onNext}
            className="w-full py-2 text-[10px] font-mono font-semibold tracking-[0.1em] uppercase text-black bg-white hover:bg-white/90 transition-colors"
          >
            Next Video
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function ListViewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    currentTime,
    duration,
    mounted,
    activeIdx,
    activeVideo,
    totalVideos,
    isPaused,
    pauseCountdown,
    goToVideo,
    videoEnded,
  } = useVideoPlayback(videoRef);

  const feedEndRef = useRef<HTMLDivElement>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const observations = activeVideo.observations;

  // Visible observations = those whose timestamp has been reached (or all if video ended)
  const visible = videoEnded ? observations : observations.filter((o) => currentTime >= o.t);

  // Track new observations for flash effect — keyed by videoId + index
  useEffect(() => {
    const currentVisible = new Set(
      observations
        .map((o, i) => (currentTime >= o.t ? `${activeVideo.id}-${i}` : null))
        .filter((k): k is string => k !== null),
    );
    const fresh = new Set<string>();
    currentVisible.forEach((key) => {
      if (!seenIds.has(key)) fresh.add(key);
    });
    if (fresh.size > 0) {
      setNewIds(fresh);
      setSeenIds((prev) => new Set([...prev, ...fresh]));
      setTimeout(() => setNewIds(new Set()), 1200);
    }
  }, [currentTime, seenIds, observations, activeVideo.id]);

  // Reset seen IDs when switching videos
  useEffect(() => {
    setSeenIds(new Set());
    setNewIds(new Set());
  }, [activeIdx]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [visible.length]);

  // Counts by type
  const productCount = visible.filter((o) => o.tag === "PRODUCT_DETECT").length;
  const techniqueCount = visible.filter((o) => o.tag === "TECHNIQUE").length;
  const emotionCount = visible.filter((o) => o.tag === "EMOTION_SHIFT").length;

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

      {/* Header */}
      <div className="h-12 flex items-baseline gap-4 px-6 border-b border-white/[0.08] shrink-0 relative z-40 pt-3">
        <span className="text-[16px] font-semibold tracking-[0.2em] text-white/90" style={{ fontFamily: '"PPMondwest", sans-serif' }}>
          GAS
        </span>
        <span className="text-[9px] font-mono tracking-[0.08em] text-white/40 uppercase">
          Content Analysis Pipeline Visualizer. Forensic Layer
        </span>
      </div>

      {!mounted && <div className="flex-1" />}
      {mounted && (
        <>
          {/* ── Main Layout ── */}
          <div className="flex flex-1 min-h-0">
            {/* ── LEFT: Switcher + Video ── */}
            <div className="w-[38%] flex flex-col relative border-r border-white/[0.08]">
              {/* Video + switcher */}
              <div className="flex-1 flex items-center justify-center p-6 relative">
                {/* Vertical video switcher */}
                <VideoSwitcher
                  videos={VIDEOS}
                  activeIdx={activeIdx}
                  onSelect={goToVideo}
                />
                <div className="relative w-full max-w-[300px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl">
                  <video
                    ref={videoRef}
                    src={activeVideo.src}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                  />

                  {/* Timestamp */}
                  <div className="absolute top-3 right-4 z-10">
                    <span className="text-[10px] font-mono tabular-nums text-white/30 bg-black/40 px-1.5 py-0.5 rounded">
                      {currentTime.toFixed(1)}s
                    </span>
                  </div>

                  {/* Creative analysis — overlays bottom of video */}
                  <AnimatePresence>
                    {(visible.length >= observations.length || videoEnded) && observations.length > 0 && (
                      <motion.div
                        className="absolute inset-x-0 bottom-0 z-20"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <CreativeAnalysisCard
                          summary={activeVideo.summary}
                          onNext={() => goToVideo(activeIdx + 1)}
                          hasNext={activeIdx < totalVideos - 1}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Timeline bar */}
              <div className="px-6 pb-4">
                <TimelineBar
                  currentTime={currentTime}
                  duration={duration}
                  observations={observations}
                  videoRef={videoRef}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] font-mono text-white/10">
                    0:00
                  </span>
                  <span className="text-[8px] font-mono text-white/10">
                    0:{Math.floor(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Observation Feed ── */}
            <div className="flex-1 flex flex-col">
              {/* Scrolling observation feed */}
              <div className="flex-1 overflow-y-auto pl-4 pr-6 py-2">
                <AnimatePresence initial={false} mode="sync">
                  {visible.map((obs) => {
                    const key = `${activeVideo.id}-${obs.t}-${obs.tag}`;
                    return (
                      <ObservationRow
                        key={key}
                        obs={obs}
                        isNew={newIds.has(
                          `${activeVideo.id}-${observations.indexOf(obs)}`,
                        )}
                        onSeek={(t) => {
                          if (videoRef.current) videoRef.current.currentTime = t;
                        }}
                      />
                    );
                  })}
                </AnimatePresence>

                {/* spacer so feed doesn't end abruptly */}
                <div className="h-4" />

                {/* Empty state for videos with no observations yet */}
                {observations.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-[11px] font-mono text-white/20">
                        No observations yet
                      </div>
                      <div className="text-[9px] text-white/10 mt-1">
                        This video hasn&apos;t been analyzed
                      </div>
                    </div>
                  </div>
                )}

                <div ref={feedEndRef} />

                {/* Empty state — waiting for playback */}
                {observations.length > 0 && visible.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-white/10">
                        Waiting for video playback...
                      </div>
                      <div className="text-[9px] text-white/5 mt-1">
                        Observations will appear in real-time
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
