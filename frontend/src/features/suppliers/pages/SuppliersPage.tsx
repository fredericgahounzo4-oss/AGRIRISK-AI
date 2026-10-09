import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import {
  Search, MapPin, ChevronRight, Phone, LocateFixed, Loader2, Package, ShoppingBag,
  MessageSquare, Navigation, Store, Star, X,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';
import { ContactSupplierModal } from '@/features/messages/components/ContactSupplierModal';
import { useSuppliers } from '../hooks/useSuppliers';
import type { Supplier } from '../types';

const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_CENTER: [number, number] = [6.1319, 1.2228]; // Lomé
const RADIUS_OPTIONS = [0, 10, 25, 50, 100]; // 0 = pas de limite
const GEO_STORAGE_KEY = 'agririsk_user_position';

type SortKey = 'distance' | 'products' | 'sales';

interface Position { lat: number; lng: number }

/** Marqueur en pur CSS : pas de dépendance aux images Leaflet (cassées avec Vite). */
function pinIcon(active: boolean) {
  return L.divIcon({
    className: '',
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -32],
    html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${active ? '#f59e0b' : '#1a5c2a'};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><div style="width:9px;height:9px;border-radius:50%;background:#fff"></div></div>`,
  });
}

/** Adapte la vue de la carte : sur le fournisseur choisi, sinon sur l'ensemble des résultats. */
function MapController({ suppliers, selected, position }: {
  suppliers: Supplier[]; selected: Supplier | null; position: Position | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
      return;
    }
    const points: [number, number][] = suppliers.map((s) => [s.lat, s.lng]);
    if (position) points.push([position.lat, position.lng]);
    if (points.length === 1) map.setView(points[0], 13);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
  }, [map, suppliers, selected, position]);

  return null;
}

function readStoredPosition(): Position | null {
  try {
    const raw = localStorage.getItem(GEO_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return typeof p.lat === 'number' && typeof p.lng === 'number' ? p : null;
  } catch {
    return null;
  }
}

export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [radius, setRadius] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>('distance');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(readStoredPosition);
  const [locating, setLocating] = useState(false);
  const [contactFor, setContactFor] = useState<Supplier | null>(null);

  // Toute la liste (sans filtre de catégorie côté serveur) : les filtres sont instantanés
  // et les catégories proposées viennent des fournisseurs réellement inscrits.
  const { data: suppliers = [], isLoading, isError, isFetching, dataUpdatedAt } = useSuppliers(
    position ? { lat: position.lat, lng: position.lng } : undefined
  );

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(suppliers.map((s) => s.category).filter(Boolean))).sort()],
    [suppliers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = suppliers.filter((s) => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
        || s.address.toLowerCase().includes(q);
      const matchCat = activeCategory === 'Tous' || s.category === activeCategory;
      const matchRadius = radius === 0 || !s.has_distance || s.distance <= radius;
      return matchSearch && matchCat && matchRadius;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'products') return b.products_count - a.products_count;
      if (sortBy === 'sales') return b.orders_done - a.orders_done;
      return a.distance - b.distance;
    });
  }, [suppliers, search, activeCategory, radius, sortBy]);

  const selected = filtered.find((s) => s.id === selectedId) ?? null;
  const hasDistance = suppliers.some((s) => s.has_distance);

  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      toast.error("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(p);
        setSelectedId(null);
        try { localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(p)); } catch { /* stockage indisponible */ }
        setLocating(false);
        toast.success('Distances calculées depuis votre position.');
      },
      () => {
        setLocating(false);
        toast.error("Position introuvable. Autorisez la localisation dans votre navigateur.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const clearPosition = () => {
    setPosition(null);
    try { localStorage.removeItem(GEO_STORAGE_KEY); } catch { /* ignore */ }
  };

  const directionsUrl = (s: Supplier) =>
    `https://www.openstreetmap.org/directions?from=${position ? `${position.lat}%2C${position.lng}` : ''}&to=${s.lat}%2C${s.lng}`;

  const distanceLabel = (s: Supplier) => (s.has_distance ? `${s.distance} km` : '—');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1d]">Carte des Fournisseurs</h1>
          <p className="text-sm text-[#6b7c6e] mt-1">
            {isLoading ? 'Chargement…' : `${filtered.length} fournisseur${filtered.length > 1 ? 's' : ''} près de chez vous`}
            {dataUpdatedAt > 0 && (
              <span className="text-[#9aab9e]">
                {' · '}mis à jour à {new Date(dataUpdatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {isFetching && <Loader2 className="inline w-3 h-3 ml-1 animate-spin" />}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={position ? 'secondary' : 'primary'} size="sm" onClick={locateMe} loading={locating}
            leftIcon={<LocateFixed className="w-4 h-4" />}>
            {position ? 'Actualiser ma position' : 'Autour de moi'}
          </Button>
          {position && (
            <button onClick={clearPosition} className="p-2 rounded-lg text-[#6b7c6e] hover:bg-gray-100" aria-label="Oublier ma position" title="Oublier ma position">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Nom, catégorie ou ville…"
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          disabled={!hasDistance}
          className="rounded-xl border border-[#e2e8e4] bg-white px-3 py-2.5 text-sm text-[#1a2e1d] disabled:opacity-50"
          aria-label="Rayon de recherche"
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} value={r}>{r === 0 ? 'Toutes distances' : `Dans ${r} km`}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-xl border border-[#e2e8e4] bg-white px-3 py-2.5 text-sm text-[#1a2e1d]"
          aria-label="Trier par"
        >
          <option value="distance">Plus proches</option>
          <option value="products">Plus de produits</option>
          <option value="sales">Plus de ventes</option>
        </select>
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

      {isLoading ? (
        <Loader text="Chargement des fournisseurs…" />
      ) : isError ? (
        <Card className="text-center py-12 text-sm text-red-600">
          Impossible de charger les fournisseurs. Vérifiez que le serveur est bien lancé.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:h-[600px]">
          {/* Carte */}
          <div className="lg:col-span-2 h-[340px] lg:h-auto rounded-2xl overflow-hidden border border-[#e2e8e4] shadow-sm relative z-0">
            <MapContainer center={DEFAULT_CENTER} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url={TILE_URL}
              />
              <MapController suppliers={filtered} selected={selected} position={position} />
              {position && (
                <CircleMarker center={[position.lat, position.lng]} radius={9}
                  pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}>
                  <Popup>Vous êtes ici</Popup>
                </CircleMarker>
              )}
              {filtered.map((s) => (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lng]}
                  icon={pinIcon(s.id === selectedId)}
                  eventHandlers={{ click: () => setSelectedId(s.id) }}
                >
                  <Popup>
                    <div className="text-sm space-y-0.5">
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-gray-500">{s.category}</p>
                      <p className="text-gray-500">{s.products_count} produit{s.products_count > 1 ? 's' : ''} en vente</p>
                      {s.has_distance && <p className="text-gray-500">{s.distance} km</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {!position && (
              <button
                onClick={locateMe}
                className="absolute bottom-3 left-3 z-[500] flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-[#1a5c2a] shadow border border-[#e2e8e4] hover:bg-white"
              >
                <LocateFixed className="w-4 h-4" /> Calculer les distances depuis ma position
              </button>
            )}
          </div>

          {/* Liste + fiche */}
          <Card padding="none" className="flex flex-col h-[460px] lg:h-auto overflow-hidden">
            <div className={cn('overflow-y-auto divide-y divide-[#e2e8e4]', selected ? 'flex-[0_0_42%]' : 'flex-1')}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <MapPin className="w-8 h-8 text-[#9aab9e] mb-3" />
                  <p className="text-sm font-medium text-[#1a2e1d]">
                    {suppliers.length === 0 ? "Aucun fournisseur n'est encore inscrit" : 'Aucun fournisseur trouvé'}
                  </p>
                  <p className="text-xs text-[#6b7c6e] mt-1">
                    {suppliers.length === 0 ? 'Revenez bientôt.' : 'Modifiez vos critères ou élargissez le rayon.'}
                  </p>
                </div>
              ) : (
                filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={cn(
                      'w-full text-left flex items-center gap-3 p-4 hover:bg-[#f7f9f7] transition-colors',
                      selectedId === s.id && 'bg-[#e8f5e9]'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5e9] shrink-0">
                      <Store className="w-5 h-5 text-[#1a5c2a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a2e1d] truncate">{s.name}</p>
                      <p className="text-xs text-[#6b7c6e] truncate">{s.category}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#6b7c6e]">
                        <span>{distanceLabel(s)}</span>
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" />{s.products_count}</span>
                        {s.reviews_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />{s.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9aab9e] shrink-0" />
                  </button>
                ))
              )}
            </div>

            {selected && (
              <div className="border-t border-[#e2e8e4] p-4 bg-[#f7f9f7] flex-1 overflow-y-auto space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1a2e1d]">{selected.name}</p>
                    <p className="text-xs text-[#6b7c6e] mt-0.5">{selected.category}</p>
                  </div>
                  <button onClick={() => setSelectedId(null)} className="p-1 rounded hover:bg-gray-200" aria-label="Fermer la fiche">
                    <X className="w-4 h-4 text-[#6b7c6e]" />
                  </button>
                </div>

                {selected.description && (
                  <p className="text-xs text-[#4a5d4e] leading-relaxed line-clamp-3">{selected.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white border border-[#e2e8e4] p-2">
                    <p className="flex items-center gap-1 text-[#6b7c6e]"><Package className="w-3.5 h-3.5" /> En vente</p>
                    <p className="font-semibold text-[#1a2e1d] mt-0.5">{selected.products_count} produit{selected.products_count > 1 ? 's' : ''}</p>
                  </div>
                  <div className="rounded-lg bg-white border border-[#e2e8e4] p-2">
                    <p className="flex items-center gap-1 text-[#6b7c6e]"><ShoppingBag className="w-3.5 h-3.5" /> Livrées</p>
                    <p className="font-semibold text-[#1a2e1d] mt-0.5">{selected.orders_done} commande{selected.orders_done > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="text-xs text-[#6b7c6e] space-y-1">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      {selected.address || 'Adresse non renseignée'}
                      {selected.has_distance && ` · ${selected.distance} km`}
                      {!selected.location_precise && <em className="block text-[#9aab9e]">Position approximative (ville)</em>}
                    </span>
                  </p>
                  <p>Membre depuis le {formatDate(selected.member_since)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => setContactFor(selected)} leftIcon={<MessageSquare className="w-4 h-4" />}>
                    Message
                  </Button>
                  <Link to={`/app/boutique?fournisseur=${selected.id}`} className="contents">
                    <Button size="sm" variant="outline" leftIcon={<Store className="w-4 h-4" />}>Produits</Button>
                  </Link>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="contents">
                      <Button size="sm" variant="ghost" leftIcon={<Phone className="w-4 h-4" />}>Appeler</Button>
                    </a>
                  )}
                  <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="contents">
                    <Button size="sm" variant="ghost" leftIcon={<Navigation className="w-4 h-4" />}>Itinéraire</Button>
                  </a>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {contactFor && (
        <ContactSupplierModal
          supplierId={contactFor.id}
          supplierName={contactFor.name}
          onClose={() => setContactFor(null)}
        />
      )}
    </div>
  );
}
