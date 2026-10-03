import type { HistoryRow } from "@/lib/types"

/** Fallback for API arrays whose shape we could not recognize. */
export function GenericTable({
  rows,
  limit = 15,
}: {
  rows: HistoryRow[]
  limit?: number
}) {
  const shown = rows.slice(0, limit)
  const columns = [...new Set(shown.flatMap((r) => Object.keys(r)))].slice(0, 6)

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-paper">
      <table className="w-full min-w-[24rem] text-left">
        <thead>
          <tr className="bg-muted font-display text-lg font-semibold">
            {columns.map((c) => (
              <th key={c} scope="col" className="px-3 py-2">
                {c.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id
            <tr key={i} className="border-t border-border">
              {columns.map((c) => (
                <td key={c} className="num px-3 py-1.5 text-lg">
                  {String(row[c] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
