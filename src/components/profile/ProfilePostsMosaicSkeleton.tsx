/** Placeholder animado alineado con `ProfilePostsMosaic` (rejilla 3× o mosaico 6 cols). */

function mosaicColSpan(index: number): "col-span-1" | "col-span-2" {
  return index % 9 < 6 ? "col-span-1" : "col-span-2";
}

const PLACEHOLDER_MOSAIC = 18;
const PLACEHOLDER_GRID = 12;

export function ProfilePostsMosaicSkeleton({
  className = "",
  layout = "grid",
}: {
  className?: string;
  layout?: "grid" | "mosaic";
}) {
  if (layout === "grid") {
    return (
      <div
        className={["w-full", className].filter(Boolean).join(" ")}
        aria-busy="true"
        aria-label="Cargando miniaturas"
      >
        <div className="grid grid-cols-3 gap-px bg-neutral-800 sm:gap-0.5 light:bg-zinc-300">
          {Array.from({ length: PLACEHOLDER_GRID }, (_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse bg-neutral-800/90 light:bg-zinc-300/90"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={["overflow-hidden rounded-lg border border-neutral-800/90 light:border-zinc-200", className]
        .filter(Boolean)
        .join(" ")}
      aria-busy="true"
      aria-label="Cargando miniaturas"
    >
      <div className="grid grid-cols-6 gap-0">
        {Array.from({ length: PLACEHOLDER_MOSAIC }, (_, index) => (
          <div
            key={index}
            className={[
              "aspect-[4/5] animate-pulse bg-neutral-800/90 light:bg-zinc-300/90",
              mosaicColSpan(index),
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
