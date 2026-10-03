import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import {
  AttributeChangesSection,
  NewlyAddedSection,
  PositionChangesSection,
} from "@/components/roster-section"
import { Input } from "@/components/ui/input"
import { rosterUpdateQuery, rosterUpdatesQuery } from "@/lib/queries"
import { overallDelta, summarize } from "@/lib/roster"

function parseId(raw: string): number {
  const id = Number(raw)
  if (!Number.isInteger(id) || id < 1) throw notFound()
  return id
}

export const Route = createFileRoute("/rosters/$id")({
  loader: async ({ context, params }) => {
    const id = parseId(params.id)
    const [update, list] = await Promise.all([
      context.queryClient.ensureQueryData(rosterUpdateQuery(id)),
      context.queryClient.ensureQueryData(rosterUpdatesQuery()),
    ])
    return { name: list.roster_updates.find((u) => u.id === id)?.name, update }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Roster update"} | Show Scout` }],
  }),
  component: RosterUpdatePage,
})

function RosterUpdatePage() {
  const id = parseId(Route.useParams().id)
  const { data } = useSuspenseQuery(rosterUpdateQuery(id))
  const { data: list } = useSuspenseQuery(rosterUpdatesQuery())
  const name = list.roster_updates.find((u) => u.id === id)?.name ?? `Update ${id}`
  const [query, setQuery] = useState("")

  const { riser, faller, upgrades, downgrades } = summarize(data.attribute_changes)

  const sections = [
    ["attribute-changes", "Attribute changes", data.attribute_changes.length],
    ["position-changes", "Position changes", data.position_changes.length],
    ["newly-added", "Newly added", data.newly_added.length],
  ] as const

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <Link
        to="/rosters"
        className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-monster hover:underline"
      >
        <ArrowLeft className="size-4" /> All roster updates
      </Link>

      <h1 className="mt-3 font-display text-5xl font-bold text-monster-deep">{name}</h1>

      <nav aria-label="Sections" className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        {sections.map(([anchor, label, n]) => (
          <a key={anchor} href={`#${anchor}`} className="group">
            <span className="block text-sm text-muted-foreground group-hover:underline">
              {label}
            </span>
            <span className="num text-3xl font-bold">{n}</span>
          </a>
        ))}
      </nav>

      {(riser || faller || upgrades > 0 || downgrades > 0) && (
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4">
          {riser && (
            <div>
              <dt className="text-sm text-muted-foreground">Biggest riser</dt>
              <dd className="font-semibold">
                <Link
                  to="/cards/$uuid"
                  params={{ uuid: riser.item.uuid }}
                  className="text-monster-deep hover:underline"
                >
                  {riser.listing_name}
                </Link>{" "}
                <span className="num text-xl text-monster">+{overallDelta(riser)}</span>
              </dd>
            </div>
          )}
          {faller && (
            <div>
              <dt className="text-sm text-muted-foreground">Biggest drop</dt>
              <dd className="font-semibold">
                <Link
                  to="/cards/$uuid"
                  params={{ uuid: faller.item.uuid }}
                  className="text-monster-deep hover:underline"
                >
                  {faller.listing_name}
                </Link>{" "}
                <span className="num text-xl text-sox">{overallDelta(faller)}</span>
              </dd>
            </div>
          )}
          {(upgrades > 0 || downgrades > 0) && (
            <div>
              <dt className="text-sm text-muted-foreground">Rarity changes</dt>
              <dd className="num text-xl font-semibold">
                {upgrades} up, {downgrades} down
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-6 max-w-md">
        <label
          htmlFor="roster-filter"
          className="font-display text-lg font-semibold text-monster-deep"
        >
          Filter all sections
        </label>
        <Input
          id="roster-filter"
          type="search"
          placeholder="Player, team, position, rarity or attribute"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <AttributeChangesSection rows={data.attribute_changes} query={query} />
      <PositionChangesSection rows={data.position_changes} query={query} />
      <NewlyAddedSection rows={data.newly_added} query={query} />
    </div>
  )
}
