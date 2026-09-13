import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Heart, MessageSquare, Store, ChevronRight, TrendingUp, Users, Zap, Shield } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const HomePage: React.FC = () => {
  const { t } = useApp();

  const modules = [
    {
      icon: <Microscope size={32} />,
      title: t('module1Title'),
      desc: t('module1Desc'),
      path: '/crop-diagnosis',
      color: 'module-green',
      badge: 'Maïs · Tomate · Manioc · Soja · Piment',
    },
    {
      icon: <Heart size={32} />,
      title: t('module2Title'),
      desc: t('module2Desc'),
      path: '/animal-diagnosis',
      color: 'module-orange',
      badge: 'Poulets · Chèvres · Bovins · Porcs',
    },
    {
      icon: <MessageSquare size={32} />,
      title: t('module3Title'),
      desc: t('module3Desc'),
      path: '/assistant',
      color: 'module-teal',
      badge: 'Français · Éwé · Kabyè · English',
    },
    {
      icon: <Store size={32} />,
      title: t('module4Title'),
      desc: t('module4Desc'),
      path: '/suppliers',
      color: 'module-earth',
      badge: 'Semences · Engrais · Médicaments',
    },
  ];

  const stats = [
    { value: '5 000+', label: 'Agriculteurs accompagnés', icon: <Users size={20} /> },
    { value: '94%', label: 'Précision diagnostic', icon: <Zap size={20} /> },
    { value: '87', label: 'Fournisseurs certifiés', icon: <Shield size={20} /> },
    { value: '30%', label: 'Pertes réduites', icon: <TrendingUp size={20} /> },
  ];

  const pricing = [
    {
      name: t('free'),
      price: '0',
      features: ['Diagnostics limités (5/mois)', 'Conseils IA basiques', 'Recherche fournisseurs'],
      color: 'pricing-free',
      cta: t('register'),
      popular: false,
    },
    {
      name: t('bronze'),
      price: '5 000',
      features: ["Présence dans l'annuaire", 'Profil entreprise', 'Jusqu\'à 10 produits'],
      color: 'pricing-bronze',
      cta: t('chooseOffer'),
      popular: false,
    },
    {
      name: t('silver'),
      price: '10 000',
      features: ['Mise en avant', 'Statistiques de visibilité', 'Produits illimités', 'Support prioritaire'],
      color: 'pricing-silver',
      cta: t('chooseOffer'),
      popular: true,
    },
    {
      name: t('gold'),
      price: '20 000',
      features: ['Priorité dans les résultats', 'Badge partenaire', 'Publicité sponsorisée', 'Tableau de bord analytics'],
      color: 'pricing-gold',
      cta: t('chooseOffer'),
      popular: false,
    },
  ];

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-content">
          <div className="hero-badge">🌱 Plateforme IA Agricole · Togo</div>
          <h1 className="hero-title">{t('heroTitle')}</h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>
          <div className="hero-actions">
            <Link to="/crop-diagnosis" className="btn-primary">
              {t('startDiagnosis')} <ChevronRight size={18} />
            </Link>
            <Link to="/assistant" className="btn-secondary">
              {t('aiAssistant')}
            </Link>
          </div>
          <div className="hero-crops">
            {['🌽', '🍅', '🌿', '🫘', '🌶️'].map((emoji, i) => (
              <span key={i} className="crop-emoji" style={{ animationDelay: `${i * 0.2}s` }}>{emoji}</span>
            ))}
          </div>
        </div>

        {/* Floating AI diagnosis card */}
        <div className="hero-card">
          <div className="hero-card-header">
            <div className="hero-card-dot green" />
            <span>Diagnostic IA en cours...</span>
          </div>
          <div className="hero-card-img">
            <div className="scan-line" />
            <div className="crop-placeholder">🌽</div>
          </div>
          <div className="hero-card-result">
            <div className="result-row">
              <span className="result-label">Maladie détectée</span>
              <span className="result-value">Rouille commune</span>
            </div>
            <div className="result-row">
              <span className="result-label">Confiance</span>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: '92%' }} />
                <span>92%</span>
              </div>
            </div>
            <div className="result-row">
              <span className="result-label">Gravité</span>
              <span className="badge-orange">Modérée</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* MODULES */}
      <section className="modules-section">
        <div className="section-header">
          <h2>Nos Services</h2>
          <p>Une plateforme complète pour accompagner les producteurs togolais</p>
        </div>
        <div className="modules-grid">
          {modules.map((mod, i) => (
            <Link key={i} to={mod.path} className={`module-card ${mod.color}`}>
              <div className="module-icon">{mod.icon}</div>
              <h3>{mod.title}</h3>
              <p>{mod.desc}</p>
              <div className="module-badge">{mod.badge}</div>
              <div className="module-arrow">
                <ChevronRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-header">
          <h2>Comment ça marche ?</h2>
          <p>Simple, rapide et accessible depuis votre téléphone</p>
        </div>
        <div className="steps-grid">
          {[
            { step: '01', title: 'Connectez-vous', desc: "Créez votre compte gratuitement en moins d'une minute." },
            { step: '02', title: 'Photographiez', desc: 'Prenez une photo de votre culture ou animal malade.' },
            { step: '03', title: "L'IA analyse", desc: "Notre intelligence artificielle identifie la maladie instantanément." },
            { step: '04', title: 'Agissez', desc: 'Recevez un traitement adapté et trouvez un fournisseur proche.' },
          ].map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{s.step}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section">
        <div className="section-header">
          <h2>{t('pricingTitle')}</h2>
          <p>Choisissez le plan adapté à votre activité</p>
        </div>
        <div className="pricing-grid">
          {pricing.map((plan, i) => (
            <div key={i} className={`pricing-card ${plan.color} ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Populaire</div>}
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="price-amount">{plan.price}</span>
                {plan.price !== '0' && <span className="price-currency"> FCFA{t('perMonth')}</span>}
                {plan.price === '0' && <span className="price-currency"> {t('free')}</span>}
              </div>
              <ul className="pricing-features">
                {plan.features.map((f, j) => (
                  <li key={j}>✓ {f}</li>
                ))}
              </ul>
              <Link to="/register" className={`pricing-btn ${plan.popular ? 'pricing-btn-popular' : ''}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Prêt à améliorer votre production ?</h2>
        <p>Rejoignez plus de 5 000 agriculteurs et éleveurs togolais qui font confiance à AgriRisk AI</p>
        <Link to="/register" className="btn-primary large">
          Commencer gratuitement <ChevronRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
