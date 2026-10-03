import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router"
import { OvrPlate } from "@/components/ovr-plate"
import { Pagination } from "@/components/pagination"
import { captainsQuery } from "@/lib/queries"
import { pageSearchSchema } from "@/lib/search"
import type { Captain } from "@/lib/types"

export const Route = createFileRoute("/captains")({
  validateSearch: pageSearchSchema,
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(captainsQuery(deps.page)),
  head: () => ({ meta: [{ title: "Captains | Show Scout" }] }),
  component: CaptainsPage,
})

function CaptainCard({ captain }: { captain: Captain }) {
  return (
    <li className="overflow-hidden rounded-lg border border-border bg-paper">
      <div className="wall flex items-center gap-3 px-4 py-3">
        <OvrPlate ovr={captain.ovr} rarity="diamond" />
        <div className="min-w-0">
          <Link
            to="/cards/$uuid"
            params={{ uuid: captain.uuid }}
            className="block truncate font-display text-2xl leading-tight font-bold text-white hover:underline"
          >
            {captain.name}
          </Link>
          <p className="text-sm text-white/75">
            {captain.team}, {captain.display_position}
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="font-display text-xl font-bold text-monster-deep">
          {captain.ability_name}
        </p>
        <p className="text-muted-foreground">{captain.ability_desc}</p>

        <ol className="mt-3 space-y-2.5">
          {captain.boosts.map((boost) => (
            <li key={boost.tier} className="border-l-4 border-sox pl-3">
              <p className="font-display text-lg font-semibold">
                Tier {boost.tier}
                <span className="ml-2 font-serif text-base font-normal text-muted-foreground">
                  {boost.description}
                </span>
              </p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {boost.attributes.map((a) => (
                  <li
                    key={a.name}
                    className="num rounded-sm bg-accent px-2 py-0.5 text-lg text-accent-foreground"
                  >
                    +{a.value} {a.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </li>
  )
}

function CaptainsPage() {
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data } = useSuspenseQuery(captainsQuery(page))

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-display text-5xl font-bold text-monster-deep">Captains</h1>
      <p className="mt-1 max-w-prose text-muted-foreground">
        {data.total_captains} captains, each with an ability that boosts your squad as you
        meet its tiers.
      </p>

      <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.captains.map((c) => (
          <CaptainCard key={c.uuid} captain={c} />
        ))}
      </ul>

      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        onPageChange={(next) => navigate({ search: { page: next } })}
      />
    </div>
  )
}
