import { useMemo, useState } from "react";
import { CATALOG_EQUIPMENT_OPTIONS } from "../../data/exerciseEquipmentFilters";
import { CATALOG_MUSCLE_OPTIONS } from "../../data/exerciseMuscleFilters";
import { WORKOUT_SET_TYPE_OPTIONS } from "../../data/workoutSetTypes";
import type { Exercise } from "../../types/exercise";
import type { WorkoutExerciseBlock, WorkoutSetRow } from "../../types/workout";
import { createBlockForExercise, createEmptySet } from "../../utils/workoutBlocks";
import { Button } from "../ui/Button";
import {
  WORKOUT_EXERCISES_MAX,
  WORKOUT_SET_FIELD_MAX_LEN,
  WORKOUT_SETS_MAX_PER_EXERCISE,
} from "./workoutFormLimits";

const EQUIPMENT_LABEL = Object.fromEntries(
  CATALOG_EQUIPMENT_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

const MUSCLE_LABEL = Object.fromEntries(
  CATALOG_MUSCLE_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

const LATERALITY_OPTIONS = [
  { slug: "bilateral" as const, label: "Bilateral" },
  { slug: "unilateral" as const, label: "Unilateral" },
];

type ExercisePickerProps = {
  exerciseBlocks: WorkoutExerciseBlock[];
  onChange: (blocks: WorkoutExerciseBlock[]) => void;
  catalog: Exercise[];
  disabled?: boolean;
  catalogError?: string | null;
  catalogLoading?: boolean;
  onOpenCatalog?: () => void;
};

function updateBlock(
  blocks: WorkoutExerciseBlock[],
  index: number,
  fn: (b: WorkoutExerciseBlock) => WorkoutExerciseBlock,
): WorkoutExerciseBlock[] {
  return blocks.map((b, i) => (i === index ? fn(b) : b));
}

export function ExercisePicker({
  exerciseBlocks: blocks,
  onChange: onChangeBlocks,
  catalog,
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
    if (disabled || blocks.length >= WORKOUT_EXERCISES_MAX) return;
    onChangeBlocks([...blocks, createBlockForExercise(id)]);
    setQuery("");
  }

  function removeAt(index: number) {
    onChangeBlocks(blocks.filter((_, i) => i !== index));
  }

  function move(index: number, delta: -1 | 1) {
    const j = index + delta;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[index];
    next[index] = next[j]!;
    next[j] = tmp!;
    onChangeBlocks(next);
  }

  function setEquipment(index: number, slug: string) {
    onChangeBlocks(
      updateBlock(blocks, index, (b) => ({
        ...b,
        equipmentSlug: b.equipmentSlug === slug ? "" : slug,
      })),
    );
  }

  function setLaterality(index: number, slug: "bilateral" | "unilateral") {
    onChangeBlocks(
      updateBlock(blocks, index, (b) => ({
        ...b,
        laterality: slug,
      })),
    );
  }

  function addSet(blockIndex: number) {
    onChangeBlocks(
      updateBlock(blocks, blockIndex, (b) => {
        if (b.sets.length >= WORKOUT_SETS_MAX_PER_EXERCISE) return b;
        return { ...b, sets: [...b.sets, createEmptySet()] };
      }),
    );
  }

  function removeSet(blockIndex: number, setIndex: number) {
    onChangeBlocks(
      updateBlock(blocks, blockIndex, (b) => {
        if (b.sets.length <= 1) return b;
        return { ...b, sets: b.sets.filter((_, i) => i !== setIndex) };
      }),
    );
  }

  function patchSet(blockIndex: number, setIndex: number, patch: Partial<WorkoutSetRow>) {
    onChangeBlocks(
      updateBlock(blocks, blockIndex, (b) => ({
        ...b,
        sets: b.sets.map((row, i) => (i === setIndex ? { ...row, ...patch } : row)),
      })),
    );
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
        disabled={disabled || blocks.length >= WORKOUT_EXERCISES_MAX}
        onClick={onOpenCatalog}
      >
        {blocks.length >= WORKOUT_EXERCISES_MAX
          ? "Limite de ejercicios alcanzado"
          : "Elegir ejercicios en el catalogo"}
      </Button>
      {blocks.length >= WORKOUT_EXERCISES_MAX ? (
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
                disabled={disabled || blocks.length >= WORKOUT_EXERCISES_MAX}
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
          En esta rutina ({blocks.length}/{WORKOUT_EXERCISES_MAX})
        </span>
        {blocks.length === 0 ? (
          <p className="text-sm text-neutral-500">Aun no has añadido ejercicios.</p>
        ) : (
          <ul className="grid list-none gap-3 p-0">
            {blocks.map((block, index) => {
              const ex = byId.get(block.exerciseId);
              const label = ex?.name ?? `ID desconocido (${block.exerciseId.slice(0, 8)}…)`;
              return (
                <li
                  key={`${block.exerciseId}-${index}`}
                  className="rounded-md border border-neutral-800/80 bg-black/25 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800/60 pb-2 max-sm:flex-col max-sm:items-stretch">
                    <span className="flex w-7 shrink-0 justify-center text-xs font-semibold tabular-nums text-goi-gold-dim sm:w-8">
                      {index + 1}.
                    </span>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="text-sm font-medium text-neutral-100">{label}</span>
                      <span className="inline-block rounded-full border border-neutral-700 bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        {(block.laterality ?? "bilateral") === "unilateral" ? "Unilateral" : "Bilateral"}
                      </span>
                      {block.equipmentSlug ? (
                        <span className="inline-block rounded-full border border-amber-500/35 bg-amber-950/30 px-2 py-0.5 text-[10px] font-medium text-amber-100/90">
                          {EQUIPMENT_LABEL[block.equipmentSlug] ?? block.equipmentSlug}
                        </span>
                      ) : null}
                      {(ex?.muscles ?? []).map((slug) => (
                        <span
                          key={slug}
                          className="inline-block rounded-full border border-goi-gold-dim/35 bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-goi-steel"
                        >
                          {MUSCLE_LABEL[slug] ?? slug}
                        </span>
                      ))}
                    </div>
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
                        disabled={disabled || index >= blocks.length - 1}
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
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Ejecucion</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {LATERALITY_OPTIONS.map((opt) => {
                        const active = (block.laterality ?? "bilateral") === opt.slug;
                        return (
                          <button
                            key={opt.slug}
                            type="button"
                            disabled={disabled}
                            onClick={() => setLaterality(index, opt.slug)}
                            className={
                              active
                                ? "rounded-full border border-sky-500/40 bg-sky-950/40 px-2.5 py-1 text-xs text-sky-100"
                                : "rounded-full border border-neutral-700 bg-neutral-950/80 px-2.5 py-1 text-xs text-neutral-300 hover:border-neutral-500 disabled:opacity-40"
                            }
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Material</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {CATALOG_EQUIPMENT_OPTIONS.map((opt) => {
                        const active = block.equipmentSlug === opt.slug;
                        return (
                          <button
                            key={opt.slug}
                            type="button"
                            disabled={disabled}
                            onClick={() => setEquipment(index, opt.slug)}
                            className={
                              active
                                ? "rounded-full border border-goi-gold/40 bg-goi-gold/15 px-2.5 py-1 text-xs text-goi-gold"
                                : "rounded-full border border-neutral-700 bg-neutral-950/80 px-2.5 py-1 text-xs text-neutral-300 hover:border-neutral-500 disabled:opacity-40"
                            }
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                      <span className="self-center text-[10px] text-neutral-600">
                        {block.equipmentSlug
                          ? `· ${EQUIPMENT_LABEL[block.equipmentSlug] ?? block.equipmentSlug}`
                          : "· opcional"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Series</p>
                      <Button
                        type="button"
                        variant="secondary"
                        className="!px-2 !py-1 text-xs"
                        disabled={disabled || block.sets.length >= WORKOUT_SETS_MAX_PER_EXERCISE}
                        onClick={() => addSet(index)}
                      >
                        Añadir serie
                      </Button>
                    </div>
                    <div className="mt-2 overflow-x-auto rounded-md border border-neutral-800/80 bg-black/20">
                      <table className="w-full min-w-[520px] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-neutral-800 text-left text-[10px] uppercase tracking-wide text-neutral-500">
                            <th className="px-2 py-2 font-semibold">#</th>
                            <th className="px-2 py-2 font-semibold">Reps</th>
                            <th className="px-2 py-2 font-semibold">Peso</th>
                            <th className="min-w-[9rem] px-2 py-2 font-semibold">Tipo de serie</th>
                            <th className="px-2 py-2 font-semibold" />
                          </tr>
                        </thead>
                        <tbody>
                          {block.sets.map((row, sIdx) => (
                            <tr key={`set-${index}-${sIdx}`} className="border-b border-neutral-800/50 last:border-b-0">
                              <td className="px-2 py-1.5 tabular-nums text-neutral-500">{sIdx + 1}</td>
                              <td className="px-2 py-1.5">
                                <input
                                  className="goi-field w-full min-w-[4rem] py-1.5 text-sm"
                                  maxLength={WORKOUT_SET_FIELD_MAX_LEN}
                                  disabled={disabled}
                                  value={row.reps}
                                  onChange={(e) => patchSet(index, sIdx, { reps: e.target.value })}
                                  placeholder="p. ej. 8"
                                  aria-label={`Repeticiones serie ${sIdx + 1}`}
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  className="goi-field w-full min-w-[4rem] py-1.5 text-sm"
                                  maxLength={WORKOUT_SET_FIELD_MAX_LEN}
                                  disabled={disabled}
                                  value={row.weight}
                                  onChange={(e) => patchSet(index, sIdx, { weight: e.target.value })}
                                  placeholder="kg"
                                  aria-label={`Peso serie ${sIdx + 1}`}
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <select
                                  className="goi-field w-full py-1.5 text-sm"
                                  disabled={disabled}
                                  value={row.setType}
                                  onChange={(e) => patchSet(index, sIdx, { setType: e.target.value })}
                                  aria-label={`Tipo de serie ${sIdx + 1}`}
                                >
                                  {WORKOUT_SET_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.slug} value={opt.slug}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="!px-2 !py-1 text-xs"
                                  disabled={disabled || block.sets.length <= 1}
                                  onClick={() => removeSet(index, sIdx)}
                                >
                                  Eliminar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
