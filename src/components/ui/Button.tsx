import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "navActive" | "link" | "linkDark";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

/** Estilo más contenido: menos sombra y brillo que un CTA “flashy”. */
const variantClassMap: Record<ButtonVariant, string> = {
  primary: [
    "border border-amber-900/20 bg-gradient-to-b from-goi-gold to-goi-gold-dim text-neutral-950",
    "legacy:border-goi-gold/40 legacy:bg-linear-to-b legacy:from-goi-gold/[0.26] legacy:via-goi-gold/[0.1] legacy:to-neutral-950 legacy:text-goi-gold legacy:[&_svg]:text-goi-gold",
    "legacy:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_0_14px_-6px_rgba(212,175,55,0.2)]",
    "legacy:hover:border-goi-gold/60 legacy:hover:from-goi-gold/[0.34] legacy:hover:via-goi-gold/[0.14] legacy:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_18px_-4px_rgba(212,175,55,0.28)] legacy:hover:brightness-100",
    "legacy:duration-[280ms] legacy:ease-[cubic-bezier(0.22,1,0.36,1)] neon:duration-[280ms] neon:ease-[cubic-bezier(0.22,1,0.36,1)] encendido:duration-[280ms] encendido:ease-[cubic-bezier(0.22,1,0.36,1)] healthy:duration-[280ms] healthy:ease-[cubic-bezier(0.22,1,0.36,1)]",
    "neon:border-goi-gold/45 neon:bg-linear-to-b neon:from-goi-gold/[0.22] neon:via-goi-gold/[0.09] neon:to-neutral-950 neon:text-goi-gold neon:[&_svg]:text-goi-gold",
    "neon:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_0_14px_-6px_rgba(200,255,61,0.22)]",
    "neon:hover:border-goi-gold/65 neon:hover:from-goi-gold/[0.32] neon:hover:via-goi-gold/[0.14] neon:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_18px_-4px_rgba(200,255,61,0.3)] neon:hover:brightness-100",
    "healthy:border-goi-gold/40 healthy:bg-linear-to-b healthy:from-goi-gold/[0.18] healthy:via-goi-gold/[0.08] healthy:to-white healthy:text-goi-gold-dim healthy:[&_svg]:text-goi-gold-dim healthy:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_1px_2px_rgba(95,116,107,0.07)]",
    "healthy:hover:border-goi-gold/55 healthy:hover:from-goi-gold/[0.24] healthy:hover:via-goi-gold/[0.11] healthy:hover:to-zinc-50/90 healthy:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(95,116,107,0.09)] healthy:hover:brightness-100",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.15)]",
    "hover:brightness-[1.035]",
    "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_2px_6px_-2px_rgba(212,175,55,0.22)]",
    "encendido:border-goi-gold/40 encendido:bg-linear-to-b encendido:from-goi-gold/[0.18] encendido:via-goi-gold/[0.08] encendido:to-white encendido:text-orange-950 encendido:[&_svg]:text-orange-950 encendido:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_1px_2px_rgba(160,58,24,0.11)]",
    "encendido:hover:border-goi-gold/55 encendido:hover:from-goi-gold/[0.24] encendido:hover:via-goi-gold/[0.11] encendido:hover:to-zinc-50/90 encendido:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(160,58,24,0.16)] encendido:hover:brightness-100",
  ].join(" "),
  secondary: [
    "border border-neutral-700/80 bg-neutral-900 text-neutral-200",
    "legacy:hover:border-goi-gold/45 legacy:hover:bg-neutral-900 legacy:hover:text-goi-gold legacy:hover:shadow-[inset_0_0_0_1px_rgba(212,175,55,0.18),0_0_12px_-4px_rgba(212,175,55,0.15)]",
    "neon:hover:border-goi-gold/45 neon:hover:bg-neutral-900 neon:hover:text-goi-gold neon:hover:shadow-[inset_0_0_0_1px_rgba(200,255,61,0.16),0_0_12px_-4px_rgba(200,255,61,0.18)]",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
    "hover:border-neutral-600 hover:bg-neutral-800/95 hover:text-neutral-100",
    "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]",
    "light:border-zinc-300/95 light:bg-white light:text-zinc-800",
    "light:shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
    "light:hover:border-zinc-400 light:hover:bg-zinc-50 light:hover:shadow-[0_1px_3px_rgba(15,23,42,0.07)]",
    "light:hover:text-zinc-900 healthy:hover:text-zinc-900",
  ].join(" "),
  danger: [
    "border border-red-900/40 bg-gradient-to-b from-red-600/95 to-red-800 text-white",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_1px_3px_rgba(127,29,29,0.35)]",
    "hover:brightness-[1.05]",
    "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_2px_6px_-2px_rgba(185,28,28,0.28)]",
  ].join(" "),
  navActive: [
    "border border-amber-800/22 bg-gradient-to-b from-goi-gold to-goi-gold-dim text-neutral-950",
    "legacy:border-goi-gold/48 legacy:bg-linear-to-b legacy:from-goi-gold/[0.36] legacy:via-goi-gold/[0.16] legacy:to-neutral-950 legacy:text-goi-gold legacy:[&_svg]:text-goi-gold",
    "legacy:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_16px_-6px_rgba(212,175,55,0.24)]",
    "legacy:hover:border-goi-gold/70 legacy:hover:from-goi-gold/[0.44] legacy:hover:via-goi-gold/[0.2] legacy:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_0_20px_-4px_rgba(212,175,55,0.32)] legacy:hover:brightness-100",
    "legacy:duration-[280ms] legacy:ease-[cubic-bezier(0.22,1,0.36,1)] neon:duration-[280ms] neon:ease-[cubic-bezier(0.22,1,0.36,1)] encendido:duration-[280ms] encendido:ease-[cubic-bezier(0.22,1,0.36,1)] healthy:duration-[280ms] healthy:ease-[cubic-bezier(0.22,1,0.36,1)]",
    "neon:border-goi-gold/52 neon:bg-linear-to-b neon:from-goi-gold/[0.32] neon:via-goi-gold/[0.14] neon:to-neutral-950 neon:text-goi-gold neon:[&_svg]:text-goi-gold",
    "neon:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_16px_-6px_rgba(200,255,61,0.26)]",
    "neon:hover:border-goi-gold/75 neon:hover:from-goi-gold/[0.42] neon:hover:via-goi-gold/[0.2] neon:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_0_20px_-4px_rgba(200,255,61,0.34)] neon:hover:brightness-100",
    "healthy:border-goi-gold/42 healthy:bg-linear-to-b healthy:from-goi-gold/[0.22] healthy:via-goi-gold/[0.1] healthy:to-white healthy:text-goi-gold-dim healthy:[&_svg]:text-goi-gold-dim healthy:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.88),0_1px_2px_rgba(95,116,107,0.08)]",
    "healthy:hover:border-goi-gold/60 healthy:hover:from-goi-gold/[0.3] healthy:hover:via-goi-gold/[0.14] healthy:hover:to-zinc-50/95 healthy:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.94),0_0_12px_-4px_rgba(95,116,107,0.1)] healthy:hover:brightness-100",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.12)]",
    "hover:brightness-[1.03]",
    "encendido:border-goi-gold/42 encendido:bg-linear-to-b encendido:from-goi-gold/[0.22] encendido:via-goi-gold/[0.1] encendido:to-white encendido:text-orange-950 encendido:[&_svg]:text-orange-950 encendido:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.88),0_1px_2px_rgba(160,58,24,0.11)]",
    "encendido:hover:border-goi-gold/60 encendido:hover:from-goi-gold/[0.3] encendido:hover:via-goi-gold/[0.14] encendido:hover:to-zinc-50/95 encendido:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.94),0_0_12px_-4px_rgba(160,58,24,0.14)] encendido:hover:brightness-100",
  ].join(" "),
  link: [
    "min-h-10 border-transparent bg-transparent px-3 py-2.5 font-semibold text-goi-gold shadow-none",
    "underline-offset-4 hover:bg-goi-gold/[0.05] hover:text-goi-gold hover:underline",
    "legacy:hover:bg-goi-gold/12",
    "neon:hover:bg-goi-gold/10",
    "active:scale-100 light:text-amber-800 healthy:text-zinc-800 light:hover:bg-amber-50/80 healthy:hover:bg-zinc-100/90 light:hover:text-amber-900 healthy:hover:text-zinc-950",
  ].join(" "),
  linkDark: [
    "min-h-10 border-transparent bg-transparent px-3 py-2.5 font-semibold text-goi-steel shadow-none",
    "underline-offset-4 hover:bg-neutral-900/45 hover:text-goi-gold hover:underline",
    "legacy:hover:bg-goi-gold/[0.08]",
    "neon:hover:bg-goi-gold/[0.06]",
    "active:scale-100 light:text-zinc-600 light:hover:bg-zinc-100/80 light:hover:text-goi-gold healthy:hover:text-zinc-900",
  ].join(" "),
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const variantClass = variantClassMap[variant];
  const baseClasses = [
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight font-inherit",
    "transition-[transform,box-shadow,background-color,border-color,filter] duration-200 ease-out active:scale-[0.992] disabled:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 light:focus-visible:ring-offset-white healthy:focus-visible:ring-goi-gold-dim/38 legacy:focus-visible:ring-goi-gold/50 legacy:focus-visible:ring-offset-black neon:focus-visible:ring-goi-gold/55 neon:focus-visible:ring-offset-black",
    "disabled:cursor-not-allowed disabled:opacity-[0.5] disabled:shadow-none",
  ].join(" ");

  const classes = [baseClasses, variantClass, className].filter(Boolean).join(" ");

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}
