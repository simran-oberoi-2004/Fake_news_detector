import { Award, Heart, Rocket, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";

const milestones = [
  { y: "Discovery", t: "Problem framing & literature on misinformation" },
  { y: "Design", t: "UX for transparent scores, not black-box alerts" },
  { y: "Build", t: "Hybrid + baseline models, API, and this React client" },
  { y: "Validate", t: "Benchmarks, user testing, and documented limitations" },
];

export function AboutProject() {
  return (
    <div className="space-y-12 pb-8 sm:space-y-16">
      <PageHero
        kicker="Final year project"
        title="TRUEVERSE — misinformation analysis for the open web"
        imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
        imageAlt="Team collaboration"
        subtitle="A capstone project delivering an industry-style interface: analyze claims, understand model behavior on the Analytics dashboard, and read the Research & Methodology sections for full academic context."
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-2xs font-semibold uppercase tracking-wide text-sky-800">
            NLP
          </span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-2xs font-semibold uppercase tracking-wide text-sky-800">
            Explainable AI
          </span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-2xs font-semibold uppercase tracking-wide text-sky-800">
            AI for social good
          </span>
        </div>
      </PageHero>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80"
            alt="Developer workspace with laptop"
            className="h-44 w-full object-cover"
            loading="lazy"
          />
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-2 text-sky-800">
              <Rocket className="h-5 w-5" />
              <h2 className="font-display text-lg font-bold">Project goals</h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li className="flex gap-2">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                Demonstrate a responsible detector UI with limitations visible to users
              </li>
              <li className="flex gap-2">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                Compare hybrid and lightweight baselines in one deployment
              </li>
              <li className="flex gap-2">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                Pair automation with media-literacy and research documentation
              </li>
            </ul>
            <Link to="/" className="btn-primary mt-6 inline-flex text-sm">
              Open Analyze
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sky-800">
            <Award className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold">Highlights for reviewers</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            End-to-end story: problem statement (Research), technical stack (Methodology), interactive demo (home), and operational metrics (Analytics) — presented in a consistent light blue product shell suitable for a portfolio and defense.
          </p>
          <div className="mt-6 space-y-4">
            {milestones.map((m) => (
              <div
                key={m.y}
                className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm"
              >
                <span className="shrink-0 rounded-lg bg-sky-600 px-2 py-1 text-2xs font-bold text-white">
                  {m.y}
                </span>
                <p className="text-sm text-slate-700">{m.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-sky-200/90 bg-sky-600 p-8 text-center text-white sm:p-12">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <Heart className="mx-auto h-8 w-8 text-sky-100" />
        <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Acknowledgment</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-sky-100">
          Thanks to your institution, project guide, and peers who supported experiments and review. TRUEVERSE is an educational system — always corroborate critical claims with independent, authoritative sources.
        </p>
      </section>
    </div>
  );
}
