import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { PreferenceRow } from '@/components/ui/PreferenceRow';
import { PasswordChangeCard } from '@/features/auth/components/PasswordChangeCard';
import { LanguageRegionCard } from '@/features/auth/components/LanguageRegionCard';
import { Shield, Server, Database, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/i18n/I18nContext';
import { useAdminSettings, useUpdateAdminSettings } from '../hooks/useAdmin';
import type { PlatformSettings } from '../types';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20';

export function AdminSettingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useAdminSettings();

  if (isLoading) return <Loader text={t('common.loading')} />;
  if (isError || !data) {
    return <p className="text-sm text-red-600 text-center py-12">{t('adminSettings.loadError')}</p>;
  }
  return <AdminSettingsForm data={data} />;
}

function AdminSettingsForm({ data }: { data: PlatformSettings }) {
  const { t } = useTranslation();
  const save = useUpdateAdminSettings(t('adminSettings.saved'));
  const toggleMaintenance = useUpdateAdminSettings(t('adminSettings.maintenanceUpdated'));

  // Brouillon local des champs qui s'enregistrent avec le bouton « Enregistrer »
  // (le mode maintenance, lui, s'applique immédiatement via son propre bouton).
  const [autoValidate, setAutoValidate] = useState(data.auto_validate_suppliers);
  const [threshold, setThreshold] = useState(String(data.confidence_threshold));

  const thresholdValue = Number(threshold);
  const thresholdValid =
    threshold.trim() !== '' && Number.isInteger(thresholdValue) && thresholdValue >= 0 && thresholdValue <= 100;
  const dirty =
    autoValidate !== data.auto_validate_suppliers ||
    (thresholdValid && thresholdValue !== data.confidence_threshold);

  const handleSave = () => {
    if (!thresholdValid) {
      toast.error(t('adminSettings.thresholdInvalid'));
      return;
    }
    save.mutate({ auto_validate_suppliers: autoValidate, confidence_threshold: thresholdValue });
  };

  const handleToggleMaintenance = () => {
    const next = !data.maintenance_mode;
    if (next && !window.confirm(t('adminSettings.maintenanceConfirm'))) return;
    toggleMaintenance.mutate({ maintenance_mode: next });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('adminSettings.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('adminSettings.subtitle')}</p>
        </div>
        <Button
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSave}
          loading={save.isPending}
          disabled={!dirty}
        >
          {t('adminSettings.save')}
        </Button>
      </div>

      <div className="space-y-6">
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('adminSettings.security')}</h2>
          </div>
          <PreferenceRow
            title={t('adminSettings.autoValidate')}
            description={t('adminSettings.autoValidateDesc')}
            checked={autoValidate}
            onChange={setAutoValidate}
          />
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Server className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('adminSettings.ai')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="confidence-threshold" className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSettings.threshold')}
              </label>
              <input
                id="confidence-threshold"
                type="number"
                min={0}
                max={100}
                step={1}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className={`${inputClass} ${thresholdValid ? '' : 'border-red-400 focus:border-red-500 focus:ring-red-200'}`}
              />
              <p className={`text-xs mt-1 ${thresholdValid ? 'text-gray-400' : 'text-red-600'}`}>
                {thresholdValid ? t('adminSettings.thresholdHint') : t('adminSettings.thresholdInvalid')}
              </p>
            </div>
            <div>
              <label htmlFor="active-model" className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminSettings.activeModel')}
              </label>
              <input id="active-model" value={data.active_model} readOnly className={`${inputClass} bg-gray-50 text-gray-600`} />
              <p className="text-xs mt-1 text-gray-400">{t('adminSettings.activeModelHint')}</p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Database className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('adminSettings.maintenance')}</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-amber-100 bg-amber-50/50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">
                {t('adminSettings.maintenanceTitle')}{' '}
                {data.maintenance_mode && (
                  <span className="text-amber-700">{t('adminSettings.maintenanceActive')}</span>
                )}
              </p>
              <p className="text-sm text-gray-600">{t('adminSettings.maintenanceDesc')}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleToggleMaintenance}
              loading={toggleMaintenance.isPending}
              className={
                data.maintenance_mode
                  ? 'text-gray-700 border-gray-300 hover:bg-gray-100'
                  : 'text-amber-700 border-amber-200 hover:bg-amber-100'
              }
            >
              {data.maintenance_mode ? t('adminSettings.maintenanceDisable') : t('adminSettings.maintenanceEnable')}
            </Button>
          </div>
        </Card>

        <PasswordChangeCard />
        <LanguageRegionCard showCountry={false} />
      </div>
    </div>
  );
}
