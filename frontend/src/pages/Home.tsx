import { useState } from "react";
import {
  CheckCircle2,
  Link2,
  Loader2,
  FileText,
  Wand2,
  AlertCircle,
} from "lucide-react";
import type { ModelChoice, PredictResponse } from "../types";
import { predictText, predictUrl } from "../lib/api";
import { pushHistory } from "../lib/history";
import { HighlightedText } from "../components/HighlightedText";
import { CredibilityRing } from "../components/CredibilityRing";
import clsx from "clsx";

const models: { value: ModelChoice; label: string; hint: string }[] = [
  { value: "auto", label: "Auto (best available)", hint: "Hybrid → baseline → keyword" },
  { value: "hybrid", label: "Hybrid (BERT + RF)", hint: "Highest quality if trained" },
  { value: "baseline", label: "Baseline (TF–IDF)", hint: "Fast, lightweight" },
  { value: "keyword", label: "Keyword heuristics", hint: "Rule-based screening" },
];

const examples = [
  "Scientists discovered aliens on Mars yesterday.",
  "The stock market closed higher today on strong earnings reports.",
  "COVID-19 vaccines underwent large randomized controlled trials before approval.",
  "The moon is made of green cheese, according to leaked documents.",
];

function labelStyles(label?: string) {
  const l = (label || "").toLowerCase();
  if (l === "real")
    return {
      text: "text-emerald-800",
      pill: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    };
  if (l === "fake")
    return {
      text: "text-rose-800",
      pill: "bg-rose-100 text-rose-900 ring-rose-200",
    };
  return {
    text: "text-amber-800",
    pill: "bg-amber-100 text-amber-900 ring-amber-200",
  };
}

function resultCardClass(res: PredictResponse) {
  const l = (res.label || "").toLowerCase();
  if (l === "real")
    return "border-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_8px_30px_-4px_rgba(16,185,129,0.12)]";
  if (l === "fake")
    return "border-rose-200 shadow-[0_0_0_1px_rgba(244,63,94,0.15),0_8px_30px_-4px_rgba(244,63,94,0.1)]";
  return "border-amber-200/80";
}

