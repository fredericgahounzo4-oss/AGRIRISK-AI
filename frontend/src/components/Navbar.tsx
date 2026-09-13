import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Leaf, LogOut, User, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { Language } from '../types';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ewe', label: 'Eʋegbe', flag: '🇹🇬' },
  { code: 'kabye', label: 'Kabɩyɛ', flag: '🇹🇬' },
];

const Navbar: React.FC = () => {
  const { t, language, setLanguage, currentUser, setCurrentUser, isAuthenticated } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/crop-diagnosis', label: t('cropDiagnosis') },
    { path: '/animal-diagnosis', label: t('animalDiagnosis') },
    { path: '/assistant', label: t('aiAssistant') },
    { path: '/suppliers', label: t('suppliers') },
    ...(currentUser?.role === 'admin' ? [{ path: '/admin', label: t('admin') }] : []),
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <Leaf size={22} />
          </div>
          <span className="logo-text">AgriRisk <span className="logo-ai">AI</span></span>
        </Link>

        <div className="nav-links-desktop">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {/* Language Selector */}
          <div className="lang-selector">
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
              <Globe size={16} />
              <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
              <ChevronDown size={14} />
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${language === lang.code ? 'active' : ''}`}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-btn">
                <User size={16} />
                <span className="user-name">{currentUser?.name.split(' ')[0]}</span>
              </button>
              <button className="logout-btn" onClick={handleLogout} title={t('logout')}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-login">{t('login')}</Link>
              <Link to="/register" className="btn-register">{t('register')}</Link>
            </div>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-mobile">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mobile-divider" />
          {isAuthenticated ? (
            <button className="mobile-link logout" onClick={handleLogout}>
              <LogOut size={16} /> {t('logout')}
            </button>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>{t('login')}</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>{t('register')}</Link>
            </>
          )}
          <div className="mobile-langs">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`mobile-lang ${language === lang.code ? 'active' : ''}`}
                onClick={() => { setLanguage(lang.code); setMenuOpen(false); }}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
