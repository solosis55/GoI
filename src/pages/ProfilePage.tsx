import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getProfile, updateProfile } from "../api/authApi";
import { ProfileForm } from "../components/profile/ProfileForm";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";

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
        setError(getErrorMessage(loadError, "No se pudo cargar el perfil"));
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
      setError(getErrorMessage(submitError, "No se pudo actualizar el perfil"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2>Mi perfil</h2>
      <p className="mb-3 text-slate-500">Configura tu identidad deportiva para la parte social</p>
      <ProfileForm
        username={username}
        goal={goal}
        avatarUrl={avatarUrl}
        bio={bio}
        loading={loading}
        error={error}
        message={message}
        onChangeUsername={setUsername}
        onChangeGoal={setGoal}
        onChangeAvatarUrl={setAvatarUrl}
        onChangeBio={setBio}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
