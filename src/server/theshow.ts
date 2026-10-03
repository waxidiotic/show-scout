import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { rosterUpdateSchema } from "@/lib/roster-schema"
import { marketSearchSchema, pageSearchSchema } from "@/lib/search"
import type {
  CaptainsResponse,
  ItemDetail,
  ListingDetail,
  ListingsResponse,
  RosterUpdatesResponse,
} from "@/lib/types"

const BASE_URL = process.env.THESHOW_BASE_URL ?? "https://mlb26.theshow.com"

type Params = Record<string, string | number | undefined>

/** All calls go through the server so the browser never hits the Show's API directly. */
async function theShow<T>(endpoint: string, params: Params = {}): Promise<T> {
  const url = new URL(`/apis/${endpoint}.json`, BASE_URL)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value))
  }

  const res = await fetch(url, { headers: { Accept: "application/json" } })
  if (!res.ok) {
    throw new Error(`MLB The Show returned ${res.status} for ${endpoint}.`)
  }
  return (await res.json()) as T
}

export const getListings = createServerFn({ method: "GET" })
  .validator(marketSearchSchema)
  .handler(({ data }) => theShow<ListingsResponse>("listings", data))

export const getCaptains = createServerFn({ method: "GET" })
  .validator(pageSearchSchema)
  .handler(({ data }) => theShow<CaptainsResponse>("captains", data))

export const getCardDetail = createServerFn({ method: "GET" })
  .validator(z.object({ uuid: z.string().min(1) }))
  .handler(async ({ data }) => {
    // Not every item has a market listing, so a failed listing lookup is not fatal.
    const [item, listing] = await Promise.allSettled([
      theShow<ItemDetail>("item", { uuid: data.uuid }),
      theShow<ListingDetail>("listing", { uuid: data.uuid }),
    ])

    if (item.status === "rejected") throw item.reason
    return {
      item: item.value,
      listing: listing.status === "fulfilled" ? listing.value : null,
    }
  })

export const getRosterUpdates = createServerFn({ method: "GET" }).handler(() =>
  theShow<RosterUpdatesResponse>("roster_updates"),
)

export const getRosterUpdate = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int().min(1) }))
  .handler(async ({ data }) => {
    const raw = await theShow<unknown>("roster_update", { id: data.id })
    const parsed = rosterUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      console.error("Unexpected roster_update shape", parsed.error.issues)
      throw new Error("MLB The Show returned roster data in an unexpected format.")
    }
    return parsed.data
  })
