import { useId, useMemo, type ReactNode } from "react";
import type { MuscleOctagonAxis } from "../../utils/muscleOctagonStats";
import { MUSCLE_OCTAGON_AXES, MUSCLE_OCTAGON_LABELS } from "../../utils/muscleOctagonStats";

type MuscleBodyGlowMapProps = {
  hits: Record<MuscleOctagonAxis, number>;
  className?: string;
};

const BASE = 0.1;

function normalizeHits(hits: Record<MuscleOctagonAxis, number>): {
  t: (axis: MuscleOctagonAxis) => number;
} {
  const vals = MUSCLE_OCTAGON_AXES.map((k) => hits[k] ?? 0);
  const max = Math.max(1, ...vals);
  return {
    t: (axis: MuscleOctagonAxis) => BASE + (1 - BASE) * ((hits[axis] ?? 0) / max),
  };
}

function MuscleTint({
  clipId,
  gid,
  d,
  op,
  strong,
  goldGradId,
}: {
  clipId: string;
  gid: string;
  d: string;
  op: number;
  strong: boolean;
  goldGradId: string;
}) {
  const goldOpacity = Math.min(0.78, 0.1 + 0.62 * op);
  return (
    <g clipPath={`url(#${clipId})`}>
      <g filter={strong ? `url(#${gid}-bloom)` : undefined}>
        <path
          d={d}
          fill={`url(#${goldGradId})`}
          fillOpacity={goldOpacity}
          stroke="none"
          style={{ mixBlendMode: "screen" }}
        />
      </g>
    </g>
  );
}

/** Proporciones ~7,5 cabezas; hombros > cadera; brazos y piernas como masas separadas del torso. */
const HEAD_RX = 22;
const HEAD_RY = 25;
const HEAD_CY = 42;

/**
 * Vista frontal: barbilla → cuello → hombro → brazo (deltoides–antebrazo–mano) → axila → costado → cadera → muslo → rodilla → pierna → pie → entrepierna → pie contrario → sube.
 * Perímetro simple (sin autointersección).
 */
const BODY_FRONT =
  "M 100 67 " +
  "C 94 67 88 69 84 73 " +
  "C 52 84 38 98 32 118 " +
  "C 26 148 24 182 26 214 " +
  "C 28 248 32 278 36 298 " +
  "L 40 318 " +
  "C 42 324 46 324 48 318 " +
  "L 54 272 " +
  "C 58 228 64 178 70 138 " +
  "L 74 118 " +
  "C 76 108 77 100 78 94 " +
  "L 80 88 " +
  "C 82 122 82 158 80 192 " +
  "C 78 228 76 268 78 308 " +
  "C 80 348 84 382 88 408 " +
  "L 92 418 " +
  "L 96 418 " +
  "L 98 328 " +
  "C 98 292 99 268 100 256 " +
  "C 101 268 102 292 102 328 " +
  "L 104 418 " +
  "L 108 418 " +
  "L 112 408 " +
  "C 116 382 120 348 122 308 " +
  "C 124 268 122 228 120 192 " +
  "C 118 158 118 122 120 88 " +
  "L 122 94 " +
  "C 123 100 124 108 126 118 " +
  "L 130 138 " +
  "C 136 178 142 228 146 272 " +
  "L 152 318 " +
  "C 154 324 158 324 160 318 " +
  "L 164 298 " +
  "C 168 278 172 248 174 214 " +
  "C 176 182 174 148 168 118 " +
  "C 162 98 148 84 116 73 " +
  "C 112 69 106 67 100 67 " +
  "Z";

