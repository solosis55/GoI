import { useState } from "react";
import type { FormEvent } from "react";
import { login, register } from "../api/authApi";
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
    <section className="card auth-card">
      <h1>{isRegisterMode ? "Crear cuenta" : "Iniciar sesion"}</h1>
      <p className="subtitle">MVP social + deporte (localStorage + API)</p>

      <form className="stack" onSubmit={handleSubmit}>
        {isRegisterMode && (
          <label>
            Usuario
            <input
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="cristianfit"
            />
          </label>
        )}

        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            minLength={4}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : isRegisterMode ? "Crear cuenta" : "Entrar"}
        </button>
      </form>

      <button
        type="button"
        className="link-btn"
        onClick={() => {
          setError("");
          setIsRegisterMode((value) => !value);
        }}
      >
        {isRegisterMode ? "Ya tengo cuenta" : "No tengo cuenta aun"}
      </button>
    </section>
  );
}
