import { MOCK_ADMIN_USERS } from '@/services/mockData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(MOCK_ADMIN_USERS);

  const toggleStatus = (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
    toast.success(nextStatus === 'active' ? `${name} a été réactivé.` : `${name} a été suspendu.`);
  };

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
        <Button>Ajouter un utilisateur</Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input 
            placeholder="Rechercher un utilisateur (nom, email)..." 
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
          Rôles / Statuts
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Utilisateur</th>
                <th className="px-6 py-4 font-semibold">Rôle</th>
                <th className="px-6 py-4 font-semibold">Région</th>
                <th className="px-6 py-4 font-semibold">Date d'inscription</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#22c55e] flex items-center justify-center text-white font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                      user.role === 'supplier' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                      {user.role === 'supplier' ? 'Fournisseur' : user.role === 'farmer' ? 'Agriculteur' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.region}</td>
                  <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-50 text-green-700' :
                      user.status === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => toggleStatus(user.id, user.name, user.status)}
                          title="Suspendre"
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStatus(user.id, user.name, user.status)}
                          title="Activer"
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
