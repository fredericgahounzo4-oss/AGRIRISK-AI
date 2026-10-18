import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/** Page affichée à la place de l'écran d'erreur technique de React Router. */
export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const detail = error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9f7] p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-[#1a2e1d]">Une erreur est survenue</h1>
        <p className="text-sm text-[#6b7c6e]">
          Cette page n'a pas pu s'afficher. Rechargez la page ou revenez à l'accueil.
        </p>
        {detail && (
          <p className="text-xs text-left rounded-lg bg-white border border-[#e2e8e4] p-3 text-[#6b7c6e] break-words">{detail}</p>
        )}
        <div className="flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Recharger</Button>
          <Button variant="outline" onClick={() => navigate('/')}>Accueil</Button>
        </div>
      </div>
    </div>
  );
}
