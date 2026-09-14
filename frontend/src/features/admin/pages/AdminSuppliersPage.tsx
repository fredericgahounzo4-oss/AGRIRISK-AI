import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Search, Building2, CheckCircle2, XCircle, X, Mail, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useAdminSuppliers, useValidateSupplier, useRejectSupplier } from '../hooks/useAdmin';
import type { AdminUser } from '../types';

export function AdminSuppliersPage() {
  const [search, setSearch] = useState('');
  const { data: suppliers = [], isLoading, isError } = useAdminSuppliers();
  const validateSupplier = useValidateSupplier();
  const rejectSupplier = useRejectSupplier();
  const [detailsSupplier, setDetailsSupplier] = useState<AdminUser | null>(null);

  const filtered = suppliers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-sm text-gray-500 mt-1">Validez et gérez les fournisseurs de la plateforme</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un fournisseur..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center"><Loader /></div>
      ) : isError ? (
        <div className="p-8 text-center text-red-600">Impossible de charger les fournisseurs.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(supplier => (
            <Card key={supplier.id} padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{supplier.email}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{supplier.region || '—'}</span>
                    <span>Inscrit le {new Date(supplier.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-0 pt-4 md:pt-0 border-gray-100">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  supplier.status === 'active' ? 'bg-green-50 text-green-700' :
                  supplier.status === 'suspended' || supplier.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {supplier.status === 'active' ? 'Vérifié' : supplier.status === 'suspended' ? 'Suspendu' : supplier.status === 'rejected' ? 'Refusé' : 'En attente de validation'}
                </span>

                {supplier.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => validateSupplier.mutate(supplier.id)}
                      disabled={validateSupplier.isPending || rejectSupplier.isPending}
                      title="Valider le fournisseur"
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => rejectSupplier.mutate(supplier.id)}
                      disabled={validateSupplier.isPending || rejectSupplier.isPending}
                      title="Refuser"
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDetailsSupplier(supplier)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Voir le dossier
                  </button>
                )}
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">Aucun fournisseur trouvé.</div>
          )}
        </div>
      )}

      {/* Modal dossier fournisseur */}
      {detailsSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Dossier fournisseur</h2>
              <button onClick={() => setDetailsSupplier(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{detailsSupplier.name}</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    detailsSupplier.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {detailsSupplier.status === 'active' ? 'Vérifié' : detailsSupplier.status === 'suspended' ? 'Suspendu' : 'Refusé'}
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {detailsSupplier.email}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {detailsSupplier.region || '—'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Inscrit le {new Date(detailsSupplier.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
