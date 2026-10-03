import { z } from "zod"

// Parsed with zod on the server so the client only receives the fields it uses
// (the raw response repeats a 28-key item object for every row), and so a
// change in the API's shape fails with one clear message.

const item = z.object({
  uuid: z.string(),
  img: z.string().nullish(),
  baked_img: z.string().nullish(),
})

const base = {
  // `name` drops accents ("Urena"); `listing_name` keeps them ("Ureña").
  listing_name: z.string(),
  name: z.string(),
  // The team on the roster, which can differ from the team printed on the card.
  team: z.string(),
  item,
}

const attributeChange = z.object({
  name: z.string(),
  current_value: z.coerce.string(),
  delta: z.coerce.string(),
})

const attributeRow = z.object({
  ...base,
  current_rank: z.coerce.number(),
  old_rank: z.coerce.number(),
  current_rarity: z.string(),
  old_rarity: z.string(),
  changes: z.array(attributeChange).default([]),
})

const positionRow = z.object({
  ...base,
  pos: z.string(),
})

const addedRow = z.object({
  ...base,
  pos: z.string(),
  current_rank: z.coerce.number(),
  current_rarity: z.string(),
})

export const rosterUpdateSchema = z.object({
  attribute_changes: z.array(attributeRow).default([]),
  position_changes: z.array(positionRow).default([]),
  newly_added: z.array(addedRow).default([]),
})

export type AttributeChange = z.infer<typeof attributeChange>
export type AttributeRow = z.infer<typeof attributeRow>
export type PositionRow = z.infer<typeof positionRow>
export type AddedRow = z.infer<typeof addedRow>
export type RosterUpdateDetail = z.infer<typeof rosterUpdateSchema>
