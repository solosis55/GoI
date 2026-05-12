import { Link } from "react-router-dom";
import { SiteFooter } from "../components/layout/SiteFooter";

/** Ruta desconocida: HTTP equivalente 404 en cliente (SPA). */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-neutral-300 light:bg-zinc-100 light:text-zinc-800">
      <header className="border-b border-neutral-900 px-4 py-4 light:border-zinc-200">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-goi-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-white"
          >
            ← Volver al inicio
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-goi-gold-dim">GoI</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <p className="mb-2 font-mono text-5xl font-bold tabular-nums text-goi-gold">404</p>
          <h1 className="mb-3 text-xl font-semibold text-neutral-100 light:text-zinc-900">Página no encontrada</h1>
          <p className="mb-8 text-sm leading-relaxed text-neutral-500 light:text-zinc-600">
            La ruta que buscas no existe en esta aplicación. Comprueba la URL o vuelve al inicio.
          </p>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-goi-gold/50 bg-goi-gold/15 px-5 text-sm font-semibold text-goi-gold hover:bg-goi-gold/25"
          >
            Ir al inicio
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
