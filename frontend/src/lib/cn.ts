import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind en gérant les conflits (ex: "p-2" + "p-4" -> "p-4").
 * Utilisé par tous les composants UI pour permettre la surcharge via la prop `className`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
