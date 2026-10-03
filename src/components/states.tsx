import { type ErrorComponentProps, Link, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export function ErrorPanel({ error }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="font-display text-4xl font-bold text-monster-deep">
        The Show didn't answer
      </h1>
      <p className="mt-3 text-muted-foreground">
        {error instanceof Error ? error.message : "Something went wrong."}
      </p>
      <p className="mt-1 text-muted-foreground">
        The API may be down or rate limiting requests. Try again in a moment.
      </p>
      <Button className="mt-6" onClick={() => router.invalidate()}>
        Try again
      </Button>
    </div>
  )
}

export function NotFoundPanel() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="font-display text-4xl font-bold text-monster-deep">
        That page is out of the park
      </h1>
      <p className="mt-3 text-muted-foreground">
        Check the address, or head back to the market.
      </p>
      <Button asChild className="mt-6">
        <Link to="/market">Go to the market</Link>
      </Button>
    </div>
  )
}
