import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Search, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAdminLogs } from '../hooks/useAdmin';

export function LogsPage() {
  const [search, setSearch] = useState('');
  const { data: logs = [], isLoading, isError } = useAdminLogs();

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journaux système (Logs)</h1>
          <p className="text-sm text-gray-500 mt-1">Trace d'audit et événements de sécurité</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher une action, un utilisateur..."
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
          <div className="p-8 text-center text-red-600">Impossible de charger les journaux.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">Niveau</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Utilisateur</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Date & Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {log.severity === 'danger' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {log.severity === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                        {log.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        <span className={`uppercase font-bold ${
                          log.severity === 'danger' ? 'text-red-600' :
                          log.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                        }`}>{log.severity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{log.action}</td>
                    <td className="px-6 py-4">{log.user}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{log.type}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-500">Aucun log trouvé.</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
