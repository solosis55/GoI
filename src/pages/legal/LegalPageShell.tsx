import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../../components/layout/SiteFooter";

type LegalPageShellProps = {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
};

export function LegalPageShell({ title, lastUpdated, children }: LegalPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-neutral-300 light:bg-zinc-100 light:text-zinc-800">
      <header className="border-b border-neutral-900 px-4 py-4 light:border-zinc-200">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-goi-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-white"
          >
            ← Volver a FitSocial
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-goi-gold-dim">FitSocial · GoI</span>
        </div>
      </header>
      <main className="flex-1 px-4 py-8 pb-12 sm:px-6">
        <article className="mx-auto max-w-3xl text-[15px] leading-relaxed [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-100 light:[&_h2]:text-zinc-900 [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-100 light:text-zinc-900">{title}</h1>
          {lastUpdated ? (
            <p className="mb-8 text-sm text-neutral-500 light:text-zinc-600">Última actualización: {lastUpdated}</p>
          ) : (
            <div className="mb-8" aria-hidden />
          )}
          <div className="space-y-4">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
