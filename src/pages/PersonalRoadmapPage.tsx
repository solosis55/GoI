import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPersonalRoadmap, savePersonalRoadmap } from "../api/personalRoadmapApi";
import { RoadmapDiagram } from "../components/roadmap/RoadmapDiagram";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Button } from "../components/ui/Button";
import {
  appendChild,
  filterRemoveTask,
  loadRoadmap,
  mapRoadmapTasks,
  newRoadmapTask,
  saveRoadmap,
  type BranchLayout,
  type RoadmapTask,
} from "../utils/personalRoadmap";

const TRELLO_PUBLIC_ROADMAP = "https://trello.com/b/6Yn18TWn/red-social-goi";

type PersistMode = "loading" | "projectDisk" | "browserOnly";

export function PersonalRoadmapPage() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [persistMode, setPersistMode] = useState<PersistMode>("loading");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Primera carga: servidor (fuente de verdad en desarrollo) → si falla, localStorage. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromApi = await fetchPersonalRoadmap();
      if (cancelled) return;
      if (fromApi !== null) {
        setTasks(fromApi);
        saveRoadmap(fromApi);
        setPersistMode("projectDisk");
      } else {
        setTasks(loadRoadmap());
        setPersistMode("browserOnly");
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const persistTasks = useCallback(async () => {
    setSaving(true);
    try {
      saveRoadmap(tasks);
      const ok = await savePersonalRoadmap(tasks);
      setPersistMode((prev) => {
        const next = ok ? "projectDisk" : "browserOnly";
        return prev === next ? prev : next;
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [tasks]);

  const onToggle = useCallback((id: string) => {
    setTasks((prev) => mapRoadmapTasks(prev, id, (t) => ({ ...t, done: !t.done })));
    setDirty(true);
  }, []);

  const onTitleChange = useCallback((id: string, title: string) => {
    setTasks((prev) => mapRoadmapTasks(prev, id, (t) => ({ ...t, title })));
    setDirty(true);
  }, []);

  const onRemove = useCallback((id: string) => {
    setTasks((prev) => filterRemoveTask(prev, id));
    setDirty(true);
  }, []);

  const onAddChild = useCallback((parentId: string) => {
    setTasks((prev) => appendChild(prev, parentId, newRoadmapTask("Nueva rama")));
    setDirty(true);
  }, []);

  const addRootTask = useCallback(() => {
    setTasks((prev) => appendChild(prev, null, newRoadmapTask("Nodo raíz")));
    setDirty(true);
  }, []);

  const onBranchLayoutChange = useCallback((id: string, branchLayout: BranchLayout) => {
    setTasks((prev) => mapRoadmapTasks(prev, id, (t) => ({ ...t, branchLayout })));
    setDirty(true);
  }, []);

  const handlers = useMemo(
    () => ({ onToggle, onTitleChange, onRemove, onAddChild, onBranchLayoutChange }),
    [onToggle, onTitleChange, onRemove, onAddChild, onBranchLayoutChange],
  );

  return (
    <div className="flex min-h-screen flex-col bg-black text-neutral-300 light:bg-zinc-100 light:text-zinc-800">
      <header className="border-b border-neutral-900 px-4 py-4 light:border-zinc-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-goi-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black light:focus-visible:ring-offset-white"
          >
            ← Volver a GoI
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-goi-gold-dim">Roadmap personal</span>
        </div>
      </header>
      <main className="flex-1 px-4 py-8 pb-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 light:text-zinc-900">Diagrama de roadmap</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-neutral-500 light:text-zinc-600">
            Vista tipo organigrama con líneas SVG: puedes acercar con{" "}
            <strong className="font-semibold text-neutral-400 light:text-zinc-700">Ctrl + rueda</strong>, mover la vista libremente arrastrando el fondo (o el{" "}
            <strong className="font-semibold text-neutral-400 light:text-zinc-700">botón central</strong> desde cualquier parte) y usar Encajar para volver al encaje completo. Los botones − / + y Encajar están encima del lienzo. Pulsa{" "}
            <strong className="font-semibold text-neutral-400 light:text-zinc-700">Guardar cambios</strong> cuando quieras escribir en disco y en el navegador: con el servidor de desarrollo en marcha se actualiza{" "}
            <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-neutral-300 light:bg-zinc-200 light:text-zinc-800">
              server/data/personal-roadmap.json
            </code>
            ; si la API no responde, la copia local del navegador se guarda igual al pulsar el botón.
          </p>

          <p
            className={[
              "mt-3 max-w-2xl rounded-lg border px-3 py-2 text-xs leading-relaxed",
              persistMode === "projectDisk"
                ? "border-goi-gold/35 bg-neutral-950/50 text-goi-gold/95 light:border-amber-200 light:bg-amber-50 light:text-amber-950 healthy:border-goi-gold/25 healthy:bg-goi-gold/[0.07] healthy:text-goi-gold-dim"
                : persistMode === "browserOnly"
                  ? "border-amber-900/60 bg-amber-950/25 text-amber-100/95 light:border-amber-200 healthy:border-goi-gold/22 light:bg-amber-50 healthy:bg-goi-gold/[0.09] light:text-amber-950 healthy:text-goi-gold-dim"
                  : "border-neutral-800 text-neutral-500 light:border-zinc-200 light:bg-zinc-50 light:text-zinc-600",
            ].join(" ")}
            role="status"
          >
            {persistMode === "loading" ? (
              <>Comprobando almacenamiento del proyecto…</>
            ) : persistMode === "projectDisk" ? (
              <>
                <strong className="font-semibold">Último guardado:</strong> sincronizado con el archivo del proyecto y copia en el
                navegador (usa el botón para volver a guardar tras editar).
              </>
            ) : (
              <>
                <strong className="font-semibold">Solo navegador en disco:</strong> la última vez no se pudo escribir el archivo del
                proyecto (¿servidor en{" "}
                <code className="rounded bg-black/40 px-1 py-px light:bg-white/80">localhost:4000</code>?). Pulsa guardar con la API en marcha para sincronizar; mientras tanto localStorage se actualiza al guardar.
              </>
            )}
          </p>

          {dirty ? (
            <p className="mt-3 max-w-2xl rounded-lg border border-amber-900/55 bg-amber-950/25 px-3 py-2 text-xs text-amber-100/95 light:border-amber-300 healthy:border-goi-gold/26 light:bg-amber-50 healthy:bg-goi-gold/[0.09] light:text-amber-950 healthy:text-goi-gold-dim">
              Tienes cambios sin guardar. Pulsa <strong className="font-semibold">Guardar cambios</strong> para persistirlos.
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={persistTasks}
              disabled={!hydrated || !dirty || saving}
              aria-busy={saving}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
            <Button type="button" variant="secondary" onClick={addRootTask}>
              Añadir nodo raíz
            </Button>
            {tasks.length > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (window.confirm("¿Borrar todo el diagrama? Los cambios no se aplican en disco hasta que guardes.")) {
                    setTasks([]);
                    setDirty(true);
                  }
                }}
              >
                Vaciar diagrama
              </Button>
            ) : null}
          </div>

          <div className="roadmap-diagram-canvas mt-8 rounded-2xl p-4 md:p-6">
            {!hydrated ? (
              <p className="py-10 text-center text-sm text-neutral-500 light:text-zinc-600">Cargando diagrama…</p>
            ) : tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-600/80 bg-black/30 px-4 py-10 text-center text-sm text-neutral-500 light:border-zinc-300 light:bg-white/60 light:text-zinc-600">
                Sin nodos todavía. Pulsa <strong className="text-neutral-400 light:text-zinc-800">Añadir nodo raíz</strong> para
                dibujar tu primer bloque en el diagrama.
              </p>
            ) : (
              <RoadmapDiagram tasks={tasks} handlers={handlers} />
            )}
          </div>

          <p className="mt-12 border-t border-neutral-800 pt-6 text-sm text-neutral-600 light:border-zinc-200 light:text-zinc-500">
            Roadmap público del proyecto (Trello):{" "}
            <a
              href={TRELLO_PUBLIC_ROADMAP}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-goi-gold underline-offset-2 hover:underline"
            >
              tablero GoI
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
