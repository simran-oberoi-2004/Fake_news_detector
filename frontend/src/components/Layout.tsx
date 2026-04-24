import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Home, LayoutGrid, Sparkles } from "lucide-react";

const linkBase =
  "group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all";
const inact = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
const act =
  "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 ring-1 ring-teal-200/80 shadow-sm";

export function Layout() {
  return (
    <div className="relative min-h-screen text-slate-800">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-slate-50" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-mesh-hero"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-grid-fine bg-grid bg-noise opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-glow-btm"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-24 top-0 -z-10 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-20 bottom-20 -z-10 h-72 w-72 rounded-full bg-indigo-200/25 blur-3xl"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-teal-400/50 to-cyan-400/40 opacity-60 blur" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-md">
                <Sparkles className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div>
              <p className="font-display text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                TRUEVERSE
              </p>
              <p className="text-2xs font-medium uppercase tracking-widest text-slate-500">
                Misinformation intelligence
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5">
            <NavLink
              to="/"
              className={({ isActive }) => `${linkBase} ${isActive ? act : inact}`}
              end
            >
              <Home className="h-4 w-4" />
              <span>Analyze</span>
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) => `${linkBase} ${isActive ? act : inact}`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </NavLink>
            <NavLink
              to="/insights"
              className={({ isActive }) => `${linkBase} ${isActive ? act : inact}`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>How it works</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-0 mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
        <Outlet />
      </main>

      <footer className="relative z-0 border-t border-slate-200/90 bg-white/50 py-8 text-center">
        <p className="mx-auto max-w-md text-2xs text-slate-500 sm:text-xs">
          AI for Social Good. Always cross-check high-stakes claims with trusted
          fact-checkers. TRUEVERSE supports literacy — it does not replace
          professional journalism.
        </p>
      </footer>
    </div>
  );
}
