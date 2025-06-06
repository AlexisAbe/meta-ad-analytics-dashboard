
export type AdType = 'Vidéo' | 'Image' | 'Carrousel' | 'Autre';

export interface BudgetSettings {
  defaultCpm: number;
  cpmByType: Record<AdType, number>;
  cpmBySector: Record<string, number>;
  forcedEndDate?: Date;
}

export interface BudgetCalculation {
  estimatedBudget: number;
  appliedCpm: number;
  duration: number;
  adType: AdType;
  isActive: boolean;
  isValid: boolean;
  exclusionReason?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  validAds: number;
  invalidAds: number;
  exclusionReasons: string[];
  averageCpm: number;
  totalDuration: number;
}
