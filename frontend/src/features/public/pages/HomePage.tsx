import { Link } from 'react-router-dom';
import { ArrowRight, Microscope, MessageCircle, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/I18nContext';

export function HomePage() {
  const { t } = useTranslation();

  const features = [
    { icon: Microscope, titleKey: 'home.feature1Title', descKey: 'home.feature1Desc', color: 'bg-blue-100 text-blue-600' },
    { icon: MessageCircle, titleKey: 'home.feature2Title', descKey: 'home.feature2Desc', color: 'bg-green-100 text-green-600' },
    { icon: MapPin, titleKey: 'home.feature3Title', descKey: 'home.feature3Desc', color: 'bg-amber-100 text-amber-600' },
  ];

  const stats = [
    { val: '10 000+', labelKey: 'home.statFarmers' },
    { val: '500+', labelKey: 'home.statDiseases' },
    { val: '95%', labelKey: 'home.statAccuracy' },
    { val: '2 000+', labelKey: 'home.statSuppliers' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f2e1d] pt-20 pb-32">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-[600px] h-[600px] rounded-full bg-[#22c55e] opacity-20 blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                {t('home.badge')}
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight">
                {t('home.heroTitlePart1')} <br />
                <span className="text-[#4ade80]">{t('home.heroTitlePart2')}</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                {t('home.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/inscription/agriculteur">
                  <Button size="lg" className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-white border-0 h-14 px-8 text-base shadow-lg shadow-[#22c55e]/25">
                    {t('home.ctaStart')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/inscription/fournisseur">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base text-white border-white/30 hover:bg-white/10">
                    {t('home.ctaSupplier')}
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-6 text-sm text-white/60">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4ade80]" /> {t('home.noCommitment')}</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4ade80]" /> {t('home.secure')}</div>
              </div>
            </div>

            {/* Hero Illustration — SVG maison, pas de dépendance externe */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1a5c2a] to-transparent rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
              <svg
                viewBox="0 0 400 500"
                role="img"
                aria-label={t('home.heroImageAlt')}
                className="relative z-10 rounded-3xl shadow-2xl border border-white/10 w-full h-[500px]"
              >
                <defs>
                  <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1a5c2a" />
                    <stop offset="100%" stopColor="#0a1f11" />
                  </linearGradient>
                  <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>

                <rect width="400" height="500" fill="url(#heroBg)" />

                {/* Décor : cercles doux */}
                <circle cx="40" cy="440" r="90" fill="#22c55e" opacity="0.12" />
                <circle cx="370" cy="60" r="120" fill="#4ade80" opacity="0.1" />

                {/* Petites feuilles décoratives */}
                <g opacity="0.35">
                  <path d="M60 120 Q80 100 100 120 Q80 140 60 120 Z" fill="#4ade80" />
                  <path d="M320 400 Q340 380 360 400 Q340 420 320 400 Z" fill="#4ade80" />
                  <path d="M300 130 Q315 115 330 130 Q315 145 300 130 Z" fill="#86efac" />
                </g>

                {/* Grande feuille centrale */}
                <g transform="translate(200 250)">
                  <path
                    d="M0 -140 C 80 -120, 120 -40, 90 40 C 65 105, 0 140, 0 140 C 0 140, -65 105, -90 40 C -120 -40, -80 -120, 0 -140 Z"
                    fill="url(#leafGrad)"
                  />
                  {/* Nervure centrale */}
                  <path d="M0 -125 L0 130" stroke="#0a1f11" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
                  {/* Nervures latérales */}
                  <path d="M0 -70 L45 -35" stroke="#0a1f11" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 -70 L-45 -35" stroke="#0a1f11" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 -10 L50 25" stroke="#0a1f11" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 -10 L-50 25" stroke="#0a1f11" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 50 L40 80" stroke="#0a1f11" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 50 L-40 80" stroke="#0a1f11" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Anneau de scan IA */}
                <circle cx="200" cy="250" r="150" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 10" />

                {/* Badge check flottant (résultat du diagnostic) */}
                <g transform="translate(285 165)">
                  <circle cx="0" cy="0" r="34" fill="#ffffff" />
                  <circle cx="0" cy="0" r="34" fill="none" stroke="#22c55e" strokeWidth="3" />
                  <path d="M-13 0 L-3 11 L15 -10" fill="none" stroke="#1a5c2a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </svg>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9]">
                  <ShieldCheck className="w-6 h-6 text-[#1a5c2a]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t('home.badgeDiagnosis')}</p>
                  <p className="text-xs text-gray-500">{t('home.badgeConfidence')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.featuresTitle')}</h2>
            <p className="text-gray-600 text-lg">{t('home.featuresSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t(feature.titleKey)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#1a5c2a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="px-4">
                <div className="text-4xl font-bold mb-2">{stat.val}</div>
                <div className="text-white/70 text-sm">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('home.ctaTitle')}</h2>
          <p className="text-lg text-gray-600 mb-8">{t('home.ctaSubtitle')}</p>
          <Link to="/inscription/agriculteur">
            <Button size="lg" className="bg-[#1a5c2a] hover:bg-[#15803d] h-14 px-10 text-base">
              {t('home.ctaButton')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
