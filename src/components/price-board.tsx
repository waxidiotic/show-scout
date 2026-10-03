import { flipProfit, formatStubs } from "@/lib/format"
import type { Price } from "@/lib/types"

interface TileProps {
  label: string
  value: string
  index: number
  note?: string
}

function Tile({ label, value, index, note }: TileProps) {
  return (
    <div
      className="tile tile-flip rounded-sm px-4 py-3"
      style={{ "--i": index } as React.CSSProperties}
    >
      <p className="font-display text-lg font-semibold text-white/85">{label}</p>
      <p className="num text-5xl leading-none font-bold sm:text-6xl">{value}</p>
      {note && <p className="mt-1.5 text-sm text-white/65">{note}</p>}
    </div>
  )
}

interface PriceBoardProps {
  buyNow: Price | undefined
  sellNow: Price | undefined
}

/** The page's one big moment: current prices, posted like the left-field scoreboard. */
export function PriceBoard({ buyNow, sellNow }: PriceBoardProps) {
  const profit = flipProfit(buyNow ?? "-", sellNow ?? "-")

  return (
    <section aria-label="Current prices" className="wall rounded-md p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile
          label="Buy now"
          value={formatStubs(buyNow)}
          index={0}
          note="Lowest open sell order"
        />
        <Tile
          label="Sell now"
          value={formatStubs(sellNow)}
          index={1}
          note="Highest open buy order"
        />
        <Tile
          label="Flip profit"
          value={profit === null ? "—" : profit.toLocaleString("en-US")}
          index={2}
          note="After the 10% market cut"
        />
      </div>
    </section>
  )
}
