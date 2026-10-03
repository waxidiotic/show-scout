import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BRANDS,
  CARD_SETS,
  POSITIONS,
  RARITIES,
  SERIES,
  SLOT_TYPE_IDS,
  SORTS,
  TEAMS,
} from "@/lib/constants"
import type { MarketSearch } from "@/lib/search"

const ANY = "__any__"

interface Option {
  value: string
  label: string
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  anyLabel = "Any",
}: {
  label: string
  value: string | undefined
  options: Option[]
  onChange: (value: string | undefined) => void
  anyLabel?: string
}) {
  const labelId = useId()
  return (
    <div className="space-y-1.5">
      <span id={labelId} className="font-display text-lg font-semibold text-monster-deep">
        {label}
      </span>
      <Select
        value={value ?? ANY}
        onValueChange={(v) => onChange(v === ANY ? undefined : v)}
      >
        <SelectTrigger aria-labelledby={labelId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{anyLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="font-display text-lg font-semibold text-monster-deep"
      >
        {label}
      </label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

type NumericKey =
  | "min_best_sell_price"
  | "max_best_sell_price"
  | "min_best_buy_price"
  | "max_best_buy_price"
  | "min_rank"
  | "max_rank"

const NUMERIC_KEYS: NumericKey[] = [
  "min_best_sell_price",
  "max_best_sell_price",
  "min_best_buy_price",
  "max_best_buy_price",
  "min_rank",
  "max_rank",
]

interface MarketFiltersProps {
  search: MarketSearch
  onApply: (next: MarketSearch) => void
  onClear: () => void
}

export function MarketFilters({ search, onApply, onClear }: MarketFiltersProps) {
  const nameId = useId()
  const [draft, setDraft] = useState<MarketSearch>(search)
  const [numbers, setNumbers] = useState<Record<NumericKey, string>>(
    () =>
      Object.fromEntries(
        NUMERIC_KEYS.map((k) => [k, search[k]?.toString() ?? ""]),
      ) as Record<NumericKey, string>,
  )

  const isCard = search.type === "mlb_card"
  const isEquipment = search.type === "equipment"

  const set = <K extends keyof MarketSearch>(key: K, value: MarketSearch[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const setNumber = (key: NumericKey) => (value: string) =>
    setNumbers((n) => ({ ...n, [key]: value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Object.fromEntries(
      NUMERIC_KEYS.map((k) => {
        const n = numbers[k].trim() === "" ? undefined : Number(numbers[k])
        return [k, Number.isFinite(n) ? n : undefined]
      }),
    )
    onApply({ ...draft, ...parsed, name: draft.name?.trim() || undefined, page: 1 })
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-border bg-paper p-4 sm:p-5"
      aria-label="Market filters"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor={nameId}
            className="font-display text-lg font-semibold text-monster-deep"
          >
            Name
          </label>
          <Input
            id={nameId}
            type="search"
            placeholder="Search by player or item name"
            value={draft.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        <FilterSelect
          label="Rarity"
          value={draft.rarity}
          options={RARITIES.map((r) => ({
            value: r,
            label: r[0]?.toUpperCase() + r.slice(1),
          }))}
          onChange={(v) => set("rarity", v as MarketSearch["rarity"])}
        />

        <FilterSelect
          label="Sort by"
          value={draft.sort}
          options={SORTS.map((s) => ({ value: s.value, label: s.label }))}
          onChange={(v) => set("sort", v ?? "rank")}
          anyLabel="Default"
        />

        {isCard && (
          <>
            <FilterSelect
              label="Position"
              value={draft.display_position}
              options={POSITIONS.map((p) => ({ value: p, label: p }))}
              onChange={(v) =>
                set("display_position", v as MarketSearch["display_position"])
              }
            />
            <FilterSelect
              label="Team"
              value={draft.team}
              options={TEAMS.map(([code, name]) => ({ value: code, label: name }))}
              onChange={(v) => set("team", v)}
            />
            <FilterSelect
              label="Series"
              value={draft.series_id?.toString()}
              options={SERIES.map(([id, name]) => ({ value: String(id), label: name }))}
              onChange={(v) => set("series_id", v ? Number(v) : undefined)}
            />
            <FilterSelect
              label="Set"
              value={draft.set}
              options={CARD_SETS.map((s) => ({ value: s.value, label: s.label }))}
              onChange={(v) => set("set", v as MarketSearch["set"])}
            />
          </>
        )}

        {isEquipment && (
          <>
            <FilterSelect
              label="Brand"
              value={draft.brand_id?.toString()}
              options={BRANDS.map(([id, name]) => ({ value: String(id), label: name }))}
              onChange={(v) => set("brand_id", v ? Number(v) : undefined)}
            />
            <FilterSelect
              label="Slot type"
              value={draft.slot_type_id?.toString()}
              options={SLOT_TYPE_IDS.map((id) => ({
                value: String(id),
                label: `Slot ${id}`,
              }))}
              onChange={(v) => set("slot_type_id", v ? Number(v) : undefined)}
            />
          </>
        )}

        <FilterSelect
          label="Direction"
          value={draft.order}
          options={[
            { value: "desc", label: "High to low" },
            { value: "asc", label: "Low to high" },
          ]}
          onChange={(v) => set("order", v === "asc" ? "asc" : "desc")}
          anyLabel="Default"
        />
      </div>

      <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField
          label="Buy now, at least"
          value={numbers.min_best_sell_price}
          onChange={setNumber("min_best_sell_price")}
        />
        <NumberField
          label="Buy now, at most"
          value={numbers.max_best_sell_price}
          onChange={setNumber("max_best_sell_price")}
        />
        <NumberField
          label="Sell now, at least"
          value={numbers.min_best_buy_price}
          onChange={setNumber("min_best_buy_price")}
        />
        <NumberField
          label="Sell now, at most"
          value={numbers.max_best_buy_price}
          onChange={setNumber("max_best_buy_price")}
        />
        {isCard && (
          <>
            <NumberField
              label="Overall, at least"
              value={numbers.min_rank}
              onChange={setNumber("min_rank")}
            />
            <NumberField
              label="Overall, at most"
              value={numbers.max_rank}
              onChange={setNumber("max_rank")}
            />
          </>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <Button type="submit">Apply filters</Button>
        <Button type="button" variant="ghost" onClick={onClear}>
          Clear all
        </Button>
      </div>
    </form>
  )
}
