import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, ChevronDown, Languages } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTranslation } from '@/lib/i18n/I18nContext';
import { cn } from '@/utils/cn';

type NavLinkDef = { to: string; labelKey: string; exact?: boolean };

// Liens principaux, toujours visibles dès le breakpoint "md" (>=768px)
const primaryLinks: NavLinkDef[] = [
  { to: '/',                     labelKey: 'nav.home',     exact: true },
  { to: '/fonctionnalites',      labelKey: 'nav.features'              },
  { to: '/fournisseurs-publics', labelKey: 'nav.suppliers'             },
];

// Liens secondaires, regroupés dans le menu "Plus" en desktop condensé
const moreLinks: NavLinkDef[] = [
  { to: '/a-propos', labelKey: 'nav.about' },
  { to: '/faq',       labelKey: 'nav.faq'   },
  { to: '/blog',      labelKey: 'nav.blog'  },
];

// Liste complète, utilisée pour le menu mobile et le footer
const navLinks = [...primaryLinks, ...moreLinks];

const registerLinks = [
  { to: '/inscription/agriculteur', labelKey: 'nav.registerFarmer', emoji: '🌱' },
  { to: '/inscription/fournisseur', labelKey: 'nav.registerSupplier', emoji: '🏪' },
];

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleDashboard = () => {
    if (user?.role === 'admin') navigate('/admin/tableau-de-bord');
    else if (user?.role === 'supplier') navigate('/fournisseur/tableau-de-bord');
    else navigate('/app/tableau-de-bord');
  };

  const closeMenus = () => {
    setRegisterOpen(false);
    setMoreOpen(false);
    setLangOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0" onClick={closeMenus}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a5c2a] shrink-0">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="hidden sm:inline text-base font-bold text-[#1a2e1d] whitespace-nowrap">
                AgriRisk AI
              </span>
            </Link>

            {/* Desktop nav (dès md, condensé) */}
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {primaryLinks.map(({ to, labelKey, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    cn(
                      'px-2 lg:px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      isActive ? 'text-[#1a5c2a] bg-[#e8f5e9]' : 'text-gray-600 hover:text-[#1a5c2a] hover:bg-gray-50'
                    )
                  }
                >
                  {t(labelKey)}
                </NavLink>
              ))}

              {/* Liens secondaires : visibles directement à partir de lg, regroupés sous "Plus" entre md et lg */}
              <div className="flex lg:hidden relative">
                <button
                  onClick={() => { setMoreOpen((v) => !v); setRegisterOpen(false); setLangOpen(false); }}
                  className={cn(
                    'flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    moreOpen ? 'text-[#1a5c2a] bg-[#e8f5e9]' : 'text-gray-600 hover:text-[#1a5c2a] hover:bg-gray-50'
                  )}
                >
                  {t('nav.more')}
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', moreOpen && 'rotate-180')} />
                </button>
                {moreOpen && (
                  <div className="absolute left-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {moreLinks.map(({ to, labelKey }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMoreOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#e8f5e9] hover:text-[#1a5c2a] transition-colors"
                      >
                        {t(labelKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {moreLinks.map(({ to, labelKey, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    cn(
                      'hidden lg:inline-block px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      isActive ? 'text-[#1a5c2a] bg-[#e8f5e9]' : 'text-gray-600 hover:text-[#1a5c2a] hover:bg-gray-50'
                    )
                  }
                >
                  {t(labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* CTA (dès md, condensé) */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
              {/* Sélecteur de langue */}
              <div className="relative">
                <button
                  onClick={() => { setLangOpen((v) => !v); setRegisterOpen(false); setMoreOpen(false); }}
                  className="flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-[#1a5c2a] hover:bg-gray-50 transition-colors uppercase"
                  aria-label="Changer de langue"
                >
                  <Languages className="w-4 h-4" />
                  {language}
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-11 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button
                      onClick={() => { setLanguage('fr'); setLangOpen(false); }}
                      className={cn('block w-full text-left px-4 py-2.5 text-sm hover:bg-[#e8f5e9]', language === 'fr' ? 'text-[#1a5c2a] font-medium' : 'text-gray-700')}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setLangOpen(false); }}
                      className={cn('block w-full text-left px-4 py-2.5 text-sm hover:bg-[#e8f5e9]', language === 'en' ? 'text-[#1a5c2a] font-medium' : 'text-gray-700')}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-[#1a5c2a] text-white text-sm font-medium whitespace-nowrap hover:bg-[#15803d] transition-colors"
                >
                  {t('nav.dashboard')}
                </button>
              ) : (
                <>
                  <Link
                    to="/connexion"
                    className="px-2.5 lg:px-4 py-2 rounded-xl text-sm font-medium text-gray-700 whitespace-nowrap hover:bg-gray-100 transition-colors"
                  >
                    {t('nav.login')}
                  </Link>

                  {/* Register dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => { setRegisterOpen((v) => !v); setMoreOpen(false); setLangOpen(false); }}
                      className="flex items-center gap-1 px-2.5 lg:px-4 py-2 rounded-xl bg-[#1a5c2a] text-white text-sm font-medium whitespace-nowrap hover:bg-[#15803d] transition-colors"
                    >
                      {t('nav.register')}
                      <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', registerOpen && 'rotate-180')} />
                    </button>
                    {registerOpen && (
                      <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        {registerLinks.map(({ to, labelKey, emoji }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setRegisterOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#e8f5e9] hover:text-[#1a5c2a] transition-colors"
                          >
                            <span>{emoji}</span>
                            <span>{t(labelKey)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile toggle (en dessous de md uniquement) */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map(({ to, labelKey, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn('block px-3 py-2 rounded-lg text-sm font-medium', isActive ? 'text-[#1a5c2a] bg-[#e8f5e9]' : 'text-gray-700')
                }
              >
                {t(labelKey)}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={cn('flex-1 px-3 py-2 text-sm font-medium rounded-lg border', language === 'fr' ? 'border-[#1a5c2a] text-[#1a5c2a] bg-[#e8f5e9]' : 'border-gray-200 text-gray-600')}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn('flex-1 px-3 py-2 text-sm font-medium rounded-lg border', language === 'en' ? 'border-[#1a5c2a] text-[#1a5c2a] bg-[#e8f5e9]' : 'border-gray-200 text-gray-600')}
              >
                English
              </button>
            </div>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/connexion" className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">{t('footer.login')}</Link>
              {registerLinks.map(({ to, labelKey, emoji }) => (
                <Link key={to} to={to} className="block px-3 py-2 text-sm font-medium text-[#1a5c2a] bg-[#e8f5e9] rounded-lg">{emoji} {t(labelKey)}</Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0f2e1d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#22c55e]">
                  <Leaf className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-base font-bold">AgriRisk AI</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3 text-white/80">{t('footer.navigation')}</p>
              <ul className="space-y-2">
                {navLinks.slice(0, 4).map(({ to, labelKey }) => (
                  <li key={to}><Link to={to} className="text-sm text-white/50 hover:text-white transition-colors">{t(labelKey)}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3 text-white/80">{t('footer.account')}</p>
              <ul className="space-y-2">
                <li><Link to="/connexion" className="text-sm text-white/50 hover:text-white transition-colors">{t('footer.login')}</Link></li>
                <li><Link to="/inscription/agriculteur" className="text-sm text-white/50 hover:text-white transition-colors">{t('footer.farmer')}</Link></li>
                <li><Link to="/inscription/fournisseur" className="text-sm text-white/50 hover:text-white transition-colors">{t('footer.supplier')}</Link></li>
                <li><Link to="/contact" className="text-sm text-white/50 hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">© {new Date().getFullYear()} AgriRisk AI — {t('footer.rights')}</p>
            <div className="flex gap-4">
              <Link to="/faq" className="text-xs text-white/40 hover:text-white/70">{t('footer.faq')}</Link>
              <Link to="/contact" className="text-xs text-white/40 hover:text-white/70">{t('footer.contact')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
