export type DiagnosticType = 'culture' | 'animal';

export type RiskLevel = 'Faible' | 'Moyen' | 'Élevé' | 'Critique';

export interface DiagnosticRequest {
  type: DiagnosticType;
  image: File;
  description?: string;
}

export interface DiagnosticCause {
  label: string;
}

export interface DiagnosticRecommendation {
  label: string;
}

export interface DiagnosticResult {
  id: string;
  type: DiagnosticType;
  disease_name: string;
  scientific_name: string;
  confidence: number;
  risk_level: RiskLevel;
  causes: DiagnosticCause[];
  recommendations: DiagnosticRecommendation[];
  treatment: string;
  image_url: string;
  additional_images?: string[];
  created_at: string;
}

export interface DiagnosticHistoryItem {
  id: string;
  type: DiagnosticType;
  disease_name: string;
  risk_level: RiskLevel;
  confidence: number;
  created_at: string;
  image_url: string;
}
