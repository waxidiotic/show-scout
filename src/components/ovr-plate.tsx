import { rarityVar } from "@/lib/format"
import { cn } from "@/lib/utils"

interface OvrPlateProps {
  ovr: number | undefined
  rarity: string | undefined
  className?: string
}

/** Overall rating on a plate colored by card rarity. */
export function OvrPlate({ ovr, rarity, className }: OvrPlateProps) {
  return (
    <span
      role="img"
      aria-label={`Overall ${ovr ?? "unknown"}, ${rarity ?? "common"}`}
      className={cn(
        "num inline-flex h-9 min-w-11 items-center justify-center rounded-md px-2 text-2xl font-bold leading-none text-white",
        className,
      )}
      style={{ backgroundColor: rarityVar(rarity) }}
    >
      {ovr ?? "—"}
    </span>
  )
}
