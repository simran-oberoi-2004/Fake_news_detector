import { BookOpen, Microscope, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { PageHero } from "../components/PageHero";

const researchBlocks = [
  {
    icon: Users,
    title: "Societal scale",
    body: "False or misleading content spreads faster than corrections on many networks. It erodes trust in institutions, harms public health when medical claims are fabricated, and can inflame social divisions during elections or crises.",
  },
  {
    icon: ShieldAlert,
    title: "Why it is a wicked problem",
    body: "Satire, opinion, and incomplete context are not the same as deliberate fabrication — yet all can look like “news” in a feed. Cheap generation tools and coordinated campaigns increase volume, so manual review alone does not scale.",
  },
  {
    icon: TrendingUp,
    title: "Detection vs. literacy",
    body: "Automatic classifiers are probabilistic: they can flag risk and surface cues, but they should support human judgment — not replace it. The sustainable path pairs algorithms with source verification, lateral reading, and transparent explanations.",
  },
  {
    icon: Microscope,
    title: "What research measures",
    body: "Academic and industry work typically evaluates statement-level or article-level classification on labeled corpora (e.g., PolitiFact-style fact-checks), and increasingly emphasizes robustness, fairness across topics, and interpretability to end users.",
  },
];

const howWeTackle = [
  {
    title: "Ingestion & model routing",
    detail:
      "TRUEVERSE accepts text, file snippets, and public URLs, then runs a model ladder — hybrid transformer + classical baselines, or keyword heuristics when that is the best available path.",
  },
  {
    title: "Credibility signal, not a verdict on truth",
    detail:
      "Outputs are framed as credibility and confidence with clear uncertainty. Sensational, hedging, and trust phrasing are highlighted so you can see language-level cues the system reacted to.",
  },
  {
    title: "Explainable signals (XAI)",
    detail:
      "Alongside a label, we surface factors researchers associate with misinformation: semantic scoring, style markers, and short natural-language factors — so the interface stays inspectable, not a black box.",
  },
  {
    title: "Local-first analytics",
    detail:
      "Run history in your browser helps you study patterns in your own checks without a third party storing your text by default, aligning with privacy expectations for a student/institution deployment.",
  },
];

export function Research() {
  return (
    <div className="space-y-12 pb-8 sm:space-y-16">
      <PageHero
        kicker="Research & problem statement"
        title="Understanding the fake news crisis — and how we address it"
        imageUrl="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80"
        imageAlt="Newspapers and information spread — editorial photography"
        subtitle="This page summarises the research landscape: what makes online misinformation harmful, why automated detection is challenging, and how TRUEVERSE combines NLP models with transparent cues to help readers think before they share."
      />

      <section>
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-sky-700" />
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">The research picture</h2>
        </div>
        <p className="max-w-3xl text-pretty text-slate-600">
          “Fake news” is often used loosely. In research, teams distinguish false claims, misleading spin, imposter sites, and manipulated media. The common thread: content presented as reliable news that can mislead audiences at scale.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {researchBlocks.map((b) => {
            const Icon = b.icon;
            return (
              <article
                key={b.title}
                className="group rounded-2xl border border-sky-100/90 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-sky-50 p-2.5 ring-1 ring-sky-100">
                  <Icon className="h-6 w-6 text-sky-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-blue-50/50 lg:grid-cols-2">
        <div className="relative min-h-[220px]">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80"
            alt="Abstract global data network representing connected information"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-900/50 to-transparent" />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">How TRUEVERSE traces and tackles the problem</h2>
          <p className="mt-3 text-sm text-slate-600">
            In this project, “tackle” means combining detection models with interpretable presentation — not claiming infallible truth. Below is the approach aligned with the running application.
          </p>
          <ol className="mt-6 space-y-4">
            {howWeTackle.map((h, i) => (
              <li key={h.title} className="flex gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-2xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{h.title}</p>
                  <p className="mt-0.5 leading-relaxed text-slate-600">{h.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="glass-panel p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">Academic and policy context</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          International bodies and fact-checking coalitions (e.g. IFCN signatories) promote transparent methodology, non-partisanship, and funding disclosure. Our tool is designed as coursework / research software: it should complement those practices by
          nudging users toward triangulation with primary sources and professional fact-checkers, especially for high-stakes claims (health, finance, elections).
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          Limitations matter: classifiers can reflect dataset bias; adversarial rewrites may evade detection; and short headlines lack context. That is why TRUEVERSE shows confidence, model name, and language-level cues next to the headline result.
        </p>
      </section>
    </div>
  );
}
