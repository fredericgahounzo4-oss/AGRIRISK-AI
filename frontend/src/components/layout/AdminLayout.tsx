import { useState } from 'react';
import { NavLink, useNavigate, Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Package,
  Microscope, FileText, BarChart3, Settings, LogOut, Leaf,
  ChevronRight, ShieldCheck, Menu
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTranslation } from '@/lib/i18n/I18nContext';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/admin/tableau-de-bord', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/admin/utilisateurs',    icon: Users,           labelKey: 'sidebar.users'    },
  { to: '/admin/fournisseurs',    icon: Building2,       labelKey: 'sidebar.suppliers'    },
  { to: '/admin/produits',        icon: Package,         labelKey: 'sidebar.products'        },
  { to: '/admin/diagnostics',     icon: Microscope,      labelKey: 'sidebar.diagnostics'     },
  { to: '/admin/journaux',        icon: FileText,        labelKey: 'sidebar.logs'        },
  { to: '/admin/statistiques',    icon: BarChart3,       labelKey: 'sidebar.stats'    },
  { to: '/admin/parametres',      icon: Settings,        labelKey: 'sidebar.settings'      },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/connexion'); };
  const closeSidebar = () => setSidebarOpen(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'A';

  return (
    <div className="flex min-h-screen bg-[#f7f9f7]">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-[#111827] text-white transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Link
          to="/admin/tableau-de-bord"
          onClick={closeSidebar}
          className="flex items-center gap-3 px-6 py-5 border-b border-white/10 hover:bg-white/5 transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">AgriRisk AI</span>
            <p className="text-xs text-white/50 leading-none mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />{t('sidebar.admin.roleShort')}
            </p>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20'
                    : 'text-white/65 hover:bg-white/8 hover:text-white'
                )
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{t(labelKey)}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
            <div className="h-8 w-8 rounded-full bg-[#22c55e] flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" />{t('sidebar.admin.role')}</p>
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

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-white/80 backdrop-blur border-b border-gray-100 px-4 sm:px-6 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={t('topbar.openMenu')}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="h-8 w-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('sidebar.admin.role')}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
