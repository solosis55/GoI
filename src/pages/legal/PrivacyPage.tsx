import { Link } from "react-router-dom";
import { LegalPageShell } from "./LegalPageShell";

const UPDATED = "6 de mayo de 2026";

export function PrivacyPage() {
  return (
    <LegalPageShell title="Política de privacidad" lastUpdated={UPDATED}>
      <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-100/95 light:border-amber-600/35 light:bg-amber-50 light:text-amber-950">
        Documento modelo alineado con el RGPD y la LSSI-CE. Debe revisarse ante
        un despliegue con datos personales de personas reales. Identifica siempre claramente al responsable del
        tratamiento.
      </p>

      <h2 id="responsable">1. Responsable del tratamiento</h2>
      <p>
        <strong>Identidad:</strong> [completar: titular].
        <br />
        <strong>Correo de contacto (privacidad):</strong>{" "}
        <Link className="text-goi-gold underline underline-offset-2 hover:text-yellow-400" to="/contacto">
          ver Contacto
        </Link>
        .
      </p>

      <h2 id="finalidades">2. ¿Con qué finalidades tratamos los datos?</h2>
      <p>En función de cómo hayas configurado FitSocial · GoI, pueden aplicarse algunas de las siguientes:</p>
      <ul>
        <li>
          <strong>Cuenta y autenticación:</strong> registro e inicio de sesión (p. ej. identificadores, nombre de usuario,
          correo electrónico si lo solicitas en el proceso, credenciales cifradas en el servidor).
        </li>
        <li>
          <strong>Prestación del servicio:</strong> mostrar perfil público dentro de la app, seguir usuarios, publicaciones,
          likes, comentarios, rutinas asociadas a la cuenta, historiales de uso del producto relacionados con el entreno.
        </li>
        <li>
          <strong>Comunicaciones de seguridad y cuenta:</strong> recuperación de acceso cuando actives ese flujo
          técnico.
        </li>
        <li>
          <strong>Mejora técnica (agregado o analítica mínima):</strong> solo si decides implementarlos más adelante;
          descríbelos entonces aquí de forma específica.
        </li>
      </ul>

      <h2 id="bases">3. Base legal del tratamiento</h2>
      <ul>
        <li>Ejecución de medidas contractuales o precontractuales (crear la cuenta y prestar las funciones del servicio).</li>
        <li>Consentimiento donde lo exija la Ley (cookies no esenciales, comunicaciones comerciales, etc., si llegan).</li>
        <li>Intereses legítimos en la medida necesaria para mantener la seguridad del servicio, prevenir fraudes o
          conservar registros proporcionados y limitados cuando resulte admisible.
        </li>
      </ul>

      <h2 id="datos-conservacion">4. ¿Qué categorías de datos y cuánto tiempo?</h2>
      <ul>
        <li>
          <strong>Datos de perfil:</strong> nombre público (@usuario), biografía objetivo opcional y URL de foto, según hayas diseñado el formulario.
        </li>
        <li>
          <strong>Contenidos generados:</strong> publicaciones, fotos cargadas temporalmente tras validación servidor,
          comentarios, historias con caducidad de ~24 h donde proceda según configuración técnica.
        </li>
        <li>
          <strong>Datos derivados:</strong> interacciones (likes), relaciones sociales tipo seguimiento dentro de la
          misma cuenta.
        </li>
      </ul>
      <p>
        Los datos se conservan mientras mantengas la cuenta activa salvo borrados técnicos o supresiones legales. Tras dar
        de baja la cuenta, pueden conservarse anonimizados o durante el tiempo necesario para cumplir obligaciones
        legales cuando existieran ([completar plazos reales cuando definas proceso de purge]).
      </p>

      <h2 id="destinatarios">5. ¿A quién se comunican datos?</h2>
      <p>
        Como regla las funciones están servidas dentro de tu propio despliegue. Si utilizas infraestructura de terceros
        (hosting, email transaccional, buckets de almacenamiento, etc.), esos proveedores actuarán como encargados del
        tratamiento si suscribes con ellos el contrato tipo o cláusulas equivalentes. [Completar lista real de
        encargados / proveedores.]
      </p>
      <p>No se prevén cesiones internacionales fuera del EEE salvo que [completar si usas servicios con transferencias].</p>

      <h2 id="derechos">6. Derechos de las personas interesadas</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y
        portabilidad cuando proceda, en los términos del RGPD. Para ello contacta con el responsable en la dirección
        indicada en la sección de contacto. También puedes presentar reclamación ante la Agencia Española de Protección de
        Datos (<a className="text-goi-gold underline underline-offset-2 hover:text-yellow-400" href="https://www.aepd.es" target="_blank" rel="noreferrer noopener">www.aepd.es</a>).
      </p>

      <h2 id="seguridad">7. Medidas de seguridad</h2>
      <p>
        El proyecto implementa prácticas razonables para un MVP (por ejemplo autenticación basada en token, validación y
        control de acceso en API). Debes documentar medidas adicionales conforme endurezcas el despliegue (HTTPS
        obligatorio, copias de seguridad, registro de accesos, etc.).
      </p>

      <h2 id="menores">8. Menores de edad</h2>
      <p>[Completar: edad mínima o prohibición implícita; la mayoría de servicios no orientados a niños establecen mayoría de 14 o 18 años conforme proyecto.]</p>

      <h2 id="cambios">9. Cambios en la política</h2>
      <p>
        Podremos modificar esta política para adaptarla a la evolución legal o técnica. Publicaremos la versión revisada en
        esta página con nueva fecha &quot;última actualización&quot;.
      </p>

      <p className="pt-4 text-sm text-neutral-500 light:text-zinc-600">
        Relacionado con el{" "}
        <Link className="text-goi-gold hover:underline" to="/aviso-legal">
          Aviso legal
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
