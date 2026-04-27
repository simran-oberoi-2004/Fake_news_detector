import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Home,
  LayoutGrid,
  Microscope,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const linkBase =
  "group flex items-center gap-1.5 rounded-full px-3 py-2 text-2xs font-medium transition-all sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-sm";
const inact = "text-slate-600 hover:bg-sky-50 hover:text-slate-900";
const act =
  "bg-gradient-to-r from-sky-100/95 to-blue-100/80 text-sky-900 ring-1 ring-sky-200/90 shadow-sm";

const navItems = [
  { to: "/", end: true, label: "Analyze", icon: Home },
  { to: "/research", label: "Research", icon: BookOpen },
  { to: "/methodology", label: "Methodology", icon: Microscope },
  { to: "/media-literacy", label: "Media literacy", icon: ShieldCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/insights", label: "How it works", icon: LayoutGrid },
  { to: "/about", label: "Project", icon: GraduationCap },
] as const;

export function Layout() {
  return (
    <div className="relative min-h-screen text-slate-800">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-slate-50" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-mesh-hero"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-grid-fine bg-grid bg-noise opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-glow-btm"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-24 top-0 -z-10 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-20 bottom-20 -z-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-sky-100/90 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-start">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-sky-400/50 to-blue-500/40 opacity-70 blur" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200/80 bg-white shadow-md">
                    <Sparkles className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-display truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                    TRUEVERSE
                  </p>
                  <p className="text-2xs font-medium uppercase tracking-widest text-slate-500 sm:text-2xs">
                    Misinformation intelligence
                  </p>
                </div>
              </div>
            </div>
            <nav
              className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-start gap-1.5 sm:gap-1 lg:justify-end lg:overflow-x-auto lg:pb-0.5 [scrollbar-width:thin]"
              aria-label="Primary"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) => `${linkBase} ${isActive ? act : inact} shrink-0`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-0 mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
        <Outlet />
      </main>

      <footer className="relative z-0 border-t border-sky-200/80 bg-gradient-to-b from-sky-50/50 to-white/90 py-10 text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=100&auto=format&fit=crop&q=70"
            alt="Abstract technology collaboration"
            className="h-14 w-40 rounded-xl object-cover shadow-md ring-1 ring-sky-200/50"
            loading="lazy"
          />
        </div>
        <p className="mx-auto max-w-lg text-2xs text-slate-500 sm:text-xs">
          AI for Social Good. Always cross-check high-stakes claims with trusted
          fact-checkers. TRUEVERSE supports literacy — it does not replace
          professional journalism.
        </p>
      </footer>
    </div>
  );
}
