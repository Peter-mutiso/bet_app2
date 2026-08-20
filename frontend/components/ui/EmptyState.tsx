interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-4 py-10 text-center ${className}`}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-500">
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-300">{title}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}
