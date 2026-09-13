import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUpdateProfile } from '@/features/auth/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function CompanyProfilePage() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    company: user?.company || '',
    name: user?.name || '',
    phone: user?.phone || '',
    region: user?.region || '',
    description: user?.description || '',
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = () => {
    updateProfile.mutate(form);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil de l'entreprise</h1>

      <Card padding="lg">
        <div className="flex items-start gap-8">
          <div className="h-24 w-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-4xl">
            🏪
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{user?.company || user?.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">
                {user?.category || 'Non catégorisé'}
              </span>
              {user?.created_at && (
                <>
                  <span>•</span>
                  <span>Inscrit depuis {new Date(user.created_at).getFullYear()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-8 border-t border-gray-100">
          <Input
            label="Nom de l'entreprise"
            value={form.company}
            onChange={handleChange('company')}
            leftIcon={<Building2 className="w-4 h-4" />}
          />
          <Input
            label="Nom du contact"
            value={form.name}
            onChange={handleChange('name')}
            leftIcon={<Building2 className="w-4 h-4" />}
          />
          <Input
            label="Email professionnel"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            hint="L'email ne peut pas être modifié."
          />
          <Input
            label="Téléphone principal"
            value={form.phone}
            onChange={handleChange('phone')}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <div className="md:col-span-2">
            <Input
              label="Adresse complète"
              value={form.region}
              onChange={handleChange('region')}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description de l'entreprise
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={handleChange('description')}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
          <Button onClick={handleSave} loading={updateProfile.isPending}>
            Enregistrer les modifications
          </Button>
        </div>
      </Card>
    </div>
  );
}