export function Home() {
  const [tab, setTab] = useState<"text" | "url" | "file">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [model, setModel] = useState<ModelChoice>("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onAnalyze() {
    setErr(null);
    setResult(null);
    setLoading(true);
    try {
      if (tab === "url") {
        if (!url.trim()) {
          setErr("Please enter a URL.");
          setLoading(false);
          return;
        }
        const data = await predictUrl(url.trim(), model);
        if (data.error) setErr(data.error);
        else {
          setResult(data);
          pushHistory("url", url, data);
        }
      } else {
        if (!text.trim()) {
          setErr("Please enter some text.");
          setLoading(false);
          return;
        }
        const data = await predictText(text.trim(), model);
        if (data.error) setErr(data.error);
        else {
          setResult(data);
          pushHistory("text", text, data);
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed. Is the API running on :8000?");
    } finally {
      setLoading(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result || "");
      setText(s.slice(0, 15000));
      setTab("text");
    };
    reader.readAsText(f);
  }

  const previewText = result?.text_preview || result?.full_text || text;
  const highlights = result?.highlight_terms || [];
  const ls = labelStyles(result?.label);

  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="grid gap-8 overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/50 p-6 shadow-sm sm:grid-cols-2 sm:p-8 sm:gap-10">
        <div className="relative min-h-[200px] overflow-hidden rounded-2xl ring-1 ring-sky-200/50 sm:min-h-[240px]">
          <img
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80"
            alt="News and media context"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-900/30 to-transparent" />
        </div>
        <div className="text-center sm:text-left">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/90 px-3 py-1 text-2xs font-bold uppercase tracking-[0.2em] text-sky-800">
          Live analysis
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-[1.1] text-slate-900 sm:text-4xl md:text-5xl">
          See what&apos;s real —{" "}
          <span className="text-gradient">before you amplify it</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-slate-600 sm:mx-0 sm:text-lg">
          Transformer-backed scoring, classical baselines, and clear language
          signals. Built for the thesis, the newsroom, and the feed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          {[
            { k: "BERT + RF", v: "Hybrid" },
            { k: "LIAR-bench", v: "Data" },
            { k: "XAI hints", v: "Explain" },
          ].map((b) => (
            <div
              key={b.v}
              className="flex items-baseline gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 shadow-sm"
            >
              <span className="text-2xs font-bold uppercase text-slate-500">
                {b.v}
              </span>
              <span className="text-sm font-semibold text-slate-800">{b.k}</span>
            </div>
          ))}
        </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="space-y-5 lg:col-span-2">
          <div className="glass-panel p-1.5 sm:p-2">
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["text", "Text", FileText],
                  ["url", "URL", Link2],
                  ["file", "File", FileText],
                ] as const
              ).map(([k, label, Icon]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={clsx(
                    "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    tab === k
                      ? "bg-gradient-to-r from-sky-500/15 to-blue-500/10 text-slate-900 ring-1 ring-sky-200/80"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-5">
            <label className="mb-2 block text-2xs font-bold uppercase tracking-wider text-slate-500">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelChoice)}
              className="input-field"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value} className="bg-white">
                  {m.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-2xs text-slate-500">
              {models.find((m) => m.value === model)?.hint}
            </p>
          </div>

          {tab === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Paste a headline, paragraph, or post…"
              className="input-field min-h-[12rem] resize-y font-[inherit] leading-relaxed"
            />
          )}

          {tab === "url" && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com/…"
              className="input-field"
            />
          )}

          {tab === "file" && (
            <div className="glass-panel border-2 border-dashed border-slate-200 p-8 text-center">
              <input
                type="file"
                accept=".txt,.md,.text"
                onChange={onFile}
                className="mx-auto block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-sky-800"
              />
              {fileName && (
                <p className="mt-3 text-sm font-medium text-sky-800">Loaded: {fileName}</p>
              )}
              <p className="mt-2 text-2xs text-slate-500">
                Text stays in your browser until you run analysis
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="h-5 w-5" />
            )}
            {loading ? "Scanning…" : "Run analysis"}
          </button>

          {tab === "text" && (
            <div>
              <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-slate-500">
                Quick samples
              </p>
              <div className="space-y-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setText(ex)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left text-2xs leading-snug text-slate-600 transition hover:border-sky-200 hover:bg-white hover:shadow-sm sm:text-xs"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={clsx(
            "min-h-[28rem] rounded-3xl border p-5 sm:min-h-[32rem] sm:p-6 lg:col-span-3",
            "glass-panel relative overflow-hidden",
            result && !err ? resultCardClass(result) : "border-slate-200"
          )}
        >
          <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-sky-200/20 blur-3xl" />
          {err && (
            <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <p className="text-sm text-rose-900">{err}</p>
            </div>
          )}
          {!err && !result && !loading && (
            <div className="flex h-full min-h-[22rem] flex-col items-center justify-center px-4 text-center">
              <div className="animate-float mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-100/80 to-blue-100/50 shadow-sm">
                <Wand2 className="h-10 w-10 text-sky-600" />
              </div>
              <p className="font-display text-lg font-semibold text-slate-800">
                Awaiting your first run
              </p>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                Scores, a credibility ring, and language cues will appear here.
                Ensure the API is on port 8000.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex h-80 flex-col items-center justify-center gap-4 text-slate-500">
              <div className="h-12 w-12 rounded-full border-2 border-sky-200 border-t-sky-600 animate-spin" />
              <p className="text-sm">Processing with your selected model…</p>
            </div>
          )}

          {result && !result.error && (
            <div className="relative space-y-6">
              {result.title && (
                <div>
                  <p className="text-2xs font-bold uppercase tracking-widest text-slate-500">
                    Article
                  </p>
                  <p className="mt-1.5 text-lg font-semibold leading-snug text-slate-900">
                    {result.title}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-bold uppercase tracking-wider ring-1",
                      ls.pill
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Label
                  </span>
                  <p
                    className={clsx(
                      "mt-3 font-display text-3xl font-bold capitalize sm:text-4xl",
                      ls.text
                    )}
                  >
                    {result.label}
                  </p>
                </div>
                {result.credibility_score_0_100 != null && (
                  <div className="shrink-0 self-center sm:self-start">
                    <CredibilityRing value={result.credibility_score_0_100} size={128} />
                    <p className="mt-1 text-center text-2xs text-slate-500">confidence</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-2xs font-bold uppercase text-slate-500">Model confidence</p>
                  <p className="font-display text-2xl font-bold text-sky-700">
                    {Math.round((result.confidence || 0) * 100)}%
                  </p>
                </div>
              </div>

              {result.verdict && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                  <p className="text-2xs font-bold uppercase tracking-widest text-slate-500">
                    Verdict
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-slate-900 sm:text-xl">
                    {result.verdict.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {result.verdict.description}
                  </p>
                </div>
              )}

              {result.credibility_score_0_100 != null && (
                <div>
                  <div className="mb-2 flex justify-between text-2xs font-medium text-slate-500">
                    <span>Signal strength</span>
                    <span>{result.credibility_score_0_100}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(0, result.credibility_score_0_100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {result.explainable_ai && (
                <div>
                  <p className="text-2xs font-bold uppercase tracking-widest text-slate-500">
                    Explainable signals
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{result.explainable_ai.summary}</p>
                  <ul className="mt-3 space-y-1.5">
                    {result.explainable_ai.factors.map((f, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-2xs text-slate-600 sm:text-xs"
                      >
                        <span className="text-sky-600">·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.style_signals && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      ["Sensational", result.style_signals.sensational_hits] as const,
                      ["Hedging", result.style_signals.hedging_hits] as const,
                      ["Trust phrasing", result.style_signals.trust_markers] as const,
                    ] as const
                  ).map(([title, list]) => (
                    <div key={String(title)} className="glass-panel-inset rounded-xl p-3">
                      <p className="text-2xs font-bold uppercase text-slate-500">{title}</p>
                      <p className="mt-1 line-clamp-4 text-2xs text-slate-600 sm:text-xs">
                        {list.length ? list.join(", ") : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {previewText && (
                <div>
                  <p className="mb-2 text-2xs font-bold uppercase text-slate-500">
                    Preview (highlighted cues)
                  </p>
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800">
                    <HighlightedText text={previewText.slice(0, 4000)} terms={highlights} />
                  </div>
                </div>
              )}

              {result.model && (
                <p className="border-t border-slate-200 pt-4 text-2xs text-slate-500">
                  Engine: {result.model}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
