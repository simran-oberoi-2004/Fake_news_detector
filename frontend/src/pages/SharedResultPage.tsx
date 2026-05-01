import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedResult } from "../lib/api";
import { CredibilityRing } from "../components/CredibilityRing";

export function SharedResultPage() {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{
    share_id?: string;
    input?: string;
    result?: {
      label?: string;
      confidence?: number;
      verdict?: { title?: string; description?: string };
      credibility_score_0_100?: number;
    };
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!shareId) {
        setErr("Missing share id");
        setLoading(false);
        return;
      }
      try {
        const res = await getSharedResult(shareId);
        if (res.error) setErr(res.error);
        else setData(res);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load shared result");
      } finally {
        setLoading(false);
      }
    })();
  }, [shareId]);

  if (loading) return <p className="text-sm text-slate-500">Loading shared result...</p>;
  if (err) return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{err}</p>;
  if (!data?.result) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-2xs font-bold uppercase tracking-[0.2em] text-sky-800">Shared result</p>
      <h1 className="font-display text-2xl font-bold text-slate-900">{data.result.label}</h1>
      <p className="text-sm text-slate-600">{data.result.verdict?.description}</p>
      {data.result.credibility_score_0_100 != null && (
        <div className="w-fit">
          <CredibilityRing value={data.result.credibility_score_0_100} size={120} />
        </div>
      )}
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{data.input}</p>
    </div>
  );
}
