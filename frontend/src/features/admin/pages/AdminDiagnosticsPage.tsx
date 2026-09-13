import { MOCK_DIAGNOSTICS } from '@/services/mockData';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, Eye, X, Calendar, Percent } from 'lucide-react';
import { useState } from 'react';

export function AdminDiagnosticsPage() {
  const [search, setSearch] = useState('');
  const [detailsDiag, setDetailsDiag] = useState<typeof MOCK_DIAGNOSTICS[number] | null>(null);

  const filtered = MOCK_DIAGNOSTICS.filter(d => 
    d.disease_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diagnostics IA Globaux</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisez l'utilisation du modèle de diagnostic</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input 
            placeholder="Rechercher une maladie..." 
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Image</th>
                <th className="px-6 py-4 font-semibold">Maladie Détectée</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Confiance</th>
                <th className="px-6 py-4 font-semibold">Risque</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(diag => (
                <tr key={diag.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                      <img src={diag.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{diag.disease_name}</p>
                    <p className="text-xs text-gray-500">{diag.type}</p>
                  </td>
                  <td className="px-6 py-4">{new Date(diag.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{diag.confidence}%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${diag.confidence}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      diag.risk_level === 'Critique' || diag.risk_level === 'Élevé' ? 'bg-red-50 text-red-700 border border-red-200' :
                      diag.risk_level === 'Moyen' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {diag.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDetailsDiag(diag)}
                      title="Voir le détail"
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">Aucun diagnostic trouvé.</div>
        )}
      </Card>

      {/* Modal détail diagnostic */}
      {detailsDiag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Détail du diagnostic</h2>
              <button onClick={() => setDetailsDiag(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={detailsDiag.image_url} alt="" className="w-full h-48 object-cover" />
            <div className="p-6 space-y-4">
              <div>
                <p className="font-bold text-lg text-gray-900">{detailsDiag.disease_name}</p>
                <p className="text-sm text-gray-500">{detailsDiag.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  detailsDiag.risk_level === 'Critique' || detailsDiag.risk_level === 'Élevé' ? 'bg-red-50 text-red-700 border border-red-200' :
                  detailsDiag.risk_level === 'Moyen' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {detailsDiag.risk_level}
                </span>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(detailsDiag.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-400" />
                  Confiance du modèle : <span className="font-semibold">{detailsDiag.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
