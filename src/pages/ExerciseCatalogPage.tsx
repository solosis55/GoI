import { ExerciseCatalogPanel } from "../components/exercises/ExerciseCatalogPanel";

type ExerciseCatalogPageProps = {
  creationFlowLabel?: "standalone" | "editor";
  onBack: () => void;
  onNavigateToRutinas: () => void;
  routineFormCrumb?: string;
  onNavigateToEditorForm?: () => void;
  onOpenExerciseDetail: (exerciseId: string) => void;
  onNewRoutineWithExerciseIds: (exerciseIds: string[]) => void;
};

export function ExerciseCatalogPage({
  creationFlowLabel = "standalone",
  onBack,
  onNavigateToRutinas,
  routineFormCrumb,
  onNavigateToEditorForm,
  onOpenExerciseDetail,
  onNewRoutineWithExerciseIds,
}: ExerciseCatalogPageProps) {
  return (
    <section className="layout grid w-full min-w-0 gap-4">
      <header className="feed-page-header px-4 py-4 sm:px-5 sm:py-5">
        <nav className="mb-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500" aria-label="Miga de pan">
          <button
            type="button"
            className="rounded px-1 py-0.5 text-neutral-400 transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
            onClick={onNavigateToRutinas}
          >
            Rutinas
          </button>
          <span className="text-neutral-600">/</span>
          {routineFormCrumb && onNavigateToEditorForm ? (
            <>
              <button
                type="button"
                className="rounded px-1 py-0.5 text-neutral-400 transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
                onClick={onNavigateToEditorForm}
              >
                Editor de rutinas
              </button>
              <span className="text-neutral-600">/</span>
              <button
                type="button"
                className="max-w-[min(100%,12rem)] truncate rounded px-1 py-0.5 text-neutral-400 transition-colors hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
                onClick={onNavigateToEditorForm}
              >
                {routineFormCrumb}
              </button>
              <span className="text-neutral-600">/</span>
            </>
          ) : null}
          <span className="rounded-full border border-goi-gold/30 bg-goi-gold/15 px-2 py-0.5 font-medium text-goi-gold">
            Catálogo
          </span>
        </nav>
        <p className="text-xs font-medium uppercase tracking-wider text-goi-gold-dim">Catálogo</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-neutral-100 light:text-zinc-900 sm:text-2xl">
          Catálogo de ejercicios
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500 light:text-zinc-600">
          Filtra por nombre, músculos y tipo de material. Puedes combinar filtros: entre categorías deben cumplirse todos los
          grupos activos; dentro de músculos o de material, basta con coincidir con una etiqueta. Marca filas para la rutina o
          abre la ficha.
        </p>
      </header>

      <ExerciseCatalogPanel
        variant="full"
        onOpenExerciseDetail={onOpenExerciseDetail}
        creationFlowLabel={creationFlowLabel}
        onBack={onBack}
        onNewRoutineWithExerciseIds={onNewRoutineWithExerciseIds}
      />
    </section>
  );
}
