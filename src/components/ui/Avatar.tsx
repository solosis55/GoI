import { useEffect, useState } from "react";

type AvatarProps = {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  /** Rellena el contenedor (el padre debe fijar tamaño). Útil en marcos circulares grandes. */
  fill?: boolean;
};

/** Silueta tipo “usuario” en tonos dorados (marca GoI). */
function AvatarPlaceholder({
  alt,
  size,
  fill,
  className,
}: {
  alt: string;
  size: number;
  fill: boolean;
  className: string;
}) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full bg-neutral-900/95 ring-2 ring-goi-gold/45 light:bg-zinc-200 light:ring-amber-400/55 healthy:ring-goi-gold/40",
        fill ? "h-full min-h-0 w-full min-w-0" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={fill ? undefined : { width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        className={
          fill
            ? "aspect-square h-[58%] w-[58%] text-goi-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.28)] light:text-amber-700 healthy:text-goi-gold light:drop-shadow-none"
            : "text-goi-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.25)] light:text-amber-700 healthy:text-goi-gold light:drop-shadow-none"
        }
        style={fill ? undefined : { width: size * 0.58, height: size * 0.58 }}
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        />
      </svg>
    </span>
  );
}

export function Avatar({ src, alt, size = 32, className = "", fill = false }: AvatarProps) {
  const trimmed = src?.trim() ?? "";
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [trimmed]);

  if (!trimmed || loadFailed) {
    return <AvatarPlaceholder alt={alt} size={size} fill={fill} className={className} />;
  }

  return (
    <img
      src={trimmed}
      alt={alt}
      className={[
        "rounded-full object-cover",
        fill ? "h-full w-full min-h-0 min-w-0" : "ring-2 ring-neutral-800 light:ring-zinc-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={fill ? undefined : { width: size, height: size }}
      onError={() => setLoadFailed(true)}
    />
  );
}
