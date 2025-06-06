
import { AdsData } from '@/types/ads';
import { BudgetSettings, BudgetCalculation, BudgetSummary, AdType } from '@/types/budget';

// Configuration par défaut
const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  defaultCpm: 6,
  cpmByType: {
    'Vidéo': 8,
    'Image': 6,
    'Carrousel': 10,
    'Autre': 6,
  },
  cpmBySector: {
    'Agro': 7,
    'Luxe': 12,
    'Tech': 9,
    'Mode': 11,
    'Automobile': 8,
  },
};

export class BudgetCalculator {
  private settings: BudgetSettings;

  constructor(settings: Partial<BudgetSettings> = {}) {
    this.settings = { ...DEFAULT_BUDGET_SETTINGS, ...settings };
  }

  /**
   * Détecte automatiquement le type de publicité à partir des données disponibles
   */
  detectAdType(ad: AdsData): AdType {
    const format = ad.creative_format?.toLowerCase() || '';
    const body = ad.ad_body?.toLowerCase() || '';
    const title = ad.link_title?.toLowerCase() || '';
    
    // Logique de détection basée sur le format créatif
    if (format.includes('video') || format.includes('vidéo')) {
      return 'Vidéo';
    }
    
    if (format.includes('carousel') || format.includes('carrousel')) {
      return 'Carrousel';
    }
    
    // Détection heuristique à partir du contenu
    if (body.includes('vidéo') || title.includes('vidéo') || 
        body.includes('video') || title.includes('video')) {
      return 'Vidéo';
    }
    
    if (format.includes('image') || format.includes('photo')) {
      return 'Image';
    }
    
    return 'Autre';
  }

