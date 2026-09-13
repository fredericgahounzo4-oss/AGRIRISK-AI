/**
 * Formate une date ISO en format français court (ex: 12/05/2024).
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formate une date relative simple (Aujourd'hui, Hier, ou date complète).
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Hier";
  return formatDate(d);
}

/**
 * Formate une distance en kilomètres avec une décimale.
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Retourne la couleur Tailwind associée à un niveau de risque.
 */
export type RiskLevel = "Faible" | "Modéré" | "Élevé";

export function getRiskColor(level: RiskLevel): { bg: string; text: string; dot: string } {
  switch (level) {
    case "Faible":
      return { bg: "bg-success-50", text: "text-success-500", dot: "bg-success-500" };
    case "Modéré":
      return { bg: "bg-warning-50", text: "text-warning-500", dot: "bg-warning-500" };
    case "Élevé":
      return { bg: "bg-danger-50", text: "text-danger-600", dot: "bg-danger-500" };
  }
}

/**
 * Tronque un texte à une longueur donnée avec ellipse.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}...`;
}
