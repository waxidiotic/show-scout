import { queryOptions } from "@tanstack/react-query"
import {
  getCaptains,
  getCardDetail,
  getListings,
  getRosterUpdate,
  getRosterUpdates,
} from "@/server/theshow"
import type { MarketSearch } from "./search"

export const listingsQuery = (search: MarketSearch) =>
  queryOptions({
    queryKey: ["listings", search],
    queryFn: () => getListings({ data: search }),
    staleTime: 30_000,
  })

export const captainsQuery = (page: number) =>
  queryOptions({
    queryKey: ["captains", page],
    queryFn: () => getCaptains({ data: { page } }),
    staleTime: 10 * 60_000,
  })

export const cardQuery = (uuid: string) =>
  queryOptions({
    queryKey: ["card", uuid],
    queryFn: () => getCardDetail({ data: { uuid } }),
    staleTime: 30_000,
  })

export const rosterUpdatesQuery = () =>
  queryOptions({
    queryKey: ["roster-updates"],
    queryFn: () => getRosterUpdates(),
    staleTime: 10 * 60_000,
  })

export const rosterUpdateQuery = (id: number) =>
  queryOptions({
    queryKey: ["roster-update", id],
    queryFn: () => getRosterUpdate({ data: { id } }),
    // A published update never changes.
    staleTime: Number.POSITIVE_INFINITY,
  })
