import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Microscope, MessageCircle, MapPin,
  History, User, Settings, LogOut, Leaf, ChevronRight, Store, ShoppingCart, ClipboardList, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTranslation } from '@/lib/i18n/I18nContext';
import { cn } from '@/utils/cn';
import { useCartStore, selectCartCount } from '@/features/shop/store/cartStore';
import { useUnreadMessages } from '@/features/messages/hooks/useMessages';

const navItems = [
  { to: '/app/tableau-de-bord', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/app/diagnostic',      icon: Microscope,      labelKey: 'sidebar.diagnosis'   },
  { to: '/app/assistant',       icon: MessageCircle,   labelKey: 'sidebar.assistant'    },
  { to: '/app/messages',        icon: MessageSquare,   labelKey: 'sidebar.messages'     },
  { to: '/app/fournisseurs',    icon: MapPin,          labelKey: 'sidebar.supplierMap' },
  { to: '/app/boutique',        icon: Store,           labelKey: 'sidebar.shop'        },
  { to: '/app/panier',          icon: ShoppingCart,    labelKey: 'sidebar.cart'        },
  { to: '/app/commandes',       icon: ClipboardList,   labelKey: 'sidebar.orders'      },
  { to: '/app/historique',      icon: History,         labelKey: 'sidebar.history'      },
  { to: '/app/profil',          icon: User,            labelKey: 'sidebar.profile'      },
  { to: '/app/parametres',      icon: Settings,        labelKey: 'sidebar.settings'      },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cartCount = useCartStore(selectCartCount);
  const { data: unreadMessages = 0 } = useUnreadMessages();

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-[#0f2e1d] text-white transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <Link
          to="/app/tableau-de-bord"
          onClick={onClose}
          className="flex items-center gap-3 px-6 py-5 border-b border-white/10 hover:bg-white/5 transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">AgriRisk AI</span>
            <p className="text-xs text-white/50 leading-none mt-0.5">{t('sidebar.farmer.role')}</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20'
                    : 'text-white/65 hover:bg-white/8 hover:text-white'
                )
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{t(labelKey)}</span>
              {to === '/app/panier' && cartCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-[#0f2e1d] text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              {to === '/app/messages' && unreadMessages > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-[#0f2e1d] text-xs font-bold flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
            <div className="h-8 w-8 rounded-full bg-[#22c55e] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name ?? 'Utilisateur'}</p>
              <p className="text-xs text-white/50 truncate">{user?.region ?? t('sidebar.farmer.role')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
