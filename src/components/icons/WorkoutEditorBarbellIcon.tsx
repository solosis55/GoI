/** Solo para el hero del editor de rutinas (barra + discos). */
export function WorkoutEditorBarbellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="6" cy="12" r="3.25" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9.25 12h5.5" />
      <circle cx="18" cy="12" r="3.25" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
