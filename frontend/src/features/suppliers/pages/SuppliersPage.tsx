import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search, Filter, MapPin, Star, ChevronRight, Phone } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { Supplier, SupplierCategory } from '../types';

// Fix icônes Leaflet avec Vite — utilise les URLs CDN plutôt que les imports locaux
function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Données de démo — région Abidjan
const demoSuppliers: Supplier[] = [
  { id: '1', name: 'AgriFourniture CI',  category: 'Semences, Engrais',       distance: 2.5, rating: 4.5, reviews_count: 28, address: 'Plateau, Abidjan', lat: 5.3545,  lng: -4.0086, phone: '+225 07 12 34 56' },
  { id: '2', name: 'Green Agro',         category: 'Équipements agricoles',    distance: 3.8, rating: 4.2, reviews_count: 15, address: 'Cocody, Abidjan',  lat: 5.3637,  lng: -3.9789, phone: '+225 05 98 76 54' },
  { id: '3', name: 'VetCare',            category: 'Produits vétérinaires',    distance: 5.2, rating: 4.7, reviews_count: 42, address: 'Marcory, Abidjan', lat: 5.3073,  lng: -4.0050, phone: '+225 01 23 45 67' },
  { id: '4', name: 'BioSolutions',       category: 'Bio-pesticides, Engrais',  distance: 6.1, rating: 4.3, reviews_count: 19, address: 'Yopougon',         lat: 5.3478,  lng: -4.0739, phone: '+225 07 65 43 21' },
];

const categories: SupplierCategory[] = ['Tous', 'Semences', 'Engrais', 'Équipements', 'Produits vétérinaires'];

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
      <span className="text-xs font-semibold text-[#1a2e1d]">{value.toFixed(1)}</span>
    </span>
  );
}

export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<SupplierCategory>('Tous');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => { fixLeafletIcons(); }, []);

  const filtered = demoSuppliers.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Tous' || s.category.includes(activeCategory);
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1d]">Carte des Fournisseurs</h1>
        <p className="text-sm text-[#6b7c6e] mt-1">Trouvez des fournisseurs agricoles près de chez vous.</p>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-72">
          <Input
            placeholder="Rechercher un fournisseur…"
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#e2e8e4] bg-white px-4 py-2.5 text-sm font-medium text-[#6b7c6e] hover:bg-[#f0f4f0] transition-colors">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                activeCategory === cat
                  ? 'bg-[#1a5c2a] text-white'
                  : 'bg-white border border-[#e2e8e4] text-[#6b7c6e] hover:border-[#1a5c2a] hover:text-[#1a5c2a]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Carte + Liste */}
      <div className="grid lg:grid-cols-3 gap-5 h-[520px]">
        {/* Carte Leaflet */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#e2e8e4] shadow-sm">
          <MapContainer center={[5.34, -4.03]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((supplier) => (
              <Marker
                key={supplier.id}
                position={[supplier.lat, supplier.lng]}
                eventHandlers={{ click: () => setSelectedSupplier(supplier) }}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">{supplier.name}</p>
                    <p className="text-gray-500">{supplier.category}</p>
                    <p className="text-gray-500">{supplier.distance} km</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Liste fournisseurs */}
        <Card padding="none" className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 divide-y divide-[#e2e8e4]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MapPin className="w-8 h-8 text-[#9aab9e] mb-3" />
                <p className="text-sm font-medium text-[#1a2e1d]">Aucun fournisseur trouvé</p>
                <p className="text-xs text-[#6b7c6e] mt-1">Modifiez vos critères de recherche</p>
              </div>
            ) : (
              filtered.map((supplier) => (
                <button
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 p-4 hover:bg-[#f7f9f7] transition-colors',
                    selectedSupplier?.id === supplier.id && 'bg-[#e8f5e9]'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5e9] shrink-0">
                    <MapPin className="w-5 h-5 text-[#1a5c2a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a2e1d] truncate">{supplier.name}</p>
                    <p className="text-xs text-[#6b7c6e] truncate">{supplier.category}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#6b7c6e]">{supplier.distance} km</span>
                      <StarRating value={supplier.rating} />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9aab9e] shrink-0" />
                </button>
              ))
            )}
          </div>

          {selectedSupplier && (
            <div className="border-t border-[#e2e8e4] p-4 bg-[#f7f9f7] shrink-0">
              <p className="text-sm font-bold text-[#1a2e1d]">{selectedSupplier.name}</p>
              <p className="text-xs text-[#6b7c6e] mt-0.5">{selectedSupplier.category}</p>
              <div className="flex items-center gap-2 text-xs text-[#6b7c6e] mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {selectedSupplier.address} · {selectedSupplier.distance} km
              </div>
              {selectedSupplier.phone && (
                <a href={`tel:${selectedSupplier.phone}`} className="mt-1.5 flex items-center gap-2 text-xs text-[#1a5c2a] font-medium hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  {selectedSupplier.phone}
                </a>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
