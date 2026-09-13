import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Leaf } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n/I18nContext';
import { useLogin } from '../hooks/useLogin';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const { t } = useTranslation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => login(data);

  const stats: [string, string][] = [
    ['92%', t('auth.statAccuracy')],
    ['500+', t('auth.statDiseases')],
    ['1 000+', t('auth.statFarmers')],
  ];

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — visuel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-[#1a5c2a] p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">AgriRisk AI</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">{t('auth.leftPanelTag')}</span>
            <h1 className="text-4xl font-bold leading-tight">
              {t('auth.leftPanelTitle')}
            </h1>
          </div>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            {t('auth.leftPanelDesc')}
          </p>

          <div className="flex gap-8">
            {stats.map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-sm text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm">© 2024 AgriRisk AI — {t('auth.rightsFooter')}</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 items-center justify-center p-8 bg-[#f7f9f7]">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a5c2a]">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1a2e1d]">AgriRisk AI</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1a2e1d]">{t('auth.loginTitle')}</h2>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-[#6b7c6e]">
              {t('auth.noAccount')}{' '}
              <div className="relative group inline-block">
                <span className="font-medium text-[#1a5c2a] hover:underline cursor-pointer">
                  {t('nav.register')}
                </span>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <Link to="/inscription/agriculteur" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#e8f5e9] hover:text-[#1a5c2a] rounded-t-xl transition-colors">
                    🌱 {t('auth.asFarmer')}
                  </Link>
                  <Link to="/inscription/fournisseur" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#e8f5e9] hover:text-[#1a5c2a] rounded-b-xl transition-colors">
                    🏪 {t('auth.asSupplier')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="jean@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#6b7c6e] hover:text-[#1a2e1d]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link to="/mot-de-passe-oublie" className="text-sm text-[#1a5c2a] hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" size="lg" loading={isPending} className="w-full">
              {t('auth.loginButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
