import { useAuthStore } from '@/features/auth/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import { Package, ClipboardList, TrendingUp, Users, Eye } from 'lucide-react';
import { useProducts, useRequests } from '../hooks/useMarketplace';
import { useMemo } from 'react';

export function SupplierDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: requests = [], isLoading: requestsLoading } = useRequests();

  const isLoading = productsLoading || requestsLoading;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const lowStockProducts = products.filter(p => p.stock < 50);

  const uniqueClients = useMemo(
    () => new Set(requests.map((r) => r.farmer_name)).size,
    [requests]
  );

  const monthlySales = useMemo(() => {
    const now = new Date();
    return requests
      .filter((r) => {
        if (r.status !== 'accepted') return false;
        const d = new Date(r.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => {
        const product = products.find((p) => p.name === r.product);
        return sum + (product ? product.price * r.quantity : 0);
      }, 0);
  }, [requests, products]);

  const stats = [
    { label: 'Total Produits', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600', trend: 'Sur votre catalogue' },
    { label: 'Demandes en attente', value: pendingRequests.length, icon: ClipboardList, color: 'bg-amber-50 text-amber-600', trend: 'À traiter' },
    { label: 'Ventes du mois', value: `${monthlySales.toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, color: 'bg-green-50 text-green-600', trend: 'Demandes acceptées ce mois' },
    { label: 'Clients uniques', value: uniqueClients, icon: Users, color: 'bg-purple-50 text-purple-600', trend: 'Ayant fait une demande' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.company ?? user?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Voici le résumé de votre activité.</p>
        </div>
        <Button onClick={() => navigate('/fournisseur/produits')}>
          Ajouter un produit
        </Button>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center"><Loader /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, trend }) => (
              <Card key={label} padding="md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{trend}</p>
                  </div>
                  <div className={`p-2 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Demandes récentes */}
            <Card padding="none">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Demandes récentes</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/fournisseur/demandes')}>
                  Voir tout
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {requests.slice(0, 4).map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {req.farmer_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{req.farmer_name}</p>
                        <p className="text-xs text-gray-500">{req.quantity}x {req.product}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        req.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {req.status === 'pending' ? 'En attente' : req.status === 'accepted' ? 'Accepté' : 'Refusé'}
                      </span>
                      <button
                        onClick={() => navigate('/fournisseur/demandes')}
                        className="p-1 text-gray-400 hover:text-gray-900"
                        title="Voir la demande"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Aucune demande reçue pour l'instant.
                  </div>
                )}
              </div>
            </Card>

            {/* Alertes Stock */}
            <Card padding="none">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Alertes Stock</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/fournisseur/produits')}>
                  Gérer
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {lowStockProducts.map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">📦</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{prod.name}</p>
                        <p className="text-xs text-gray-500">SKU: {prod.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${prod.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {prod.stock} restants
                      </p>
                      <p className="text-xs text-gray-500">{prod.status}</p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Tous vos produits sont en stock suffisant.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
