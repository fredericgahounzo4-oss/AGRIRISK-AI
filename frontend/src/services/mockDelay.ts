/**
 * Simule une latence réseau pour les appels API mockés.
 * À retirer une fois le backend réel connecté.
 */
export function delay<T>(data: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
