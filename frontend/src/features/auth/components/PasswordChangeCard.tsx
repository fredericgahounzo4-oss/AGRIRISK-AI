import { useState } from 'react';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n/I18nContext';
import { useChangePassword } from '../hooks/useProfile';

const emptyForm = { current_password: '', new_password: '', new_password_confirmation: '' };

/** Carte « Sécurité » : changement de mot de passe (agriculteur, fournisseur et admin). */
export function PasswordChangeCard() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.new_password_confirmation) {
      toast.error(t('settings.passwordMismatch'));
      return;
    }
    changePassword.mutate(form, {
      onSuccess: () => {
        setForm(emptyForm);
        setOpen(false);
      },
    });
  };

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Lock className="w-5 h-5" /></div>
        <h2 className="text-lg font-bold text-gray-900">{t('settings.security')}</h2>
      </div>

      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>
          {t('settings.changePassword')}
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input
            label={t('settings.currentPassword')}
            type="password"
            autoComplete="current-password"
            value={form.current_password}
            onChange={(e) => setForm((p) => ({ ...p, current_password: e.target.value }))}
            required
          />
          <Input
            label={t('settings.newPassword')}
            type="password"
            autoComplete="new-password"
            value={form.new_password}
            onChange={(e) => setForm((p) => ({ ...p, new_password: e.target.value }))}
            hint={t('settings.newPasswordHint')}
            required
          />
          <Input
            label={t('settings.confirmPassword')}
            type="password"
            autoComplete="new-password"
            value={form.new_password_confirmation}
            onChange={(e) => setForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
            required
          />
          <div className="flex gap-3">
            <Button type="submit" loading={changePassword.isPending}>
              {t('settings.savePassword')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={changePassword.isPending}
            >
              {t('settings.cancel')}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
