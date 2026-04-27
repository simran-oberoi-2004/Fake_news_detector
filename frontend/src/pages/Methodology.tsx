import { Beaker, Cpu, Database, GitBranch, Layers, LineChart } from "lucide-react";
import { PageHero } from "../components/PageHero";

const stack = [
  { icon: GitBranch, label: "Input layer", text: "UTF-8 text, .txt / .md uploads, or article fetch from a public URL (when the API is configured)." },
  { icon: Layers, label: "Representation", text: "When trained, hybrid paths use transformer embeddings; baselines use TF–IDF vectors; heuristics scan for sensational and trust language." },
  { icon: Cpu, label: "Models", text: "Hybrid (BERT + Random Forest), TF–IDF baseline, keyword rules, and an Auto path that tries the best available model." },
  { icon: Beaker, label: "Output", text: "Label, confidence, credibility score 0–100, optional verdict category, and explainable factors plus highlighted terms." },
];

const evalRows = [
  { metric: "Task framing", value: "Statement- or document-level binary / graded classification (per API training)" },
  { metric: "Typical data", value: "LIAR / PolitiFact-style public benchmarks (when you train locally)" },
  { metric: "What we show users", value: "Accuracy references on the Analytics view when the backend exposes `metrics`" },
  { metric: "Latency", value: "Trades speed vs. quality: baseline & keyword are fast; hybrid is richer but slower" },
];

export function Methodology() {
  return (
    <div className="space-y-12 pb-8 sm:space-y-16">
      <PageHero
        kicker="Technical methodology"
        title="From raw text to an interpretable score"
        imageUrl="https://images.unsplash.com/photo-1639762681485-074b7c9382e0?w=1200&auto=format&fit=crop&q=80"
        imageAlt="Analytical and code-oriented workspace"
        subtitle="A concise architecture view of TRUEVERSE: preprocessing, model routing, and explainable outputs. Use this as the methodology section of your final-year report — aligned with the actual Analyze and Analytics features."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {stack.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.label}
              className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-xl bg-sky-50 p-2 ring-1 ring-sky-100">
                <Icon className="h-5 w-5 text-sky-700" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">{s.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 overflow-hidden rounded-3xl border border-sky-200/80 bg-white shadow-sm lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center p-8 sm:p-10 lg:order-1">
          <div className="mb-3 flex items-center gap-2 text-sky-800">
            <LineChart className="h-6 w-6" />
            <span className="text-2xs font-bold uppercase tracking-widest">End-to-end flow</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Pipeline overview</h2>
          <ol className="mt-6 space-y-3 text-sm text-slate-700">
            {[
              "Request hits the FastAPI (or your backend) prediction route with text, URL, or file-derived content.",
              "The service selects a model: user choice or Auto, which prioritises hybrid quality when assets exist.",
              "For URL mode, the article is normalized to extract readable text and title where possible.",
              "Post-process: style signals, optional XAI string factors, and mapping to a credibility band for the ring UI.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-sky-600 font-mono text-xs tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative order-1 min-h-[260px] lg:order-2">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80"
            alt="Dashboard and charts representing model evaluation"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-900/40 to-transparent" />
        </div>
      </section>

      <section className="glass-panel p-0 overflow-hidden sm:flex">
        <div className="shrink-0 self-stretch bg-sky-600/90 p-6 text-white sm:max-w-[200px] sm:p-8">
          <Database className="h-8 w-8 opacity-90" />
          <p className="mt-4 text-sm font-semibold leading-snug">Dataset &amp; evaluation lens</p>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-sm text-slate-600">
            Reporting methodology transparently: note which split you use for test accuracy, and document any domain shift (e.g. training on politics but testing on health). The Analytics page surfaces reference figures when the API provides them.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-4">Topic</th>
                  <th className="py-2">Project stance</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {evalRows.map((r) => (
                  <tr key={r.metric} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{r.metric}</td>
                    <td className="py-3">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
