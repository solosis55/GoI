import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
  as?: "section" | "article" | "aside" | "div";
};

export function Card({ children, className = "", tone = "light", as = "section" }: CardProps) {
  const Component = as;
  const toneClasses =
    tone === "dark" ? "card-dark border-slate-800 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-900";
  const classes = ["card rounded-[10px] border p-4", toneClasses, className].filter(Boolean).join(" ");

  return <Component className={classes}>{children}</Component>;
}
