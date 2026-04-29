type StatusMessageProps = {
  loading?: boolean;
  error?: string;
  success?: string;
  loadingText?: string;
};

export function StatusMessage({ loading = false, error = "", success = "", loadingText = "Cargando..." }: StatusMessageProps) {
  return (
    <>
      {loading && <p className="m-0 text-slate-500">{loadingText}</p>}
      {error && <p className="m-0 text-red-600">{error}</p>}
      {success && <p className="m-0 text-green-700 dark:text-green-400">{success}</p>}
    </>
  );
}
