export type FeedScope = "all" | "following";

type FeedModeTabsProps = {
  mode: FeedScope;
  onChangeMode: (mode: FeedScope) => void;
  /** Pills and spacing tuned for compact strips (e. g. historias). */
  compact?: boolean;
  className?: string;
};

export function FeedModeTabs({ mode, onChangeMode, compact, className = "" }: FeedModeTabsProps) {
  const shell = compact ? "p-0.5 gap-0.5 max-w-full" : "p-1 gap-1";
  const seg = compact ? "min-h-11 px-2 py-1 text-[11px] min-w-0 flex-1 sm:flex-none sm:px-2.5 sm:text-xs" : "min-h-11 px-4 py-1.5 text-sm";
  return (
    <div
      className={[
        "inline-flex w-full max-w-full rounded-lg border border-neutral-800 bg-neutral-950/90 shadow-inner shadow-black/30 sm:w-auto sm:max-w-none light:border-zinc-300 light:bg-white light:shadow-inner light:shadow-zinc-900/10",
        shell,
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Modo del feed"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "all"}
        className={[
          "rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35",
          seg,
          mode === "all"
            ? "bg-neutral-800 text-goi-gold shadow-sm light:bg-zinc-200 light:text-yellow-900"
            : "text-neutral-500 hover:bg-neutral-900/80 hover:text-neutral-200 light:text-zinc-600 light:hover:bg-zinc-100 light:hover:text-zinc-900",
        ].join(" ")}
        onClick={() => onChangeMode("all")}
      >
        Todos
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "following"}
        className={[
          "rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35",
          seg,
          mode === "following"
            ? "bg-neutral-800 text-goi-gold shadow-sm light:bg-zinc-200 light:text-yellow-900"
            : "text-neutral-500 hover:bg-neutral-900/80 hover:text-neutral-200 light:text-zinc-600 light:hover:bg-zinc-100 light:hover:text-zinc-900",
        ].join(" ")}
        onClick={() => onChangeMode("following")}
      >
        Seguidos
      </button>
    </div>
  );
}
