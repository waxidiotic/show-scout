import { toNumber } from "./format"
import type { HistoryRow } from "./types"

// The API docs elide the shape of price_history and completed_orders ("..."),
// so these helpers look for the likely key names and return null when nothing
// usable is found. Callers fall back to a generic table in that case.

const DATE_KEYS = ["date", "time", "timestamp", "created_at", "day"]
const BUY_KEYS = ["best_sell_price", "sell_price", "best_sell"]
const SELL_KEYS = ["best_buy_price", "buy_price", "best_buy"]
const ORDER_PRICE_KEYS = ["price", "amount", "sale_price", "sold_price"]

function pick(row: HistoryRow, keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key]
  }
  return undefined
}

function parseTime(label: string): number | null {
  const t = Date.parse(label)
  return Number.isNaN(t) ? null : t
}

export interface HistoryPoint {
  label: string
  time: number | null
  /** best_sell_price: what it costs to buy right now */
  buyNow: number | null
  /** best_buy_price: what you get for selling right now */
  sellNow: number | null
}

export function normalizeHistory(rows: HistoryRow[] | undefined): HistoryPoint[] | null {
  if (!rows?.length) return null

  const points = rows
    .map((row) => {
      const label = String(pick(row, DATE_KEYS) ?? "")
      return {
        label,
        time: parseTime(label),
        buyNow: toNumber(pick(row, BUY_KEYS)),
        sellNow: toNumber(pick(row, SELL_KEYS)),
      }
    })
    .filter((p) => p.label && (p.buyNow !== null || p.sellNow !== null))

  if (points.length < 2) return null
  if (points.every((p) => p.time !== null)) {
    points.sort((a, b) => (a.time ?? 0) - (b.time ?? 0))
  }
  return points
}

export interface OrderRow {
  label: string
  price: number
}

export function normalizeOrders(rows: HistoryRow[] | undefined): OrderRow[] | null {
  if (!rows?.length) return null

  const orders = rows
    .map((row) => ({
      label: String(pick(row, DATE_KEYS) ?? ""),
      price: toNumber(pick(row, ORDER_PRICE_KEYS)),
    }))
    .filter((o): o is OrderRow => o.label !== "" && o.price !== null)

  return orders.length ? orders : null
}
