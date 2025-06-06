import { AdRawData, ParsedImportResult } from '@/types/adRawData';
import { dateParser } from '@/utils/dateParser';
import { ExtendedColumnMapping } from './columnDetector';

export const dataConverter = {
  convertToAdData(
    rawData: string[][], 
    columnMapping: ExtendedColumnMapping, 
    forcedBrand?: string
  ): ParsedImportResult {
    console.log('🚀 Conversion vers AdRawData avec mapping étendu:', columnMapping);
    console.log('🏷️ Marque forcée reçue:', forcedBrand);
    
    const result: ParsedImportResult = {
      data: [],
      errors: [],
      warnings: [],
      totalLines: rawData.length - 1,
      validLines: 0,
      excludedLines: 0,
      incompleteLines: 0
    };

    if (columnMapping.ad_id === null) {
      result.errors.push('Colonne ID obligatoire manquante');
      return result;
    }

    // Vérification des colonnes démographiques
    const demographicColumns = [
      'audience_fr_18_24_h', 'audience_fr_18_24_f',
      'audience_fr_25_34_h', 'audience_fr_25_34_f',
      'audience_fr_35_44_h', 'audience_fr_35_44_f',
      'audience_fr_45_54_h', 'audience_fr_45_54_f',
      'audience_fr_55_64_h', 'audience_fr_55_64_f',
      'audience_fr_65_plus_h', 'audience_fr_65_plus_f'
    ];

    const missingDemographicColumns = demographicColumns.filter(col => 
      columnMapping[col as keyof ExtendedColumnMapping] === null
    );

    if (missingDemographicColumns.length > 0) {
      result.warnings.push(`Colonnes démographiques manquantes (${missingDemographicColumns.length}/12): les données démographiques ne seront pas disponibles`);
    }

    for (let i = 1; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        const adData = this.parseRowToAdData(row, columnMapping, forcedBrand, i + 1);
        
        if (adData) {
          result.data.push(adData);
          
          switch (adData.status) {
            case 'valide':
              result.validLines++;
              break;
            case 'exclue':
              result.excludedLines++;
              break;
            case 'incomplète':
              result.incompleteLines++;
              break;
          }
        }
      } catch (error) {
        result.errors.push(`Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    console.log('✅ Conversion terminée:', {
      total: result.totalLines,
      valides: result.validLines,
      exclues: result.excludedLines,
      incomplètes: result.incompleteLines,
      marqueUtilisee: forcedBrand,
      colonnesDemographiques: 12 - missingDemographicColumns.length
    });

    return result;
  },

  parseRowToAdData(
    row: string[], 
    mapping: ExtendedColumnMapping, 
    forcedBrand?: string, 
    lineNumber?: number
  ): AdRawData | null {
    const getValue = (field: string): string => {
      const index = mapping[field as keyof ExtendedColumnMapping];
      return index !== null && index < row.length ? (row[index] || '').toString().trim() : '';
    };

    const getNumericValue = (field: string): number => {
      const value = getValue(field);
      return parseInt(value) || 0;
    };

    const ad_id = getValue('ad_id');
    if (!ad_id) {
      console.log(`❌ Ligne ${lineNumber}: ID manquant`);
      return null;
    }

    const rawStartDate = getValue('start_date');
    const rawEndDate = getValue('end_date');
    
    console.log(`📅 Ligne ${lineNumber} - Dates brutes:`, { rawStartDate, rawEndDate });
    
    const start_date = dateParser.parseDate(rawStartDate);
    const end_date = rawEndDate ? dateParser.parseDate(rawEndDate) : dateParser.getCurrentDate();

    const audience_total = parseInt(getValue('audience_total')) || 0;
    const body = getValue('body');
    const title = getValue('title');

    let status: AdRawData['status'] = 'valide';
    let exclusion_reason: string | undefined;

    if (!start_date) {
      status = 'exclue';
      exclusion_reason = 'Date de début invalide';
    } else if (audience_total === 0) {
      status = 'exclue';
      exclusion_reason = 'Audience nulle';
    } else if (!body && !title) {
      status = 'incomplète';
      exclusion_reason = 'Contenu publicitaire manquant';
    } else if (end_date && new Date(end_date) < new Date(start_date)) {
      status = 'exclue';
      exclusion_reason = 'Date de fin antérieure à la date de début';
    }

    const format = this.detectAdFormat(body, title, getValue('format'));

    // PRIORITÉ À LA MARQUE FORCÉE
    let brand: string;
    if (forcedBrand && forcedBrand.trim()) {
      brand = forcedBrand.trim();
      console.log(`🏷️ Ligne ${lineNumber} - Marque forcée utilisée: ${brand}`);
    } else {
      const detectedBrand = getValue('brand') || this.extractBrand(body, title);
      brand = detectedBrand || 'Marque non identifiée';
      console.log(`🏷️ Ligne ${lineNumber} - Marque détectée/défaut: ${brand}`);
    }

    // Extraction des données démographiques
    const audience_breakdown: Record<string, number> = {
      'audience_fr_18_24_h': getNumericValue('audience_fr_18_24_h'),
      'audience_fr_18_24_f': getNumericValue('audience_fr_18_24_f'),
      'audience_fr_25_34_h': getNumericValue('audience_fr_25_34_h'),
      'audience_fr_25_34_f': getNumericValue('audience_fr_25_34_f'),
      'audience_fr_35_44_h': getNumericValue('audience_fr_35_44_h'),
      'audience_fr_35_44_f': getNumericValue('audience_fr_35_44_f'),
      'audience_fr_45_54_h': getNumericValue('audience_fr_45_54_h'),
      'audience_fr_45_54_f': getNumericValue('audience_fr_45_54_f'),
      'audience_fr_55_64_h': getNumericValue('audience_fr_55_64_h'),
      'audience_fr_55_64_f': getNumericValue('audience_fr_55_64_f'),
      'audience_fr_65_plus_h': getNumericValue('audience_fr_65_plus_h'),
      'audience_fr_65_plus_f': getNumericValue('audience_fr_65_plus_f'),
    };

    // Validation des données démographiques
    const totalDemographic = Object.values(audience_breakdown).reduce((sum, val) => sum + val, 0);
    if (totalDemographic > audience_total * 1.1) { // Tolérance de 10%
      status = 'incomplète';
      exclusion_reason = 'Incohérence dans les données démographiques (somme > audience totale)';
    }

    const adData: AdRawData = {
      ad_id,
      snapshot_url: getValue('snapshot_url'),
      body,
      legend: getValue('legend'),
      description: getValue('description'),
      title,
      audience_total,
      start_date: start_date || '',
      end_date,
      brand,
      format,
      sector: getValue('sector'),
      audience_breakdown,
      status,
      exclusion_reason
    };

    console.log(`📋 Ligne ${lineNumber} - Status: ${status}`, {
      ad_id,
      audience_total,
      brand,
      start_date,
      end_date,
      totalDemographic,
      exclusion_reason
    });

    return adData;
  },

  detectAdFormat(body: string, title: string, explicitFormat?: string): AdRawData['format'] {
    if (explicitFormat) {
      const normalized = explicitFormat.toLowerCase();
      if (normalized.includes('vidéo') || normalized.includes('video')) return 'Vidéo';
      if (normalized.includes('image')) return 'Image';
      if (normalized.includes('carrousel') || normalized.includes('carousel')) return 'Carrousel';
    }

    const content = `${body} ${title}`.toLowerCase();
    
    if (content.includes('vidéo') || content.includes('video')) return 'Vidéo';
    if (content.includes('carrousel') || content.includes('carousel')) return 'Carrousel';
    
    return 'Image';
  },

  extractBrand(body: string, title: string): string | undefined {
    const content = `${body} ${title}`.toLowerCase();
    
    const brands = ['picard', 'swapn', 'carrefour', 'leclerc'];
    
    for (const brand of brands) {
      if (content.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }
    
    return undefined;
  }
};