/** Espalda: trapecios más anchos, glúteo más ancho que cintura, mismas extremidades. */
const BODY_BACK =
  "M 100 67 " +
  "C 93 67 86 69 82 73 " +
  "C 48 88 34 108 30 132 " +
  "C 26 168 24 208 26 246 " +
  "C 28 284 32 314 36 332 " +
  "L 40 348 " +
  "C 42 354 46 352 48 346 " +
  "L 54 298 " +
  "C 58 252 64 198 70 152 " +
  "L 74 128 " +
  "C 76 114 77 102 78 92 " +
  "L 80 86 " +
  "C 82 125 82 168 80 208 " +
  "C 78 252 76 298 78 342 " +
  "C 80 378 84 402 88 416 " +
  "L 92 418 " +
  "L 96 418 " +
  "L 98 332 " +
  "C 98 298 99 272 100 258 " +
  "C 101 272 102 298 102 332 " +
  "L 104 418 " +
  "L 108 418 " +
  "L 112 416 " +
  "C 116 402 120 378 122 342 " +
  "C 124 298 122 252 120 208 " +
  "C 118 168 118 125 120 86 " +
  "L 122 92 " +
  "C 123 102 124 114 126 128 " +
  "L 130 152 " +
  "C 136 198 142 252 146 298 " +
  "L 152 346 " +
  "C 154 352 158 354 160 348 " +
  "L 164 332 " +
  "C 168 314 172 284 174 246 " +
  "C 176 208 174 168 170 132 " +
  "C 166 108 152 88 118 73 " +
  "C 114 69 107 67 100 67 " +
  "Z";

/** Zonas alineadas al contorno anatómico (centro x=100). */
const ZF = {
  hombroL: "M44 82 Q58 76 72 86 Q70 102 50 100 Q40 92 44 82z",
  hombroR: "M156 82 Q142 76 128 86 Q130 102 150 100 Q160 92 156 82z",
  pecL: "M50 92 Q70 84 88 96 Q86 122 52 120 Q48 106 50 92z",
  pecR: "M150 92 Q130 84 112 96 Q114 122 148 120 Q152 106 150 92z",
  brazoL: "M34 104 Q24 155 28 212 Q26 265 22 302 Q32 312 42 268 Q48 205 46 148 Q44 118 34 104z",
  brazoR: "M166 104 Q176 155 172 212 Q174 265 178 302 Q168 312 158 268 Q152 205 154 148 Q156 118 166 104z",
  core: "M72 118 Q100 106 128 118 Q132 168 126 208 Q100 220 74 208 Q68 168 72 118z",
  cuadL: "M68 212 Q62 268 70 338 Q78 362 90 366 Q96 308 92 242 Q82 216 68 212z",
  cuadR: "M132 212 Q138 268 130 338 Q122 362 110 366 Q104 308 108 242 Q118 216 132 212z",
  gemL: "M74 342 Q68 388 74 412 Q86 418 94 408 Q98 372 92 352 Q84 338 74 342z",
  gemR: "M126 342 Q132 388 126 412 Q114 418 106 408 Q102 372 108 352 Q116 338 126 342z",
};

const ZB = {
  espalda: "M38 88 Q100 68 162 88 Q166 128 158 168 Q100 188 42 168 Q34 128 38 88z",
  latL: "M40 112 Q72 104 92 138 Q84 188 52 202 Q38 158 40 112z",
  latR: "M160 112 Q128 104 108 138 Q116 188 148 202 Q162 158 160 112z",
  hombroL: "M42 84 Q54 78 68 90 Q66 106 48 104 Q40 94 42 84z",
  hombroR: "M158 84 Q146 78 132 90 Q134 106 152 104 Q160 94 158 84z",
  brazoL: "M28 108 Q18 162 22 222 Q20 278 16 318 Q26 328 38 278 Q44 212 42 152 Q40 122 28 108z",
  brazoR: "M172 108 Q182 162 178 222 Q180 278 184 318 Q174 328 162 278 Q156 212 158 152 Q160 122 172 108z",
  lumbar: "M70 168 Q100 154 130 168 Q134 202 128 228 Q100 240 72 228 Q66 202 70 168z",
  post: "M50 218 Q100 198 150 218 Q156 268 148 312 Q100 332 52 312 Q44 268 50 218z",
  cuadL: "M70 288 Q64 338 72 392 Q82 402 92 396 Q98 348 92 298 Q82 284 70 288z",
  cuadR: "M130 288 Q136 338 128 392 Q118 402 108 396 Q102 348 108 298 Q118 284 130 288z",
  gemL: "M76 362 Q70 402 78 416 Q90 420 98 412 Q102 382 96 358 Q86 348 76 362z",
  gemR: "M124 362 Q130 402 122 416 Q110 420 102 412 Q98 382 104 358 Q114 348 124 362z",
};

