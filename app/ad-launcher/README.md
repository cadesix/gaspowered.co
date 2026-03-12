# Ad Launcher

## What the demo is proving

GAS can take a single creative brief, think through strategy, generate 24 ad concepts with rendered statics, and stage the entire batch for launch — compressing what normally takes a team days into one autonomous sequence.

## Visual design system

Uses the same GAS demo system as analyzer, fakestatics, and queue: black/near-black background (#090909), thin white borders, Geist Mono labels, restrained panels, subtle motion.

## Mocked dataset shape

### Brief
- brand, objective, platforms, tone, CTA, budget, campaign name, ad set name

### Concepts (24 total)
- 6 creative angles × 4 executions each
- Each concept: id, title, angle, hook, color

### Angles taxonomy
Morning Routine, Ingredient Transparency, Cost Comparison, Social Proof, Taste Test, Lifestyle Flex

### Launch destination
- Campaign: "AG1 — Spring Push Q2"
- Ad Set: "Health-curious 25–40"
- 24 unique statics, all live

## 20-second recording beat-by-beat

| Time | Beat |
|------|------|
| 0.3s | Brief card fades in on the left |
| 1.2s | Agent reasoning starts streaming: "Reading brief" heading, then analysis lines |
| 3.0s | Concept count begins climbing (0 → 24) |
| 4.2s | Static thumbnails start populating into the 6×4 grid, one by one |
| ~27s | Grid is fully populated (24 statics visible) |
| ~27s | Status bar shows "STAGING..." |
| ~29s | Launch confirmation: "24 ads launched" with campaign details, green check |

Total sequence: ~30 seconds of active animation, clean hold at end.

## Thumbnail population cadence

- One thumbnail every 950ms with 700ms shimmer loading state
- 24 thumbnails × 950ms = ~22.8s of population time
- Empty dashed placeholders visible from the start fill in left-to-right, top-to-bottom

## Initial prompt/brief

> Drive first-purchase conversions among health-curious 25–40 year-olds

## 24 concept list structure

Each concept gets: a unique hook line, one of 6 angles, and a Gemini-generated ad static image.

## Launch confirmation copy

"24 ads launched" with metadata grid: Campaign (AG1 — Spring Push Q2), Ad Set (Health-curious 25–40), Statics (24 unique), Status (Live).

## Asset requirements

24 pre-generated AG1 ad statics in `/public/ad-launcher/01.png` through `24.png`, generated via Gemini image generation API with a two-pass prompt pipeline (concept generation → DR refinement → image rendering).

## Twitter caption

`we made an ad launcher. give it a brief, it thinks through the angles, makes the statics, and stages the whole batch to launch. feels better than opening ads manager.`
