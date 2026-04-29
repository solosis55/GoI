import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "navActive" | "link";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 border-slate-900 text-white hover:bg-slate-800",
  secondary: "secondary bg-white border-slate-900 text-slate-900 hover:bg-slate-100",
  danger: "danger bg-red-700 border-red-700 text-white hover:bg-red-800",
  navActive: "nav-active bg-violet-600 border-violet-600 text-white hover:bg-violet-700",
  link: "link-btn mt-3 w-full bg-transparent border-transparent text-slate-900 hover:bg-slate-100",
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const variantClass = variantClassMap[variant];
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg border px-3 py-2 font-inherit transition-colors disabled:cursor-not-allowed disabled:opacity-70";
  const classes = [baseClasses, variantClass, className].filter(Boolean).join(" ");

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}
