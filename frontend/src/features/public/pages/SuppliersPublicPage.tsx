import { MOCK_SUPPLIERS } from '@/services/mockData';
import { MapPin, Star, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

export function SuppliersPublicPage() {
  const [search, setSearch] = useState('');
  
  const filtered = MOCK_SUPPLIERS.filter(s => 
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
        <div className="max-w-3xl mx-auto mb-12 flex gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Rechercher par nom, catégorie..." 
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
            <Filter className="w-4 h-4" /> Filtres
          </button>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(supplier => (
            <Card key={supplier.id} padding="md" className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9]">
                  <span className="text-xl">🏪</span>
                </div>
                {supplier.verified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    <ShieldCheckIcon className="w-3.5 h-3.5" /> Vérifié
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{supplier.category}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {supplier.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-gray-900">{supplier.rating}</span>
                  <span>({supplier.reviews_count} avis)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-center text-gray-500 mb-2">Connectez-vous pour voir les produits et le contact</p>
                <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Voir le profil
                </button>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
