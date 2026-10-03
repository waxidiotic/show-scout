import { z } from "zod"
import { BRANDS, ITEM_TYPES, POSITIONS, RARITIES, SORTS, TEAMS } from "./constants"

const itemTypes = ITEM_TYPES.map((t) => t.value) as [string, ...string[]]
const sorts = SORTS.map((s) => s.value) as [string, ...string[]]
const teamCodes = TEAMS.map((t) => t[0]) as [string, ...string[]]

const optionalNumber = z.number().optional().catch(undefined)

/**
 * Every filter lives in the URL so a market view can be shared or bookmarked.
 * Invalid values fall back to "unset" instead of throwing.
 */
export const marketSearchSchema = z.object({
  type: z.enum(itemTypes).default("mlb_card").catch("mlb_card"),
  page: z.number().int().min(1).default(1).catch(1),
  sort: z.enum(sorts).default("rank").catch("rank"),
  order: z.enum(["desc", "asc"]).default("desc").catch("desc"),
  name: z.coerce.string().optional().catch(undefined),
  rarity: z.enum(RARITIES).optional().catch(undefined),
  min_best_sell_price: optionalNumber,
  max_best_sell_price: optionalNumber,
  min_best_buy_price: optionalNumber,
  max_best_buy_price: optionalNumber,
  min_rank: optionalNumber,
  max_rank: optionalNumber,
  display_position: z.enum(POSITIONS).optional().catch(undefined),
  team: z.enum(teamCodes).optional().catch(undefined),
  set: z.enum(["legend", "flashback"]).optional().catch(undefined),
  series_id: optionalNumber,
  brand_id: z
    .number()
    .refine((n) => BRANDS.some((b) => b[0] === n))
    .optional()
    .catch(undefined),
  slot_type_id: z.number().int().min(0).max(14).optional().catch(undefined),
})

export type MarketSearch = z.infer<typeof marketSearchSchema>

export const pageSearchSchema = z.object({
  page: z.number().int().min(1).default(1).catch(1),
})
