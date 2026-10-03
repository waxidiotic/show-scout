import type { AddedRow, AttributeRow, PositionRow } from "./roster-schema"

const RARITY_ORDER = ["common", "bronze", "silver", "gold", "diamond"]

function rarityIndex(rarity: string) {
  return RARITY_ORDER.indexOf(rarity.toLowerCase())
}

/** Overall change in this update. The API's trend_display mixes numbers and strings, so it is not used. */
export function overallDelta(row: AttributeRow): number {
  return row.current_rank - row.old_rank
}

export function rarityMove(row: AttributeRow): "up" | "down" | null {
  const from = rarityIndex(row.old_rarity)
  const to = rarityIndex(row.current_rarity)
  if (from === -1 || to === -1 || from === to) return null
  return to > from ? "up" : "down"
}

export function deltaSign(delta: string): "up" | "down" | "flat" {
  if (delta.startsWith("+")) return "up"
  if (delta.startsWith("-") || delta.startsWith("−")) return "down"
  return "flat"
}

/** Lowercase and strip accents so "Urena" finds "Ureña". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

export function matchesQuery(parts: string[], query: string): boolean {
  const needle = normalizeText(query.trim())
  if (!needle) return true
  return parts.some((p) => normalizeText(p).includes(needle))
}

const byName = (a: { listing_name: string }, b: { listing_name: string }) =>
  a.listing_name.localeCompare(b.listing_name)

/** Biggest movers first, then rows with the most attribute changes. */
export function sortAttributeRows(rows: AttributeRow[]): AttributeRow[] {
  return [...rows].sort(
    (a, b) =>
      Math.abs(overallDelta(b)) - Math.abs(overallDelta(a)) ||
      b.changes.length - a.changes.length ||
      byName(a, b),
  )
}

export function sortPositionRows(rows: PositionRow[]): PositionRow[] {
  return [...rows].sort(byName)
}

export function sortAddedRows(rows: AddedRow[]): AddedRow[] {
  return [...rows].sort((a, b) => b.current_rank - a.current_rank || byName(a, b))
}

export function summarize(rows: AttributeRow[]) {
  let riser: AttributeRow | null = null
  let faller: AttributeRow | null = null
  let upgrades = 0
  let downgrades = 0

  for (const row of rows) {
    const d = overallDelta(row)
    if (d > 0 && d > (riser ? overallDelta(riser) : 0)) riser = row
    if (d < 0 && d < (faller ? overallDelta(faller) : 0)) faller = row
    const move = rarityMove(row)
    if (move === "up") upgrades++
    if (move === "down") downgrades++
  }

  return { riser, faller, upgrades, downgrades }
}
