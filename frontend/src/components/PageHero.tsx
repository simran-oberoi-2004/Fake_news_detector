import type { ReactNode } from "react";

type PageHeroProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  children?: ReactNode;
  /** Optional small label above the title */
  kicker?: string;
};

/**
 * Full-width hero with banner image and light blue gradient overlay.
 */
export function PageHero({ title, subtitle, imageUrl, imageAlt, children, kicker }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-blue-50/80 shadow-sm">
      <div className="grid gap-0 lg:grid-cols-5">
        <div className="relative min-h-[200px] overflow-hidden sm:min-h-[240px] lg:col-span-2">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-600/20 via-sky-500/10 to-transparent lg:bg-gradient-to-t lg:from-sky-800/30 lg:via-sky-600/15 lg:to-transparent" />
        </div>
        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:col-span-3 lg:pr-12">
          {kicker && (
            <p className="mb-3 text-2xs font-bold uppercase tracking-[0.2em] text-sky-800">{kicker}</p>
          )}
          <h1 className="font-display text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl md:text-[2.4rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
