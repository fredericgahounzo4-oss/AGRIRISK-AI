import { ChevronDown, Search, Leaf, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTranslation } from '@/lib/i18n/I18nContext';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  // Determine profile path based on role
  const profilePath =
    user?.role === 'admin'    ? '/admin/tableau-de-bord' :
    user?.role === 'supplier' ? '/fournisseur/profil-entreprise' :
                                '/app/profil';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-white/80 backdrop-blur border-b border-gray-100 px-4 sm:px-6 h-16">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        aria-label={t('topbar.openMenu')}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xs hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('topbar.search')}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/15 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <NotificationBell />

        {/* Logo (mobile) */}
        <div className="flex md:hidden items-center gap-1.5">
          <div className="h-7 w-7 rounded-lg bg-[#22c55e] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* User */}
        <Link to={profilePath} className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-gray-200">
          <div className="h-8 w-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role === 'farmer' ? t('sidebar.farmer.role') : user?.role === 'supplier' ? t('sidebar.supplier.role') : t('sidebar.admin.role')}</p>
          </div>
          <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400" />
        </Link>
      </div>
    </header>
  );
}
