import {
  type AttributeGroup,
  FIELDING,
  HITTING,
  PITCHING,
  RUNNING,
} from "@/lib/attributes"
import type { ItemDetail } from "@/lib/types"

function barColor(value: number) {
  if (value >= 80) return "var(--monster)"
  if (value >= 60) return "var(--monster-mid)"
  return "#7d9a86"
}

function Group({ group, item }: { group: AttributeGroup; item: ItemDetail }) {
  // Attribute fields are looked up by name, so view the item as a plain record.
  const record = item as unknown as Record<string, unknown>
  const rows = group.keys.flatMap(([key, label]) => {
    const value = record[key]
    return typeof value === "number" ? [{ key, label, value }] : []
  })
  if (rows.length === 0) return null

  return (
    <section>
      <h3 className="font-display text-2xl font-bold text-monster-deep">{group.title}</h3>
      <dl className="mt-2 space-y-2">
        {rows.map(({ key, label, value }) => (
          <div key={key} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-3">
            <dt className="text-base">{label}</dt>
            <dd className="contents">
              <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.min(100, value)}%`,
                    backgroundColor: barColor(value),
                  }}
                />
              </span>
              <span className="num text-right text-xl font-semibold">{value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function AttributePanel({ item }: { item: ItemDetail }) {
  const hitter = item.is_hitter !== false
  const primary = hitter ? [HITTING, FIELDING, RUNNING] : [PITCHING]
  const secondary = hitter ? [PITCHING] : [HITTING, FIELDING, RUNNING]

  return (
    <div className="space-y-8">
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {primary.map((g) => (
          <Group key={g.title} group={g} item={item} />
        ))}
      </div>
      <details className="group">
        <summary className="cursor-pointer font-display text-xl font-semibold text-monster-deep">
          {hitter ? "Pitching attributes" : "Hitting, fielding and running attributes"}
        </summary>
        <div className="mt-4 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {secondary.map((g) => (
            <Group key={g.title} group={g} item={item} />
          ))}
        </div>
      </details>
    </div>
  )
}
