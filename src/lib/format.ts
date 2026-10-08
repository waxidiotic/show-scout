import { MARKET_TAX } from "./constants"
import type { Price } from "./types"

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, ""))
    if (value.trim() !== "" && Number.isFinite(n)) return n
  }
  return null
}

export function formatStubs(value: Price | undefined): string {
  const n = toNumber(value)
  return n === null ? "—" : n.toLocaleString("en-US")
}

/**
 * Profit from a filled buy order at the sell now price (best_buy_price), relisted
 * at the buy now price (best_sell_price), after the market cut
 */
export function flipProfit(buyNow: Price, sellNow: Price): number | null {
  const listAt = toNumber(buyNow)
  const bidAt = toNumber(sellNow)
  if (!listAt || !bidAt) return null
  return Math.floor(listAt * (1 - MARKET_TAX)) - bidAt
}

export function rarityVar(rarity: string | undefined): string {
  const key = (rarity ?? "common").toLowerCase()
  return `var(--rarity-${["diamond", "gold", "silver", "bronze"].includes(key) ? key : "common"})`
}
