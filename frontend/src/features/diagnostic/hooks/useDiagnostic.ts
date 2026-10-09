import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { diagnosticApi } from '../api/diagnosticApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { useBasePath } from '@/features/auth/hooks/useBasePath';
import type { DiagnosticType } from '../types';

export function useAnalyzeDiagnostic() {
  const navigate = useNavigate();
  const base = useBasePath();

  return useMutation({
    mutationFn: ({ type, image }: { type: DiagnosticType; image: File }) => {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('image', image);
      return diagnosticApi.analyze(formData);
    },
    onSuccess: (result) => {
      toast.success('Diagnostic terminé !');
      navigate(`${base}/diagnostic/resultat/${result.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'analyse. Réessayez."), { duration: 6000 });
    },
  });
}

export function useDiagnosticResult(id: string) {
  return useQuery({
    queryKey: ['diagnostic', id],
    queryFn: () => diagnosticApi.getById(id),
    enabled: !!id,
  });
}

export function useDiagnosticHistory() {
  return useQuery({
    queryKey: ['diagnostics', 'history'],
    queryFn: () => diagnosticApi.getHistory(),
  });
}
