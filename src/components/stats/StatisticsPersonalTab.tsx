import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPersonalBody, putPersonalBody } from "../../api/personalBodyApi";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { MuscleBodyGlowMap } from "./MuscleBodyGlowMap";
import { PersonalMetricCharts } from "./PersonalMetricCharts";
import type { MuscleOctagonAxis } from "../../utils/muscleOctagonStats";
import { getErrorMessage } from "../../utils/errorMessages";
import { compressImageFileToJpegDataUrl } from "../../utils/imageCompress";
import {
  appendHistoryEntry,
  computeBmi,
  deleteHistoryEntry,
  deleteProgressPhoto,
  addProgressPhoto,
  EMPTY_GOALS,
  EMPTY_PERSONAL_BODY,
  exportPersonalDataCsv,
  loadBundle,
  mergeRemotePersonalBody,
  type PersonalBodyBundle,
  type PersonalBodyMetrics,
  type PersonalGoals,
  saveBundle,
  sanitizePersonalBody,
} from "../../utils/personalBodyPrefs";

type StatisticsPersonalTabProps = {
  userId: string;
  octHits: Record<MuscleOctagonAxis, number>;
};

function parseOptFloat(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseBodyFat(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = parseFloat(t);
  if (!Number.isFinite(n) || n < 3 || n > 70) return null;
  return Math.round(n * 10) / 10;
}

function downloadCsv(userId: string) {
  const csv = exportPersonalDataCsv(userId);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `goi-metricas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type RemoteSyncState = "idle" | "syncing" | "synced" | "offline";

export function StatisticsPersonalTab({ userId, octHits }: StatisticsPersonalTabProps) {
  const [draft, setDraft] = useState<PersonalBodyMetrics>(EMPTY_PERSONAL_BODY);
  const [goals, setGoals] = useState<PersonalGoals>(EMPTY_GOALS);
  const [historyNote, setHistoryNote] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);
  const [bundleTick, setBundleTick] = useState(0);
  const [remoteSync, setRemoteSync] = useState<RemoteSyncState>("syncing");
  const [syncError, setSyncError] = useState("");

  const bundle = useMemo(() => loadBundle(userId), [userId, bundleTick]);

  const hydrateFromBundle = useCallback((b: PersonalBodyBundle) => {
    let m = { ...b.metrics };
    if (m.bicepsCm != null && m.bicepsLeftCm == null && m.bicepsRightCm == null) {
      m = { ...m, bicepsLeftCm: m.bicepsCm, bicepsRightCm: m.bicepsCm };
    }
    setDraft(m);
    setGoals({ ...b.goals });
  }, []);

  useEffect(() => {
    hydrateFromBundle(loadBundle(userId));
  }, [userId, hydrateFromBundle]);

  useEffect(() => {
    let cancelled = false;
    setRemoteSync("syncing");
    void fetchPersonalBody()
      .then((res) => {
        if (cancelled) return;
        const local = loadBundle(userId);
        const { bundle: merged, changed } = mergeRemotePersonalBody(local, res.bundle, res.serverWrittenAt);
        if (changed) {
          saveBundle(userId, merged);
          hydrateFromBundle(merged);
          setBundleTick((t) => t + 1);
        }
        setRemoteSync("synced");
        setSyncError("");
      })
      .catch(() => {
        if (!cancelled) setRemoteSync("offline");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, hydrateFromBundle]);

  const bmi = useMemo(() => computeBmi(draft.weightKg, draft.heightCm), [draft.weightKg, draft.heightCm]);

  const weightProgress = useMemo(() => {
    if (goals.targetWeightKg == null || draft.weightKg == null) return null;
    return Math.round((draft.weightKg - goals.targetWeightKg) * 10) / 10;
  }, [goals.targetWeightKg, draft.weightKg]);

  const waistProgress = useMemo(() => {
    if (goals.targetWaistCm == null || draft.waistCm == null) return null;
    return Math.round((draft.waistCm - goals.targetWaistCm) * 10) / 10;
  }, [goals.targetWaistCm, draft.waistCm]);

  function patch<K extends keyof PersonalBodyMetrics>(key: K, value: PersonalBodyMetrics[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function patchGoal<K extends keyof PersonalGoals>(key: K, value: PersonalGoals[K]) {
    setGoals((prev) => ({ ...prev, [key]: value }));
  }

  const bump = useCallback(() => setBundleTick((t) => t + 1), []);

  async function handleSaveAll() {
    const b = loadBundle(userId);
    b.metrics = sanitizePersonalBody(draft);
    b.goals = {
      targetWeightKg: goals.targetWeightKg,
      targetWaistCm: goals.targetWaistCm,
      targetDate: goals.targetDate,
      note: goals.note.slice(0, 2000),
    };
    saveBundle(userId, b);
    bump();
    setSavedMsg(true);
    window.setTimeout(() => setSavedMsg(false), 2200);
    setSyncError("");
    try {
      await putPersonalBody(loadBundle(userId));
      setRemoteSync("synced");
    } catch (e) {
      setSyncError(getErrorMessage(e, "No se pudo guardar en el servidor."));
      setRemoteSync("offline");
    }
  }

  function handleRegisterHistory() {
    appendHistoryEntry(userId, draft, historyNote);
    setHistoryNote("");
    bump();
  }

  async function onPickPhoto(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await compressImageFileToJpegDataUrl(file, { maxEdge: 1200, quality: 0.82 });
      const ok = addProgressPhoto(userId, dataUrl, photoCaption);
      setPhotoCaption("");
      if (!ok) {
        window.alert(
          "No se pudo guardar la foto (límite de tamaño o número máximo de fotos). Prueba otra imagen más pequeña.",
        );
      }
      bump();
    } catch {
      window.alert("No se pudo procesar la imagen.");
    }
  }

  const recentHistory = useMemo(() => [...bundle.history].reverse().slice(0, 12), [bundle.history]);

  return (
    <div className="space-y-6">
      <Card tone="dark" className="border-emerald-900/30 bg-emerald-950/10 light:border-emerald-200/80 light:bg-emerald-50/60">
        <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Resumen</h2>
        <p className="mt-1 text-xs leading-relaxed text-neutral-400 light:text-zinc-700">
          Los datos se guardan en este navegador y, si el backend está disponible, en{" "}
          <strong className="font-medium text-neutral-300 light:text-zinc-800">servidor</strong> (archivo por usuario en la API).
          Usa <strong className="font-medium text-neutral-300 light:text-zinc-800">exportar CSV</strong> para una copia portable.
        </p>
        <p className="mt-2 text-[11px] text-neutral-500 light:text-zinc-600">
          {remoteSync === "syncing" ? "Sincronizando con el servidor…" : null}
          {remoteSync === "synced" ? "Servidor consultado: si había una copia más reciente, ya está aplicada." : null}
          {remoteSync === "offline"
            ? "No se pudo contactar con la API; solo verás datos locales hasta que haya conexión."
            : null}
        </p>
      </Card>

      <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
        <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Objetivos</h2>
        <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
          Referencias para seguir evolución (no calculan nada automático salvo la diferencia abajo).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Peso objetivo (kg)</span>
            <input
              className="goi-field tabular-nums"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              placeholder="—"
              value={goals.targetWeightKg ?? ""}
              onChange={(e) => patchGoal("targetWeightKg", parseOptFloat(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Cintura objetivo (cm)</span>
            <input
              className="goi-field tabular-nums"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              placeholder="—"
              value={goals.targetWaistCm ?? ""}
              onChange={(e) => patchGoal("targetWaistCm", parseOptFloat(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Fecha referencia</span>
            <input
              className="goi-field"
              type="date"
              value={goals.targetDate ?? ""}
              onChange={(e) => patchGoal("targetDate", e.target.value || null)}
            />
          </label>
        </div>
        <label className="mt-4 grid gap-1.5">
          <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Nota (motivación, contexto)</span>
          <textarea
            className="goi-field min-h-[72px] resize-y"
            maxLength={2000}
            placeholder="Opcional"
            value={goals.note}
            onChange={(e) => patchGoal("note", e.target.value)}
          />
        </label>
        {(weightProgress != null || waistProgress != null) && (
          <div className="mt-3 rounded-lg border border-neutral-800/60 bg-black/20 px-3 py-2 text-xs text-neutral-300 light:border-zinc-200 light:bg-white light:text-zinc-800">
            {weightProgress != null ? (
              <p className="m-0">
                <span className="font-medium text-goi-gold light:text-amber-900">Peso vs objetivo:</span>{" "}
                {weightProgress > 0 ? "+" : ""}
                {weightProgress} kg respecto al objetivo.
              </p>
            ) : null}
            {waistProgress != null ? (
              <p className={weightProgress != null ? "mt-1.5" : "m-0"}>
                <span className="font-medium text-goi-gold light:text-amber-900">Cintura vs objetivo:</span>{" "}
                {waistProgress > 0 ? "+" : ""}
                {waistProgress} cm respecto al objetivo.
              </p>
            ) : null}
          </div>
        )}
      </Card>

      <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
        <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Peso, altura y composición</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Peso (kg)</span>
            <input
              className="goi-field tabular-nums"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              placeholder="—"
              value={draft.weightKg ?? ""}
              onChange={(e) => patch("weightKg", parseOptFloat(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Altura (cm)</span>
            <input
              className="goi-field tabular-nums"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              placeholder="—"
              value={draft.heightCm ?? ""}
              onChange={(e) => patch("heightCm", parseOptFloat(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">% grasa corporal</span>
            <input
              className="goi-field tabular-nums"
              type="number"
              inputMode="decimal"
              min={3}
              max={70}
              step={0.1}
              placeholder="Opcional ( báscula / plicómetro )"
              value={draft.bodyFatPercent ?? ""}
              onChange={(e) => patch("bodyFatPercent", parseBodyFat(e.target.value))}
            />
          </label>
        </div>
        {bmi != null ? (
          <p className="mt-3 text-sm text-neutral-300 light:text-zinc-800">
            <span className="font-medium text-goi-gold light:text-amber-900">IMC:</span> {bmi}{" "}
            <span className="text-neutral-500 light:text-zinc-600">(orientativo)</span>
          </p>
        ) : null}
      </Card>

      <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
        <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Medidas (cm)</h2>
        <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
          Pecho, cintura, cadera, brazos izq./der., antebrazo, muslo, gemelo y cuello.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["chestCm", "Pecho"] as const,
              ["waistCm", "Cintura"] as const,
              ["hipsCm", "Cadera"] as const,
              ["bicepsLeftCm", "Brazo izq."] as const,
              ["bicepsRightCm", "Brazo der."] as const,
              ["forearmCm", "Antebrazo"] as const,
              ["thighCm", "Muslo"] as const,
              ["calfCm", "Gemelo"] as const,
              ["neckCm", "Cuello"] as const,
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="grid gap-1.5">
              <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">{label}</span>
              <input
                className="goi-field tabular-nums"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                placeholder="—"
                value={draft[key] ?? ""}
                onChange={(e) => patch(key, parseOptFloat(e.target.value))}
              />
            </label>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-neutral-600 light:text-zinc-600">
          Si antes solo tenías un único “brazo”, se ha copiado a izquierda y derecha al cargar; puedes ajustarlo.
        </p>
      </Card>

      <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
        <h2 className="mt-0 text-sm font-semibold text-neutral-100 light:text-zinc-900">Historial y gráficas</h2>
        <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
          Cada vez que registres una medición se guarda una copia con fecha. Las gráficas usan solo entradas con peso,
          cintura o % grasa informados.
        </p>
        <PersonalMetricCharts history={bundle.history} className="mt-4" />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid min-w-0 flex-1 gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Nota en esta entrada</span>
            <input
              className="goi-field"
              placeholder="Ej.: primera medición post-vacaciones"
              value={historyNote}
              maxLength={500}
              onChange={(e) => setHistoryNote(e.target.value)}
            />
          </label>
          <Button type="button" variant="secondary" className="shrink-0 !py-2 !text-sm" onClick={handleRegisterHistory}>
            Registrar medición en historial
          </Button>
        </div>

        {recentHistory.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-800/60 light:border-zinc-200">
            <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-neutral-800 bg-black/30 light:border-zinc-200 light:bg-zinc-100">
                  <th className="px-2 py-2 font-semibold text-neutral-400 light:text-zinc-700">Fecha</th>
                  <th className="px-2 py-2 font-semibold text-neutral-400 light:text-zinc-700">Peso</th>
                  <th className="px-2 py-2 font-semibold text-neutral-400 light:text-zinc-700">Cintura</th>
                  <th className="px-2 py-2 font-semibold text-neutral-400 light:text-zinc-700">Nota</th>
                  <th className="px-2 py-2 font-semibold text-neutral-400 light:text-zinc-700"> </th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((h) => (
                  <tr key={h.id} className="border-b border-neutral-800/40 light:border-zinc-100">
                    <td className="px-2 py-2 tabular-nums text-neutral-300 light:text-zinc-800">
                      {new Date(h.at).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-2 py-2 tabular-nums text-neutral-400 light:text-zinc-700">
                      {h.metrics.weightKg ?? "—"}
                    </td>
                    <td className="px-2 py-2 tabular-nums text-neutral-400 light:text-zinc-700">
                      {h.metrics.waistCm ?? "—"}
                    </td>
                    <td className="max-w-[200px] truncate px-2 py-2 text-neutral-500 light:text-zinc-600" title={h.note}>
                      {h.note || "—"}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        className="text-[11px] font-medium text-red-400 underline-offset-2 hover:underline light:text-red-700"
                        onClick={() => {
                          deleteHistoryEntry(userId, h.id);
                          bump();
                        }}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-xs text-neutral-500 light:text-zinc-600">Aún no hay entradas en el historial.</p>
        )}
      </Card>

      <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
        <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Fotos de progreso</h2>
        <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
          Se comprimen en el navegador. Máximo {18} fotos; si falla el guardado, borra alguna o usa imágenes más
          pequeñas.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid min-w-0 flex-1 gap-1.5">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Pie de foto (opcional)</span>
            <input
              className="goi-field"
              value={photoCaption}
              maxLength={500}
              placeholder="Ej.: Semana 4 volumen"
              onChange={(e) => setPhotoCaption(e.target.value)}
            />
          </label>
          <label className="inline-flex cursor-pointer flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400 light:text-zinc-600">Añadir imagen</span>
            <input
              type="file"
              accept="image/*"
              className="goi-field cursor-pointer text-xs file:mr-2 file:rounded-md file:border-0 file:bg-neutral-700 file:px-2 file:py-1 file:text-xs file:text-neutral-200 light:file:bg-zinc-200 light:file:text-zinc-900"
              onChange={(e) => {
                void onPickPhoto(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {bundle.photos.length > 0 ? (
          <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
            {[...bundle.photos].reverse().map((p) => (
              <li
                key={p.id}
                className="overflow-hidden rounded-xl border border-neutral-800/70 bg-black/40 light:border-zinc-200 light:bg-zinc-50"
              >
                <div className="relative aspect-[3/4] w-full bg-black/50">
                  <img src={p.dataUrl} alt="" className="size-full object-cover" />
                </div>
                <div className="space-y-1 px-2 py-2">
                  <p className="text-[10px] text-neutral-500 light:text-zinc-600">
                    {new Date(p.at).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {p.caption ? <p className="text-[11px] text-neutral-300 light:text-zinc-800">{p.caption}</p> : null}
                  <button
                    type="button"
                    className="text-[11px] font-medium text-red-400 hover:underline light:text-red-700"
                    onClick={() => {
                      deleteProgressPhoto(userId, p.id);
                      bump();
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-neutral-500 light:text-zinc-600">Sin fotos todavía.</p>
        )}
      </Card>

      <Card tone="dark" className="border-neutral-800/70 light:border-zinc-200">
        <h2 className="text-sm font-semibold text-neutral-100 light:text-zinc-900">Mapa corporal (entrenos)</h2>
        <p className="mt-1 text-xs text-neutral-500 light:text-zinc-600">
          Intensidad según las mismas reglas que el radar octogonal.
        </p>
        <MuscleBodyGlowMap hits={octHits} className="mt-4" />
      </Card>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" className="!py-2 !text-sm" onClick={() => void handleSaveAll()}>
            Guardar y sincronizar
          </Button>
          <Button type="button" variant="secondary" className="!py-2 !text-sm" onClick={() => downloadCsv(userId)}>
            Exportar CSV
          </Button>
          {savedMsg ? (
            <span className="text-xs font-medium text-goi-gold light:text-amber-900">Guardado localmente.</span>
          ) : null}
        </div>
        {syncError ? <p className="m-0 text-xs text-red-400 light:text-red-700">{syncError}</p> : null}
      </div>
    </div>
  );
}
