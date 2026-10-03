import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  stripSearchParams,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router"
import { ListingsTable } from "@/components/listings-table"
import { MarketFilters } from "@/components/market-filters"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { ITEM_TYPES } from "@/lib/constants"
import { listingsQuery } from "@/lib/queries"
import { type MarketSearch, marketSearchSchema } from "@/lib/search"

export const Route = createFileRoute("/market")({
  validateSearch: marketSearchSchema,
  // Keep shared URLs short: defaults are not written into the address bar.
  search: {
    middlewares: [
      stripSearchParams({ type: "mlb_card", page: 1, sort: "rank", order: "desc" }),
    ],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(listingsQuery(deps)),
  head: () => ({ meta: [{ title: "Market | Show Scout" }] }),
  component: MarketPage,
})

function MarketPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data } = useSuspenseQuery(listingsQuery(search))
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  const apply = (next: MarketSearch) => navigate({ search: next })
  const clear = () => navigate({ search: { type: search.type } })

  // Filters remount whenever the URL changes underneath them (type tabs, clear).
  const filtersKey = JSON.stringify({ ...search, page: 1 })

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-display text-5xl font-bold text-monster-deep">Market</h1>
      <p className="mt-1 max-w-prose text-muted-foreground">
        Current buy and sell prices from the community market. Select a name to see the
        full card and its price history.
      </p>

      <nav
        aria-label="Item type"
        className="mt-6 flex flex-wrap gap-x-6 border-b border-border"
      >
        {ITEM_TYPES.map((t) => {
          const active = search.type === t.value
          return (
            <Link
              key={t.value}
              to="/market"
              search={{ type: t.value }}
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-4 py-2 font-display text-xl font-semibold ${
                active
                  ? "border-sox text-monster-deep"
                  : "border-transparent text-muted-foreground hover:text-monster-deep"
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-5">
        <MarketFilters key={filtersKey} search={search} onApply={apply} onClear={clear} />
      </div>

      <section
        aria-label="Results"
        aria-busy={isLoading}
        className={`mt-6 transition-opacity ${isLoading ? "opacity-60" : ""}`}
      >
        {data.listings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-input bg-paper px-6 py-14 text-center">
            <p className="font-display text-3xl font-semibold text-monster-deep">
              Nothing matches those filters
            </p>
            <p className="mt-1 text-muted-foreground">
              Widen the price range or remove a filter to see more listings.
            </p>
            <Button className="mt-5" onClick={clear}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <ListingsTable listings={data.listings} />
        )}

        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          onPageChange={(page) => navigate({ search: (prev) => ({ ...prev, page }) })}
        />
      </section>
    </div>
  )
}
