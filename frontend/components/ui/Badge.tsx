type Tone = "success" | "danger" | "warning" | "info" | "neutral" | "brand";

const TONE_CLASSES: Record<Tone, string> = {
  success: "border-emerald-500/30 bg-emerald-950/60 text-emerald-300",
  danger: "border-rose-500/30 bg-rose-950/60 text-rose-300",
  warning: "border-amber-500/30 bg-amber-950/60 text-amber-300",
  info: "border-blue-500/30 bg-blue-950/60 text-blue-300",
  neutral: "border-slate-700 bg-slate-800/80 text-slate-300",
  brand: "border-teal-500/30 bg-teal-950/60 text-teal-300",
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export default function Badge({
  tone = "neutral",
  children,
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${TONE_CLASSES[tone]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
