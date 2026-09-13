import { useRef, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUpdateProfile, useUploadAvatar } from '@/features/auth/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, MapPin, Sprout, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    region: user?.region || '',
    culture: user?.culture || '',
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    updateProfile.mutate(form);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    uploadAvatar.mutate(file);
    e.target.value = '';
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil agriculteur</h1>

      <Card padding="lg">
        <div className="flex items-start gap-8">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-[#1a5c2a] flex items-center justify-center text-3xl text-white font-bold">
                {user?.name?.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadAvatar.isPending}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">
              Agriculteur{memberSince ? ` • Membre depuis ${memberSince}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <Input
            label="Nom complet"
            value={form.name}
            onChange={handleChange('name')}
            leftIcon={<User className="w-4 h-4" />}
          />
          <Input
            label="Adresse email"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            hint="L'email ne peut pas être modifié."
          />
          <Input
            label="Numéro de téléphone"
            value={form.phone}
            onChange={handleChange('phone')}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="Région / Localité"
            value={form.region}
            onChange={handleChange('region')}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <div className="md:col-span-2">
            <Input
              label="Culture principale"
              value={form.culture}
              onChange={handleChange('culture')}
              leftIcon={<Sprout className="w-4 h-4" />}
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
