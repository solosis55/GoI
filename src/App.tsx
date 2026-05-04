import "./App.css";
import { useEffect, useState } from "react";
import { GoISidebarBadge } from "./components/branding/GoISidebarBadge";
import { SiteFooter } from "./components/layout/SiteFooter";
import { Button } from "./components/ui/Button";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ExerciseCatalogPage } from "./pages/ExerciseCatalogPage";
import { ExerciseDetailPage } from "./pages/ExerciseDetailPage";
import { WorkoutEditorPage, type WorkoutEditorMode } from "./pages/WorkoutEditorPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import type { Workout } from "./types/workout";
import { clearWorkoutCreateDraft } from "./utils/workoutCreateDraft";

const TAB_STORAGE_KEY = "fitsocial:activeTab";
type ActiveTab = "feed" | "profile" | "workouts";
type WorkoutsView = "overview" | "catalog" | "exerciseDetail" | "editor";

function readStoredTab(): ActiveTab | null {
  try {
    const raw = sessionStorage.getItem(TAB_STORAGE_KEY);
    if (raw === "feed" || raw === "profile" || raw === "workouts") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function persistActiveTab(tab: ActiveTab) {
  try {
    sessionStorage.setItem(TAB_STORAGE_KEY, tab);
  } catch {
    /* ignore */
  }
}

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => readStoredTab() ?? "feed");
  const [workoutsView, setWorkoutsView] = useState<WorkoutsView>("overview");
  const [catalogExerciseId, setCatalogExerciseId] = useState<string | null>(null);
  const [catalogFromEditor, setCatalogFromEditor] = useState(false);
  /** Si la ficha se abrio desde el catalogo tras pasar por el editor (afecta la miga de pan). */
  const [exerciseDetailFromEditor, setExerciseDetailFromEditor] = useState(false);
  const [workoutEditorMode, setWorkoutEditorMode] = useState<WorkoutEditorMode>(() => ({ mode: "create" }));

  const routineFormBreadcrumbLabel =
    workoutEditorMode.mode === "edit" ? "Editar rutina" : "Nueva rutina";

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        sessionStorage.removeItem(TAB_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      clearWorkoutCreateDraft();
      setActiveTab("feed");
      setWorkoutsView("overview");
      setCatalogExerciseId(null);
      setCatalogFromEditor(false);
      setExerciseDetailFromEditor(false);
    }
  }, [isAuthenticated]);

  function goTo(tab: ActiveTab) {
    persistActiveTab(tab);
    setActiveTab(tab);
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-neutral-200">
        <main className="social-shell grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="social-sidebar sticky top-0 flex h-screen flex-col gap-5 border-r border-neutral-900 bg-black px-3.5 py-6 max-md:static max-md:h-auto max-md:border-b max-md:border-r-0 max-md:px-2.5 max-md:py-3">
            <GoISidebarBadge
              subtitle="Inicia sesión o regístrate"
              description="Red social y rutinas en un solo lugar. Entra al feed cuando inicies sesión."
            />
          </aside>
          <section className="social-content flex min-h-0 min-w-0 w-full flex-col justify-center p-4 max-md:min-h-[50vh] max-md:py-6 max-md:max-lg:justify-start">
            <AuthPage />
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-neutral-200">
      <main className="social-shell grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="social-sidebar sticky top-0 flex h-screen flex-col gap-5 border-r border-neutral-900 bg-black px-3.5 py-6 max-md:static max-md:h-auto max-md:border-b max-md:border-r-0 max-md:px-2.5 max-md:py-3">
          <GoISidebarBadge subtitle={`@${user?.username ?? ""}`} />
          <nav className="sidebar-nav grid gap-2.5 max-md:grid-cols-2">
            <Button
              type="button"
              variant={activeTab === "feed" ? "navActive" : "secondary"}
              onClick={() => goTo("feed")}
            >
              Inicio
            </Button>
            <Button
              type="button"
              variant={activeTab === "workouts" ? "navActive" : "secondary"}
              onClick={() => {
                setWorkoutsView("overview");
                setCatalogExerciseId(null);
                setCatalogFromEditor(false);
                setExerciseDetailFromEditor(false);
                goTo("workouts");
              }}
            >
              Rutinas
            </Button>
            <Button
              type="button"
              variant={activeTab === "profile" ? "navActive" : "secondary"}
              onClick={() => goTo("profile")}
            >
              Perfil
            </Button>
            <Button type="button" variant="danger" className="sidebar-logout mt-4" onClick={logout}>
              Cerrar sesion
            </Button>
          </nav>
        </aside>

        <section className="social-content min-h-0 min-w-0 w-full p-4 max-md:p-2.5">
          {activeTab === "workouts" && workoutsView === "overview" && (
            <WorkoutsPage
              onCreateWorkout={() => {
                setWorkoutEditorMode({ mode: "create" });
                setWorkoutsView("editor");
              }}
              onEditWorkout={(workout: Workout) => {
                setWorkoutEditorMode({ mode: "edit", workout });
                setWorkoutsView("editor");
              }}
            />
          )}
          {activeTab === "workouts" && workoutsView === "catalog" && (
            <ExerciseCatalogPage
              creationFlowLabel={catalogFromEditor ? "editor" : "standalone"}
              onBack={() => {
                const backToEditor = catalogFromEditor;
                setCatalogFromEditor(false);
                setWorkoutsView(backToEditor ? "editor" : "overview");
              }}
              onNavigateToRutinas={() => {
                setCatalogFromEditor(false);
                setWorkoutsView("overview");
              }}
              routineFormCrumb={catalogFromEditor ? routineFormBreadcrumbLabel : undefined}
              onNavigateToEditorForm={
                catalogFromEditor
                  ? () => {
                      setWorkoutsView("editor");
                      setCatalogFromEditor(true);
                    }
                  : undefined
              }
              onOpenExerciseDetail={(id) => {
                setExerciseDetailFromEditor(catalogFromEditor);
                setCatalogExerciseId(id);
                setWorkoutsView("exerciseDetail");
              }}
              onNewRoutineWithExerciseIds={(ids) => {
                setWorkoutEditorMode({ mode: "create", initialExerciseIds: ids });
                setCatalogFromEditor(false);
                setWorkoutsView("editor");
              }}
            />
          )}
          {activeTab === "workouts" && workoutsView === "exerciseDetail" && catalogExerciseId ? (
            <ExerciseDetailPage
              exerciseId={catalogExerciseId}
              showRoutineTrail={exerciseDetailFromEditor}
              routineFormCrumb={exerciseDetailFromEditor ? routineFormBreadcrumbLabel : undefined}
              onNavigateToEditorForm={
                exerciseDetailFromEditor
                  ? () => {
                      setCatalogExerciseId(null);
                      setExerciseDetailFromEditor(false);
                      setWorkoutsView("editor");
                      setCatalogFromEditor(true);
                    }
                  : undefined
              }
              onBackToCatalog={() => {
                setCatalogExerciseId(null);
                setExerciseDetailFromEditor(false);
                setWorkoutsView("catalog");
              }}
              onBackToRoutines={() => {
                setCatalogExerciseId(null);
                setExerciseDetailFromEditor(false);
                setWorkoutsView("overview");
              }}
              onNewRoutineWithExerciseIds={(ids) => {
                setWorkoutEditorMode({ mode: "create", initialExerciseIds: ids });
                setCatalogExerciseId(null);
                setExerciseDetailFromEditor(false);
                setCatalogFromEditor(false);
                setWorkoutsView("editor");
              }}
            />
          ) : null}
          {activeTab === "workouts" && workoutsView === "editor" && (
            <WorkoutEditorPage
              mode={workoutEditorMode}
              onBack={() => setWorkoutsView("overview")}
              onSaved={() => setWorkoutsView("overview")}
              onBrowseCatalog={() => {
                setCatalogExerciseId(null);
                setCatalogFromEditor(true);
                setWorkoutsView("catalog");
              }}
            />
          )}
          {activeTab === "profile" && <ProfilePage />}
          {activeTab === "feed" && <FeedPage />}
        </section>
      </main>
      <SiteFooter />
    </div>
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
