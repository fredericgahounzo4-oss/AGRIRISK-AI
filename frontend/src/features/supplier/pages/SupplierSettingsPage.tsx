import { Bell, CreditCard, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PreferenceRow } from '@/components/ui/PreferenceRow';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUpdateProfile } from '@/features/auth/hooks/useProfile';
import { PasswordChangeCard } from '@/features/auth/components/PasswordChangeCard';
import { LanguageRegionCard } from '@/features/auth/components/LanguageRegionCard';
import { useEarnings } from '@/features/shop/hooks/useShop';
import { useTranslation } from '@/lib/i18n/I18nContext';

export function SupplierSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile({ successMessage: t('settings.prefSaved') });
  const { data: earnings } = useEarnings();

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('supplierSettings.title')}</h1>

      <div className="space-y-6">
        {/* Boutique */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Store className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('supplierSettings.shopVisibility')}</h2>
          </div>
          <div className="space-y-4">
            <PreferenceRow
              title={t('supplierSettings.shopOnline')}
              description={t('supplierSettings.shopOnlineDesc')}
              checked={user?.shop_visible ?? true}
              disabled={updateProfile.isPending}
              onChange={(v) => updateProfile.mutate({ shop_visible: v })}
            />
            {user?.shop_visible === false && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                {t('supplierSettings.shopHiddenWarning')}
              </p>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Bell className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('settings.notifications')}</h2>
          </div>
          <div className="space-y-4">
            <PreferenceRow
              title={t('supplierSettings.notifNewOrders')}
              description={t('supplierSettings.notifNewOrdersDesc')}
              checked={user?.notify_new_orders ?? true}
              disabled={updateProfile.isPending}
              onChange={(v) => updateProfile.mutate({ notify_new_orders: v })}
            />
            <PreferenceRow
              title={t('supplierSettings.notifStock')}
              description={t('supplierSettings.notifStockDesc')}
              checked={user?.notify_stock_alerts ?? true}
              disabled={updateProfile.isPending}
              onChange={(v) => updateProfile.mutate({ notify_stock_alerts: v })}
            />
            <p className="text-xs text-gray-400">{t('settings.notifNote')}</p>
          </div>
        </Card>

        {/* Commission et paiements */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('supplierSettings.billing')}</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-green-100 bg-green-50/50 rounded-xl">
            <p className="text-sm text-gray-700">
              {earnings
                ? t('supplierSettings.commissionText', { percent: earnings.commission_percent })
                : t('supplierSettings.commissionTextNoRate')}
            </p>
            <Button variant="outline" onClick={() => navigate('/fournisseur/revenus')}>
              {t('supplierSettings.viewEarnings')}
            </Button>
          </div>
        </Card>

        <PasswordChangeCard />
        <LanguageRegionCard />
      </div>
    </div>
  );
}
