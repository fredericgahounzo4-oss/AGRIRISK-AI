import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bell, Lock, Globe } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useChangePassword, useUpdateProfile } from '@/features/auth/hooks/useProfile';
import { useTranslation, type Language } from '@/lib/i18n/I18nContext';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user } = useAuthStore();
  const changePassword = useChangePassword();
  const updateProfile = useUpdateProfile();
  const { t, language, setLanguage } = useTranslation();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [country, setCountry] = useState(user?.country || 'Togo');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error(t('settings.passwordMismatch'));
      return;
    }
    changePassword.mutate(passwordForm, {
      onSuccess: () => {
        setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        setShowPasswordForm(false);
      },
    });
  };

  const handleLanguageChange = (lang: Language) => {
    // Applique immédiatement la langue à toute l'interface…
    setLanguage(lang);
    toast.success(t('settings.languageChanged'));
  };

  const handlePreferencesSave = () => {
    // …et on persiste la préférence sur le profil pour les prochaines connexions.
    updateProfile.mutate({ language, country });
  };

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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t('settings.notifAlerts')}</p>
                <p className="text-sm text-gray-500">{t('settings.notifAlertsDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t('settings.notifAssistant')}</p>
                <p className="text-sm text-gray-500">{t('settings.notifAssistantDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400">
              {t('settings.notifNote')}
            </p>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Lock className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('settings.security')}</h2>
          </div>

          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              {t('settings.changePassword')}
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <Input
                label={t('settings.currentPassword')}
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                required
              />
              <Input
                label={t('settings.newPassword')}
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                hint={t('settings.newPasswordHint')}
                required
              />
              <Input
                label={t('settings.confirmPassword')}
                type="password"
                value={passwordForm.new_password_confirmation}
                onChange={(e) => setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                required
              />
              <div className="flex gap-3">
                <Button type="submit" loading={changePassword.isPending}>
                  {t('settings.savePassword')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPasswordForm(false)}
                  disabled={changePassword.isPending}
                >
                  {t('settings.cancel')}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Globe className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">{t('settings.languageRegion')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.language')}</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.country')}</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20"
              >
                <option value="Togo">Togo</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Mali">Mali</option>
                <option value="Bénin">Bénin</option>
                <option value="Ghana">Ghana</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <Button onClick={handlePreferencesSave} loading={updateProfile.isPending}>
              {t('settings.savePreferences')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
