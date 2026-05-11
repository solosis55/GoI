import { Card } from "../ui/Card";

type ProfileAccountCardProps = {
  accountEmail?: string;
};

/** Datos de cuenta (no públicos): correo y espacio para futuras opciones de seguridad. */
export function ProfileAccountCard({ accountEmail }: ProfileAccountCardProps) {
  return (
    <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
      <h2 className="mt-0 text-lg font-semibold text-neutral-100 light:text-zinc-900">Cuenta</h2>
      <p className="mb-3 text-sm text-neutral-500 light:text-zinc-600">
        Información privada. Tu correo no aparece en el feed ni en tu perfil público.
      </p>
      {accountEmail ? (
        <label className="grid gap-1.5 font-semibold">
          Correo
          <input className="goi-field cursor-not-allowed opacity-90" readOnly disabled value={accountEmail} />
          <span className="text-xs font-normal text-neutral-500">Visible solo para ti</span>
        </label>
      ) : (
        <p className="text-sm text-neutral-500 light:text-zinc-600">No hay correo en esta sesión.</p>
      )}
    </Card>
  );
}
