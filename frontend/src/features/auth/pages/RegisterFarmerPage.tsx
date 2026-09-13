import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Leaf, Phone, MapPin, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegisterFarmer } from '../hooks/useRegister';

const schema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro invalide'),
  region: z.string().min(2, 'Région requise'),
  culture: z.string().min(2, 'Culture principale requise'),
  password: z.string().min(6, 'Au moins 6 caractères'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

export function RegisterFarmerPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending } = useRegisterFarmer();

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => register(data);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#f7f9f7]">
      <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5c2a] mb-4">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2e1d]">Inscription Agriculteur</h2>
          <p className="mt-2 text-sm text-[#6b7c6e]">
            Déjà inscrit ?{' '}
            <Link to="/connexion" className="font-medium text-[#1a5c2a] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom complet"
              placeholder="Jean Dupont"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...formRegister('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jean@example.com"
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
              label="Région / Localité"
              placeholder="Ex: Abidjan, Bouaké..."
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.region?.message}
              {...formRegister('region')}
            />
          </div>

          <Input
            label="Culture ou élevage principal"
            placeholder="Ex: Cacao, Volaille, Maïs..."
            leftIcon={<Sprout className="w-4 h-4" />}
            error={errors.culture?.message}
            {...formRegister('culture')}
          />

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

          <Button type="submit" size="lg" loading={isPending} className="w-full mt-6">
            Créer mon compte agriculteur
          </Button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Vous êtes un fournisseur de produits agricoles ?{' '}
            <Link to="/inscription/fournisseur" className="text-[#1a5c2a] hover:underline font-medium">
              Inscrivez-vous ici
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
