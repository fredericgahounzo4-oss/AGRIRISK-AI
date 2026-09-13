import React, { useState } from 'react';
import { Users, Stethoscope, Store, Clock, TrendingUp, CheckCircle, XCircle, UserCheck, BarChart2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { mockAdminStats, mockSuppliers, mockUsers } from '../data/mockData';
import type { Supplier, User } from '../types';

type AdminTab = 'stats' | 'suppliers' | 'users';

const AdminPage: React.FC = () => {
  const { t, currentUser } = useApp();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [users, setUsers] = useState<User[]>(mockUsers);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="page-container">
        <div className="access-denied">
          <h2>Accès refusé</h2>
          <p>Vous n'avez pas les droits d'accès à cette page.</p>
        </div>
      </div>
    );
  }

  const stats = mockAdminStats;

  const approveSupplier = (id: string) =>
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
  const rejectSupplier = (id: string) =>
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
  const toggleUser = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));

  const statCards = [
    { label: t('totalUsers'), value: stats.totalUsers.toLocaleString(), icon: <Users size={24} />, color: 'stat-blue', sub: `${stats.activeUsers} actifs` },
    { label: t('totalDiagnoses'), value: stats.totalDiagnoses.toLocaleString(), icon: <Stethoscope size={24} />, color: 'stat-green', sub: `${stats.diagnosesThisMonth} ce mois` },
    { label: t('totalSuppliers'), value: stats.totalSuppliers.toLocaleString(), icon: <Store size={24} />, color: 'stat-earth', sub: `${stats.pendingSuppliers} en attente` },
    { label: 'Taux d\'activité', value: `${Math.round(stats.activeUsers / stats.totalUsers * 100)}%`, icon: <TrendingUp size={24} />, color: 'stat-teal', sub: 'Utilisateurs actifs' },
  ];

  const statusBadge = (status: string) => ({
    approved: <span className="badge-green">Approuvé</span>,
    rejected: <span className="badge-red">Refusé</span>,
    pending: <span className="badge-yellow">En attente</span>,
  }[status] || <span>{status}</span>);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon blue"><BarChart2 size={28} /></div>
        <div>
          <h1>{t('adminTitle')}</h1>
          <p>{t('connectedAs')} : {currentUser.name} — Administrateur</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { key: 'stats', label: t('statistics'), icon: <BarChart2 size={16} /> },
          { key: 'suppliers', label: t('totalSuppliers'), icon: <Store size={16} /> },
          { key: 'users', label: t('users'), icon: <Users size={16} /> },
        ].map(tabItem => (
          <button
            key={tabItem.key}
            className={`admin-tab ${tab === tabItem.key ? 'active' : ''}`}
            onClick={() => setTab(tabItem.key as AdminTab)}
          >
            {tabItem.icon} {tabItem.label}
          </button>
        ))}
      </div>

      {/* STATS TAB */}
      {tab === 'stats' && (
        <div className="admin-content">
          <div className="stats-grid">
            {statCards.map((card, i) => (
              <div key={i} className={`admin-stat-card ${card.color}`}>
                <div className="admin-stat-icon">{card.icon}</div>
                <div className="admin-stat-info">
                  <div className="admin-stat-value">{card.value}</div>
                  <div className="admin-stat-label">{card.label}</div>
                  <div className="admin-stat-sub">{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="admin-section">
            <h3>Activité récente</h3>
            <div className="activity-list">
              {[
                { time: 'Il y a 5 min', action: 'Nouveau diagnostic — Rouille du maïs', type: 'diag' },
                { time: 'Il y a 12 min', action: 'Inscription fournisseur — PhytoVet Kpalimé', type: 'supplier' },
                { time: 'Il y a 23 min', action: 'Nouveau utilisateur — Afi Kuma (Éleveur)', type: 'user' },
                { time: 'Il y a 1h', action: 'Diagnostic animal — Maladie de Newcastle', type: 'diag' },
                { time: 'Il y a 2h', action: 'Question assistant IA — Fertilisation soja', type: 'ai' },
              ].map((act, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${act.type}`} />
                  <div className="activity-info">
                    <span>{act.action}</span>
                    <small>{act.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disease frequency */}
          <div className="admin-section">
            <h3>Maladies les plus diagnostiquées</h3>
            <div className="disease-chart">
              {[
                { name: 'Rouille du maïs', count: 342, pct: 85 },
                { name: 'Mildiou tomate', count: 287, pct: 72 },
                { name: 'Mosaïque manioc', count: 198, pct: 49 },
                { name: 'Newcastle volailles', count: 165, pct: 41 },
                { name: 'Dermatophilose bovine', count: 112, pct: 28 },
              ].map((d, i) => (
                <div key={i} className="disease-row">
                  <span className="disease-name">{d.name}</span>
                  <div className="disease-bar-wrap">
                    <div className="disease-bar" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="disease-count">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIERS TAB */}
      {tab === 'suppliers' && (
        <div className="admin-content">
          <div className="admin-section">
            <div className="section-toolbar">
              <h3>Gestion des fournisseurs</h3>
              <div className="toolbar-counts">
                <span className="badge-yellow">
                  <Clock size={14} /> {suppliers.filter(s => s.status === 'pending').length} en attente
                </span>
              </div>
            </div>

            <div className="admin-table">
              <div className="table-header">
                <span>Entreprise</span>
                <span>Région</span>
                <span>Catégorie</span>
                <span>Pack</span>
                <span>Statut</span>
                <span>Actions</span>
              </div>
              {suppliers.map(s => (
                <div key={s.id} className="table-row">
                  <div className="table-cell">
                    <strong>{s.companyName}</strong>
                    <small>{s.manager} · {s.phone}</small>
                  </div>
                  <div className="table-cell">{s.region}</div>
                  <div className="table-cell">{s.category}</div>
                  <div className="table-cell">
                    <span className={`pack-badge pack-${s.pack}`}>{s.pack}</span>
                  </div>
                  <div className="table-cell">{statusBadge(s.status)}</div>
                  <div className="table-cell actions">
                    {s.status === 'pending' && (
                      <>
                        <button className="action-btn green" onClick={() => approveSupplier(s.id)}>
                          <CheckCircle size={15} /> {t('approve')}
                        </button>
                        <button className="action-btn red" onClick={() => rejectSupplier(s.id)}>
                          <XCircle size={15} /> {t('reject')}
                        </button>
                      </>
                    )}
                    {s.status === 'approved' && (
                      <button className="action-btn red" onClick={() => rejectSupplier(s.id)}>
                        <XCircle size={15} /> Suspendre
                      </button>
                    )}
                    {s.status === 'rejected' && (
                      <button className="action-btn green" onClick={() => approveSupplier(s.id)}>
                        <CheckCircle size={15} /> Réactiver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="admin-content">
          <div className="admin-section">
            <h3>Gestion des utilisateurs</h3>
            <div className="admin-table">
              <div className="table-header">
                <span>Utilisateur</span>
                <span>Rôle</span>
                <span>Région</span>
                <span>Inscrit le</span>
                <span>Statut</span>
                <span>Actions</span>
              </div>
              {users.map(u => (
                <div key={u.id} className="table-row">
                  <div className="table-cell">
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </div>
                  <div className="table-cell">
                    <span className="role-badge">{u.role}</span>
                  </div>
                  <div className="table-cell">{u.region || '—'}</div>
                  <div className="table-cell">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</div>
                  <div className="table-cell">
                    {u.isActive
                      ? <span className="badge-green"><UserCheck size={13} /> Actif</span>
                      : <span className="badge-red">Inactif</span>}
                  </div>
                  <div className="table-cell">
                    <button
                      className={`action-btn ${u.isActive ? 'red' : 'green'}`}
                      onClick={() => toggleUser(u.id)}
                    >
                      {u.isActive ? t('deactivate') : t('activate')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
