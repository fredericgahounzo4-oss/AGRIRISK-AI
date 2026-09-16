import { MapPin, Star, Search, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';

export function SuppliersPublicPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: suppliers = [], isLoading, isError } = useSuppliers();

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Annuaire des fournisseurs agricoles</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Trouvez les meilleurs fournisseurs d'intrants, de semences et d'équipements agricoles certifiés par notre plateforme.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <Input 
            placeholder="Rechercher par nom, catégorie..." 
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="p-10 flex justify-center"><Loader /></div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">Impossible de charger l'annuaire pour l'instant.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {suppliers.length === 0 ? "Aucun fournisseur n'est encore inscrit sur la plateforme." : "Aucun résultat pour cette recherche."}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(supplier => (
              <Card key={supplier.id} padding="md" className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9]">
                    <span className="text-xl">🏪</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Vérifié
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{supplier.category}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {supplier.address}
                  </div>
                  {supplier.reviews_count > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-gray-900">{supplier.rating}</span>
                      <span>({supplier.reviews_count} avis)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Star className="w-4 h-4" />
                      Pas encore d'avis
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-center text-gray-500 mb-2">Connectez-vous pour voir les produits et le contact</p>
                  <button
                    onClick={() => navigate('/connexion')}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Voir le profil
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
