import { Link } from "react-router-dom";
import { PUBLIC_CONTACT_EMAIL } from "../../config/site";
import { LegalPageShell } from "./LegalPageShell";

const UPDATED = "6 de mayo de 2026";

export function ContactPage() {
  const email = PUBLIC_CONTACT_EMAIL;
  const mailHref = email ? `mailto:${encodeURIComponent(email)}` : null;

  return (
    <LegalPageShell title="Contacto" lastUpdated={UPDATED}>
      <p>
        Para cualquier comunicación relacionada con el uso de GoI, soporte técnico, ejercicio de derechos en
        materia de privacidad o incidencias relativas al contenido, utiliza uno de estos canales.
      </p>

      <h2 id="correo">Correo electrónico</h2>
      {mailHref ? (
        <p>
          <a
            href={mailHref}
            className="font-medium text-goi-gold underline underline-offset-2 hover:text-yellow-400 light:hover:text-amber-800 healthy:hover:text-zinc-800"
          >
            {email}
          </a>
        </p>
      ) : (
        <p className="rounded-lg border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-neutral-400 light:border-zinc-300 light:bg-zinc-50 light:text-zinc-700">
          Aún no hay correo público configurado. En el proyecto, define la variable de entorno del cliente{" "}
          <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-neutral-300 light:bg-zinc-200 light:text-zinc-900">VITE_CONTACT_EMAIL</code>{" "}
          antes del build para mostrar aquí tu dirección de contacto (p. ej. en Vercel, Netlify o tu hosting).
        </p>
      )}

      <h2 id="plazos">Plazos de respuesta</h2>
      <p>
        En proyectos personales o de MVP puede no garantizarse un tiempo de contestación determinado; conviene establecer uno
        razonable y documentarlo aquí cuando tengas un canal atendido (&quot;a la mayor brevedad posible&quot;, o plazo
        concreto en días hábiles).
      </p>

      <p className="pt-6 text-sm text-neutral-500 light:text-zinc-600">
        <Link className="text-goi-gold hover:underline" to="/privacidad">
          Política de privacidad
        </Link>
        {" · "}
        <Link className="text-goi-gold hover:underline" to="/aviso-legal">
          Aviso legal
        </Link>
      </p>
    </LegalPageShell>
  );
}
