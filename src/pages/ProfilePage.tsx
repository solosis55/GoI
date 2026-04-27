import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getProfile, updateProfile } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [goal, setGoal] = useState(user?.goal ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      setLoading(true);
      setError("");
      try {
        const response = await getProfile(user.id);
        setUsername(response.user.username);
        setBio(response.user.bio);
        setGoal(response.user.goal);
        setAvatarUrl(response.user.avatarUrl);
        updateUser(response.user);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [user?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");
    setError("");

    if (username.trim().length < 3) {
      setLoading(false);
      setError("El usuario debe tener al menos 3 caracteres");
      return;
    }
    if (goal.length > 60) {
      setLoading(false);
      setError("El objetivo no puede superar 60 caracteres");
      return;
    }
    if (bio.length > 200) {
      setLoading(false);
      setError("La bio no puede superar 200 caracteres");
      return;
    }
    if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) {
      setLoading(false);
      setError("La foto debe empezar por http:// o https://");
      return;
    }

    try {
      const response = await updateProfile(user.id, {
        username: username.trim(),
        bio,
        goal,
        avatarUrl,
      });
      updateUser(response.user);
      setMessage("Perfil actualizado correctamente");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Mi perfil</h2>
      <p className="subtitle">Configura tu identidad deportiva para la parte social</p>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Usuario
          <input required value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Objetivo deportivo
          <input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Ganar fuerza" />
        </label>
        <label>
          URL foto de perfil
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://..."
          />
        </label>
        <label>
          Bio
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Entreno 5 dias por semana..."
          />
        </label>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar perfil"}
        </button>
      </form>
    </section>
  );
}
