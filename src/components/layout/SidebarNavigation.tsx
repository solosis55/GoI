import { Button } from "../ui/Button";

export type SidebarActiveTab = "feed" | "profile" | "statistics" | "settings" | "workouts";

function IconHome({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
      />
    </svg>
  );
}

function IconDumbbell({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M4 14V10M20 14V10M7 17V7M17 17V7M7 10h10M7 14h10"
      />
    </svg>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19h16M7 16V9m5 7V5m5 11v-5"
      />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
      />
    </svg>
  );
}

const navItemBase =
  "group/nav w-full !justify-start gap-3 px-3.5 py-2.5 text-left motion-safe:transition-[transform,box-shadow,background-color,color] motion-safe:duration-200 motion-safe:hover:translate-x-0.5 motion-safe:active:scale-[0.99] [&_svg]:shrink-0 [&_svg]:opacity-95 motion-safe:[&_svg]:transition-transform motion-safe:[&_svg]:duration-200 motion-safe:group-hover/nav:[&_svg]:scale-110";

/** Cerrar sesión en la zona inferior del sidebar. */
export function SidebarLogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <Button
      type="button"
      variant="danger"
      className={[navItemBase, "sidebar-logout"].join(" ")}
      onClick={() => {
        if (window.confirm("¿Cerrar sesión? Se cerrará tu sesión en este dispositivo.")) {
          onLogout();
        }
      }}
    >
      <IconLogout className="size-[1.125rem]" />
      <span className="min-w-0 font-medium">Cerrar sesión</span>
    </Button>
  );
}

function activeStripe(active: boolean) {
  return active
    ? "relative overflow-hidden before:pointer-events-none before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-yellow-950/50 light:before:bg-yellow-950/40"
    : "";
}

/** Ajustes en la zona inferior del sidebar (debajo del menú principal). */
export function SidebarSettingsButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant={active ? "navActive" : "secondary"}
      className={[navItemBase, activeStripe(active)].join(" ")}
      onClick={onClick}
    >
      <IconSettings className="size-[1.125rem]" />
      <span className="min-w-0 font-medium">Ajustes</span>
    </Button>
  );
}

type SidebarNavigationProps = {
  activeTab: SidebarActiveTab;
  onFeed: () => void;
  onWorkouts: () => void;
  onStatistics: () => void;
  onProfile: () => void;
};

export function SidebarNavigation({
  activeTab,
  onFeed,
  onWorkouts,
  onStatistics,
  onProfile,
}: SidebarNavigationProps) {
  return (
    <nav className="sidebar-nav flex flex-col gap-0" aria-label="Navegación principal">
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 light:text-zinc-500">
        Menú
      </p>
      <div className="grid grid-cols-1 gap-2 md:gap-2.5">
        <Button
          type="button"
          variant={activeTab === "feed" ? "navActive" : "secondary"}
          className={[navItemBase, activeStripe(activeTab === "feed")].join(" ")}
          onClick={onFeed}
        >
          <IconHome className="size-[1.125rem]" />
          <span className="min-w-0 font-medium">Inicio</span>
        </Button>
        <Button
          type="button"
          variant={activeTab === "workouts" ? "navActive" : "secondary"}
          className={[navItemBase, activeStripe(activeTab === "workouts")].join(" ")}
          onClick={onWorkouts}
        >
          <IconDumbbell className="size-[1.125rem]" />
          <span className="min-w-0 font-medium">Rutinas</span>
        </Button>
        <Button
          type="button"
          variant={activeTab === "statistics" ? "navActive" : "secondary"}
          className={[navItemBase, activeStripe(activeTab === "statistics")].join(" ")}
          onClick={onStatistics}
        >
          <IconChart className="size-[1.125rem]" />
          <span className="min-w-0 font-medium">Estadísticas</span>
        </Button>
        <Button
          type="button"
          variant={activeTab === "profile" ? "navActive" : "secondary"}
          className={[navItemBase, activeStripe(activeTab === "profile")].join(" ")}
          onClick={onProfile}
        >
          <IconUser className="size-[1.125rem]" />
          <span className="min-w-0 font-medium">Perfil</span>
        </Button>
      </div>
    </nav>
  );
}
