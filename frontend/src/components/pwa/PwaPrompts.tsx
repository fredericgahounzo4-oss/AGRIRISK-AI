import { useEffect, useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { useInstallPrompt } from '@/lib/pwa/useInstallPrompt';
import { IosInstallHelp } from './InstallAppButton';

const DISMISS_KEY = 'agririsk_install_dismissed';

function wasDismissed(): boolean {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  return online;
}

/** Bandeau « Installer » (une seule fois, fermable) + bandeau « Hors connexion ». */
export function PwaPrompts() {
  const { state, install } = useInstallPrompt();
  const online = useOnline();
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [iosHelp, setIosHelp] = useState(false);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* stockage indisponible */ }
  };

  const showInstall = !dismissed && (state === 'promptable' || state === 'ios');

  return (
    <>
      {!online && (
        <div className="fixed top-0 inset-x-0 z-[900] flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white">
          <WifiOff className="w-3.5 h-3.5" /> Vous êtes hors connexion — certaines fonctions sont indisponibles.
        </div>
      )}

      {showInstall && (
        <div className="fixed bottom-4 inset-x-4 z-[900] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#e2e8e4] bg-white p-3 shadow-xl">
          <img src="/pwa-192.png" alt="" className="h-11 w-11 rounded-xl shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#1a2e1d]">Installer AgriRisk AI</p>
            <p className="text-xs text-[#6b7c6e]">Accès direct depuis votre écran d'accueil.</p>
          </div>
          <button
            onClick={async () => { if (state === 'promptable') { await install(); } else { setIosHelp(true); } }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a5c2a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#164d23] shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Installer
          </button>
          <button onClick={dismiss} className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0" aria-label="Plus tard">
            <X className="w-4 h-4 text-[#6b7c6e]" />
          </button>
        </div>
      )}
      {iosHelp && <IosInstallHelp onClose={() => setIosHelp(false)} />}
    </>
  );
}
