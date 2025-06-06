
import { demographicColumnDetector, DemographicColumnMapping } from './demographicColumnDetector';

export interface ColumnMapping {
  [key: string]: number | null;
}

export interface ExtendedColumnMapping extends ColumnMapping, DemographicColumnMapping {}

export const columnDetector = {
  createEmptyMapping(): ExtendedColumnMapping {
    return {
      // Standard columns
      ad_id: null,
      snapshot_url: null,
      body: null,
      legend: null,
      description: null,
      title: null,
      audience_total: null,
      start_date: null,
      end_date: null,
      format: null,
      brand: null,
      sector: null,
      // Demographic columns
      audience_fr_18_24_h: null,
      audience_fr_18_24_f: null,
      audience_fr_25_34_h: null,
      audience_fr_25_34_f: null,
      audience_fr_35_44_h: null,
      audience_fr_35_44_f: null,
      audience_fr_45_54_h: null,
      audience_fr_45_54_f: null,
      audience_fr_55_64_h: null,
      audience_fr_55_64_f: null,
      audience_fr_65_plus_h: null,
      audience_fr_65_plus_f: null,
    };
  },

  detectColumns(headers: string[]): ExtendedColumnMapping {
    const mapping = this.createEmptyMapping();

    const fieldPatterns = {
      ad_id: ['ID de la publicité', 'Ad ID', 'ID', 'id', 'ad_id'],
      snapshot_url: ['URL de la snapshot', 'Snapshot URL', 'URL snapshot', 'snapshot_url'],
      body: ['Corps de la publicité', 'Ad Body', 'Corps', 'Body', 'body'],
      legend: ['Légendes du lien', 'Link Caption', 'Légendes', 'legend'],
      description: ['Description du lien', 'Link Description', 'Description', 'description'],
      title: ['Titre du lien', 'Link Title', 'Titre', 'title'],
      audience_total: ['Audience totale en Europe', 'Audience Europe', 'Total Audience', 'audience_total'],
      start_date: ['Date de début', 'Start Date', 'Début', 'start_date'],
      end_date: ['Date de fin', 'End Date', 'Fin', 'end_date'],
      format: ['Format créatif', 'Creative Format', 'Format', 'format'],
      brand: ['Marque', 'Brand', 'brand'],
      sector: ['Secteur', 'Sector', 'sector']
    };

    Object.entries(fieldPatterns).forEach(([field, patterns]) => {
      const index = headers.findIndex(header => 
        patterns.some(pattern => 
          header.toLowerCase().trim().includes(pattern.toLowerCase())
        )
      );
      if (index !== -1) {
        mapping[field as keyof ExtendedColumnMapping] = index;
      }
    });

    // Ajouter la détection des colonnes démographiques
    const demographicMapping = demographicColumnDetector.detectDemographicColumns(headers);
    
    console.log('🔍 Détection démographique:', {
      totalHeaders: headers.length,
      demographicColumnsFound: Object.values(demographicMapping).filter(v => v !== null).length
    });

    // Merge demographic mapping into main mapping
    Object.assign(mapping, demographicMapping);

    return mapping;
  }
};
