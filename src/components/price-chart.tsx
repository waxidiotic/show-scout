import type { HistoryPoint } from "@/lib/history"

const W = 720
const H = 240
const PAD = { top: 12, right: 16, bottom: 28, left: 64 }

function path(points: { x: number; y: number }[]) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")
}

export function PriceChart({ points }: { points: HistoryPoint[] }) {
  const values = points
    .flatMap((p) => [p.buyNow, p.sellNow])
    .filter((v): v is number => v !== null)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const span = rawMax - rawMin || Math.max(rawMax, 1)
  const min = Math.max(0, rawMin - span * 0.1)
  const max = rawMax + span * 0.1

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) =>
    PAD.left + (points.length === 1 ? 0 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * innerH

  const series = (key: "buyNow" | "sellNow") =>
    points.flatMap((p, i) =>
      p[key] === null ? [] : [{ x: x(i), y: y(p[key] as number) }],
    )

  const ticks = [0, 1, 2, 3].map((i) => min + ((max - min) * i) / 3)
  const first = points[0]
  const last = points[points.length - 1]

  return (
    <figure>
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-base">
        <span className="flex items-center gap-2">
          <span className="h-1 w-6 rounded bg-sox" /> Buy now
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1 w-6 rounded bg-monster" /> Sell now
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-labelledby="price-chart-title"
      >
        <title id="price-chart-title">{`Price history from ${first?.label} to ${last?.label}`}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--rule)"
            />
            <text
              x={PAD.left - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="num"
              fontSize="15"
              fill="var(--ink-soft)"
            >
              {Math.round(t).toLocaleString("en-US")}
            </text>
          </g>
        ))}
        <path
          d={path(series("buyNow"))}
          fill="none"
          stroke="var(--sox)"
          strokeWidth="2.5"
        />
        <path
          d={path(series("sellNow"))}
          fill="none"
          stroke="var(--monster)"
          strokeWidth="2.5"
        />
        <text x={PAD.left} y={H - 6} className="num" fontSize="15" fill="var(--ink-soft)">
          {first?.label}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
          className="num"
          fontSize="15"
          fill="var(--ink-soft)"
        >
          {last?.label}
        </text>
      </svg>
    </figure>
  )
}
