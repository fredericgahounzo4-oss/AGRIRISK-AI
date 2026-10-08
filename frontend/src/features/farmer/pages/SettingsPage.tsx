import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PreferenceRow } from '@/components/ui/PreferenceRow';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUpdateProfile } from '@/features/auth/hooks/useProfile';
import { PasswordChangeCard } from '@/features/auth/components/PasswordChangeCard';
import { LanguageRegionCard } from '@/features/auth/components/LanguageRegionCard';
import { useTranslation } from '@/lib/i18n/I18nContext';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile({ successMessage: t('settings.prefSaved') });

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('settings.title')}</h1>

      <div className="space-y-6">
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Bell className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('settings.notifications')}</h2>
          </div>
          <div className="space-y-4">
            <PreferenceRow
              title={t('settings.notifDiagnostics')}
              description={t('settings.notifDiagnosticsDesc')}
              checked={user?.notify_diagnostics ?? true}
              disabled={updateProfile.isPending}
              onChange={(v) => updateProfile.mutate({ notify_diagnostics: v })}
            />
            <PreferenceRow
              title={t('settings.notifOrders')}
              description={t('settings.notifOrdersDesc')}
              checked={user?.notify_order_updates ?? true}
              disabled={updateProfile.isPending}
              onChange={(v) => updateProfile.mutate({ notify_order_updates: v })}
            />
            <p className="text-xs text-gray-400">{t('settings.notifNote')}</p>
          </div>
        </Card>

        <PasswordChangeCard />
        <LanguageRegionCard />
      </div>
    </div>
  );
}
