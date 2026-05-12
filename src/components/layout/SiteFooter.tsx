import { Link } from "react-router-dom";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps = {}) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={[
        "site-footer border-t border-neutral-900 bg-black px-4 py-6 text-sm text-neutral-500 max-md:px-2.5 neon:border-neutral-900 neon:bg-[#030303] light:border-zinc-200 light:bg-[var(--goi-page-bg)] light:text-zinc-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 max-md:text-center">
          <p className="font-medium text-neutral-400 light:text-zinc-700">
            © {year} GoI
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 light:text-zinc-500">
            Red social y seguimiento de entrenos. Uso educativo / MVP; revisa las políticas de tu despliegue antes de datos reales.
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 max-md:justify-center light:text-zinc-600 sm:gap-x-5"
          aria-label="Pie de página"
        >
          <Link
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-[var(--goi-page-bg)] neon:focus-visible:ring-offset-[#030303]"
            to="/roadmap"
          >
            Roadmap
          </Link>
          <span className="text-neutral-700 max-md:hidden light:text-zinc-400" aria-hidden>
            ·
          </span>
          <Link
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-[var(--goi-page-bg)] neon:focus-visible:ring-offset-[#030303]"
            to="/aviso-legal"
          >
            Aviso legal
          </Link>
          <span className="text-neutral-700 max-md:hidden light:text-zinc-400" aria-hidden>
            ·
          </span>
          <Link
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-[var(--goi-page-bg)] neon:focus-visible:ring-offset-[#030303]"
            to="/privacidad"
          >
            Privacidad
          </Link>
          <span className="text-neutral-700 max-md:hidden light:text-zinc-400" aria-hidden>
            ·
          </span>
          <Link
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-[var(--goi-page-bg)] neon:focus-visible:ring-offset-[#030303]"
            to="/contacto"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
}
