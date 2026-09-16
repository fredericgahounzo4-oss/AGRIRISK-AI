import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout }     from '@/components/layout/MainLayout';
import { PublicLayout }   from '@/components/layout/PublicLayout';
import { SupplierLayout } from '@/components/layout/SupplierLayout';
import { AdminLayout }    from '@/components/layout/AdminLayout';

// Guards
import { RoleRoute } from '@/features/auth/components/RoleRoute';

// ─── Auth pages ──────────────────────────────────────────────────────────────
import { LoginPage }            from '@/features/auth/pages/LoginPage';
import { RegisterFarmerPage }   from '@/features/auth/pages/RegisterFarmerPage';
import { RegisterSupplierPage } from '@/features/auth/pages/RegisterSupplierPage';
import { ForgotPasswordPage }   from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage }    from '@/features/auth/pages/ResetPasswordPage';

// ─── Public pages ────────────────────────────────────────────────────────────
import { HomePage }            from '@/features/public/pages/HomePage';
import { FeaturesPage }        from '@/features/public/pages/FeaturesPage';
import { SuppliersPublicPage } from '@/features/public/pages/SuppliersPublicPage';
import { AboutPage }           from '@/features/public/pages/AboutPage';
import { FAQPage }             from '@/features/public/pages/FAQPage';
import { ContactPage }         from '@/features/public/pages/ContactPage';
import { BlogPage }            from '@/features/public/pages/BlogPage';
import { BlogPostPage }        from '@/features/public/pages/BlogPostPage';

// ─── Farmer pages ────────────────────────────────────────────────────────────
import { DashboardPage }       from '@/features/dashboard/pages/DashboardPage';
import { DiagnosticPage }      from '@/features/diagnostic/pages/DiagnosticPage';
import { DiagnosticResultPage }from '@/features/diagnostic/pages/DiagnosticResultPage';
import { AssistantPage }       from '@/features/assistant/pages/AssistantPage';
import { SuppliersPage }       from '@/features/suppliers/pages/SuppliersPage';
import { HistoryPage }         from '@/features/farmer/pages/HistoryPage';
import { ProfilePage }         from '@/features/farmer/pages/ProfilePage';
import { SettingsPage }        from '@/features/farmer/pages/SettingsPage';

// ─── Supplier pages ──────────────────────────────────────────────────────────
import { SupplierDashboardPage } from '@/features/supplier/pages/SupplierDashboardPage';
import { CompanyProfilePage }    from '@/features/supplier/pages/CompanyProfilePage';
import { ProductsPage }          from '@/features/supplier/pages/ProductsPage';
import { RequestsPage }          from '@/features/supplier/pages/RequestsPage';
import { StatisticsPage }        from '@/features/supplier/pages/StatisticsPage';
import { SupplierSettingsPage }  from '@/features/supplier/pages/SupplierSettingsPage';

// ─── Admin pages ─────────────────────────────────────────────────────────────
import { AdminDashboardPage }  from '@/features/admin/pages/AdminDashboardPage';
import { UsersPage }           from '@/features/admin/pages/UsersPage';
import { AdminSuppliersPage }  from '@/features/admin/pages/AdminSuppliersPage';
import { AdminProductsPage }   from '@/features/admin/pages/AdminProductsPage';
import { AdminDiagnosticsPage }from '@/features/admin/pages/AdminDiagnosticsPage';
import { LogsPage }            from '@/features/admin/pages/LogsPage';
import { AdminStatisticsPage } from '@/features/admin/pages/AdminStatisticsPage';
import { AdminSettingsPage }   from '@/features/admin/pages/AdminSettingsPage';

export const router = createBrowserRouter([
  // ── Public site (no auth required) ──────────────────────────────────────
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true,                    element: <HomePage />            },
      { path: 'fonctionnalites',        element: <FeaturesPage />        },
      { path: 'fournisseurs-publics',   element: <SuppliersPublicPage /> },
      { path: 'a-propos',              element: <AboutPage />           },
      { path: 'faq',                   element: <FAQPage />             },
      { path: 'contact',               element: <ContactPage />         },
      { path: 'blog',                  element: <BlogPage />            },
      { path: 'blog/:slug',            element: <BlogPostPage />        },
    ],
  },

  // ── Auth routes ──────────────────────────────────────────────────────────
  { path: '/connexion',                       element: <LoginPage />            },
  { path: '/inscription',                     element: <Navigate to="/inscription/agriculteur" replace /> },
  { path: '/inscription/agriculteur',         element: <RegisterFarmerPage />   },
  { path: '/inscription/fournisseur',         element: <RegisterSupplierPage /> },
  { path: '/mot-de-passe-oublie',            element: <ForgotPasswordPage />   },
  { path: '/reinitialiser-mot-de-passe',     element: <ResetPasswordPage />    },

  // ── Farmer app (/app/*) ──────────────────────────────────────────────────
  {
    path: '/app',
    element: <RoleRoute roles={['farmer']}><MainLayout /></RoleRoute>,
    children: [
      { index: true,                     element: <Navigate to="/app/tableau-de-bord" replace /> },
      { path: 'tableau-de-bord',         element: <DashboardPage />        },
      { path: 'diagnostic',              element: <DiagnosticPage />       },
      { path: 'diagnostic/resultat/:id', element: <DiagnosticResultPage /> },
      { path: 'assistant',               element: <AssistantPage />        },
      { path: 'fournisseurs',            element: <SuppliersPage />        },
      { path: 'historique',              element: <HistoryPage />          },
      { path: 'profil',                  element: <ProfilePage />          },
      { path: 'parametres',              element: <SettingsPage />         },
    ],
  },

  // ── Supplier portal (/fournisseur/*) ─────────────────────────────────────
  {
    path: '/fournisseur',
    element: <RoleRoute roles={['supplier']}><SupplierLayout /></RoleRoute>,
    children: [
      { index: true,              element: <Navigate to="/fournisseur/tableau-de-bord" replace /> },
      { path: 'tableau-de-bord', element: <SupplierDashboardPage /> },
      { path: 'profil-entreprise',element: <CompanyProfilePage />   },
      { path: 'produits',         element: <ProductsPage />         },
      { path: 'demandes',         element: <RequestsPage />         },
      { path: 'statistiques',     element: <StatisticsPage />       },
      { path: 'parametres',       element: <SupplierSettingsPage /> },
    ],
  },

  // ── Admin portal (/admin/*) ──────────────────────────────────────────────
  {
    path: '/admin',
    element: <RoleRoute roles={['admin']}><AdminLayout /></RoleRoute>,
    children: [
      { index: true,              element: <Navigate to="/admin/tableau-de-bord" replace /> },
      { path: 'tableau-de-bord', element: <AdminDashboardPage />   },
      { path: 'utilisateurs',    element: <UsersPage />            },
      { path: 'fournisseurs',    element: <AdminSuppliersPage />   },
      { path: 'produits',        element: <AdminProductsPage />    },
      { path: 'diagnostics',     element: <AdminDiagnosticsPage /> },
      { path: 'journaux',        element: <LogsPage />             },
      { path: 'statistiques',    element: <AdminStatisticsPage />  },
      { path: 'parametres',      element: <AdminSettingsPage />    },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);
