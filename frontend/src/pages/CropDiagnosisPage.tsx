import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader, AlertCircle, CheckCircle, Leaf } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { DiagnosisResult } from '../types';
import { mockSuppliers } from '../data/mockData';
import SupplierCard from '../components/SupplierCard';

const CROPS = [
  { key: 'corn', emoji: '🌽' },
  { key: 'tomato', emoji: '🍅' },
  { key: 'cassava', emoji: '🌿' },
  { key: 'soy', emoji: '🫘' },
  { key: 'pepper', emoji: '🌶️' },
];

const MOCK_RESULTS: Record<string, DiagnosisResult> = {
  corn: {
    disease: 'Rouille commune du maïs (Puccinia sorghi)',
    confidence: 92,
    severity: 'modéré',
    description: 'La rouille commune est causée par le champignon Puccinia sorghi. Elle se manifeste par des pustules brun-orange sur les feuilles, réduisant la surface photosynthétique.',
    treatment: 'Application de fongicides à base de triazoles (propiconazole, tebuconazole) ou strobilurines. Traiter tôt le matin. Répéter après 14 jours si nécessaire.',
    prevention: 'Utiliser des variétés résistantes. Éviter la densité excessive de plantation. Assurer une bonne circulation d\'air entre les plants.',
  },
  tomato: {
    disease: 'Mildiou de la tomate (Phytophthora infestans)',
    confidence: 87,
    severity: 'élevé',
    description: 'Le mildiou est une maladie cryptogamique très destructrice. Taches brunes huileuses sur feuilles, tiges noires, fruits pourris.',
    treatment: 'Fongicides à base de cuivre (bouillie bordelaise) ou chlorothalonil. Application préventive en saison des pluies. Enlever et brûler les parties atteintes.',
    prevention: 'Espacer les plants. Éviter l\'arrosage sur le feuillage. Rotation des cultures sur 3-4 ans. Utiliser des variétés tolérantes.',
  },
  cassava: {
    disease: 'Mosaïque du manioc (Cassava Mosaic Disease)',
    confidence: 95,
    severity: 'critique',
    description: 'Maladie virale transmise par des aleurodes. Symptômes : feuilles déformées, mosaïque jaune-vert, retard de croissance sévère.',
    treatment: 'Aucun traitement curatif. Arracher et détruire les plants malades. Contrôler les populations d\'aleurodes avec insecticides systémiques.',
    prevention: 'Utiliser des boutures saines et certifiées. Planter des variétés résistantes (CMD-résistantes). Inspecter régulièrement les cultures.',
  },
  soy: {
    disease: 'Pourriture du collet (Phytophthora root rot)',
    confidence: 78,
    severity: 'modéré',
    description: 'Champignon attaquant les racines et la tige. Plantes flétrissent progressivement, feuilles jaunissent et tombent, racines noircies.',
    treatment: 'Métalaxyl ou éthametsulfuron en traitement de sol. Améliorer le drainage. Éviter les sols engorgés.',
    prevention: 'Drainage adapté des parcelles. Rotation avec céréales. Traitement des semences avant plantation.',
  },
  pepper: {
    disease: 'Anthracnose du piment (Colletotrichum capsici)',
    confidence: 89,
    severity: 'élevé',
    description: 'Maladie fongique affectant fruits et feuilles. Taches circulaires brunes avec centre gris sur fruits, dessèchement des feuilles.',
    treatment: 'Fongicides à base de mancozèbe ou azoxystrobine. Traitement préventif dès la floraison.',
    prevention: 'Éviter l\'humidité prolongée sur les fruits. Récolter régulièrement. Éviter les blessures lors de la manipulation.',
  },
};

const severityColors: Record<string, string> = {
  'faible': 'severity-low',
  'modéré': 'severity-medium',
  'élevé': 'severity-high',
  'critique': 'severity-critical',
};

