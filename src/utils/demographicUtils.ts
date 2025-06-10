
import { demographicAnalyzer } from '@/services/demographicAnalyzer';
import { AdsData } from '@/types/ads';
import { DemographicData } from '@/types/demographics';

export interface DemographicDisplayData {
  hasData: boolean;
  isUsable: boolean;
  completeness: number;
  availableAgeGroups: string[];
  badgeVariant: 'complete' | 'partial' | 'none';
  badgeText: string;
  showAudienceButton: boolean;
  demographics: DemographicData;
}

export const demographicUtils = {
  /**
   * Calcule et prépare toutes les données démographiques pour l'affichage
   */
  calculateDisplayData(ads: AdsData[]): DemographicDisplayData {
    const demographics = demographicAnalyzer.calculateDemographicBreakdown(ads);
    
    console.log('🔍 DemographicUtils - Calcul pour:', {
      ad_ids: ads.map(ad => ad.ad_id),
      hasData: demographics.hasData,
      completeness: demographics.completeness,
      availableAgeGroups: demographics.availableAgeGroups
    });

    // Déterminer le badge à afficher
    let badgeVariant: 'complete' | 'partial' | 'none' = 'none';
    let badgeText = '';
    
    if (demographics.hasData) {
      if (demographics.completeness === 100) {
        badgeVariant = 'complete';
        badgeText = 'Données complètes';
      } else {
        badgeVariant = 'partial';
        badgeText = 'Données partielles';
      }
    }

    return {
      hasData: demographics.hasData,
      isUsable: demographics.isUsable,
      completeness: demographics.completeness,
      availableAgeGroups: demographics.availableAgeGroups,
      badgeVariant,
      badgeText,
      showAudienceButton: demographics.hasData, // Afficher dès qu'il y a des données
      demographics
    };
  },

  /**
   * Messages standardisés pour les différents cas
   */
  getMessages() {
    return {
      noDataTitle: 'Données démographiques non disponibles',
      noDataDescription: 'Aucun champ démographique détecté dans ce fichier.',
      noDataHelp: "Formats supportés : 'Audience FR 25-34 Homme', 'FR_35_44_Female', '45-54 H'...",
      partialDataInfo: 'Certaines tranches d\'âge ne sont pas renseignées dans cette publicité.',
      partialDataDetail: (availableGroups: string[], completeness: number) => 
        `Tranches disponibles : ${availableGroups.join(', ')} ans (${completeness}%)`
    };
  }
};
