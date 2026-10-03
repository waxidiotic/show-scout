import type { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import appCss from "@/styles.css?url"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Show Scout" },
      {
        name: "description",
        content:
          "Browse MLB The Show market prices, player cards and captains. Unofficial fan project.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const navLink =
  "font-display text-xl font-semibold tracking-wide text-white/80 hover:text-white border-b-4 border-transparent py-2"

function RootLayout() {
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="wall relative">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-8 gap-y-2 px-5 pt-5">
          <Link
            to="/market"
            className="font-display text-4xl font-bold leading-none tracking-wide text-white sm:text-5xl"
          >
            Show Scout
          </Link>
          <nav aria-label="Main" className="flex gap-6">
            <Link
              to="/market"
              className={navLink}
              activeProps={{ className: "!border-bulb !text-white" }}
            >
              Market
            </Link>
            <Link
              to="/captains"
              className={navLink}
              activeProps={{ className: "!border-bulb !text-white" }}
            >
              Captains
            </Link>
            <Link
              to="/rosters"
              className={navLink}
              activeProps={{ className: "!border-bulb !text-white" }}
            >
              Rosters
            </Link>
          </nav>
        </div>
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-1 origin-left bg-bulb transition-transform duration-500 ${
            isLoading ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-sm text-muted-foreground">
        <p className="mx-auto max-w-6xl px-5">
          Unofficial fan project. Data comes from the public MLB The Show API and is not
          affiliated with San Diego Studio, Sony or MLB.
        </p>
      </footer>
    </div>
  )
}
