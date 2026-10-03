import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { type ReactNode, useState } from "react"
import { OvrPlate } from "@/components/ovr-plate"
import { Button } from "@/components/ui/button"
import { ATTRIBUTE_NAMES } from "@/lib/attributes"
import { rarityVar } from "@/lib/format"
import {
  deltaSign,
  matchesQuery,
  overallDelta,
  rarityMove,
  sortAddedRows,
  sortAttributeRows,
  sortPositionRows,
} from "@/lib/roster"
import type { AddedRow, AttributeRow, PositionRow } from "@/lib/roster-schema"

const PAGE_SIZE = 50

interface ShellProps {
  id: string
  title: string
  description: string
  total: number
  matched: number
  query: string
  children: (limit: number) => ReactNode
}

/** Shared heading, empty states and "show more" for all three sections. */
function Shell({ id, title, description, total, matched, query, children }: ShellProps) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const filtering = query.trim() !== ""
  const empty =
    "mt-4 rounded-lg border border-dashed border-input bg-paper px-5 py-4 text-muted-foreground"

  return (
    <section aria-labelledby={id} className="mt-10 scroll-mt-4">
      <h2
        id={id}
        className="border-b-2 border-dashed border-sox pb-1 font-display text-3xl font-bold text-monster-deep"
      >
        {title}
        <span className="num ml-3 text-2xl font-semibold text-muted-foreground">
          {filtering ? `${matched} of ${total}` : total}
        </span>
      </h2>
      <p className="mt-1 text-muted-foreground">{description}</p>

      {total === 0 ? (
        <p className={empty}>This update has no {title.toLowerCase()}.</p>
      ) : matched === 0 ? (
        <p className={empty}>
          No {title.toLowerCase()} match “{query.trim()}”.
        </p>
      ) : (
        <>
          {children(limit)}
          {matched > limit && (
            <div className="mt-3 flex items-center gap-3">
              <p className="text-muted-foreground">
                Showing {limit} of {matched}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
              >
                Show {Math.min(PAGE_SIZE, matched - limit)} more
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CardName({
  row,
  subtitle,
}: {
  row: {
    listing_name: string
    item: { uuid: string; baked_img?: string | null; img?: string | null }
  }
  subtitle?: string
}) {
  const src = row.item.baked_img ?? row.item.img
  return (
    <div className="flex min-w-0 items-center gap-3">
      {src ? (
        <img
          src={src}
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
          params={{ uuid: row.item.uuid }}
          className="font-semibold text-monster-deep hover:underline"
        >
          {row.listing_name}
        </Link>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}

function OverallMove({ row }: { row: AttributeRow }) {
  const delta = overallDelta(row)
  const move = rarityMove(row)

  if (delta === 0) {
    return (
      <div className="flex items-center gap-2">
        <OvrPlate ovr={row.current_rank} rarity={row.current_rarity} />
        <span className="text-muted-foreground">Overall unchanged</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <OvrPlate ovr={row.old_rank} rarity={row.old_rarity} />
        <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
        <OvrPlate ovr={row.current_rank} rarity={row.current_rarity} />
        <span
          className={`num text-2xl font-bold ${delta > 0 ? "text-monster" : "text-sox"}`}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      </div>
      {move && (
        <p className="mt-1 text-sm" style={{ color: rarityVar(row.current_rarity) }}>
          {row.old_rarity} to {row.current_rarity}
        </p>
      )}
    </div>
  )
}

function AttributeChips({ row }: { row: AttributeRow }) {
  if (row.changes.length === 0) {
    return <p className="text-muted-foreground">No attribute changes listed</p>
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {row.changes.map((c) => {
        const sign = deltaSign(c.delta)
        return (
          <li
            key={c.name}
            className="flex items-baseline gap-1.5 rounded-sm bg-accent px-2 py-0.5 text-accent-foreground"
          >
            <abbr
              title={ATTRIBUTE_NAMES[c.name]}
              className="num text-lg font-semibold no-underline"
            >
              {c.name}
            </abbr>
            <span className="num text-xl">{c.current_value}</span>
            <span
              className={`num text-lg font-semibold ${
                sign === "up" ? "text-monster" : sign === "down" ? "text-sox" : ""
              }`}
            >
              {c.delta}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

interface SectionProps<T> {
  rows: T[]
  query: string
}

export function AttributeChangesSection({ rows, query }: SectionProps<AttributeRow>) {
  const matched = sortAttributeRows(rows).filter((r) =>
    matchesQuery(
      [r.listing_name, r.name, r.team, r.current_rarity, ...r.changes.map((c) => c.name)],
      query,
    ),
  )

  return (
    <Shell
      id="attribute-changes"
      title="Attribute changes"
      description="Overall rating moves and attribute changes, biggest movers first. Some cards change overall without a listed attribute change."
      total={rows.length}
      matched={matched.length}
      query={query}
    >
      {(limit) => (
        <ol className="mt-4 overflow-hidden rounded-lg border border-border bg-paper">
          {matched.slice(0, limit).map((row) => (
            <li
              key={row.item.uuid}
              className="grid gap-x-6 gap-y-2 border-t border-border px-4 py-3 first:border-t-0 sm:grid-cols-[15rem_13rem_1fr] sm:items-center"
              style={{ boxShadow: `inset 4px 0 0 ${rarityVar(row.current_rarity)}` }}
            >
              <CardName row={row} subtitle={row.team} />
              <OverallMove row={row} />
              <AttributeChips row={row} />
            </li>
          ))}
        </ol>
      )}
    </Shell>
  )
}

const th = "px-3 py-2.5 first:pl-4"

export function PositionChangesSection({ rows, query }: SectionProps<PositionRow>) {
  const matched = sortPositionRows(rows).filter((r) =>
    matchesQuery([r.listing_name, r.name, r.team, r.pos], query),
  )

  return (
    <Shell
      id="position-changes"
      title="Position changes"
      description="Cards with a position update."
      total={rows.length}
      matched={matched.length}
      query={query}
    >
      {(limit) => (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-paper">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <caption className="sr-only">Position changes</caption>
            <thead>
              <tr className="wall font-display text-lg font-semibold tracking-wide">
                <th scope="col" className={th}>
                  Card
                </th>
                <th scope="col" className={th}>
                  Team
                </th>
                <th scope="col" className={th}>
                  Position
                </th>
              </tr>
            </thead>
            <tbody>
              {matched.slice(0, limit).map((row) => (
                <tr
                  key={row.item.uuid}
                  className="border-t border-border hover:bg-accent/50"
                >
                  <td className="py-2 pr-3 pl-4">
                    <CardName row={row} />
                  </td>
                  <td className="px-3 text-muted-foreground">{row.team}</td>
                  <td className="num px-3 text-2xl font-semibold">{row.pos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}

export function NewlyAddedSection({ rows, query }: SectionProps<AddedRow>) {
  const matched = sortAddedRows(rows).filter((r) =>
    matchesQuery([r.listing_name, r.name, r.team, r.pos, r.current_rarity], query),
  )

  return (
    <Shell
      id="newly-added"
      title="Newly added"
      description="Cards added to the pool in this update, highest overall first."
      total={rows.length}
      matched={matched.length}
      query={query}
    >
      {(limit) => (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-paper">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">Newly added cards</caption>
            <thead>
              <tr className="wall font-display text-lg font-semibold tracking-wide">
                <th scope="col" className={th}>
                  Card
                </th>
                <th scope="col" className={th}>
                  Team
                </th>
                <th scope="col" className={th}>
                  Position
                </th>
                <th scope="col" className={th}>
                  Overall
                </th>
              </tr>
            </thead>
            <tbody>
              {matched.slice(0, limit).map((row) => (
                <tr
                  key={row.item.uuid}
                  className="border-t border-border hover:bg-accent/50"
                  style={{ boxShadow: `inset 4px 0 0 ${rarityVar(row.current_rarity)}` }}
                >
                  <td className="py-2 pr-3 pl-5">
                    <CardName row={row} />
                  </td>
                  <td className="px-3 text-muted-foreground">{row.team}</td>
                  <td className="num px-3 text-2xl font-semibold">{row.pos}</td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <OvrPlate ovr={row.current_rank} rarity={row.current_rarity} />
                      <span className="text-sm text-muted-foreground">
                        {row.current_rarity}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}
