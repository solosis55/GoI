import { Link } from "react-router-dom";
import { LegalPageShell } from "./LegalPageShell";

const UPDATED = "6 de mayo de 2026";

export function LegalNoticePage() {
  return (
    <LegalPageShell title="Aviso legal" lastUpdated={UPDATED}>
      <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-100/95 light:border-amber-600 healthy:border-goi-gold/32 light:bg-amber-50 healthy:bg-goi-gold/[0.09] light:text-amber-950 healthy:text-goi-gold-dim">
        Este texto es una <strong>base orientativa</strong> para un MVP o entorno educativo. Antes de tratar datos
        personales reales o ofrecer el servicio al público, conviene revisarlo y adaptarlo con asesoramiento jurídico.
      </p>

      <h2 id="titular">1. Titular del sitio</h2>
      <p>
        En cumplimiento de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio
        electrónico (LSSI-CE), se informa de los siguientes datos:
      </p>
      <ul>
        <li>
          <strong>Denominación del responsable:</strong> [completar: nombre o razón social del titular del sitio /
          proyecto].
        </li>
        <li>
          <strong>NIF / identificación:</strong> [completar si aplica].
        </li>
        <li>
          <strong>Domicilio:</strong> [completar si aplica].
        </li>
        <li>
          <strong>Correo electrónico de contacto:</strong> ver la página{" "}
          <Link className="text-goi-gold underline underline-offset-2 hover:text-yellow-400" to="/contacto">
            Contacto
          </Link>
          .
        </li>
      </ul>

      <h2 id="objeto">2. Objeto y condiciones de uso</h2>
      <p>
        GoI es una aplicación web de carácter <strong>experimental / educativo</strong> (MVP) orientada a
        compartir actividad en un feed, gestionar rutinas de entrenamiento y funciones relacionadas. El uso del sitio es
        libre dentro de los límites descritos aquí y en las políticas vinculadas.
      </p>
      <p>
        La navegación y uso del servicio suponen la condición de <strong>usuario</strong> del sitio e implica la
        aceptación de este aviso legal y, en su caso, de la política de privacidad y de los términos que resulten de
        aplicación.
      </p>

      <h2 id="propiedad-intelectual">3. Propiedad intelectual e industrial</h2>
      <p>
        Los contenidos propios del sitio (marca donde proceda, textos propios del proyecto, elementos de diseño, etc.)
        pertenecen al titular o se utilizan con la licencia o condición legal que corresponda. Quedan reservados todos los derechos.
      </p>
      <p>
        Respecto del contenido generado por los usuarios en el seno del servicio, rigen las licencias y condiciones que se
        establezcan contractualmente entre el usuario y el titular; en ausencia de cláusulas específicas, el usuario debe
        asegurarse de tener derecho a lo que publica.
      </p>

      <h2 id="usuarios-contenidos">4. Obligaciones de los usuarios y contenidos</h2>
      <p>
        El usuario se compromete a utilizar el servicio de manera lícita, sin vulnerar derechos de terceros, sin
        difundir malware y sin realizar prácticas abusivas. En particular está prohibido publicar contenido ilegal,
        discriminatorio o que vulnere la intimidad de terceros.
      </p>
      <p>
        El titular podrá adoptar las medidas técnicas que considere adecuadas (incluida la eliminación de contenidos o la
        suspensión temporal de cuentas) cuando tenga conocimiento efectivo de ilicitudes o cuando las condiciones del
        servicio lo justifiquen.
      </p>

      <h2 id="exclusion">5. Exclusión de garantías y responsabilidad</h2>
      <p>
        El servicio se ofrece <strong>tal cual</strong>. No se garantiza disponibilidad ininterrumpida ni ausencia de
        errores. El contenido relacionado con entrenamiento tiene carácter informativo; no sustituye asesoramiento
        sanitario ni de preparación física profesional.
      </p>

      <h2 id="enlaces">6. Enlaces externos</h2>
      <p>
        El sitio puede enlazar sitios de terceros (por ejemplo roadmap u otros recursos). El titular no se hace responsable
        del contenido de dichos enlaces ni de los tratamientos de datos que realizen terceros.
      </p>

      <h2 id="ley">7. Legislación aplicable</h2>
      <p>
        Este aviso legal se interpretará de acuerdo con la legislación del <strong>Reino de España</strong>. Para
        controversias, salvo norma imperativa distinta, [completar: tribunales o jurisdición acordada].
      </p>
    </LegalPageShell>
  );
}
