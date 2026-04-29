import "./App.css";
import { useState } from "react";
import { Button } from "./components/ui/Button";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkoutsPage } from "./pages/WorkoutsPage";

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"workouts" | "profile" | "feed">("feed");

  if (!isAuthenticated) {
    return <main className="app-shell mx-auto w-full max-w-[920px] px-4 pb-10 pt-6">{<AuthPage />}</main>;
  }

  return (
    <main className="social-shell grid min-h-screen grid-cols-1 bg-slate-950 text-slate-200 md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="social-sidebar sticky top-0 flex h-screen flex-col gap-5 border-r border-slate-800 px-3.5 py-6 max-md:static max-md:h-auto max-md:border-b max-md:border-r-0 max-md:px-2.5 max-md:py-3">
        <div>
          <h1 className="brand mb-2 text-[28px]">FitSocial</h1>
          <p className="sidebar-user text-slate-400">@{user?.username}</p>
        </div>
        <nav className="sidebar-nav grid gap-2.5 max-md:grid-cols-2">
          <Button
            type="button"
            variant={activeTab === "feed" ? "navActive" : "secondary"}
            onClick={() => setActiveTab("feed")}
          >
            Inicio
          </Button>
          <Button
            type="button"
            variant={activeTab === "workouts" ? "navActive" : "secondary"}
            onClick={() => setActiveTab("workouts")}
          >
            Entrenamientos
          </Button>
          <Button
            type="button"
            variant={activeTab === "profile" ? "navActive" : "secondary"}
            onClick={() => setActiveTab("profile")}
          >
            Perfil
          </Button>
          <Button type="button" variant="danger" className="sidebar-logout mt-4" onClick={logout}>
            Cerrar sesion
          </Button>
        </nav>
      </aside>

      <section className="social-content p-4 max-md:p-2.5">
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
