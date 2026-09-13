import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Leaf, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Email invalide'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSent(true);
      toast.success('Lien de réinitialisation envoyé !');
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
          <h2 className="text-2xl font-bold text-[#1a2e1d]">Mot de passe oublié</h2>
          <p className="mt-2 text-sm text-[#6b7c6e]">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {isSent ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-[#e8f5e9] text-[#1a5c2a] rounded-xl text-sm font-medium border border-[#bbf7d0]">
              Un email contenant les instructions de réinitialisation vous a été envoyé. Veuillez vérifier votre boîte de réception.
            </div>
            <Link to="/connexion" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#1a5c2a] hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="jean@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" size="lg" loading={isPending} className="w-full mt-2">
              Envoyer le lien
            </Button>
            
            <div className="text-center mt-4">
              <Link to="/connexion" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#6b7c6e] hover:text-[#1a2e1d] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