function SilhouetteFigure({
  gid,
  bodyPath,
  goldB,
  children,
}: {
  gid: string;
  bodyPath: string;
  goldB: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <ellipse
        cx={100}
        cy={HEAD_CY}
        rx={HEAD_RX}
        ry={HEAD_RY}
        fill={`url(#${gid}-metal-surface)`}
        stroke="rgba(82,82,91,0.9)"
        strokeWidth={1}
      />
      <ellipse cx={100} cy={HEAD_CY - 6} rx={11} ry={9} fill="rgba(255,255,255,0.08)" stroke="none" />
      <path
        d={bodyPath}
        fill={`url(#${gid}-metal-surface)`}
        stroke="rgba(82,82,91,0.9)"
        strokeWidth={1}
      />
      <path d={bodyPath} fill={`url(#${gid}-skin-shade)`} fillOpacity={goldB ? 0.28 : 0.34} stroke="none" />
      <ellipse
        cx={100}
        cy={HEAD_CY}
        rx={HEAD_RX}
        ry={HEAD_RY}
        fill={`url(#${gid}-skin-shade)`}
        fillOpacity={0.2}
        stroke="none"
      />
      {children}
      <g fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.55} opacity={0.85}>
        <ellipse cx={100} cy={HEAD_CY} rx={HEAD_RX} ry={HEAD_RY} />
        <path d={bodyPath} />
      </g>
    </>
  );
}

