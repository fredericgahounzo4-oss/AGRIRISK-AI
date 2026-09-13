import React, { useState } from 'react';
import { Phone, MapPin, Package, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { Supplier } from '../types';
import { useApp } from '../contexts/AppContext';

const CATEGORY_LABELS: Record<string, string> = {
  agricultural: '🌿 Produits agricoles',
  veterinary: '💊 Produits vétérinaires',
  seeds: '🌱 Semences',
  fertilizer: '⚗️ Engrais',
  feed: '🌾 Aliments animaux',
};

const PACK_COLORS: Record<string, string> = {
  bronze: 'pack-bronze',
  silver: 'pack-silver',
  gold: 'pack-gold',
};

interface SupplierCardProps {
  supplier: Supplier;
  mini?: boolean;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, mini = false }) => {
  const { t } = useApp();
  const [showProducts, setShowProducts] = useState(false);

  if (mini) {
    return (
      <div className="supplier-card mini">
        <div className="supplier-card-top">
          <div className="supplier-info">
            <h4>{supplier.companyName}</h4>
            <span className="supplier-category">{CATEGORY_LABELS[supplier.category]}</span>
            <div className="supplier-meta">
              <MapPin size={13} /> {supplier.region}
            </div>
          </div>
          <span className={`pack-badge ${PACK_COLORS[supplier.pack]}`}>{supplier.pack}</span>
        </div>
        <a href={`tel:${supplier.phone}`} className="contact-btn mini">
          <Phone size={14} /> {supplier.phone}
        </a>
      </div>
    );
  }

  return (
    <div className={`supplier-card ${supplier.pack === 'gold' ? 'gold-border' : ''}`}>
      <div className="supplier-card-top">
        <div className="supplier-info">
          <div className="supplier-name-row">
            <h3>{supplier.companyName}</h3>
            {supplier.pack === 'gold' && <Star size={16} className="gold-star" fill="currentColor" />}
          </div>
          <span className="supplier-category">{CATEGORY_LABELS[supplier.category]}</span>
          <p className="supplier-manager">👤 {supplier.manager}</p>
        </div>
        <span className={`pack-badge ${PACK_COLORS[supplier.pack]}`}>
          {supplier.pack.charAt(0).toUpperCase() + supplier.pack.slice(1)}
        </span>
      </div>

      <div className="supplier-details">
        <div className="detail-row">
          <Phone size={14} />
          <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>
        </div>
        <div className="detail-row">
          <MapPin size={14} />
          <span>{supplier.address} — {supplier.region}</span>
        </div>
        <div className="detail-row">
          <Package size={14} />
          <span>{supplier.products.length} produit{supplier.products.length > 1 ? 's' : ''} disponible{supplier.products.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="supplier-actions">
        <a href={`tel:${supplier.phone}`} className="contact-btn">
          <Phone size={16} /> {t('contact')}
        </a>
        <button className="products-btn" onClick={() => setShowProducts(!showProducts)}>
          {showProducts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {t('viewProducts')}
        </button>
      </div>

      {showProducts && (
        <div className="products-list">
          {supplier.products.map(product => (
            <div key={product.id} className={`product-item ${!product.available ? 'unavailable' : ''}`}>
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="product-desc">{product.description}</span>
              </div>
              <div className="product-right">
                <span className="product-price">{product.price.toLocaleString('fr-FR')} FCFA</span>
                <span className={`product-status ${product.available ? 'avail' : 'unavail'}`}>
                  {product.available ? t('available') : t('unavailable')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierCard;
