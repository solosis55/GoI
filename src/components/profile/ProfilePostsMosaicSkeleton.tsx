/** Placeholder animado con la misma rejilla 6 columnas que `ProfilePostsMosaic`. */
function mosaicColSpan(index: number): "col-span-1" | "col-span-2" {
  return index % 9 < 6 ? "col-span-1" : "col-span-2";
}

const PLACEHOLDER_COUNT = 18;

export function ProfilePostsMosaicSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={["overflow-hidden rounded-lg border border-neutral-800/90 light:border-zinc-200", className]
        .filter(Boolean)
        .join(" ")}
      aria-busy="true"
      aria-label="Cargando miniaturas"
    >
      <div className="grid grid-cols-6 gap-0">
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
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
