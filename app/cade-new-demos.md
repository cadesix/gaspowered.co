# New Demo Briefs

This file is a product and design brief for a new batch of GAS demos.

These are not generic AI demos. Each route should feel like a sharp operator tool for performance marketing: specific input, legible agent judgment, immediate output, and a strong visual system.

Design system, styling, overall UI should be taken from the other demos in this directory.

## Shared requirements for every route

Every route below must include:

- its own route-local Markdown file inside that route directory with context, scope, mock data assumptions, and build notes
- an autonomous screen recording flow of about 20 seconds that behaves like the existing `analyzer` style: deterministic, self-playing from page load, no manual input required for the core capture
- a Twitter caption in a nonchalant product announcement tone, stored in the route-local Markdown file
- the same GAS demo design system styling already established in the repo, rather than a new visual language

## Shared recording contract

Each demo should be built so an agent can open the route and reliably get a clean screen recording without needing to improvise interaction.

Recording rules:

- The page should settle quickly and begin its sequence automatically.
- The sequence should be visually complete in about 20 seconds.
- The route should not depend on live APIs. Use mocked data only.
- Motion should be intentional and cinematic, but not chaotic.
- Key states should appear in a fixed order so multiple takes look consistent.
- If there are interactive branches, the default recording path should still be automatic.

Light implementation guidance:

- Prefer a single top-level timeline or phase system that advances the page through its key beats.
- Build the route so the initial load is already the recording mode, or make recording mode trivial for an agent to discover.
- Make sure loading placeholders, generated states, and final states all read clearly at laptop screen size.
- Match the existing GAS demo system: black or near-black background, thin white borders, mono labels, restrained glassy panels, subtle noise, and the same top-level product-shell feel used in `analyzer`, `instant-creatives`, and `fakestatics`.

## Route-local Markdown requirement

Inside each route, add a short MD file that includes:

- what the demo is proving
- the exact mocked dataset shape
- the 20-second recording beat-by-beat sequence
- any asset requirements
- the Twitter caption for that route
- a note that the route should use the same visual design system as the other GAS demos in this repo

Suggested naming:

- `app/<route>/README.md`

## 1. Competitor Explorer

Proposed route slug:

- `/competitor-explorer`

Core idea:

- A massive field of ads scraped from Instagram and TikTok appears as a living network.
- Similar ads cluster closer together.
- The point is not just "lots of ads." The point is that GAS can map creative territory and show where competitors are converging.

What the demo should show:

- video thumbnails as the nodes
- clusters that feel semantically meaningful: creator testimonial, product macro, before/after, founder story, podcast clip, meme edit, etc.
- floating labels or annotated edges that explain why groups are connected
- subtle ambient motion so the graph feels alive and ethereal, not like a static data-viz

Visual direction:

- dark canvas
- soft glows, faint connecting lines, drifting labels
- clusters should breathe slightly and respond to focus changes
- motion should feel elegant, not gamified

Mock data:

- 100 to 300 ad nodes
- each node includes thumbnail, platform, category, hook type, format, tone, and embedding-like similarity coordinates
- annotations should call out patterns like "everyone is using face-cam confession hooks" or "macro product demos cluster around low-CAC beauty brands"

20-second recording beats:

1. Empty dark canvas with a few faint particles.
2. Ad nodes begin populating in waves.
3. Nodes pull into clusters and connection lines fade in.
4. Cluster labels appear.
5. One or two clusters are highlighted with floating annotations.
6. The camera subtly reframes or zooms to show the network as a whole.

Route-local MD must also include:

- the taxonomy used for clustering
- the annotation copy for highlighted clusters
- the exact order of focus states in the recording

Twitter caption:

`built a competitor explorer for paid social. drop in the market and it maps the creative landscape for you. clusters, overlaps, obvious copycats, weird white space. useful.`

## 2. Ad Launcher

Proposed route slug:

- `/ad-launcher`

Core idea:

