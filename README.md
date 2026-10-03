# Show Scout

Unofficial explorer for MLB The Show's public API. Built with TanStack Start,
TanStack Router and Query, Tailwind v4, shadcn/ui primitives and Biome.

## Run it

```sh
bun install
cp .env.example .env     # optional: THESHOW_BASE_URL defaults to https://mlb26.theshow.com
bun run dev              # http://localhost:3000
```

Other scripts: `bun run check` (Biome lint + format + import sort),
`bun run typecheck`, `bun run build`.

## Pages

| Route | API endpoints |
| --- | --- |
| `/market` | `listings.json` |
| `/cards/$uuid` | `item.json`, `listing.json` |
| `/captains` | `captains.json` |
| `/rosters`, `/rosters/$id` | `roster_updates.json`, `roster_update.json` |

Not built yet: Scouting (`player_search`, `game_history`, `game_log`).

## How it fits together

- `src/server/theshow.ts` holds every API call as a TanStack Start server function,
  so the browser never talks to the Show directly.
- `src/lib/search.ts` defines the market filters as a zod schema. Filters live in the
  URL, defaults are stripped, and invalid values fall back to unset.
- `src/lib/constants.ts` holds the filter lists copied from the API docs.
  `meta_data.json` uses different ids for series and brands than `listings.json`
  (for example Adidas is 15 there and 14 in listings), so it is not used for filters.
- `src/lib/history.ts` normalizes `price_history` and `completed_orders`. The docs
  elide their shape, so it looks for likely key names and the UI falls back to a
  generic table if none match.

## Deploying to Vercel

The `nitro()` plugin in `vite.config.ts` produces Vercel output. Import the repo in
Vercel, set `THESHOW_BASE_URL` if you want to override the default, and deploy. Bun is
used for installs when a `bun.lock` is present. The server runtime stays on Node.

## Editor

`.zed/settings.json` routes formatting, import sorting and fix-all through Biome for
JS, TS, TSX, JSX, JSON and CSS, and disables Prettier. Biome only activates in
projects that have a `biome.json`.

## Rosters

`roster_update.json` is validated with zod in `src/lib/roster-schema.ts` on the server,
which also strips the repeated 28-key `item` object from every row before it reaches
the browser. Notes on the data:

- Overall change is computed as `current_rank - old_rank`. The API's `trend_display`
  mixes numbers and strings (`0`, `"+5"`, `-5`), so it is ignored.
- The row's `team` is the roster team and `item.team` is the card's team; they differ
  for some players. The page shows the roster team.
- `listing_name` keeps accents and `name` does not. The page displays `listing_name`,
  and the filter box ignores accents.
- Many attribute rows have an empty `changes` list (overall moved, or nothing listed).
- `src/lib/attributes.ts` expands abbreviations such as CTRL and K/9 R in tooltips.
  Abbreviations not listed there (for example POP) show without one.