  /**
   * Calcule la durée de diffusion en jours
   */
  calculateDuration(startDate: string, endDate?: string): number {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : (this.settings.forcedEndDate || new Date());
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays); // Minimum 1 jour
  }

  /**
   * Détermine le CPM à appliquer selon la logique de priorité
   */
  determineCpm(adType: AdType, sector?: string): number {
    // 1. Priorité au CPM secteur si disponible
    if (sector && this.settings.cpmBySector[sector]) {
      return this.settings.cpmBySector[sector];
    }
    
    // 2. Sinon CPM par type
    if (this.settings.cpmByType[adType]) {
      return this.settings.cpmByType[adType];
    }
    
    // 3. CPM par défaut
    return this.settings.defaultCpm;
  }

  /**
   * Valide si une publicité peut être incluse dans le calcul - Version enrichie pour diagnostic
   */
  validateAdWithDetails(ad: AdsData): { isValid: boolean; reason?: string } {
    // Validation audience
    if (ad.audience_eu_total === undefined || ad.audience_eu_total === null) {
      return { isValid: false, reason: 'Audience EU manquante (undefined/null)' };
    }
    
    if (ad.audience_eu_total === 0) {
      return { isValid: false, reason: 'Audience EU égale à zéro' };
    }
    
    if (isNaN(ad.audience_eu_total) || ad.audience_eu_total < 0) {
      return { isValid: false, reason: 'Audience EU invalide (NaN ou négative)' };
    }
    
    // Validation date de début
    if (!ad.start_date) {
      return { isValid: false, reason: 'Date de début manquante' };
    }
    
    if (typeof ad.start_date !== 'string' || ad.start_date.trim() === '') {
      return { isValid: false, reason: 'Date de début vide ou invalide' };
    }
    
    const startDate = new Date(ad.start_date);
    if (isNaN(startDate.getTime())) {
      return { isValid: false, reason: `Date de début non parsable: ${ad.start_date}` };
    }
    
    // Validation date de fin (si présente)
    if (ad.end_date) {
      const endDate = new Date(ad.end_date);
      if (isNaN(endDate.getTime())) {
        return { isValid: false, reason: `Date de fin non parsable: ${ad.end_date}` };
      }
      
      if (endDate < startDate) {
        return { isValid: false, reason: 'Date de fin antérieure à la date de début' };
      }
    }
    
    // Validation marque
    if (!ad.brand || ad.brand.trim() === '') {
      return { isValid: false, reason: 'Marque manquante ou vide' };
    }
    
    // Validation ID
    if (!ad.ad_id || ad.ad_id.trim() === '') {
      return { isValid: false, reason: 'ID publicité manquant' };
    }
    
    return { isValid: true };
  }

  /**
   * Version simplifiée pour compatibilité
   */
  validateAd(ad: AdsData): { isValid: boolean; reason?: string } {
    return this.validateAdWithDetails(ad);
  }

  /**
   * Calcule le budget estimé pour une publicité avec diagnostic enrichi
   */
  calculateBudget(ad: AdsData): BudgetCalculation {
    const validation = this.validateAdWithDetails(ad);
    
    if (!validation.isValid) {
      return {
        estimatedBudget: 0,
        appliedCpm: 0,
        duration: 0,
        adType: 'Autre',
        isActive: false,
        isValid: false,
        exclusionReason: validation.reason,
      };
    }

    const adType = this.detectAdType(ad);
    const duration = this.calculateDuration(ad.start_date, ad.end_date);
    const appliedCpm = this.determineCpm(adType, ad.brand); // Utilisation de la marque comme secteur
    const isActive = !ad.end_date || new Date(ad.end_date) >= new Date();
    
    // Formule : (audience * cpm) / 1000
    const estimatedBudget = (ad.audience_eu_total * appliedCpm) / 1000;

    return {
      estimatedBudget: Math.round(estimatedBudget * 100) / 100, // Arrondi à 2 décimales
      appliedCpm,
      duration,
      adType,
      isActive,
      isValid: true,
    };
  }

  /**
   * Calcule le budget total et les statistiques pour un ensemble de publicités
   */
  calculateSummary(ads: AdsData[]): BudgetSummary {
    const calculations = ads.map(ad => this.calculateBudget(ad));
    const validCalculations = calculations.filter(calc => calc.isValid);
    const invalidCalculations = calculations.filter(calc => !calc.isValid);
    
    const totalBudget = validCalculations.reduce((sum, calc) => sum + calc.estimatedBudget, 0);
    const totalCpmWeighted = validCalculations.reduce((sum, calc) => sum + (calc.appliedCpm * calc.estimatedBudget), 0);
    const averageCpm = totalBudget > 0 ? totalCpmWeighted / totalBudget : 0;
    const totalDuration = validCalculations.reduce((sum, calc) => sum + calc.duration, 0);
    
    const exclusionReasons = Array.from(new Set(
      invalidCalculations
        .map(calc => calc.exclusionReason)
        .filter(Boolean) as string[]
    ));

    return {
      totalBudget: Math.round(totalBudget * 100) / 100,
      validAds: validCalculations.length,
      invalidAds: invalidCalculations.length,
      exclusionReasons,
      averageCpm: Math.round(averageCpm * 100) / 100,
      totalDuration,
    };
  }

  /**
   * Fonction de diagnostic pour logger les publicités exclues
   */
  logExcludedAds(ads: AdsData[]): void {
    console.group('🔍 DIAGNOSTIC DES PUBLICITÉS EXCLUES');
    console.info(`Analyse de ${ads.length} publicités...`);
    
    let excludedCount = 0;
    
    ads.forEach(ad => {
      const calculation = this.calculateBudget(ad);
      
      if (!calculation.isValid) {
        excludedCount++;
        console.warn('Publicité exclue', ad.ad_id, {
          audience: ad.audience_eu_total,
          startDate: ad.start_date,
          endDate: ad.end_date,
          format: ad.creative_format,
          secteur: ad.brand,
          reason: calculation.exclusionReason
        });
      }
    });
    
    console.info(`📊 Résumé: ${ads.length - excludedCount} valides / ${ads.length} analysées (${excludedCount} exclues)`);
    console.groupEnd();
  }

  /**
   * Met à jour les paramètres de calcul
   */
  updateSettings(newSettings: Partial<BudgetSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Récupère les paramètres actuels
   */
  getSettings(): BudgetSettings {
    return { ...this.settings };
  }
}

// Instance singleton pour l'application
export const budgetCalculator = new BudgetCalculator();

// Fonctions utilitaires pour l'export
export const estimateBudget = (ad: AdsData, settings?: Partial<BudgetSettings>) => {
  const calculator = settings ? new BudgetCalculator(settings) : budgetCalculator;
  return calculator.calculateBudget(ad);
};

export const calculateTotalBudget = (ads: AdsData[], settings?: Partial<BudgetSettings>) => {
  const calculator = settings ? new BudgetCalculator(settings) : budgetCalculator;
  return calculator.calculateSummary(ads);
};

export const logExcludedAds = (ads: AdsData[], settings?: Partial<BudgetSettings>) => {
  const calculator = settings ? new BudgetCalculator(settings) : budgetCalculator;
  calculator.logExcludedAds(ads);
};
