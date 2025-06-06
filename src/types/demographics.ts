
export interface DemographicBreakdown {
  '18-24': AgeGroupData;
  '25-34': AgeGroupData;
  '35-44': AgeGroupData;
  '45-54': AgeGroupData;
  '55-64': AgeGroupData;
  '65+': AgeGroupData;
}

export interface AgeGroupData {
  total: number;
  men: number;
  women: number;
  percentage: number;
  overRepresented: boolean;
  vsAverage?: number; // Pourcentage d'écart vs moyenne
  hasData: boolean; // Nouvelle propriété pour indiquer si des données existent
}

export interface DemographicData {
  breakdown: DemographicBreakdown;
  totalAudience: number;
  hasData: boolean;
  missingFields: string[];
  // Nouvelles propriétés pour la gestion des données partielles
  availableAgeGroups: string[];
  missingAgeGroups: string[];
  completeness: number; // Pourcentage de tranches présentes (0-100)
  isUsable: boolean; // true si au moins 2 tranches disponibles
}

export interface ComparisonData {
  current: DemographicBreakdown;
  average: DemographicBreakdown;
  insights: string[];
}
