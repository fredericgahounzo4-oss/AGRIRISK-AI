import { useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DiagnosticTypeSelector } from '../components/DiagnosticTypeSelector';
import { ImageUploader } from '../components/ImageUploader';
import { useAnalyzeDiagnostic } from '../hooks/useDiagnostic';
import type { DiagnosticType } from '../types';

const tips = [
  'Prenez une photo claire et bien éclairée',
  'Assurez-vous que la zone affectée est visible',
  'Évitez les flous et les ombres',
  'Pour les plantes, incluez les feuilles, tiges ou fruits',
];

export function DiagnosticPage() {
  const [type, setType] = useState<DiagnosticType>('culture');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: analyze, isPending } = useAnalyzeDiagnostic();

  const handleSubmit = () => {
    if (!selectedFile) return;
    analyze({ type, image: selectedFile });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1d]">Diagnostic IA</h1>
        <p className="text-sm text-[#6b7c6e] mt-1">Téléversez une image et obtenez un diagnostic intelligent.</p>
      </div>

      {/* Étape 1 — Type */}
      <Card>
        <h2 className="text-base font-semibold text-[#1a2e1d] mb-4">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1a5c2a] text-white text-xs font-bold mr-2">1</span>
          Choisissez le type de diagnostic
        </h2>
        <DiagnosticTypeSelector value={type} onChange={setType} />
      </Card>

      {/* Étape 2 — Image */}
      <Card>
        <h2 className="text-base font-semibold text-[#1a2e1d] mb-4">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1a5c2a] text-white text-xs font-bold mr-2">2</span>
          Téléversez une image
        </h2>

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <ImageUploader
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClear={() => setSelectedFile(null)}
            />
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-[#e8f5e9] p-5">
            <p className="text-sm font-semibold text-[#1a5c2a] mb-3">Conseils pour de meilleurs résultats</p>
            <ul className="space-y-2">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4caf50] shrink-0 mt-0.5" />
                  <span className="text-xs text-[#2d7a3e] leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Bouton */}
      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={!selectedFile}
        loading={isPending}
        leftIcon={<Sparkles className="w-5 h-5" />}
        className="w-full"
      >
        {isPending ? 'Analyse en cours…' : 'Lancer le diagnostic'}
      </Button>
    </div>
  );
}
