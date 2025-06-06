
import { useMemo } from 'react';
import { AdsData } from '@/types/ads';
import { BudgetSettings, BudgetCalculation, BudgetSummary } from '@/types/budget';
import { budgetCalculator } from '@/services/budgetCalculator';

export const useBudgetCalculations = (
  ads: AdsData[], 
  settings?: Partial<BudgetSettings>
) => {
  return useMemo(() => {
    // Mettre à jour les paramètres si fournis
    if (settings) {
      budgetCalculator.updateSettings(settings);
    }

    // Calculer les budgets pour chaque publicité
    const calculations = ads.map(ad => ({
      ad,
      calculation: budgetCalculator.calculateBudget(ad),
    }));

    // Calculer le résumé global
    const summary = budgetCalculator.calculateSummary(ads);

    // Séparer les publicités valides et invalides
    const validAds = calculations.filter(item => item.calculation.isValid);
    const invalidAds = calculations.filter(item => !item.calculation.isValid);

    return {
      calculations,
      validAds,
      invalidAds,
      summary,
      settings: budgetCalculator.getSettings(),
    };
  }, [ads, settings]);
};
