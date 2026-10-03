// Prices come back as a number, or "-" when there are no open orders.
export type Price = number | string

export interface CardSummary {
  uuid: string
  img?: string
  name: string
  rarity: string
  team?: string
  team_short_name?: string
  ovr?: number
  display_position?: string
  series?: string
}

export interface Listing {
  listing_name: string
  best_sell_price: Price
  best_buy_price: Price
  item: CardSummary
}

export interface ListingsResponse {
  page: number
  per_page: number
  total_pages: number
  listings: Listing[]
}

export type HistoryRow = Record<string, string | number | boolean | null>

export interface ListingDetail extends Listing {
  price_history?: HistoryRow[]
  completed_orders?: HistoryRow[]
}

export interface Pitch {
  name: string
  speed: number
  control: number
  movement: number
}

export interface Quirk {
  name: string
  description: string
  img?: string
}

export interface ItemDetail extends CardSummary {
  type?: string
  series_year?: number
  display_secondary_positions?: string
  jersey_number?: string
  age?: number
  bat_hand?: string
  throw_hand?: string
  weight?: string
  height?: string
  born?: string
  is_hitter?: boolean
  pitches?: Pitch[]
  quirks?: Quirk[]
  locations?: string[]
}

export interface CaptainBoost {
  tier: string
  description: string
  attributes: { name: string; value: string }[]
}

export interface Captain {
  uuid: string
  name: string
  display_position: string
  team: string
  ovr: number
  ability_name: string
  ability_desc: string
  boosts: CaptainBoost[]
}

export interface CaptainsResponse {
  page: number
  per_page: number
  total_pages: number
  total_captains: number
  captains: Captain[]
}

export interface RosterUpdateSummary {
  id: number
  name: string
}

export interface RosterUpdatesResponse {
  roster_updates: RosterUpdateSummary[]
}
