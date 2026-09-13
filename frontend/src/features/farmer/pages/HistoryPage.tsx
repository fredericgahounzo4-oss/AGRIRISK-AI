import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Calendar, Microscope } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { useDiagnosticHistory } from '@/features/diagnostic/hooks/useDiagnostic';

export function HistoryPage() {
  const { data: diagnostics = [], isLoading, isError } = useDiagnosticHistory();
  const [search, setSearch] = useState('');

  const filtered = diagnostics.filter((d) =>
    d.disease_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des diagnostics</h1>
          <p className="text-gray-600 mt-1">Retrouvez toutes vos analyses passées</p>
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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <Loader text="Chargement de l'historique…" />
        ) : isError ? (
          <p className="text-sm text-red-600 text-center py-12">
            Impossible de charger l'historique. Vérifiez que le serveur est bien lancé.
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
            <Microscope className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm">
              {diagnostics.length === 0
                ? "Aucun diagnostic pour l'instant. Lancez votre première analyse !"
                : 'Aucun résultat pour cette recherche.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">Image</th>
                  <th className="px-6 py-4 font-semibold">Maladie diagnostiquée</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Niveau de risque</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((diag) => (
                  <tr key={diag.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100">
                        <img src={diag.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{diag.disease_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(diag.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                        ${diag.risk_level === 'Critique' || diag.risk_level === 'Élevé' ? 'bg-red-50 text-red-700' :
                          diag.risk_level === 'Moyen' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}
                      >
                        {diag.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/app/diagnostic/resultat/${diag.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-[#1a5c2a] hover:text-white transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
