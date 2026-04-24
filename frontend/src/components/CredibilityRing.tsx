import { useId } from "react";

type Props = { value: number; size?: number; className?: string };

export function CredibilityRing({ value, size = 120, className = "" }: Props) {
  const gradId = useId().replace(/:/g, "");
  const v = Math.min(100, Math.max(0, value));
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient
            id={gradId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
          {v}
        </span>
        <span className="text-2xs font-medium uppercase tracking-wider text-slate-500">
          score
        </span>
      </div>
    </div>
  );
}
