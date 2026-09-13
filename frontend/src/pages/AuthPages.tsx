import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useApp, mockAdminUser } from '../contexts/AppContext';
import type { User } from '../types';

export const LoginPage: React.FC = () => {
  const { t, setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    // Demo login
    if (email === 'admin@agririsk.tg' && password === 'admin123') {
      setCurrentUser(mockAdminUser);
      navigate('/admin');
      return;
    }
    const demoUser: User = {
      id: 'u-' + Date.now(),
      name: email.split('@')[0].replace(/\./g, ' '),
      email,
      role: 'farmer',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(demoUser);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon large"><Leaf size={28} /></div>
          <h1>AgriRisk <span className="logo-ai">AI</span></h1>
        </div>

        <h2>{t('loginTitle')}</h2>

        <div className="demo-hint">
          <strong>Démo :</strong><br/>
          Admin : <code>admin@agririsk.tg</code> / <code>admin123</code><br/>
          Utilisateur : n'importe quel email / mot de passe
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-field">
            <label>{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.tg" />
          </div>

          <div className="form-field">
            <label>{t('password')}</label>
            <div className="password-input">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary full">{t('login')}</button>
        </form>

        <p className="auth-switch">
          {t('noAccount')} <Link to="/register">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { t, setCurrentUser } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'farmer', region: 'Lomé' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Veuillez remplir tous les champs obligatoires'); return; }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Mot de passe trop court (min. 6 caractères)'); return; }
    const newUser: User = {
      id: 'u-' + Date.now(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role as 'farmer' | 'breeder' | 'supplier',
      region: form.region,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    navigate('/');
  };

  const update = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-logo">
          <div className="logo-icon large"><Leaf size={28} /></div>
          <h1>AgriRisk <span className="logo-ai">AI</span></h1>
        </div>

        <h2>{t('registerTitle')}</h2>

        <form onSubmit={handleRegister} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-row">
            <div className="form-field">
              <label>{t('fullName')} *</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Kofi Mensah" />
            </div>
            <div className="form-field">
              <label>{t('phone')}</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+228 90 00 00 00" />
            </div>
          </div>

          <div className="form-field">
            <label>{t('email')} *</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="vous@exemple.tg" />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t('role')} *</label>
              <select value={form.role} onChange={e => update('role', e.target.value)}>
                <option value="farmer">{t('farmer')}</option>
                <option value="breeder">{t('breeder')}</option>
                <option value="supplier">{t('supplier')}</option>
              </select>
            </div>
            <div className="form-field">
              <label>{t('region')}</label>
              <select value={form.region} onChange={e => update('region', e.target.value)}>
                {['Lomé', 'Kara', 'Sokodé', 'Atakpamé', 'Kpalimé', 'Dapaong'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t('password')} *</label>
              <div className="password-input">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-field">
              <label>{t('confirmPassword')} *</label>
              <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="btn-primary full">{t('register')}</button>
        </form>

        <p className="auth-switch">
          {t('hasAccount')} <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
};

export const SupplierRegisterPage: React.FC = () => {
  const { t } = useApp();
  const [form, setForm] = useState({ companyName: '', manager: '', phone: '', address: '', region: 'Lomé', category: 'agricultural', pack: 'bronze' });
  const [submitted, setSubmitted] = useState(false);
  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Inscription soumise !</h2>
            <p>Votre profil fournisseur est en attente de validation par notre équipe. Vous recevrez une confirmation sous 24-48h.</p>
            <Link to="/suppliers" className="btn-primary">Voir les fournisseurs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <h2>{t('supplierRegister')}</h2>
        <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="auth-form">
          <div className="form-row">
            <div className="form-field">
              <label>{t('companyName')} *</label>
              <input value={form.companyName} onChange={e => update('companyName', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>{t('manager')} *</label>
              <input value={form.manager} onChange={e => update('manager', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>{t('phone')} *</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>{t('region')} *</label>
              <select value={form.region} onChange={e => update('region', e.target.value)}>
                {['Lomé', 'Kara', 'Sokodé', 'Atakpamé', 'Kpalimé', 'Dapaong'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>{t('address')}</label>
            <input value={form.address} onChange={e => update('address', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>{t('category')}</label>
              <select value={form.category} onChange={e => update('category', e.target.value)}>
                {['agricultural', 'veterinary', 'seeds', 'fertilizer', 'feed'].map(c => (
                  <option key={c} value={c}>{t(c)}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Pack</label>
              <select value={form.pack} onChange={e => update('pack', e.target.value)}>
                <option value="bronze">Bronze — 5 000 FCFA/mois</option>
                <option value="silver">Silver — 10 000 FCFA/mois</option>
                <option value="gold">Gold — 20 000 FCFA/mois</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary full">{t('submit')}</button>
        </form>
      </div>
    </div>
  );
};