- GAS takes a prompt, thinks through strategy, generates 35 ad concepts, renders statics, and simulates launching them into an ad account.
- The emotional payoff is operational compression: one agent moves from idea to launched batch.

What the demo should show:

- agent reasoning panel
- concept generation count climbing toward 35
- small static thumbnails populating one by one into a loading or staging area
- a final launch action with a satisfying "ads launched" moment

Visual direction:

- command-center feel
- left side for agent thought stream
- right side for generated static queue and launch panel
- launch moment should feel clean and confident, not explosive

Mock data:

- one initial creative brief
- 35 concept titles or short concept descriptors
- 35 generated static thumbnails
- a simulated account destination like campaign, ad set, and launch count

20-second recording beats:

1. Brief appears.
2. Agent starts reasoning through angles.
3. Concept count starts climbing.
4. Static thumbnails begin landing into the staging area one by one.
5. The grid fills enough to feel impressive.
6. Final launch confirmation animates in: "35 ads launched."

Route-local MD must also include:

- the initial prompt/brief
- the list structure for the 35 concepts
- the launch confirmation copy
- the exact thumbnail population cadence

Twitter caption:

`we made an ad launcher. give it a brief, it thinks through the angles, makes the statics, and stages the whole batch to launch. feels better than opening ads manager.`

## 3. Ad Iteration Agent

Proposed route slug:

- `/ad-iteration-agent`

Core idea:

- One source ad sits on the left.
- The agent analyzes it in a terminal-like reasoning stream.
- New variants slowly appear on the right as static video thumbnails: different creators, settings, hooks, framings.

What the demo should show:

- source creative as the anchor
- reasoning that feels like a creative strategist breaking down what to preserve and what to mutate
- a growing family of adjacent variants
- emphasis on controlled iteration, not random generation

Visual direction:

- split layout
- left side stable and grounded
- right side feels like a field of emerging options
- terminal text should animate in with restraint

Mock data:

- one input video thumbnail
- analysis fields like hook, pacing, creator archetype, product framing, emotional tone, CTA strength
- 8 to 12 generated variant thumbnails

20-second recording beats:

1. Source ad is visible immediately.
2. Terminal reasoning starts typing in.
3. Key traits are identified.
4. First few variants fade in.
5. More variants appear in clusters.
6. Final state shows a strong set of adjacent options.

Route-local MD must also include:

- the source ad description
- the mutation rules for the variants
- the exact reasoning lines shown in the recording
- the order that thumbnails appear

Twitter caption:

`working on an iteration agent. feed it one ad and it starts branching controlled variants off the original instead of making random new stuff. much closer to how actual creative work happens.`

## 4. Fatigue Analytics

Proposed route slug:

- `/fatigue-analytics`

Core idea:

- A table of ads from one account.
- Clicking a row expands a dropdown panel with a fatigue-over-time graph and a compact explanation.
- The point is to show that GAS can identify creative decay in a way a buyer or strategist can act on immediately.

What the demo should show:

- clean table view with believable ad metrics
- fatigue score visible in-row
- expanded row shows a graph over time
- supporting details like frequency, CPA trend, spend trend, and suggested action

Visual direction:

- minimal and analytical
- strong hierarchy in the table
- expansion animation should feel precise and quick

Mock data:

- 15 to 30 ads
- each row includes name, platform, spend, CPA, ROAS, frequency, fatigue score, status
- each expanded row includes a 14-day or 30-day fatigue graph

20-second recording beats:

1. Full table loads.
2. Highest-fatigue row highlights subtly.
3. Row opens and graph appears.
4. A second row opens to contrast healthy vs fatigued.
5. Suggested actions appear clearly.

Route-local MD must also include:

- the mock table schema
- graph shape definitions for healthy, rising-risk, and exhausted ads
- the two or three rows that the recording should expand

Twitter caption:

`fatigue analytics is starting to look right. click any ad and you can see the decay curve instead of pretending the fatigue score came from nowhere.`

## 5. Trend Detector

Proposed route slug:

