import { useMemo, useState } from "react";
import type { Exercise } from "../../types/exercise";
import { Button } from "../ui/Button";
import { WORKOUT_EXERCISES_MAX } from "./workoutFormLimits";

type ExercisePickerProps = {
  exerciseIds: string[];
  catalog: Exercise[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  catalogError?: string | null;
  catalogLoading?: boolean;
  /** Abre el catalogo completo (p. ej. al elegir un ejercicio nuevo). */
  onOpenCatalog?: () => void;
};

export function ExercisePicker({
  exerciseIds,
  catalog,
  onChange,
  disabled = false,
  catalogError,
  catalogLoading = false,
  onOpenCatalog,
}: ExercisePickerProps) {
  const [query, setQuery] = useState("");

  const byId = useMemo(() => new Map(catalog.map((e) => [e.id, e])), [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .filter((e) => !q || e.name.toLowerCase().includes(q))
      .slice(0, 40);
  }, [catalog, query]);

  function addId(id: string) {
    if (disabled || exerciseIds.length >= WORKOUT_EXERCISES_MAX) return;
    onChange([...exerciseIds, id]);
    setQuery("");
  }

  function removeAt(index: number) {
    onChange(exerciseIds.filter((_, i) => i !== index));
  }

  function move(index: number, delta: -1 | 1) {
    const j = index + delta;
    if (j < 0 || j >= exerciseIds.length) return;
    const next = [...exerciseIds];
    const tmp = next[index];
    next[index] = next[j]!;
    next[j] = tmp!;
    onChange(next);
  }

  if (catalogError) {
    return (
      <p className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
        {catalogError}
      </p>
    );
  }

  if (catalogLoading) {
    return <p className="text-sm text-neutral-500">Cargando catalogo de ejercicios…</p>;
  }

  const addFromCatalog = onOpenCatalog ? (
    <div className="grid gap-2">
      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={disabled || exerciseIds.length >= WORKOUT_EXERCISES_MAX}
        onClick={onOpenCatalog}
      >
        {exerciseIds.length >= WORKOUT_EXERCISES_MAX
          ? "Limite de ejercicios alcanzado"
          : "Elegir ejercicios en el catalogo"}
      </Button>
      {exerciseIds.length >= WORKOUT_EXERCISES_MAX ? (
        <p className="text-sm text-neutral-500">Quita un ejercicio de la lista para añadir mas desde el catalogo.</p>
      ) : null}
    </div>
  ) : (
    <>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-neutral-400">Buscar en el catalogo</span>
        <input
          className="goi-field"
          type="search"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Empieza a escribir…"
          autoComplete="off"
          aria-label="Buscar ejercicio para añadir"
        />
      </label>

      {filtered.length > 0 ? (
        <ul
          className="max-h-48 list-none space-y-1 overflow-y-auto rounded-md border border-neutral-800 bg-black/25 p-1.5"
          aria-label="Resultados del catalogo"
        >
          {filtered.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                disabled={disabled || exerciseIds.length >= WORKOUT_EXERCISES_MAX}
                className="w-full rounded px-2 py-2 text-left text-sm text-neutral-200 transition-colors hover:bg-goi-gold/10 hover:text-goi-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35 disabled:opacity-40"
                onClick={() => addId(e.id)}
              >
                {e.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">
          {query.trim()
            ? "Ningun resultado (prueba otro termino o ya estan todos elegidos)."
            : "Escribe para filtrar o elige de la lista."}
        </p>
      )}
    </>
  );

  return (
    <div className="grid gap-3">
      {addFromCatalog}

      <div className="grid gap-2">
        <span className="text-sm font-semibold text-neutral-300">
          En esta rutina ({exerciseIds.length}/{WORKOUT_EXERCISES_MAX})
        </span>
        {exerciseIds.length === 0 ? (
          <p className="text-sm text-neutral-500">Aun no has añadido ejercicios.</p>
        ) : (
          <ul className="grid list-none gap-2 p-0">
            {exerciseIds.map((id, index) => {
              const ex = byId.get(id);
              const label = ex?.name ?? `ID desconocido (${id.slice(0, 8)}…)`;
              return (
                <li
                  key={`${id}-${index}`}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-800/80 bg-black/20 p-2 max-sm:flex-col max-sm:items-stretch"
                >
                  <span className="flex w-7 shrink-0 justify-center text-xs font-semibold tabular-nums text-goi-gold-dim sm:w-8">
                    {index + 1}.
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-neutral-200">{label}</span>
                  <div className="flex shrink-0 flex-wrap gap-1.5 sm:gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="!px-2 !py-1.5 text-xs"
                      disabled={disabled || index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={`Subir ejercicio ${index + 1}`}
                    >
                      Arriba
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="!px-2 !py-1.5 text-xs"
                      disabled={disabled || index >= exerciseIds.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={`Bajar ejercicio ${index + 1}`}
                    >
                      Abajo
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="!px-2 !py-1.5 text-xs"
                      disabled={disabled}
                      onClick={() => removeAt(index)}
                    >
                      Quitar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
