import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Store, Phone, MapPin, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegisterSupplier } from '../hooks/useRegister';

const schema = z.object({
  company: z.string().min(2, 'Nom d\'entreprise requis'),
  name: z.string().min(2, 'Au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro invalide'),
  region: z.string().min(2, 'Région requise'),
  category: z.string().min(1, 'Catégorie requise'),
  password: z.string().min(6, 'Au moins 6 caractères'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

const categories = [
  'Semences',
  'Engrais',
  'Produits phytosanitaires',
  'Équipements agricoles',
  'Produits vétérinaires',
  'Aliments pour bétail',
  'Autre'
];

export function RegisterSupplierPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending } = useRegisterSupplier();

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => register(data);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#f7f9f7]">
      <div className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22c55e] mb-4">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2e1d]">Inscription Fournisseur</h2>
          <p className="mt-2 text-sm text-[#6b7c6e]">
            Vendez vos produits agricoles à des milliers d'agriculteurs. Déjà inscrit ?{' '}
            <Link to="/connexion" className="font-medium text-[#1a5c2a] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom de l'entreprise"
              placeholder="Ex: Agro Services Plus"
              leftIcon={<Store className="w-4 h-4" />}
              error={errors.company?.message}
              {...formRegister('company')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1a2e1d]">Catégorie principale</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Package className="h-4 w-4 text-[#9aab9e]" />
                </div>
                <select
                  className="w-full rounded-xl border border-[#e2e8e4] bg-white pl-11 pr-4 py-2.5 text-sm text-[#1a2e1d] focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20 outline-none appearance-none"
                  {...formRegister('category')}
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionnez une catégorie...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom du contact"
              placeholder="Jean Dupont"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...formRegister('name')}
            />
            <Input
              label="Email professionnel"
              type="email"
              placeholder="contact@entreprise.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...formRegister('email')}
            />
            <Input
              label="Téléphone"
              type="tel"
              placeholder="+225 07..."
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...formRegister('phone')}
            />
            <Input
              label="Région / Ville"
              placeholder="Ex: Abidjan"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.region?.message}
              {...formRegister('region')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#6b7c6e]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              {...formRegister('password')}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password_confirmation?.message}
              {...formRegister('password_confirmation')}
            />
          </div>

          <Button type="submit" size="lg" loading={isPending} className="w-full mt-6 bg-[#22c55e] hover:bg-[#16a34a]">
            Créer mon compte fournisseur
          </Button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Vous êtes agriculteur ?{' '}
            <Link to="/inscription/agriculteur" className="text-[#1a5c2a] hover:underline font-medium">
              Inscrivez-vous ici
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
