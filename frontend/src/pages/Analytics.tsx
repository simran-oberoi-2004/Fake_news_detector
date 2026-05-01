import { useEffect, useId, useState, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Pie,
  Cell,
  PieChart,
} from "recharts";
import { Activity, Cpu, Database, PieChart as PieIcon, Server } from "lucide-react";
import { apiHealth, apiMetrics, apiUsage } from "../lib/api";
import { loadHistory, clearHistory } from "../lib/history";
import type { HealthResponse, HistoryItem } from "../types";

const PIE_COLORS = ["#0284c7", "#0ea5e9", "#d97706", "#e11d48", "#6366f1", "#2563eb"];

const TIP: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  color: "#1e293b",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
};

export function Analytics() {
  const barGradA = `bench-${useId().replace(/:/g, "")}`;
  const barGradB = `use-${useId().replace(/:/g, "")}`;

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [usage, setUsage] = useState<{
    totals: { predictions: number; url_runs: number };
    by_model: Record<string, number>;
    by_verdict_category: Record<string, number>;
  } | null>(null);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    (async () => {
      setLoadError(null);
      try {
        const [h, u, m] = await Promise.all([apiHealth(), apiUsage(), apiMetrics()]);
        setHealth(h);
        setUsage(u);
        setMetrics(m);
      } catch (e) {
        setLoadError(
          e instanceof Error ? e.message : "API unreachable (start uvicorn on 8000)"
        );
      }
    })();
  }, []);

  const fromHistory = (key: "label" | "verdict") => {
    const m: Record<string, number> = {};
    for (const row of history) {
      const v = key === "label" ? row.result.label || "?" : row.result.verdict?.key || "?";
      m[v] = (m[v] || 0) + 1;
    }
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  };

  const modelsBlock = metrics?.models as
    | Record<string, { name?: string; approx_accuracy?: number; avg_latency_ms?: number }>
    | undefined;
  const modelCompare =
    modelsBlock && Object.keys(modelsBlock).length
      ? Object.entries(modelsBlock)
          .filter(([, v]) => v && typeof v.approx_accuracy === "number")
          .map(([k, v]) => ({
            name: v.name || k,
            acc: Math.round((v.approx_accuracy as number) * 100),
            ms: v.avg_latency_ms ?? 0,
          }))
      : [
          { name: "Hybrid (BERT + RF)", acc: 62, ms: 200 },
          { name: "TF–IDF baseline", acc: 60, ms: 50 },
          { name: "Keyword", acc: 55, ms: 5 },
        ];

  const dataset = metrics?.dataset as
    | { name?: string; statements?: number }
    | undefined;

  const labelPie = fromHistory("label");
  const verdictPie = fromHistory("verdict");
  const serverModelBar = usage
    ? Object.entries(usage.by_model).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-10 sm:space-y-12">
      <section>
        <p className="mb-2 text-2xs font-bold uppercase tracking-[0.2em] text-sky-800">
          Dashboard
        </p>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Analytics & <span className="text-gradient">insight</span>
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-slate-600 sm:text-base">
          Session activity from the API, reference benchmarks, and on-device
          history — without sending your text to a third party.
        </p>
      </section>

      {loadError && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
          {loadError} — You can still view charts that use your browser history.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Server, label: "Service", v: health ? health.service || "TRUEVERSE" : "…" },
          { icon: Cpu, label: "Hybrid (BERT+RF)", v: health?.hybrid_loaded ? "ready" : "n/a" },
          { icon: Database, label: "Baseline (TF–IDF)", v: health?.baseline_loaded ? "ready" : "n/a" },
          { icon: Activity, label: "Session API calls", v: String(usage?.totals.predictions ?? "—") },
        ].map((c) => (
          <div
            key={c.label}
            className="glass-panel p-4 transition hover:shadow-md"
          >
            <c.icon className="mb-3 h-5 w-5 text-sky-600" />
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
              {c.label}
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{c.v}</p>
          </div>
        ))}
      </div>

      {dataset && (
        <div className="glass-panel p-6 sm:p-8">
          <div className="mb-1 flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
              Reference dataset
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {dataset.name}
            {dataset.statements != null && (
              <span> — {dataset.statements.toLocaleString()} statements</span>
            )}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">Model reference (API)</h2>
          </div>
          <div className="h-72 w-full min-w-0 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  Array.isArray(modelCompare) && modelCompare.length
                    ? modelCompare
                    : [{ name: "—", acc: 0, ms: 0 }]
                }
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={64}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  domain={[0, 100]}
                  width={32}
                />
                <Tooltip
                  contentStyle={TIP}
                  labelStyle={{ color: "#64748b" }}
                />
                <defs>
                  <linearGradient id={barGradA} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <Bar dataKey="acc" fill={`url(#${barGradA})`} name="acc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-900 sm:text-base">
            Server: predictions by model
          </h2>
          {serverModelBar.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-center text-sm text-slate-500 sm:h-80">
              No API-side predictions in this process yet. Run a few tests from
              Analyze.
            </div>
          ) : (
            <div className="h-72 w-full min-w-0 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serverModelBar}
                  layout="vertical"
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <XAxis type="number" tick={{ fill: "#64748b" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <Tooltip contentStyle={TIP} />
                  <defs>
                    <linearGradient id={barGradB} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="value" name="value" fill={`url(#${barGradB})`} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">Browser: label mix</h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearHistory();
                  setHistory([]);
                }}
                className="text-2xs font-bold uppercase text-rose-600 hover:text-rose-800"
              >
                Clear history
              </button>
            )}
          </div>
          {labelPie.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">No local history yet.</p>
          ) : (
            <div className="h-64 w-full min-w-0 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={labelPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={80}
                    paddingAngle={2}
                    label
                  >
                    {labelPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-900 sm:text-base">Browser: verdict mix</h2>
          {verdictPie.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">No verdicts in local history.</p>
          ) : (
            <div className="h-64 w-full min-w-0 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verdictPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={84}
                    paddingAngle={2}
                    label
                  >
                    {verdictPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
