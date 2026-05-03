import { NavLink, Outlet } from "react-router-dom";
import {
  Home,
  History,
  GraduationCap,
  UserCircle2,
} from "lucide-react";
import { Gamepad2 } from "lucide-react";

const linkBase =
  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all";
const inact = "text-slate-600 hover:bg-sky-50 hover:text-slate-900";
const act =
  "bg-sky-100 text-sky-900 shadow-sm ring-1 ring-sky-200";

const navItems = [
  { to: "/", end: true, label: "Analyze", icon: Home },
  { to: "/history", label: "History", icon: History },
  { to: "/quiz", label: "Quiz", icon: Gamepad2 },
  { to: "/about", label: "Project", icon: GraduationCap },
  { to: "/auth", label: "Account", icon: UserCircle2 },
] as const;

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
              <span className="text-sky-600 font-bold">TV</span>
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900">TRUEVERSE</p>
              <p className="text-xs text-slate-500">
                Misinformation Intelligence
              </p>
            </div>
          </div>

          {/* NAVBAR */}
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? act : inact}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        <p>
          TRUEVERSE — AI-powered fake news detection platform.  
          Always verify important information from trusted sources.
        </p>
      </footer>

    </div>
  );
}