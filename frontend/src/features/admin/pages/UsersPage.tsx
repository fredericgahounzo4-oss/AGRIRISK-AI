import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Search, UserX, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useAdminUsers, useToggleUserStatus } from '../hooks/useAdmin';

const statusLabel: Record<string, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  pending: 'En attente',
  rejected: 'Refusé',
};

const statusStyle: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
};

export function UsersPage() {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading, isError } = useAdminUsers();
  const toggleStatus = useToggleUserStatus();

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez tous les comptes de la plateforme</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un utilisateur..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center"><Loader /></div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">Impossible de charger les utilisateurs.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">Utilisateur</th>
                  <th className="px-6 py-4 font-semibold">Rôle</th>
                  <th className="px-6 py-4 font-semibold">Région</th>
                  <th className="px-6 py-4 font-semibold">Inscription</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 capitalize">{user.role === 'farmer' ? 'Agriculteur' : 'Fournisseur'}</td>
                    <td className="px-6 py-4">{user.region || '—'}</td>
                    <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[user.status]}`}>
                        {statusLabel[user.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => toggleStatus.mutate(user.id)}
                          disabled={toggleStatus.isPending}
                          title="Suspendre"
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStatus.mutate(user.id)}
                          disabled={toggleStatus.isPending}
                          title="Activer"
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-500">Aucun utilisateur trouvé.</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
