import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  FileSearch,
  Fingerprint,
  Network,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    title: "Ingest",
    body: "Paste text, drop a .txt file, or fetch an article from a public URL. Nothing is stored on our servers by default.",
    tone: "from-cyan-100/90 to-teal-50/80",
  },
  {
    icon: Brain,
    title: "Encode & score",
    body: "Transformer embeddings (when trained) and classical baselines turn language into a credibility signal you can read at a glance.",
    tone: "from-indigo-100/90 to-violet-50/80",
  },
  {
    icon: Fingerprint,
    title: "Explain",
    body: "Surface sensational phrasing, hedging, and trust markers so you see why a score looks the way it does — not just a label.",
    tone: "from-amber-100/80 to-rose-50/80",
  },
];

export function Insights() {
  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/90 to-teal-50/40 p-8 shadow-card sm:p-12">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-3 py-1 text-2xs font-semibold uppercase tracking-widest text-teal-800">
            <Sparkles className="h-3.5 w-3.5" />
            Under the hood
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            A pipeline built for{" "}
            <span className="text-gradient">clarity, not just labels</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            TRUEVERSE pairs modern NLP with simple, honest visuals so students,
            journalists, and everyday readers can reason about what they are
            reading — not scroll past another opaque score.
          </p>
          <Link
            to="/"
            className="btn-primary mt-8 inline-flex shadow-glow"
          >
            Run an analysis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              The flow
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              From raw text to interpretable output in three steps
            </p>
          </div>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:block" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group glass-panel p-6 transition hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${s.tone} p-3 ring-1 ring-slate-200/80 transition group-hover:scale-105`}
                >
                  <Icon className="h-7 w-7 text-slate-800" strokeWidth={1.5} />
                </div>
                <p className="text-2xs font-bold uppercase tracking-widest text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel relative overflow-hidden p-8 sm:p-10">
          <Network className="mb-4 h-8 w-8 text-indigo-600" strokeWidth={1.5} />
          <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
            Models you can reason about
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Hybrid (BERT + Random Forest) for depth, TF–IDF baselines for
            speed, and keyword heuristics as a last resort. Pick &ldquo;Auto&rdquo;
            and we walk that ladder for you.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="flex gap-2">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              Latency and accuracy trade-offs surfaced on the Analytics page
            </li>
            <li className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              Trained on the LIAR / PolitiFact-style benchmark (when you run
              training locally)
            </li>
          </ul>
        </div>
        <div className="glass-panel relative flex flex-col justify-center overflow-hidden p-8 sm:p-10">
          <div
            className="pointer-events-none absolute inset-0 bg-[conic-gradient(at_100%_0%,rgba(45,212,191,0.2),transparent_50%,rgba(99,102,241,0.12))]"
            aria-hidden
          />
          <div className="relative text-center">
            <p className="font-display text-4xl font-extrabold text-gradient sm:text-5xl">
              XAI
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Highlights where language looks sensational, uncertain, or
              trust-building — the same signals researchers study in
              misinformation work.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Semantics", "Tone", "Claims", "Context"].map((t) => (
                <span
                  key={t}
                  className="rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-2xs font-medium text-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
