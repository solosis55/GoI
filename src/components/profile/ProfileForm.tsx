import type { FormEvent, ReactNode } from "react";
import { Button } from "../ui/Button";
import { StatusMessage } from "../ui/StatusMessage";

type ProfileFormProps = {
  username: string;
  goal: string;
  bio: string;
  loading: boolean;
  error: string;
  message: string;
  onChangeUsername: (value: string) => void;
  onChangeGoal: (value: string) => void;
  onChangeBio: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Campos extra (cabecera, enlaces, privacidad) dentro del mismo formulario. */
  extraSection?: ReactNode;
};

export function ProfileForm({
  username,
  goal,
  bio,
  loading,
  error,
  message,
  onChangeUsername,
  onChangeGoal,
  onChangeBio,
  onSubmit,
  extraSection,
}: ProfileFormProps) {
  return (
    <form className="stack grid gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1.5 font-semibold">
        Usuario
        <input
          className="goi-field"
          required
          value={username}
          maxLength={24}
          onChange={(event) => onChangeUsername(event.target.value)}
        />
      </label>
      <label className="grid gap-1.5 font-semibold">
        Objetivo deportivo
        <input
          className="goi-field"
          value={goal}
          maxLength={60}
          onChange={(event) => onChangeGoal(event.target.value)}
          placeholder="Ganar fuerza"
        />
        <span className="text-xs font-normal text-neutral-500">{goal.length}/60</span>
      </label>
      <label className="grid gap-1.5 font-semibold">
        Bio
        <textarea
          className="goi-field min-h-[96px]"
          value={bio}
          maxLength={200}
          onChange={(event) => onChangeBio(event.target.value)}
          placeholder="Entreno 5 dias por semana..."
        />
        <span className="text-xs font-normal text-neutral-500">{bio.length}/200</span>
      </label>

      {extraSection ? <div className="grid gap-3 border-t border-neutral-800/80 pt-3 light:border-zinc-200">{extraSection}</div> : null}

      <StatusMessage tone="dark" error={error} success={message} />

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Guardando..." : "Guardar perfil"}
      </Button>
    </form>
  );
}
