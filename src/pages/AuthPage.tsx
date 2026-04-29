import { useState } from "react";
import type { FormEvent } from "react";
import { login, register } from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { setAuth } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegisterMode && username.trim().length < 3) {
        throw new Error("El usuario debe tener al menos 3 caracteres");
      }
      if (password.length < 6) {
        throw new Error("La password debe tener al menos 6 caracteres");
      }

      if (isRegisterMode) {
        const response = await register({ username: username.trim(), email, password });
        const loginResponse = await login({ email, password });
        if (!loginResponse.token) throw new Error("Login token missing");
        setAuth(loginResponse.token, response.user);
      } else {
        const response = await login({ email, password });
        if (!response.token) throw new Error("Login token missing");
        setAuth(response.token, response.user);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto my-8 w-full max-w-[460px] max-md:my-4">
      <h1>{isRegisterMode ? "Crear cuenta" : "Iniciar sesion"}</h1>
      <p className="mb-3 text-slate-500">MVP social + deporte (localStorage + API)</p>

      <form className="grid gap-2.5" onSubmit={handleSubmit}>
        {isRegisterMode && (
          <label className="grid gap-1.5 font-semibold">
            Usuario
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="cristianfit"
            />
          </label>
        )}

        <label className="grid gap-1.5 font-semibold">
          Email
          <input
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
          />
        </label>

        <label className="grid gap-1.5 font-semibold">
          Password
          <input
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
            required
            type="password"
            minLength={4}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
          />
        </label>

        <StatusMessage error={error} />

        <Button type="submit" disabled={loading}>
          {loading ? "Procesando..." : isRegisterMode ? "Crear cuenta" : "Entrar"}
        </Button>
      </form>

      <Button
        type="button"
        variant="link"
        onClick={() => {
          setError("");
          setIsRegisterMode((value) => !value);
        }}
      >
        {isRegisterMode ? "Ya tengo cuenta" : "No tengo cuenta aun"}
      </Button>
    </Card>
  );
}
