
import { dateParser } from '@/utils/dateParser';
import { headerMatcher } from '@/utils/headerMatcher';

interface ExtractedAdFields {
  audienceTotal: number;
  linkTitle: string;
  adBody: string;
  linkCaption: string;
  linkDescription: string;
  snapshotUrl: string;
  audienceData: {
    fr_18_24_h: number;
    fr_18_24_f: number;
    fr_25_34_h: number;
    fr_25_34_f: number;
    fr_35_44_h: number;
    fr_35_44_f: number;
    fr_45_54_h: number;
    fr_45_54_f: number;
    fr_55_64_h: number;
    fr_55_64_f: number;
    fr_65_plus_h: number;
    fr_65_plus_f: number;
  };
}

export const dataExtractor = {
  extractDates(headers: string[], values: string[]): { startDate: string | null; endDate: string } {
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
    
    console.log('📅 Dates extraites:', { startDateStr, endDateStr });
    
    const startDate = dateParser.parseDate(startDateStr);
    
    // Si pas de date de fin ou date de fin vide, c'est une campagne active -> date d'aujourd'hui
    let endDate: string;
    if (!endDateStr || endDateStr.trim() === '') {
      endDate = dateParser.getCurrentDate();
      console.log('📅 Date de fin manquante, campagne active détectée. Date de fin assignée:', endDate);
    } else {
      const parsedEndDate = dateParser.parseDate(endDateStr);
      if (!parsedEndDate) {
        // Si la date de fin est invalide, utiliser la date d'aujourd'hui
        endDate = dateParser.getCurrentDate();
        console.log('📅 Date de fin invalide, utilisation de la date d\'aujourd\'hui:', endDate);
      } else {
        endDate = parsedEndDate;
      }
    }

    return { startDate, endDate };
  },

  extractAdFields(headers: string[], values: string[]): ExtractedAdFields {
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

    const audienceData = {
      fr_18_24_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 18-24 Homme'])) || 0,
      fr_18_24_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 18-24 Femme'])) || 0,
      fr_25_34_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 25-34 Homme'])) || 0,
      fr_25_34_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 25-34 Femme'])) || 0,
      fr_35_44_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 35-44 Homme'])) || 0,
      fr_35_44_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 35-44 Femme'])) || 0,
      fr_45_54_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 45-54 Homme'])) || 0,
      fr_45_54_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 45-54 Femme'])) || 0,
      fr_55_64_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 55-64 Homme'])) || 0,
      fr_55_64_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 55-64 Femme'])) || 0,
      fr_65_plus_h: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 65+ Homme'])) || 0,
      fr_65_plus_f: parseInt(headerMatcher.getValueByHeader(headers, values, ['Audience FR 65+ Femme'])) || 0,
    };

    return {
      audienceTotal,
      linkTitle,
      adBody,
      linkCaption,
      linkDescription,
      snapshotUrl,
      audienceData
    };
  }
};
