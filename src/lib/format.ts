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

/** Profit from buying at best_sell_price and relisting at best_buy_price, after the market cut. */
export function flipProfit(buyNow: Price, sellNow: Price): number | null {
  const buy = toNumber(buyNow)
  const sell = toNumber(sellNow)
  if (buy === null || sell === null) return null
  return Math.floor(sell * (1 - MARKET_TAX)) - buy
}

export function rarityVar(rarity: string | undefined): string {
  const key = (rarity ?? "common").toLowerCase()
  return `var(--rarity-${["diamond", "gold", "silver", "bronze"].includes(key) ? key : "common"})`
}
