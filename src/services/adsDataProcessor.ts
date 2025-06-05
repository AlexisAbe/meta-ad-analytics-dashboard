
import { AdsData, ProcessedSheetData } from '@/types/ads';
import { dateParser } from '@/utils/dateParser';
import { brandExtractor } from '@/utils/brandExtractor';
import { headerMatcher } from '@/utils/headerMatcher';

export const adsDataProcessor = {
  processSheetData(rawData: string, forcedBrandName?: string): ProcessedSheetData {
    const lines = rawData.trim().split('\n');
    const errors: string[] = [];
    const processedData: AdsData[] = [];
    
    if (lines.length === 0) {
      return { data: [], errors: ['Aucune donnée à traiter'], preview: [] };
    }
    
    // Headers expected (first line)
    const headers = lines[0].split('\t');
    const preview = lines.slice(0, 5).map(line => line.split('\t'));
    
    console.log('Headers detectés:', headers);
    console.log('Nombre de colonnes:', headers.length);
    console.log('Marque forcée:', forcedBrandName);
    
    // Check if we have tab-separated data
    if (headers.length === 1 && lines[0].includes(',')) {
      errors.push('Les données semblent être séparées par des virgules. Utilisez des tabulations (copiez directement depuis Google Sheets).');
      return { data: [], errors, preview };
    }
    
    if (headers.length < 6) {
      errors.push(`Trop peu de colonnes détectées (${headers.length}). Assurez-vous de copier toutes les colonnes depuis Google Sheets.`);
      return { data: [], errors, preview };
    }
    
    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split('\t');
        console.log(`Ligne ${i + 1}:`, values.slice(0, 8)); // Log first 8 values
        
        const ad = this.mapRowToAd(headers, values, forcedBrandName);
        if (ad) {
          processedData.push(ad);
        } else {
          errors.push(`Ligne ${i + 1}: Données insuffisantes (ID ou date de début manquante)`);
        }
      } catch (error) {
        errors.push(`Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
    
    console.log('Données traitées:', processedData.length);
    
    return { data: processedData, errors, preview };
  },

  mapRowToAd(headers: string[], values: string[], forcedBrandName?: string): AdsData | null {
    // Extract ID with exact Google Sheets header
    const adId = headerMatcher.getValueByHeader(headers, values, [
      'ID de la publicité',
      'ID publicité', 
      'Ad ID',
      'ID'
    ]);
                 
    if (!adId) {
      console.log('ID de publicité non trouvé. Headers disponibles:', headers.slice(0, 10));
      return null;
    }

    // Extract dates with exact Google Sheets headers
    const startDateStr = headerMatcher.getValueByHeader(headers, values, [
      'Date de début de diffusion de la publicité',
      'Date de début',
      'Start Date'
    ]);
    
    const endDateStr = headerMatcher.getValueByHeader(headers, values, [
      'Date de fin de diffusion de la publicité',
      'Date de fin',
      'End Date'
    ]);
    
    const startDate = dateParser.parseDate(startDateStr);
    
    // Si pas de date de début, on ne peut pas traiter
    if (!startDate) {
      console.log('Date de début manquante ou invalide:', startDateStr);
      return null;
    }
    
    // Si pas de date de fin ou date de fin vide, c'est une campagne active -> date d'aujourd'hui
    let endDate: string;
    if (!endDateStr || endDateStr.trim() === '') {
      endDate = dateParser.getCurrentDate();
      console.log('Date de fin manquante, campagne active détectée. Date de fin assignée:', endDate);
    } else {
      const parsedEndDate = dateParser.parseDate(endDateStr);
      if (!parsedEndDate) {
        // Si la date de fin est invalide, utiliser la date d'aujourd'hui
        endDate = dateParser.getCurrentDate();
        console.log('Date de fin invalide, utilisation de la date d\'aujourd\'hui:', endDate);
      } else {
        endDate = parsedEndDate;
      }
    }

    // Extract other fields with exact headers
    const audienceTotal = parseInt(headerMatcher.getValueByHeader(headers, values, [
      'Audience totale en Europe',
      'Audience Europe',
      'Total Audience'
    ])) || 0;
    
    const linkTitle = headerMatcher.getValueByHeader(headers, values, [
      'Titre du lien de la publicité',
      'Titre du lien',
      'Link Title'
    ]);
    
    const adBody = headerMatcher.getValueByHeader(headers, values, [
      'Corps de la publicité',
      'Ad Body',
      'Corps'
    ]);
    
    const linkCaption = headerMatcher.getValueByHeader(headers, values, [
      'Légendes du lien de la publicité',
      'Link Caption',
      'Légendes'
    ]);
    
    const linkDescription = headerMatcher.getValueByHeader(headers, values, [
      'Description du lien de la publicité',
      'Link Description',
      'Description'
    ]);
    
    const snapshotUrl = headerMatcher.getValueByHeader(headers, values, [
      'URL de la snapshot de la publicité',
      'Snapshot URL',
      'URL snapshot'
    ]);

    // Utiliser le nom de marque forcé ou extraire intelligemment
    const brand = forcedBrandName || brandExtractor.extractBrand(adBody, linkTitle, linkCaption);
    
    const daysActive = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      ad_id: adId,
      brand,
      snapshot_url: snapshotUrl,
      ad_body: adBody,
      link_caption: linkCaption,
      link_description: linkDescription,
      link_title: linkTitle,
      audience_eu_total: audienceTotal,
      start_date: startDate,
      end_date: endDate,
      audience_fr_18_24_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 18-24 Homme'])) || 0,
      audience_fr_18_24_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 18-24 Femme'])) || 0,
      audience_fr_25_34_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 25-34 Homme'])) || 0,
      audience_fr_25_34_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 25-34 Femme'])) || 0,
      audience_fr_35_44_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 35-44 Homme'])) || 0,
      audience_fr_35_44_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 35-44 Femme'])) || 0,
      audience_fr_45_54_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 45-54 Homme'])) || 0,
      audience_fr_45_54_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 45-54 Femme'])) || 0,
      audience_fr_55_64_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 55-64 Homme'])) || 0,
      audience_fr_55_64_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 55-64 Femme'])) || 0,
      audience_fr_65_plus_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 65+ Homme'])) || 0,
      audience_fr_65_plus_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 65+ Femme'])) || 0,
      days_active: daysActive,
      budget_estimated: audienceTotal * 5, // CPM estimé à 5€
      start_month: new Date(startDate).toISOString().substring(0, 7)
    };
  }
};
