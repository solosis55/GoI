import type { FormEvent } from "react";
import { Button } from "../ui/Button";
import { StatusMessage } from "../ui/StatusMessage";

type ProfileFormProps = {
  username: string;
  goal: string;
  avatarUrl: string;
  bio: string;
  loading: boolean;
  error: string;
  message: string;
  onChangeUsername: (value: string) => void;
  onChangeGoal: (value: string) => void;
  onChangeAvatarUrl: (value: string) => void;
  onChangeBio: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProfileForm({
  username,
  goal,
  avatarUrl,
  bio,
  loading,
  error,
  message,
  onChangeUsername,
  onChangeGoal,
  onChangeAvatarUrl,
  onChangeBio,
  onSubmit,
}: ProfileFormProps) {
  return (
    <form className="stack grid gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1.5 font-semibold">
        Usuario
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          required
          value={username}
          onChange={(event) => onChangeUsername(event.target.value)}
        />
      </label>
      <label className="grid gap-1.5 font-semibold">
        Objetivo deportivo
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          value={goal}
          onChange={(event) => onChangeGoal(event.target.value)}
          placeholder="Ganar fuerza"
        />
      </label>
      <label className="grid gap-1.5 font-semibold">
        URL foto de perfil
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          value={avatarUrl}
          onChange={(event) => onChangeAvatarUrl(event.target.value)}
          placeholder="https://..."
        />
      </label>
      <label className="grid gap-1.5 font-semibold">
        Bio
        <textarea
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
          value={bio}
          onChange={(event) => onChangeBio(event.target.value)}
          placeholder="Entreno 5 dias por semana..."
        />
      </label>

      <StatusMessage error={error} success={message} />

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar perfil"}
      </Button>
    </form>
  );
}
