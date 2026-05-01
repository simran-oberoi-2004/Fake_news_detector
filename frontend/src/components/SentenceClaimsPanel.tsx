import clsx from "clsx";

type SentenceClaim = {
  sentence: string;
  label: string;
  confidence: number;
  confidence_pct: number;
  severity: "high" | "medium" | "safe";
};

function claimStyle(severity: SentenceClaim["severity"]) {
  if (severity === "high") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }
  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

export function SentenceClaimsPanel({ claims }: { claims?: SentenceClaim[] }) {
  if (!claims?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-5">
      <p className="text-2xs font-bold uppercase tracking-widest text-slate-500">
        Sentence-level claim scan
      </p>
      <p className="mt-1 text-2xs text-slate-500">
        Hover any line to see model confidence.
      </p>
      <div className="mt-3 space-y-2">
        {claims.map((claim, idx) => (
          <div
            key={`${idx}-${claim.sentence.slice(0, 18)}`}
            title={`Confidence: ${claim.confidence_pct}% | Label: ${claim.label}`}
            className={clsx("rounded-lg border px-3 py-2 text-xs leading-relaxed", claimStyle(claim.severity))}
          >
            {claim.sentence}
          </div>
        ))}
      </div>
    </div>
  );
}
