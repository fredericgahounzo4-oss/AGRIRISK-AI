import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-icon"><Leaf size={18} /></div>
            <span>AgriRisk <span className="logo-ai">AI</span></span>
          </div>
          <p className="footer-tagline">{t('heroTitle')}</p>
          <p className="footer-desc">
            Plateforme numérique d'aide à la décision agricole et pastorale pour le Togo, propulsée par l'intelligence artificielle.
          </p>
        </div>

        <div className="footer-links">
          <h4>Services</h4>
          <Link to="/crop-diagnosis">{t('cropDiagnosis')}</Link>
          <Link to="/animal-diagnosis">{t('animalDiagnosis')}</Link>
          <Link to="/assistant">{t('aiAssistant')}</Link>
          <Link to="/suppliers">{t('suppliers')}</Link>
        </div>

        <div className="footer-links">
          <h4>Fournisseurs</h4>
          <Link to="/supplier-register">{t('becomeSupplier')}</Link>
          <Link to="/suppliers">Annuaire fournisseurs</Link>
          <Link to="/register">Créer un compte</Link>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <div className="contact-row"><MapPin size={14} /> Lomé, Togo</div>
          <div className="contact-row"><Phone size={14} /> +228 90 00 00 00</div>
          <div className="contact-row"><Mail size={14} /> contact@agririsk.tg</div>

          <div className="footer-langs">
            <span>🇫🇷 Français</span>
            <span>🇬🇧 English</span>
            <span>🇹🇬 Eʋe</span>
            <span>🇹🇬 Kabɩyɛ</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 AgriRisk AI — Tous droits réservés · Togo 🇹🇬</p>
        <p className="footer-disclaimer">
          Les diagnostics IA sont des outils d'aide à la décision et ne remplacent pas un expert professionnel.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
