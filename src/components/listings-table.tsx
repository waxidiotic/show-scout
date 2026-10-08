import { Link } from "@tanstack/react-router"
import { OvrPlate } from "@/components/ovr-plate"
import { flipProfit, formatStubs, rarityVar } from "@/lib/format"
import type { Listing } from "@/lib/types"

export function ListingsTable({ listings }: { listings: Listing[] }) {
  const showOvr = listings.some((l) => typeof l.item.ovr === "number")

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-paper">
      <table className="w-full min-w-160 border-collapse text-left">
        <caption className="sr-only">Market listings</caption>
        <thead>
          <tr className="wall font-display text-lg font-semibold tracking-wide">
            <th scope="col" className="px-4 py-2.5">
              Item
            </th>
            {showOvr && (
              <th scope="col" className="px-3 py-2.5">
                Overall
              </th>
            )}
            <th scope="col" className="px-3 py-2.5">
              Team
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              Buy now
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              Sell now
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-right"
              title="Buy now price after the 10% market cut, minus the sell now price"
            >
              Flip profit
            </th>
          </tr>
        </thead>
        <tbody>
          {listings.map(({ item, listing_name, best_sell_price, best_buy_price }) => {
            const profit = flipProfit(best_sell_price, best_buy_price)
            return (
              <tr
                key={item.uuid}
                className="border-t border-border hover:bg-accent/50"
                style={{ boxShadow: `inset 4px 0 0 ${rarityVar(item.rarity)}` }}
              >
                <td className="py-2 pr-3 pl-5">
                  <div className="flex items-center gap-3">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt=""
                        loading="lazy"
                        className="h-14 w-10 shrink-0 rounded-sm object-contain"
                      />
                    ) : (
                      <span className="h-14 w-10 shrink-0 rounded-sm bg-muted" />
                    )}
                    <div className="min-w-0">
                      <Link
                        to="/cards/$uuid"
                        params={{ uuid: item.uuid }}
                        className="font-semibold text-monster-deep hover:underline"
                      >
                        {listing_name || item.name}
                      </Link>
                      {item.display_position && (
                        <p className="text-sm text-muted-foreground">
                          {item.display_position}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                {showOvr && (
                  <td className="px-3">
                    <OvrPlate ovr={item.ovr} rarity={item.rarity} />
                  </td>
                )}
                <td className="px-3 text-muted-foreground">{item.team ?? "—"}</td>
                <td className="num px-3 text-right text-xl">
                  {formatStubs(best_sell_price)}
                </td>
                <td className="num px-3 text-right text-xl">
                  {formatStubs(best_buy_price)}
                </td>
                <td
                  className={`num px-4 text-right text-xl ${
                    profit === null
                      ? "text-muted-foreground"
                      : profit > 0
                        ? "font-semibold text-monster"
                        : "text-sox"
                  }`}
                >
                  {profit === null ? "—" : profit.toLocaleString("en-US")}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
