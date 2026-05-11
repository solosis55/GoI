import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Contenedor de ancho común para separar las vistas de los bordes del viewport.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={["mx-auto w-full max-w-6xl px-0.5 sm:px-2 lg:pr-4 lg:pl-6", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
