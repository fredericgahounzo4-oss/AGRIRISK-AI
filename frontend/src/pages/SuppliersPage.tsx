import React, { useState } from 'react';
import { Search, Store, Plus, Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { mockSuppliers } from '../data/mockData';
import SupplierCard from '../components/SupplierCard';
import { Link } from 'react-router-dom';

const CATEGORIES = ['all', 'agricultural', 'veterinary', 'seeds', 'fertilizer', 'feed'];
const REGIONS = ['', 'Lomé', 'Kara', 'Sokodé', 'Atakpamé', 'Kpalimé', 'Dapaong'];

const SuppliersPage: React.FC = () => {
  const { t } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('');

  const approved = mockSuppliers.filter(s => s.status === 'approved');

  const filtered = approved.filter(s => {
    const matchSearch = !search ||
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.manager.toLowerCase().includes(search.toLowerCase()) ||
      s.products.some(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'all' || s.category === category;
    const matchReg = !region || s.region === region;
    return matchSearch && matchCat && matchReg;
  });

  // Sort gold first
  const sorted = [...filtered].sort((a, b) => {
    const order = { gold: 0, silver: 1, bronze: 2 };
    return order[a.pack] - order[b.pack];
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon earth"><Store size={28} /></div>
        <div>
          <h1>{t('suppliers')}</h1>
          <p>Trouvez des fournisseurs certifiés de produits agricoles et vétérinaires près de chez vous</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            className="search-input"
            placeholder={t('searchSuppliers')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="all">{t('allCategories')}</option>
            {CATEGORIES.slice(1).map(c => (
              <option key={c} value={c}>{t(c)}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select className="filter-select" value={region} onChange={e => setRegion(e.target.value)}>
            <option value="">{t('filterByRegion')}</option>
            {REGIONS.slice(1).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="category-pills">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`category-pill ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c === 'all' ? t('allCategories') : t(c)}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="results-count">
        <span>{sorted.length} fournisseur{sorted.length > 1 ? 's' : ''} trouvé{sorted.length > 1 ? 's' : ''}</span>
        <Link to="/supplier-register" className="become-supplier-btn">
          <Plus size={16} /> {t('becomeSupplier')}
        </Link>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <Store size={64} />
          <p>Aucun fournisseur trouvé pour ces critères</p>
          <button className="btn-primary" onClick={() => { setSearch(''); setCategory('all'); setRegion(''); }}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="suppliers-grid">
          {sorted.map(s => <SupplierCard key={s.id} supplier={s} />)}
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
