import { Link } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";

const TRELLO_ROADMAP = "https://trello.com/b/6Yn18TWn/red-social-goi";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer border-t border-neutral-900 bg-black px-4 py-6 text-sm text-neutral-500 max-md:px-2.5 light:border-zinc-200 light:bg-zinc-50 light:text-zinc-600">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-neutral-400 light:text-zinc-700">
            © {year} FitSocial · GoI
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 light:text-zinc-500">
            Red social y seguimiento de entrenos. Uso educativo / MVP; revisa las políticas de tu despliegue antes de datos reales.
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 light:text-zinc-600 sm:gap-x-5"
          aria-label="Pie de página"
        >
          <ThemeToggle />
          <a
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-zinc-50"
            href={TRELLO_ROADMAP}
            target="_blank"
            rel="noreferrer noopener"
          >
            Roadmap
          </a>
          <span className="text-neutral-700 light:text-zinc-400" aria-hidden>
            ·
          </span>
          <Link
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-zinc-50"
            to="/aviso-legal"
          >
            Aviso legal
          </Link>
          <span className="text-neutral-700 light:text-zinc-400" aria-hidden>
            ·
          </span>
          <Link
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-zinc-50"
            to="/privacidad"
          >
            Privacidad
          </Link>
          <span className="text-neutral-700 light:text-zinc-400" aria-hidden>
            ·
          </span>
          <Link
            className="transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-zinc-50"
            to="/contacto"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
}
