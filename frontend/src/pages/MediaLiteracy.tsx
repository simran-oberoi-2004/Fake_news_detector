import { CheckCircle2, ExternalLink, Globe, Search } from "lucide-react";
import { PageHero } from "../components/PageHero";

const sift = [
  { t: "Stop", d: "Before sharing, pause — high emotion is a common manipulation lever." },
  { t: "Investigate the source", d: "Open the about page, see who funds the outlet, and compare to known standards." },
  { t: "Find better coverage", d: "Search for the claim independently; look for wire services and local reporting." },
  { t: "Trace claims to evidence", d: "Follow links to study abstracts, government releases, or named officials." },
];

const habits = [
  "Prefer original documents (reports, dockets, preprints) over reposts.",
  "Reverse image search for suspicious photos; check date and place.",
  "Beware of screenshots — verify on the live page when possible.",
  "Cross-check with regional fact-checkers and international agencies for global stories.",
];

export function MediaLiteracy() {
  return (
    <div className="space-y-12 pb-8 sm:space-y-16">
      <PageHero
        kicker="Media literacy & verification"
        title="Build habits that outlast any single app"
        imageUrl="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80"
        imageAlt="Person reading and taking notes — thoughtful media consumption"
        subtitle="TRUEVERSE can score text, but strong readers still verify sources, look for primary evidence, and use structured frameworks like SIFT. This page is a practical complement to the detector — not a replacement for professional fact-checking."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-2 text-sky-800">
            <Search className="h-5 w-5" />
            <h2 className="font-display text-xl font-bold text-slate-900">The SIFT method</h2>
          </div>
          <p className="text-sm text-slate-600">
            Widely taught in digital literacy programs: a short checklist before you amplify a dramatic claim.
          </p>
          <ul className="mt-6 space-y-4">
            {sift.map((s) => (
              <li key={s.t} className="flex gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-100 text-2xs font-bold text-sky-800">
                  {s.t[0]}
                </span>
                <span>
                  <span className="font-semibold text-slate-900">{s.t}</span> — {s.d}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-sky-200/80">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80"
            alt="Collaboration and learning"
            className="h-48 w-full object-cover sm:h-full sm:min-h-[320px]"
            loading="lazy"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-sky-950/85 via-sky-900/40 to-transparent p-6 sm:p-8">
            <Globe className="h-8 w-8 text-white/90" />
            <p className="mt-3 font-display text-lg font-bold text-white">Lateral reading</p>
            <p className="mt-1 max-w-md text-sm text-sky-100/95">
              Open a new tab and let search engines and encyclopedic sources ground the claim. One site should never be the only stop.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">Verification habits</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {habits.map((h) => (
            <div
              key={h}
              className="flex gap-2 rounded-xl border border-sky-50 bg-sky-50/50 px-3 py-2.5 text-sm text-slate-700"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              {h}
            </div>
          ))}
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>Explore signatories and standards:</span>
          <a
            href="https://www.poynter.org/ifcn/"
            className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-900"
            target="_blank"
            rel="noreferrer"
          >
            International Fact-Checking Network (Poynter) <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>
      </section>
    </div>
  );
}
