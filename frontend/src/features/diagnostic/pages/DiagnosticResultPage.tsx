import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertTriangle, Leaf, PawPrint } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { useDiagnosticResult } from '../hooks/useDiagnostic';
import { diagnosticApi } from '../api/diagnosticApi';
import { getApiErrorMessage } from '@/lib/apiError';
import toast from 'react-hot-toast';
import { useState } from 'react';
import type { RiskLevel } from '../types';

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  'Faible':    { label: 'Faible',   color: 'text-[#1a5c2a]', bg: 'bg-[#e8f5e9]' },
  'Moyen':     { label: 'Moyen',    color: 'text-[#f59e0b]', bg: 'bg-[#fff8e1]' },
  'Élevé':     { label: 'Élevé',    color: 'text-[#e53935]', bg: 'bg-[#ffebee]' },
  'Critique':  { label: 'Critique', color: 'text-[#b71c1c]', bg: 'bg-[#ffcdd2]' },
};

export function DiagnosticResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useDiagnosticResult(id!);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!id) return;
    setIsDownloading(true);
    try {
      const blob = await diagnosticApi.downloadReport(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnostic-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors du téléchargement du rapport.'));
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <Loader text="Chargement du résultat…" fullPage />;

  if (isError || !result) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <AlertTriangle className="w-10 h-10 text-[#e53935] mx-auto" />
        <h1 className="text-xl font-bold text-[#1a2e1d]">Diagnostic introuvable</h1>
        <p className="text-sm text-[#6b7c6e]">
          {getApiErrorMessage(error, "Ce diagnostic n'existe pas ou n'a pas pu être chargé.")}
        </p>
        <Button onClick={() => navigate('/app/diagnostic')}>Retour au diagnostic</Button>
      </div>
    );
  }

  const risk = riskConfig[result.risk_level] ?? riskConfig['Moyen'];
  const TypeIcon = result.type === 'culture' ? Leaf : PawPrint;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/diagnostic')}
          className="flex items-center gap-2 text-sm text-[#6b7c6e] hover:text-[#1a2e1d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au diagnostic
        </button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleDownload}
          loading={isDownloading}
        >
          Télécharger le rapport
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1d]">Résultat du diagnostic</h1>
        <p className="text-sm text-[#6b7c6e] mt-1">Voici l'analyse détaillée de votre image.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Image + infos principales */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="overflow-hidden">
            <img src={result.image_url} alt={result.disease_name} className="w-full h-56 object-cover" />
            <div className="p-4">
              <p className="text-xs font-medium text-[#6b7c6e] uppercase tracking-wider">Image analysée</p>
            </div>
          </Card>

          {/* Résumé */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-[#e53935]" />
              <span className="text-xs font-semibold text-[#e53935] uppercase tracking-wider">Diagnostic IA</span>
            </div>
            <h2 className="text-xl font-bold text-[#1a2e1d]">{result.disease_name}</h2>
            {result.scientific_name && (
              <p className="text-sm text-[#6b7c6e] italic mt-0.5">({result.scientific_name})</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-[#6b7c6e]">Niveau de risque</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${risk.bg} ${risk.color}`}>
                {risk.label}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6b7c6e]">Confiance de l'IA</span>
                <span className="text-xs font-semibold text-[#1a2e1d]">{result.confidence}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#e2e8e4]">
                <div
                  className="h-2 rounded-full bg-[#4caf50] transition-all"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-[#1a5c2a]" />
              <span className="text-xs text-[#6b7c6e] capitalize">{result.type}</span>
            </div>
          </Card>
        </div>

        {/* Causes & Recommandations */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-[#1a2e1d] mb-3">Causes probables</h3>
              {result.causes.length === 0 ? (
                <p className="text-sm text-[#9aab9e]">Aucune cause spécifique identifiée.</p>
              ) : (
                <ul className="space-y-2">
                  {result.causes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#e53935] shrink-0" />
                      <span className="text-sm text-[#6b7c6e]">{c.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-[#1a2e1d] mb-3">Recommandations</h3>
              {result.recommendations.length === 0 ? (
                <p className="text-sm text-[#9aab9e]">Aucune recommandation spécifique.</p>
              ) : (
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4caf50] shrink-0" />
                      <span className="text-sm text-[#6b7c6e]">{r.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Traitement */}
          {result.treatment && (
            <Card className="bg-[#e8f5e9] border-[#4caf50]/30">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a5c2a] shrink-0">
                  <span className="text-lg">💊</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a5c2a]">Traitement recommandé</p>
                  <p className="text-sm text-[#2d7a3e] mt-1 leading-relaxed">{result.treatment}</p>
                </div>
              </div>
            </Card>
          )}

          <p className="text-xs text-[#9aab9e] italic">
            Ce diagnostic est généré automatiquement par une IA. Consultez un agronome ou vétérinaire
            pour confirmer un problème sérieux.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/app/diagnostic')}>
              Nouveau diagnostic
            </Button>
            <Button className="flex-1" onClick={() => navigate('/app/assistant')}>
              Consulter l'assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
