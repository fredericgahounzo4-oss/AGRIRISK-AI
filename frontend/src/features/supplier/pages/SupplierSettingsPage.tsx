import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bell, Lock, Store, CreditCard } from 'lucide-react';
import { useChangePassword } from '@/features/auth/hooks/useProfile';
import toast from 'react-hot-toast';

export function SupplierSettingsPage() {
  const changePassword = useChangePassword();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    changePassword.mutate(passwordForm, {
      onSuccess: () => {
        setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        setShowPasswordForm(false);
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres de la boutique</h1>

      <div className="space-y-6">
        {/* Boutique */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Store className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Visibilité de la boutique</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Boutique en ligne</p>
                <p className="text-sm text-gray-500">Permettre aux agriculteurs de trouver votre boutique</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400">
              Ce réglage n'est pas encore connecté au serveur (à venir).
            </p>
          </div>
        </Card>

        {/* Notifications */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Bell className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Nouvelles demandes</p>
                <p className="text-sm text-gray-500">Recevoir un email à chaque nouvelle commande</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Alertes de stock</p>
                <p className="text-sm text-gray-500">M'avertir quand un produit est en rupture ou presque épuisé</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400">
              Ces réglages ne sont pas encore connectés au serveur (à venir).
            </p>
          </div>
        </Card>

        {/* Facturation */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Abonnement et facturation</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-green-100 bg-green-50/50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">Plan Premium</p>
              <p className="text-sm text-gray-600">Prochain prélèvement le 01 Juil 2024</p>
            </div>
            <Button variant="outline" onClick={() => toast('La gestion de l\'abonnement arrive bientôt.', { icon: 'ℹ️' })}>
              Gérer l'abonnement
            </Button>
          </div>
        </Card>

        {/* Sécurité */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Lock className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Sécurité</h2>
          </div>

          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Changer le mot de passe
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <Input
                label="Mot de passe actuel"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                required
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                hint="8 caractères minimum, pas uniquement des chiffres."
                required
              />
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={passwordForm.new_password_confirmation}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))
                }
                required
              />
              <div className="flex gap-3">
                <Button type="submit" loading={changePassword.isPending}>
                  Enregistrer le nouveau mot de passe
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPasswordForm(false)}
                  disabled={changePassword.isPending}
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
