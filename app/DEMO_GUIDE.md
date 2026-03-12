# Making GAS Demo Pages

## What this product is

GAS is an AI-native performance marketing product or agency. The core idea is not "generic AI for ads," but a system of specialized agents that:

- analyze paid social performance across campaigns, ad sets, and creatives
- diagnose fatigue, scaling opportunities, and budget moves
- generate net-new ad concepts and statics from brand context
- compare creative variants and predict winners
- turn messy marketing judgment into fast, legible operator workflows

The product story is: AI agents that act like a sharp creative strategist, media buyer, and creative ops team for performance marketing.

## What makes the existing demos work

The demos in this directory share a clear pattern:

- They show one narrow job, not the whole platform.
- They feel like tools an operator would actually use.
- They use concrete marketing artifacts: ROAS, CPA, fatigue, concepts, hooks, references, variants, votes.
- They are opinionated. The agent does not just summarize; it recommends or acts.
- They reveal work progressively: scan, analyze, decide, generate, compare, save.
- They stay visually cinematic, but the UI is still readable as a product demo.

Examples already here:

- `analyzer`: AI account audit with actions and projected impact
- `instant-creatives`: website in, ad creatives out
- `fakestatics`: batch generation plus save/regenerate workflow
- `arena` / `compare`: head-to-head creative judgment
- `queue`: creative backlog and production planning
- `visioncore`: frame-by-frame creative analysis

## How to make a new demo like these

Pick one agent job only. Good examples:

- "Find the next 3 creatives to kill"
- "Turn a landing page into 6 Meta statics"
- "Predict which hook wins before spend"
- "Convert top comments into UGC briefs"

Then structure the demo like this:

1. Start with a real input.
   Inputs should feel native to performance marketing: ad account data, a URL, a creative folder, a batch of hooks, a campaign brief, or a set of variants.

2. Show the agent's intermediate thinking.
   Use staged progress, streamed updates, or visible reasoning artifacts like extracted brand colors, detected hooks, fatigue scores, or ranked opportunities.

3. End with a decision or deliverable.
   The output should be something a marketer can use immediately: actions taken, briefs, ranked winners, generated creatives, budget changes, or a saved shortlist.

4. Make the judgment legible.
   Always expose why the agent decided something. Use a few sharp signals, not a wall of explanation.

5. Keep the loop interactive.
   Let the user iterate, regenerate, compare, save, or refine. A static mockup is weaker than a compact workflow.

## Demo principles

- Prefer operator verbs: analyze, rank, generate, kill, scale, queue, compare, iterate.
- Use believable numbers and platform language: Meta, TikTok, CTR, CPA, ROAS, frequency, fatigue.
- Keep the scope tight enough that the demo can be understood in under 30 seconds.
- Make the output slightly opinionated and high-agency. "Here is what I would do next" is stronger than "Here are some observations."
- Show taste. The best demos here combine performance marketing rigor with premium creative direction.

## Recommended formula

Use this sentence when designing a new page:

> "This demo shows a GAS agent taking **specific marketing input**, applying **specialized judgment**, and producing **an immediate performance outcome**."

If a concept does not fit that sentence cleanly, it is probably too broad.
