import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Search, Filter, CheckCircle2, XCircle, Clock, X, Phone, MapPin, Package, ChevronDown } from 'lucide-react';
import { useRequests, useAcceptRequest, useRejectRequest } from '../hooks/useMarketplace';
import type { ProductRequest } from '../types';

const statusLabel: Record<ProductRequest['status'], string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  rejected: 'Refusé',
  completed: 'Terminé',
};

const statusStyle: Record<ProductRequest['status'], string> = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
};

type StatusFilter = 'all' | ProductRequest['status'];

export function RequestsPage() {
  const { data: requests = [], isLoading, isError } = useRequests();
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState<ProductRequest | null>(null);

  const filtered = requests.filter(
    (r) =>
      (statusFilter === 'all' || r.status === statusFilter) &&
      (r.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
        r.product.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de devis / commandes</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les requêtes des agriculteurs</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un client, un produit..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'all' ? 'Tous les statuts' : statusLabel[statusFilter]}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
              <button
                onClick={() => { setStatusFilter('all'); setFilterOpen(false); }}
                className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Tous les statuts
              </button>
              {(Object.keys(statusLabel) as ProductRequest['status'][]).map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setFilterOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {statusLabel[status]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <Loader text="Chargement des demandes…" />
      ) : isError ? (
        <p className="text-sm text-red-600 text-center py-12">
          Impossible de charger les demandes. Vérifiez que le serveur est bien lancé.
        </p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((req) => (
            <Card
              key={req.id}
              padding="md"
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#1a5c2a]/10 flex items-center justify-center text-[#1a5c2a] font-bold text-lg">
                  {req.farmer_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{req.farmer_name}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Demande :{' '}
                    <span className="font-medium text-gray-900">
                      {req.quantity}x {req.product}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {new Date(req.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span>•</span>
                    <span>{req.region}</span>
                    <span>•</span>
                    <span>{req.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-0 pt-4 md:pt-0 border-gray-100">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[req.status]}`}>
                  {statusLabel[req.status]}
                </span>

                {req.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest.mutate(req.id)}
                      disabled={acceptRequest.isPending || rejectRequest.isPending}
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => rejectRequest.mutate(req.id)}
                      disabled={acceptRequest.isPending || rejectRequest.isPending}
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDetailsRequest(req)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Voir détails
                  </button>
                )}
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {requests.length === 0 ? "Aucune demande pour l'instant." : 'Aucune demande trouvée.'}
            </div>
          )}
        </div>
      )}

      {/* Modal détails */}
      {detailsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Détails de la demande</h2>
              <button onClick={() => setDetailsRequest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#1a5c2a]/10 flex items-center justify-center text-[#1a5c2a] font-bold text-lg">
                  {detailsRequest.farmer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{detailsRequest.farmer_name}</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle[detailsRequest.status]}`}>
                    {statusLabel[detailsRequest.status]}
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  {detailsRequest.quantity}x {detailsRequest.product}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {new Date(detailsRequest.date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </div>
                {detailsRequest.region && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {detailsRequest.region}
                  </div>
                )}
                {detailsRequest.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {detailsRequest.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
