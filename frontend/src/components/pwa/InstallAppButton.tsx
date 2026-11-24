import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useInstallPrompt } from '@/lib/pwa/useInstallPrompt';
import { cn } from '@/utils/cn';

/** Bouton « Installer l'application » (menus latéraux). Invisible si déjà installée ou non installable. */
export function InstallAppButton({ className }: { className?: string }) {
  const { state, install } = useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (state !== 'promptable' && state !== 'ios') return null;

  return (
    <>
      <button
        onClick={() => (state === 'promptable' ? install() : setShowIosHelp(true))}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all',
          className
        )}
      >
        <Download className="w-4.5 h-4.5 shrink-0" />
        <span>Installer l'application</span>
      </button>
      {showIosHelp && <IosInstallHelp onClose={() => setShowIosHelp(false)} />}
    </>
  );
}

export function IosInstallHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl text-[#1a2e1d]">
        <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-gray-100" aria-label="Fermer">
          <X className="w-4 h-4 text-[#6b7c6e]" />
        </button>
        <h2 className="font-semibold mb-3">Installer AgriRisk sur iPhone</h2>
        <ol className="space-y-2 text-sm text-[#4a5d4e] list-decimal pl-5">
          <li>Ouvrez cette page dans <strong>Safari</strong>.</li>
          <li>Touchez le bouton <Share className="inline w-4 h-4 -mt-0.5" /> <strong>Partager</strong>.</li>
          <li>Choisissez <strong>« Sur l'écran d'accueil »</strong>, puis <strong>Ajouter</strong>.</li>
        </ol>
      </div>
    </div>
  );
}
