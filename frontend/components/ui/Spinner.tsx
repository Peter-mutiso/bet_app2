const SIZE_CLASSES: Record<string, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
};

interface SpinnerProps {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent opacity-90 ${SIZE_CLASSES[size]} ${className}`}
    />
  );
}
