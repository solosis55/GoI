type EmptyStateProps = {
  message: string;
  className?: string;
};

export function EmptyState({ message, className = "" }: EmptyStateProps) {
  const classes = ["empty-state", className].filter(Boolean).join(" ");
  return <p className={classes}>{message}</p>;
}
