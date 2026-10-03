import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import { AttributePanel } from "@/components/attribute-panel"
import { GenericTable } from "@/components/generic-table"
import { OvrPlate } from "@/components/ovr-plate"
import { PriceBoard } from "@/components/price-board"
import { PriceChart } from "@/components/price-chart"
import { formatStubs, rarityVar } from "@/lib/format"
import { normalizeHistory, normalizeOrders } from "@/lib/history"
import { cardQuery } from "@/lib/queries"

export const Route = createFileRoute("/cards/$uuid")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(cardQuery(params.uuid)),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.item.name ?? "Card"} | Show Scout` }],
  }),
  component: CardPage,
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 border-b-2 border-dashed border-sox pb-1 font-display text-3xl font-bold text-monster-deep">
        {title}
      </h2>
      {children}
    </section>
  )
}

function BackLink() {
  const router = useRouter()

  // Render the same link on the server and the client. Whether there is history
  // to go back to is only known in the browser, so it is checked at click time.
  function goBack(e: React.MouseEvent<HTMLAnchorElement>) {
    const plainClick =
      e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    if (plainClick && router.history.canGoBack()) {
      e.preventDefault()
      router.history.back()
    }
  }

  return (
    <Link
      to="/market"
      onClick={goBack}
      className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-monster hover:underline"
    >
      <ArrowLeft className="size-4" /> Back to results
    </Link>
  )
}

function CardPage() {
  const { uuid } = Route.useParams()
  const { data } = useSuspenseQuery(cardQuery(uuid))
  const { item, listing } = data

  const img = listing?.item.img ?? item.img
  const facts: [string, string | undefined][] = [
    ["Team", item.team],
    [
      "Position",
      [item.display_position, item.display_secondary_positions]
        .filter(Boolean)
        .join(", "),
    ],
    ["Series", [item.series, item.series_year].filter(Boolean).join(" ")],
    ["Bats", item.bat_hand],
    ["Throws", item.throw_hand],
    ["Age", item.age?.toString()],
    ["Height", item.height],
    ["Weight", item.weight],
    ["Born", item.born],
    ["Jersey", item.jersey_number ? `#${item.jersey_number}` : undefined],
  ]

  const history = normalizeHistory(listing?.price_history)
  const orders = normalizeOrders(listing?.completed_orders)

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <BackLink />

      <div className="mt-5 grid gap-8 md:grid-cols-[15rem_1fr]">
        <div>
          {img ? (
            <img
              src={img}
              alt={`${item.name} card`}
              className="w-full max-w-60 rounded-lg border-4 bg-paper"
              style={{ borderColor: rarityVar(item.rarity) }}
            />
          ) : (
            <div
              className="aspect-[2/3] w-full max-w-60 rounded-lg border-4 bg-muted"
              style={{ borderColor: rarityVar(item.rarity) }}
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <OvrPlate
              ovr={item.ovr}
              rarity={item.rarity}
              className="h-12 min-w-14 text-4xl"
            />
            <p
              className="font-display text-xl font-semibold"
              style={{ color: rarityVar(item.rarity) }}
            >
              {item.rarity}
            </p>
          </div>
          <h1 className="mt-2 font-display text-5xl font-bold leading-none text-monster-deep sm:text-6xl">
            {item.name}
          </h1>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {facts
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      <div className="mt-8">
        {listing ? (
          <PriceBoard buyNow={listing.best_sell_price} sellNow={listing.best_buy_price} />
        ) : (
          <p className="rounded-lg border border-dashed border-input bg-paper px-5 py-4 text-muted-foreground">
            This item has no market listing, so there are no prices to show.
          </p>
        )}
      </div>

      {listing && (
        <Section title="Price history">
          {history ? (
            <PriceChart points={history} />
          ) : listing.price_history?.length ? (
            <GenericTable rows={listing.price_history} />
          ) : (
            <p className="text-muted-foreground">
              No price history has been recorded yet.
            </p>
          )}
        </Section>
      )}

      <Section title="Attributes">
        <AttributePanel item={item} />
      </Section>

      {item.pitches && item.pitches.length > 0 && (
        <Section title="Pitches">
          <div className="overflow-x-auto rounded-lg border border-border bg-paper">
            <table className="w-full min-w-[24rem] text-left">
              <thead>
                <tr className="bg-muted font-display text-lg font-semibold">
                  <th scope="col" className="px-4 py-2">
                    Pitch
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Speed
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Control
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Movement
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.pitches.map((p) => (
                  <tr key={p.name} className="border-t border-border">
                    <th scope="row" className="px-4 py-2 font-semibold">
                      {p.name}
                    </th>
                    <td className="num px-3 text-right text-xl">{p.speed}</td>
                    <td className="num px-3 text-right text-xl">{p.control}</td>
                    <td className="num px-4 text-right text-xl">{p.movement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {item.quirks && item.quirks.length > 0 && (
        <Section title="Quirks">
          <ul className="grid gap-3 sm:grid-cols-2">
            {item.quirks.map((q) => (
              <li
                key={q.name}
                className="rounded-lg border border-border bg-paper px-4 py-3"
              >
                <p className="font-display text-xl font-bold text-monster-deep">
                  {q.name}
                </p>
                <p className="text-muted-foreground">{q.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.locations && item.locations.length > 0 && (
        <Section title="Where to get it">
          <ul className="list-inside list-disc space-y-1">
            {item.locations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Section>
      )}

      {listing && (
        <Section title="Recent sales">
          {orders ? (
            <div className="overflow-x-auto rounded-lg border border-border bg-paper">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted font-display text-lg font-semibold">
                    <th scope="col" className="px-4 py-2">
                      Sold
                    </th>
                    <th scope="col" className="px-4 py-2 text-right">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 25).map((o, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: orders have no stable id
                    <tr key={i} className="border-t border-border">
                      <td className="num px-4 py-1.5 text-lg">{o.label}</td>
                      <td className="num px-4 text-right text-xl">
                        {formatStubs(o.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : listing.completed_orders?.length ? (
            <GenericTable rows={listing.completed_orders} />
          ) : (
            <p className="text-muted-foreground">No completed sales yet.</p>
          )}
        </Section>
      )}
    </div>
  )
}
