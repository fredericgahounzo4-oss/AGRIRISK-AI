import React, { useState, useRef } from 'react';
import { Upload, Stethoscope, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { AnimalDiagnosisResult } from '../types';
import { mockSuppliers } from '../data/mockData';
import SupplierCard from '../components/SupplierCard';

const ANIMALS = [
  { key: 'chickens', emoji: '🐔' },
  { key: 'guinea_fowls', emoji: '🦆' },
  { key: 'goats', emoji: '🐐' },
  { key: 'sheep', emoji: '🐑' },
  { key: 'pigs', emoji: '🐖' },
  { key: 'cattle', emoji: '🐄' },
];

const MOCK_ANIMAL_RESULTS: Record<string, AnimalDiagnosisResult> = {
  chickens: {
    disease: 'Maladie de Newcastle (Paramyxovirus aviaire)',
    symptoms: ['Difficultés respiratoires', 'Torsion du cou (torticolis)', 'Diarrhée verdâtre', 'Prostration', 'Chute de ponte'],
    riskLevel: 'critique',
    immediateActions: 'Isoler immédiatement les animaux malades. Informer les autorités vétérinaires. Ne pas déplacer les volailles. Désinfection complète du poulailler.',
    vetAdvice: 'Cette maladie est hautement contagieuse et mortelle. Aucun traitement curatif. La vaccination préventive avec la souche La Sota est essentielle. Contacter d\'urgence un vétérinaire.',
  },
  guinea_fowls: {
    disease: 'Aspergillose (Aspergillus fumigatus)',
    symptoms: ['Essoufflement', 'Léthargie', 'Perte d\'appétit', 'Cyanose du bec'],
    riskLevel: 'modéré',
    immediateActions: 'Améliorer la ventilation. Retirer la litière moisie. Isoler les individus atteints.',
    vetAdvice: 'Traitement à base d\'antifongiques (itraconazole). Renouveler la litière. Contrôler l\'humidité du local d\'élevage.',
  },
  goats: {
    disease: 'Fièvre aphteuse (FMDV)',
    symptoms: ['Fièvre élevée (40-41°C)', 'Vésicules sur la bouche et les sabots', 'Boitement', 'Refus de manger', 'Chute de production laitière'],
    riskLevel: 'élevé',
    immediateActions: 'Isoler immédiatement. Notifier les services vétérinaires officiels. Mesures de biosécurité strictes.',
    vetAdvice: 'Maladie à déclaration obligatoire. Traitement symptomatique : désinfection des lésions, analgésiques. Vaccination préventive recommandée.',
  },
  sheep: {
    disease: 'Brucellose ovine (Brucella melitensis)',
    symptoms: ['Avortements en fin de gestation', 'Mortalité néonatale', 'Arthrite', 'Orchite chez les mâles'],
    riskLevel: 'élevé',
    immediateActions: 'Isoler les animaux avortés. Porter des gants pour manipuler les produits d\'avortement. Contacter un vétérinaire.',
    vetAdvice: 'Maladie zoonotique transmissible à l\'homme. Dépistage sérologique nécessaire. Vaccination avec Rev1 pour la prévention.',
  },
  pigs: {
    disease: 'Peste porcine africaine (ASF)',
    symptoms: ['Fièvre très élevée', 'Cyanose de la peau', 'Hémorragies', 'Diarrhée sanglante', 'Mort subite'],
    riskLevel: 'critique',
    immediateActions: 'URGENCE : Isoler immédiatement. Ne rien sortir de l\'exploitation. Alerter immédiatement les autorités vétérinaires. Biosécurité maximale.',
    vetAdvice: 'Maladie à déclaration obligatoire SANS traitement. Mortalité quasi totale. La prévention est le seul moyen de lutte.',
  },
  cattle: {
    disease: 'Dermatophilose bovine (Dermatophilus congolensis)',
    symptoms: ['Croûtes et squames sur le dos', 'Lésions cutanées douloureuses', 'Perte de poils', 'Amaigrissement'],
    riskLevel: 'modéré',
    immediateActions: 'Rentrer les animaux pour les protéger de la pluie. Traiter les plaies à l\'iode. Isoler les cas sévères.',
    vetAdvice: 'Traitement à la pénicilline-streptomycine injectable. Améliorer les conditions d\'hébergement. Contrôle des tiques vecteurs.',
  },
};

const riskColors: Record<string, string> = {
  'faible': 'severity-low',
  'modéré': 'severity-medium',
  'élevé': 'severity-high',
  'critique': 'severity-critical',
};

const AnimalDiagnosisPage: React.FC = () => {
  const { t } = useApp();
  const [selectedAnimal, setSelectedAnimal] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnimalDiagnosisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedAnimal || !imagePreview) return;
    setAnalyzing(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2500));
    setResult(MOCK_ANIMAL_RESULTS[selectedAnimal] || MOCK_ANIMAL_RESULTS.chickens);
    setAnalyzing(false);
  };

  const vetSuppliers = mockSuppliers.filter(s => s.status === 'approved' && s.category === 'veterinary').slice(0, 3);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon orange"><Stethoscope size={28} /></div>
        <div>
          <h1>{t('animalDiagnosis')}</h1>
          <p>Diagnostiquez rapidement les maladies de vos animaux grâce à l'IA</p>
        </div>
      </div>

      <div className="diagnosis-layout">
        <div className="diagnosis-input">
          <div className="input-section">
            <label className="input-label">{t('selectAnimal')}</label>
            <div className="crop-selector">
              {ANIMALS.map(animal => (
                <button
                  key={animal.key}
                  className={`crop-btn ${selectedAnimal === animal.key ? 'active' : ''}`}
                  onClick={() => setSelectedAnimal(animal.key)}
                >
                  <span className="crop-btn-emoji">{animal.emoji}</span>
                  <span>{t(animal.key)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-section">
            <label className="input-label">{t('uploadImage')}</label>
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''} ${imagePreview ? 'has-image' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f); }}
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
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {imagePreview && (
              <button className="change-image-btn" onClick={() => { setImagePreview(null); setResult(null); }}>
                Changer l'image
              </button>
            )}
          </div>

          <button
            className={`btn-analyze orange ${(!selectedAnimal || !imagePreview || analyzing) ? 'disabled' : ''}`}
            onClick={handleAnalyze}
            disabled={!selectedAnimal || !imagePreview || analyzing}
          >
            {analyzing ? (
              <><Loader size={20} className="spin" /> {t('analyzing')}</>
            ) : (
              <><Stethoscope size={20} /> {t('analyze')}</>
            )}
          </button>
        </div>

        <div className="diagnosis-result">
          {analyzing && (
            <div className="analyzing-state">
              <div className="analyzing-animation orange">
                <div className="scan-circle orange" />
                <span className="analyze-emoji">🐄</span>
              </div>
              <p>{t('analyzing')}</p>
              <small>Analyse vétérinaire par IA...</small>
            </div>
          )}

          {!analyzing && !result && (
            <div className="empty-result">
              <Stethoscope size={64} className="empty-icon orange" />
              <p>Sélectionnez un animal, uploadez une photo et lancez l'analyse</p>
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
                    <span className="metric-label">{t('riskLevel')}</span>
                    <span className={`severity-badge ${riskColors[result.riskLevel]}`}>
                      {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h4>🔍 {t('symptoms')}</h4>
                <ul className="symptoms-list">
                  {result.symptoms.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div className="result-section treatment">
                <h4>⚡ {t('immediateActions')}</h4>
                <p>{result.immediateActions}</p>
              </div>
              <div className="result-section prevention">
                <h4>👨‍⚕️ {t('vetAdvice')}</h4>
                <p>{result.vetAdvice}</p>
              </div>

              <div className="disclaimer-box">
                <AlertCircle size={16} />
                <p>{t('disclaimer')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="related-suppliers">
          <h3>🏥 Pharmacies vétérinaires recommandées</h3>
          <p>Trouvez médicaments et vaccins pour vos animaux</p>
          <div className="suppliers-mini-grid">
            {vetSuppliers.map(s => <SupplierCard key={s.id} supplier={s} mini />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalDiagnosisPage;
