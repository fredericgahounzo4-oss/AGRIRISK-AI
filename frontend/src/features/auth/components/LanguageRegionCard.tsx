import { useState } from 'react';
import { Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslation, type Language } from '@/lib/i18n/I18nContext';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfile } from '../hooks/useProfile';

const COUNTRIES = ['Togo', "Côte d'Ivoire", 'Sénégal', 'Mali', 'Bénin', 'Ghana'];

const selectClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20';

/** Carte « Langue et région » : la langue s'applique tout de suite, « Enregistrer » la mémorise sur le profil. */
export function LanguageRegionCard({ showCountry = true }: { showCountry?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const { t, language, setLanguage } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [country, setCountry] = useState(user?.country || 'Togo');

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast.success(t('settings.languageChanged'));
  };

  const handleSave = () => {
    updateProfile.mutate(showCountry ? { language, country } : { language });
  };

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Globe className="w-5 h-5" /></div>
        <h2 className="text-lg font-bold text-gray-900">{t('settings.languageRegion')}</h2>
      </div>
      <div className={`grid gap-4 ${showCountry ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.language')}</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className={selectClass}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        {showCountry && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.country')}</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <Button onClick={handleSave} loading={updateProfile.isPending}>
          {t('settings.savePreferences')}
        </Button>
      </div>
    </Card>
  );
}
