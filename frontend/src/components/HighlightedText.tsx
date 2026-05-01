import { useMemo } from "react";

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Props = {
  text: string;
  terms: string[];
  className?: string;
};

export function HighlightedText({ text, terms, className }: Props) {
  const nodes = useMemo(() => {
    const t = (terms || [])
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    if (!t.length) return [text];
    const re = new RegExp(`(${t.map(escapeReg).join("|")})`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) => {
      if (!p) return null;
      const lower = p.toLowerCase();
      const isHit = t.some((x) => lower === x.toLowerCase());
      if (isHit) {
        return (
          <mark
            key={i}
            className="rounded-sm bg-amber-100 px-0.5 font-medium text-amber-900"
          >
            {p}
          </mark>
        );
      }
      return <span key={i}>{p}</span>;
    });
  }, [text, terms]);

  return <span className={className}>{nodes}</span>;
}
