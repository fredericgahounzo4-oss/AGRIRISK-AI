import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Leaf, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Au moins 8 caractères'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'dummy-token';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      await authApi.resetPassword(token, data.password, data.password_confirmation);
      toast.success('Mot de passe réinitialisé avec succès !');
      navigate('/connexion');
    } catch (error) {
      toast.error('Une erreur est survenue.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#f7f9f7]">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5c2a] mb-4">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2e1d]">Nouveau mot de passe</h2>
          <p className="mt-2 text-sm text-[#6b7c6e]">
            Veuillez entrer votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nouveau mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightElement={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#6b7c6e]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />

          <Button type="submit" size="lg" loading={isPending} className="w-full mt-2">
            Enregistrer et se connecter
          </Button>

          <div className="text-center mt-4">
            <Link to="/connexion" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#6b7c6e] hover:text-[#1a2e1d] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
