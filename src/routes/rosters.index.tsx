import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { rosterUpdatesQuery } from "@/lib/queries"

export const Route = createFileRoute("/rosters/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(rosterUpdatesQuery()),
  head: () => ({ meta: [{ title: "Roster updates | Show Scout" }] }),
  component: RosterUpdatesPage,
})

function RosterUpdatesPage() {
  const { data } = useSuspenseQuery(rosterUpdatesQuery())
  const updates = [...data.roster_updates].sort((a, b) => b.id - a.id)

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="font-display text-5xl font-bold text-monster-deep">
        Roster updates
      </h1>
      <p className="mt-1 max-w-prose text-muted-foreground">
        Every update changes card ratings, positions and the cards in the pool. Pick one
        to see exactly what moved.
      </p>

      {updates.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-input bg-paper px-6 py-14 text-center text-muted-foreground">
          No roster updates have been published yet.
        </p>
      ) : (
        <ol className="mt-6 overflow-hidden rounded-lg border border-border bg-paper">
          {updates.map((u, i) => (
            <li key={u.id} className="border-t border-border first:border-t-0">
              <Link
                to="/rosters/$id"
                params={{ id: String(u.id) }}
                className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-accent/60"
              >
                <span className="font-display text-3xl font-semibold text-monster-deep">
                  {u.name}
                </span>
                {i === 0 && (
                  <span className="rounded-sm bg-sox px-2 py-0.5 font-display text-lg font-semibold text-white">
                    Latest
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