const CropDiagnosisPage: React.FC = () => {
  const { t } = useApp();
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedCrop || !imagePreview) return;
    setAnalyzing(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2500));
    setResult(MOCK_RESULTS[selectedCrop] || MOCK_RESULTS.corn);
    setAnalyzing(false);
  };

  const relatedSuppliers = mockSuppliers.filter(s =>
    s.status === 'approved' && (s.category === 'seeds' || s.category === 'agricultural' || s.category === 'fertilizer')
  ).slice(0, 3);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon green"><Leaf size={28} /></div>
        <div>
          <h1>{t('cropDiagnosis')}</h1>
          <p>Téléchargez une photo de votre culture pour obtenir un diagnostic instantané</p>
        </div>
      </div>

      <div className="diagnosis-layout">
        {/* Left: Input */}
        <div className="diagnosis-input">
          {/* Crop selector */}
          <div className="input-section">
            <label className="input-label">{t('selectCrop')}</label>
            <div className="crop-selector">
              {CROPS.map(crop => (
                <button
                  key={crop.key}
                  className={`crop-btn ${selectedCrop === crop.key ? 'active' : ''}`}
                  onClick={() => setSelectedCrop(crop.key)}
                >
                  <span className="crop-btn-emoji">{crop.emoji}</span>
                  <span>{t(crop.key)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div className="input-section">
            <label className="input-label">{t('uploadImage')}</label>
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''} ${imagePreview ? 'has-image' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Uploaded" className="upload-preview" />
              ) : (
                <div className="upload-placeholder">
                  <Upload size={40} />
                  <p>{t('dragDrop')}</p>
                  <small>{t('supportedFormats')}</small>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
            {imagePreview && (
              <button className="change-image-btn" onClick={() => { setImagePreview(null); setResult(null); }}>
                Changer l'image
              </button>
            )}
          </div>

          <button
            className={`btn-analyze ${(!selectedCrop || !imagePreview || analyzing) ? 'disabled' : ''}`}
            onClick={handleAnalyze}
            disabled={!selectedCrop || !imagePreview || analyzing}
          >
            {analyzing ? (
              <><Loader size={20} className="spin" /> {t('analyzing')}</>
            ) : (
              <><Camera size={20} /> {t('analyze')}</>
            )}
          </button>
        </div>

        {/* Right: Results */}
        <div className="diagnosis-result">
          {analyzing && (
            <div className="analyzing-state">
              <div className="analyzing-animation">
                <div className="scan-circle" />
                <span className="analyze-emoji">🌽</span>
              </div>
              <p>{t('analyzing')}</p>
              <small>Analyse par intelligence artificielle...</small>
            </div>
          )}

          {!analyzing && !result && (
            <div className="empty-result">
              <Leaf size={64} className="empty-icon" />
              <p>Sélectionnez une culture, uploadez une photo et lancez l'analyse</p>
            </div>
          )}

          {result && !analyzing && (
            <div className="result-card">
              <div className="result-header">
                <CheckCircle size={24} className="result-check" />
                <h2>{t('results')}</h2>
              </div>

              <div className="result-disease">
                <div className="result-field">
                  <span className="field-label">{t('disease')}</span>
                  <span className="field-value disease-name">{result.disease}</span>
                </div>
                <div className="result-metrics">
                  <div className="metric">
                    <span className="metric-label">{t('confidence')}</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${result.confidence}%` }} />
                    </div>
                    <span className="metric-pct">{result.confidence}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">{t('severity')}</span>
                    <span className={`severity-badge ${severityColors[result.severity]}`}>
                      {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h4>📋 {t('description')}</h4>
                <p>{result.description}</p>
              </div>
              <div className="result-section treatment">
                <h4>💊 {t('treatment')}</h4>
                <p>{result.treatment}</p>
              </div>
              <div className="result-section prevention">
                <h4>🛡️ {t('prevention')}</h4>
                <p>{result.prevention}</p>
              </div>

              <div className="disclaimer-box">
                <AlertCircle size={16} />
                <p>{t('disclaimer')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related suppliers */}
      {result && (
        <div className="related-suppliers">
          <h3>🛒 Fournisseurs recommandés</h3>
          <p>Trouvez les produits pour traiter cette maladie près de chez vous</p>
          <div className="suppliers-mini-grid">
            {relatedSuppliers.map(s => <SupplierCard key={s.id} supplier={s} mini />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDiagnosisPage;