export function MuscleBodyGlowMap({ hits, className = "" }: MuscleBodyGlowMapProps) {
  const rid = useId().replace(/:/g, "");
  const gid = `mbg-${rid}`;
  const clipF = `${gid}-sil-front`;
  const clipB = `${gid}-sil-back`;
  const { t } = normalizeHits(hits);

  const summary = useMemo(
    () => MUSCLE_OCTAGON_AXES.map((ax) => `${MUSCLE_OCTAGON_LABELS[ax]}: ${hits[ax] ?? 0}`).join(", "),
    [hits],
  );

  const strong = (op: number) => op >= 0.38;

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <figure className="m-0 mx-auto max-w-4xl">
        <svg
          viewBox="0 0 420 460"
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Mapa muscular frente y espalda. ${summary}`}
        >
          <title>Distribución de trabajo muscular</title>
          <defs>
            <linearGradient id={`${gid}-metal-surface`} x1="18%" y1="5%" x2="82%" y2="95%">
              <stop offset="0%" stopColor="#f4f4f5" />
              <stop offset="28%" stopColor="#a1a1aa" />
              <stop offset="55%" stopColor="#52525b" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            <radialGradient id={`${gid}-skin-shade`} cx="45%" cy="28%" r="65%">
              <stop offset="0%" stopColor="#e4e4e7" />
              <stop offset="70%" stopColor="#52525b" />
              <stop offset="100%" stopColor="#09090b" />
            </radialGradient>
            <linearGradient id={`${gid}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="35%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id={`${gid}-gold-b`} x1="100%" y1="10%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id={`${gid}-bloom`} x="-45%" y="-45%" width="190%" height="190%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
                result="soft"
              />
              <feMerge>
                <feMergeNode in="soft" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id={clipF}>
              <ellipse cx={100} cy={HEAD_CY} rx={HEAD_RX} ry={HEAD_RY} />
              <path d={BODY_FRONT} />
            </clipPath>
            <clipPath id={clipB}>
              <ellipse cx={100} cy={HEAD_CY} rx={HEAD_RX} ry={HEAD_RY} />
              <path d={BODY_BACK} />
            </clipPath>
          </defs>

          <g transform="translate(16 12)">
            <text
              x={100}
              y={14}
              className="fill-neutral-500 text-[11px] font-semibold uppercase tracking-wide light:fill-zinc-600"
              textAnchor="middle"
            >
              Frente
            </text>
            <SilhouetteFigure gid={gid} bodyPath={BODY_FRONT} goldB={false}>
              <g className="goi-muscle-map-breathe">
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.hombroL}
                  op={t("hombros")}
                  strong={strong(t("hombros"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.hombroR}
                  op={t("hombros")}
                  strong={strong(t("hombros"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.pecL}
                  op={t("pecho")}
                  strong={strong(t("pecho"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.pecR}
                  op={t("pecho")}
                  strong={strong(t("pecho"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.brazoL}
                  op={t("brazos")}
                  strong={strong(t("brazos"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.brazoR}
                  op={t("brazos")}
                  strong={strong(t("brazos"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.core}
                  op={t("core")}
                  strong={strong(t("core"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.cuadL}
                  op={t("cuadriceps")}
                  strong={strong(t("cuadriceps"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.cuadR}
                  op={t("cuadriceps")}
                  strong={strong(t("cuadriceps"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.gemL}
                  op={t("gemelos")}
                  strong={strong(t("gemelos"))}
                  goldGradId={`${gid}-gold`}
                />
                <MuscleTint
                  clipId={clipF}
                  gid={gid}
                  d={ZF.gemR}
                  op={t("gemelos")}
                  strong={strong(t("gemelos"))}
                  goldGradId={`${gid}-gold`}
                />
              </g>
            </SilhouetteFigure>
          </g>

          <g transform="translate(204 12)">
            <text
              x={100}
              y={14}
              className="fill-neutral-500 text-[11px] font-semibold uppercase tracking-wide light:fill-zinc-600"
              textAnchor="middle"
            >
              Espalda
            </text>
            <SilhouetteFigure gid={gid} bodyPath={BODY_BACK} goldB={true}>
              <g className="goi-muscle-map-breathe">
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.espalda}
                  op={t("espalda")}
                  strong={strong(t("espalda"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.latL}
                  op={t("espalda")}
                  strong={strong(t("espalda"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.latR}
                  op={t("espalda")}
                  strong={strong(t("espalda"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.hombroL}
                  op={Math.max(t("hombros"), t("espalda") * 0.85)}
                  strong={strong(Math.max(t("hombros"), t("espalda")))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.hombroR}
                  op={Math.max(t("hombros"), t("espalda") * 0.85)}
                  strong={strong(Math.max(t("hombros"), t("espalda")))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.brazoL}
                  op={t("brazos")}
                  strong={strong(t("brazos"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.brazoR}
                  op={t("brazos")}
                  strong={strong(t("brazos"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.lumbar}
                  op={t("core")}
                  strong={strong(t("core"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.post}
                  op={t("posterior")}
                  strong={strong(t("posterior"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.cuadL}
                  op={t("cuadriceps") * 0.95}
                  strong={strong(t("cuadriceps"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.cuadR}
                  op={t("cuadriceps") * 0.95}
                  strong={strong(t("cuadriceps"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.gemL}
                  op={t("gemelos")}
                  strong={strong(t("gemelos"))}
                  goldGradId={`${gid}-gold-b`}
                />
                <MuscleTint
                  clipId={clipB}
                  gid={gid}
                  d={ZB.gemR}
                  op={t("gemelos")}
                  strong={strong(t("gemelos"))}
                  goldGradId={`${gid}-gold-b`}
                />
              </g>
            </SilhouetteFigure>
          </g>
        </svg>
        <figcaption className="sr-only">Vistas frontal y dorsal. {summary}</figcaption>
      </figure>

      <div
        className="mx-auto mt-5 flex max-w-lg flex-wrap items-center gap-3 rounded-xl border border-neutral-800/50 bg-black/30 px-3 py-2 light:border-zinc-200 light:bg-zinc-100/80"
        role="presentation"
      >
        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 light:text-zinc-600">
          Leyenda
        </span>
        <span className="text-[10px] text-neutral-500 light:text-zinc-600">
          Silueta con hombros, brazos, cintura, muslos y pies reconocibles; el oro indica carga por zona.
        </span>
      </div>

      <p className="mt-3 text-center text-xs text-neutral-500 light:text-zinc-600">
        Vista esquemática inspirada en proporciones reales (~7,5 cabezas de altura); no sustituye un atlas anatómico.
      </p>
    </div>
  );
}
