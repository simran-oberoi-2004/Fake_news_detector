import { useEffect, useMemo, useState } from "react";
import { deleteServerHistory, getServerHistory } from "../lib/api";
import type { HistoryItem } from "../types";

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [minConfidence, setMinConfidence] = useState("");
  const [days, setDays] = useState("0");

  const dateFrom = useMemo(() => {
    const d = Number(days || 0);
    if (!d || d <= 0) return undefined;
    return Date.now() - d * 24 * 60 * 60 * 1000;
  }, [days]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await getServerHistory({
        date_from: dateFrom,
        verdict: verdict || undefined,
        min_confidence: minConfidence ? Number(minConfidence) / 100 : undefined,
      });
      if (res.error) {
        setErr(res.error);
        setItems([]);
      } else {
        setItems(res.items || []);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xs font-bold uppercase tracking-[0.2em] text-sky-800">User data</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Persistent history</h1>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <input
          className="input-field"
          placeholder="Verdict key (fake/reliable...)"
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Min confidence %"
          value={minConfidence}
          onChange={(e) => setMinConfidence(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Last N days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading..." : "Apply filters"}
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          onClick={async () => {
            const ok = window.confirm("Delete all history?");
            if (!ok) return;
            const res = await deleteServerHistory();
            if (res.error) setErr(res.error);
            await load();
          }}
        >
          Delete history
        </button>
      </div>

      {err && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{err}</div>}

      <div className="space-y-3">
        {items.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800">
                {new Date(row.t).toLocaleString()} • {row.kind.toUpperCase()}
              </p>
              {row.share_id && (
                <a
                  href={`/result/${row.share_id}`}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900"
                >
                  Open share link
                </a>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-700 line-clamp-3">{row.input}</p>
            <p className="mt-2 text-xs text-slate-500">
              Verdict: {row.result.verdict?.key || row.result.label || "unknown"} • Confidence:{" "}
              {Math.round((row.result.confidence || 0) * 100)}%
            </p>
          </div>
        ))}
        {!items.length && !loading && (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No records found. Login first and run analysis to save history.
          </p>
        )}
      </div>
    </div>
  );
}
