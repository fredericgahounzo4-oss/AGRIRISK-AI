import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "brand";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-50 text-success-500",
  warning: "bg-warning-50 text-warning-500",
  danger: "bg-danger-50 text-danger-600",
  neutral: "bg-gray-100 text-gray-600",
  brand: "bg-brand-50 text-brand-700",
};

/** Pastille de statut (ex: niveau de risque "Élevé", note fournisseur). */
export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
