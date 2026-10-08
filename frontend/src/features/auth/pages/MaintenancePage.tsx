import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '@/lib/i18n/I18nContext';

/** Affichée à tous les non-admins tant que le « mode maintenance » est actif. */
export function MaintenancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [checking, setChecking] = useState(false);
  const [stillDown, setStillDown] = useState(false);

  const retry = async () => {
    setChecking(true);
    setStillDown(false);
    try {
      const { data } = await api.get<{ maintenance: boolean }>('/platform/status');
      if (data.maintenance) {
        setStillDown(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setStillDown(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7faf7] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('maintenance.title')}</h1>
        <p className="mt-3 text-gray-600">{t('maintenance.text')}</p>
        {stillDown && <p className="mt-3 text-sm text-amber-700">{t('maintenance.stillDown')}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={retry} loading={checking}>{t('maintenance.retry')}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              navigate('/connexion', { replace: true });
            }}
          >
            {t('maintenance.adminLogin')}
          </Button>
        </div>
      </div>
    </div>
  );
}
