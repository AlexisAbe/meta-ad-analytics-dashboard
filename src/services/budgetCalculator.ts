import { AdsData } from '@/types/ads';
import { BudgetSettings, BudgetCalculation, BudgetSummary, AdType, CpmApplication, CpmSource } from '@/types/budget';

// Configuration par défaut mise à jour
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
  cpmByBrand: {}, // Nouvelle section pour CPM par marque
  impressionSettings: {
    repeatRate: 1.3,
    showEstimationNote: true,
  },
};

export class BudgetCalculator {
  private settings: BudgetSettings;

  constructor(settings: Partial<BudgetSettings> = {}) {
    this.settings = { ...DEFAULT_BUDGET_SETTINGS, ...settings };
  }

  /**
   * Détermine le CPM selon la hiérarchie : Marque → Secteur → Format → Défaut
   */
  determineCpmWithSource(brand?: string, sector?: string, adType?: AdType): CpmApplication {
    // 1. Priorité absolue : CPM par marque
    if (brand && this.settings.cpmByBrand[brand]) {
      return {
        value: this.settings.cpmByBrand[brand],
        source: 'brand',
        sourceKey: brand
      };
    }
    
    // 2. CPM par secteur
    if (sector && this.settings.cpmBySector[sector]) {
      return {
        value: this.settings.cpmBySector[sector],
        source: 'sector',
        sourceKey: sector
      };
    }
    
    // 3. CPM par type/format
    if (adType && this.settings.cpmByType[adType]) {
      return {
        value: this.settings.cpmByType[adType],
        source: 'format',
        sourceKey: adType
      };
    }
    
    // 4. CPM par défaut
    return {
      value: this.settings.defaultCpm,
      source: 'default'
    };
  }

  /**
   * Calcule les impressions estimées
   */
  calculateEstimatedImpressions(audience: number): number {
    return Math.round(audience * this.settings.impressionSettings.repeatRate);
  }

  /**
   * Détecte les champs manquants pour une publicité
   */
  detectMissingFields(ad: AdsData): string[] {
    const missing: string[] = [];
    
    if (!ad.brand || ad.brand.trim() === '') missing.push('Marque');
    if (!ad.start_date) missing.push('Date de début');
    if (!ad.end_date) missing.push('Date de fin');
    if (!ad.link_title && !ad.ad_body) missing.push('Titre ou contenu');
    if (!ad.creative_format) missing.push('Format créatif');
    if (!ad.snapshot_url) missing.push('URL snapshot');
    
    return missing;
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
   * Valide si une publicité peut être incluse dans le calcul - Version enrichie
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
   * Calcule le budget estimé avec la nouvelle logique hiérarchique
   */
  calculateBudget(ad: AdsData): BudgetCalculation {
    const validation = this.validateAdWithDetails(ad);
    const missingFields = this.detectMissingFields(ad);
    const hasIncompleteData = missingFields.length > 0;
    
    if (!validation.isValid) {
      return {
        estimatedBudget: 0,
        appliedCpm: 0,
        cpmSource: { value: 0, source: 'default' },
        estimatedImpressions: 0,
        duration: 0,
        adType: 'Autre',
        isActive: false,
        isValid: false,
        exclusionReason: validation.reason,
        hasIncompleteData: true,
        missingFields: missingFields,
      };
    }

    const adType = this.detectAdType(ad);
    const duration = this.calculateDuration(ad.start_date, ad.end_date);
    const cpmApplication = this.determineCpmWithSource(ad.brand, ad.brand, adType); // Utilise brand comme secteur par défaut
    const isActive = !ad.end_date || new Date(ad.end_date) >= new Date();
    
    // Calcul des impressions estimées
    const estimatedImpressions = this.calculateEstimatedImpressions(ad.audience_eu_total);
    
    // Formule : (impressions * cpm) / 1000
    const estimatedBudget = (estimatedImpressions * cpmApplication.value) / 1000;

    return {
      estimatedBudget: Math.round(estimatedBudget * 100) / 100,
      appliedCpm: cpmApplication.value,
      cpmSource: cpmApplication,
      estimatedImpressions,
      duration,
      adType,
      isActive,
      isValid: true,
      hasIncompleteData,
      missingFields,
    };
  }

  /**
   * Calcule le résumé avec les nouvelles métriques
   */
  calculateSummary(ads: AdsData[]): BudgetSummary {
    const calculations = ads.map(ad => this.calculateBudget(ad));
    const validCalculations = calculations.filter(calc => calc.isValid);
    const invalidCalculations = calculations.filter(calc => !calc.isValid);
    
    const totalBudget = validCalculations.reduce((sum, calc) => sum + calc.estimatedBudget, 0);
    const totalImpressions = validCalculations.reduce((sum, calc) => sum + calc.estimatedImpressions, 0);
    const totalCpmWeighted = validCalculations.reduce((sum, calc) => sum + (calc.appliedCpm * calc.estimatedBudget), 0);
    const averageCpm = totalBudget > 0 ? totalCpmWeighted / totalBudget : 0;
    const totalDuration = validCalculations.reduce((sum, calc) => sum + calc.duration, 0);
    
    // Distribution des sources CPM
    const cpmSourceDistribution: Record<CpmSource, number> = {
      brand: 0,
      sector: 0,
      format: 0,
      default: 0,
    };
    
    validCalculations.forEach(calc => {
      cpmSourceDistribution[calc.cpmSource.source]++;
    });
    
    const exclusionReasons = Array.from(new Set(
      invalidCalculations
        .map(calc => calc.exclusionReason)
        .filter(Boolean) as string[]
    ));

    return {
      totalBudget: Math.round(totalBudget * 100) / 100,
      totalImpressions,
      validAds: validCalculations.length,
      invalidAds: invalidCalculations.length,
      exclusionReasons,
      averageCpm: Math.round(averageCpm * 100) / 100,
      totalDuration,
      cpmSourceDistribution,
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
