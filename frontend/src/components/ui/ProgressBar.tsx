import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  colorClassName?: string;
}

/** Barre de progression utilisée pour afficher le % de confiance du diagnostic IA. */
export function ProgressBar({ value, className, colorClassName = "bg-brand-600" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all", colorClassName)}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
