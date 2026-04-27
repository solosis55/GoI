import "./App.css";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkoutsPage } from "./pages/WorkoutsPage";

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"workouts" | "profile" | "feed">("feed");

  if (!isAuthenticated) {
    return <main className="app-shell">{<AuthPage />}</main>;
  }

  return (
    <main className="social-shell">
      <aside className="social-sidebar">
        <div>
          <h1 className="brand">FitSocial</h1>
          <p className="sidebar-user">@{user?.username}</p>
        </div>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={activeTab === "feed" ? "nav-active" : "secondary"}
            onClick={() => setActiveTab("feed")}
          >
            Inicio
          </button>
          <button
            type="button"
            className={activeTab === "workouts" ? "nav-active" : "secondary"}
            onClick={() => setActiveTab("workouts")}
          >
            Entrenamientos
          </button>
          <button
            type="button"
            className={activeTab === "profile" ? "nav-active" : "secondary"}
            onClick={() => setActiveTab("profile")}
          >
            Perfil
          </button>
          <button type="button" className="danger sidebar-logout" onClick={logout}>
            Cerrar sesion
          </button>
        </nav>
      </aside>

      <section className="social-content">
        {activeTab === "workouts" && <WorkoutsPage />}
        {activeTab === "profile" && <ProfilePage />}
        {activeTab === "feed" && <FeedPage />}
      </section>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
