
export type AdType = 'Vidéo' | 'Image' | 'Carrousel' | 'Autre';

export type CpmSource = 'brand' | 'sector' | 'format' | 'default';

export interface CpmApplication {
  value: number;
  source: CpmSource;
  sourceKey?: string; // nom de la marque, secteur, ou format utilisé
}

export interface ImpressionSettings {
  repeatRate: number; // taux de répétition par défaut: 1.3
  showEstimationNote: boolean;
}

export interface BudgetSettings {
  defaultCpm: number;
  cpmByType: Record<AdType, number>;
  cpmBySector: Record<string, number>;
  cpmByBrand: Record<string, number>; // Nouvelle: CPM par marque
  impressionSettings: ImpressionSettings;
  forcedEndDate?: Date;
}

export interface BudgetCalculation {
  estimatedBudget: number;
  appliedCpm: number;
  cpmSource: CpmApplication; // Nouvelle: traçabilité du CPM
  estimatedImpressions: number; // Nouvelle: impressions estimées
  duration: number;
  adType: AdType;
  isActive: boolean;
  isValid: boolean;
  exclusionReason?: string;
  hasIncompleteData: boolean; // Nouvelle: flag pour données partielles
  missingFields: string[]; // Nouvelle: liste des champs manquants
}

export interface BudgetSummary {
  totalBudget: number;
  totalImpressions: number; // Nouvelle
  validAds: number;
  invalidAds: number;
  exclusionReasons: string[];
  averageCpm: number;
  totalDuration: number;
  cpmSourceDistribution: Record<CpmSource, number>; // Nouvelle: répartition des sources CPM
}
