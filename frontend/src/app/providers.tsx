import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './queryClient';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import { LanguageSync } from '@/lib/i18n/LanguageSync';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageSync />
        {children}
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1a2e1d',
            border: '1px solid #e2e8e4',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#4caf50', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e53935', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
    </I18nProvider>
  );
}
