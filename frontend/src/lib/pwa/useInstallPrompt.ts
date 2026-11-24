import { useSyncExternalStore } from 'react';

/** Événement non standard (Chrome/Edge/Android) déclenché quand l'app est installable. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// Écouteurs posés dès le chargement du module : l'événement peut arriver avant le premier rendu.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // on affiche notre propre bouton à la place de la mini-barre du navigateur
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

// iOS Safari ne déclenche jamais beforeinstallprompt : il faut passer par « Partager ».
const isIos = () =>
  typeof navigator !== 'undefined' &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !/crios|fxios|edgios/i.test(navigator.userAgent);

export type InstallState = 'installed' | 'promptable' | 'ios' | 'unavailable';

function getSnapshot(): InstallState {
  if (installed || isStandalone()) return 'installed';
  if (deferredPrompt) return 'promptable';
  if (isIos()) return 'ios';
  return 'unavailable';
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function useInstallPrompt() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => 'unavailable' as InstallState);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null; // l'événement ne peut servir qu'une fois
    notify();
    return outcome === 'accepted';
  };

  return { state, install };
}
