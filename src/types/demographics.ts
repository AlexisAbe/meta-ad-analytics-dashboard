
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
}

export interface DemographicData {
  breakdown: DemographicBreakdown;
  totalAudience: number;
  hasData: boolean;
  missingFields: string[];
}

export interface ComparisonData {
  current: DemographicBreakdown;
  average: DemographicBreakdown;
  insights: string[];
}