- `/trend-detector`

Core idea:

- A daily dashboard showing which video formats are trending in the last 72 hours.
- Grouping should primarily relate to demographics and categories.
- This should feel like a creative strategy radar, not a generic social listening dashboard.

What the demo should show:

- category and demographic groupings
- trending formats listed under each group
- time-bound framing: "last 72h"
- velocity, repetition, and breakout signals

Visual direction:

- dashboard, but tasteful
- dense enough to feel useful
- subtle motion in rank changes, velocity indicators, and breakout tags

Mock data:

- groups like "women 25-34 skincare", "men 18-24 supplements", "parents / household", "running / performance wellness"
- each group has trending formats like street interview, split-screen reaction, day-in-the-life, founder monologue, green screen explainer, product macro loop
- include counts, momentum arrows, and breakout tags

20-second recording beats:

1. Dashboard loads with current date framing.
2. Several groups populate.
3. Trend rankings animate into place.
4. One group expands or gets spotlighted.
5. Breakout formats pulse or rise.

Route-local MD must also include:

- the grouping logic
- the 72-hour trend signals
- the exact categories and demographic buckets used in the recording

Twitter caption:

`trend detector gives you a daily read on what formats are actually moving in the last 72 hours, broken out by audience and category. less guessing.`

## 6. Variant Test Tree

Proposed route slug:

- `/variant-test-tree`

Core idea:

- A branching tree of ad tests.
- Each variant spawns further variants.
- Most branches fail and fade to grey.
- Winners stay green and branch again.
- The point is to show creative evolution as a living search tree.

What the demo should show:

- clear parent-child relationships
- performance status communicated instantly by color and motion
- visible attrition across the tree
- one or two successful branches continuing deeper

Visual direction:

- dark background
- node-link system
- restrained but beautiful branching motion
- winning green should feel earned, not flashy

Mock data:

- one root ad
- 3 to 5 levels deep
- each node includes variant label, changed variable, result, and status
- most leaves dead-end in grey, a smaller set continues in green

20-second recording beats:

1. Root ad appears.
2. First generation branches out.
3. Failures grey out.
4. One winning branch expands into a second and third generation.
5. Final tree shows how the system searched toward a better ad.

Route-local MD must also include:

- the variant dimensions used in branching
- the win/loss logic in the mocked tree
- the exact branch order for the recording

Twitter caption:

`variant test tree makes the creative process look more honest. most branches die. the good ones branch again. thats basically the job.`

## 7. Node-Based Static Iterator

Proposed route slug:

- `/static-iterator`

Core idea:

- A static ad starts in the middle.
- Four variants come out from it.
- The best one is selected.
- Three more variants generate from that winner.
- The process repeats until the final static clearly feels "right."

What the demo should show:

- center-origin iteration mechanic
- rapid comparison without clutter
- visible progression toward a stronger final asset
- a sense of taste, not just brute-force generation

Visual direction:

- bold centered composition
- each generation radiates outward
- selected winner becomes the new center of gravity
- smooth transitions matter a lot here

Mock data:

- one starting static
- 3 to 5 iteration rounds
- each candidate has a thumbnail and a short mutation label like headline swap, tighter crop, warmer palette, stronger social proof, cleaner CTA

20-second recording beats:

1. Original static appears in the center.
2. Four variants generate around it.
3. Winner is selected.
4. Three more generate from that winner.
5. Repeat until the final static lands.

Route-local MD must also include:

- the full iteration path
- the label for each mutation
- the exact winner sequence used in the recording

Twitter caption:

`made a static iterator that keeps branching around the strongest ad until the thing actually looks finished. way closer to taste-driven iteration than one-shot generation.`

## Build notes for whoever implements these

- Keep all demos mock-first.
- Reuse existing visual language from this repo where it helps, but do not force every route into the same layout.
- Prioritize legibility over feature count.
- Every route should feel recordable on day one.
- If a route needs image assets that are not already in the repo, stop and ask before inventing low-quality placeholders.
