
import { AdsData, ProcessedSheetData } from '@/types/ads';

export const adsDataProcessor = {
  processSheetData(rawData: string): ProcessedSheetData {
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
    
    // Check if we have tab-separated data
    if (headers.length === 1 && lines[0].includes(',')) {
      errors.push('Les données semblent être séparées par des virgules. Utilisez des tabulations (copiez directement depuis Google Sheets).');
      return { data: [], errors, preview };
    }
    
    if (headers.length < 3) {
      errors.push(`Trop peu de colonnes détectées (${headers.length}). Assurez-vous de copier toutes les colonnes depuis Google Sheets.`);
      return { data: [], errors, preview };
    }
    
    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split('\t');
        console.log(`Ligne ${i + 1}:`, values.slice(0, 5)); // Log first 5 values
        
        const ad = this.mapRowToAd(headers, values);
        if (ad) {
          processedData.push(ad);
        } else {
          errors.push(`Ligne ${i + 1}: Données insuffisantes (ID ou dates manquantes)`);
        }
      } catch (error) {
        errors.push(`Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
    
    console.log('Données traitées:', processedData.length);
    
    return { data: processedData, errors, preview };
  },

  mapRowToAd(headers: string[], values: string[]): AdsData | null {
    const getValueByHeader = (headerPattern: string): string => {
      const index = headers.findIndex(h => 
        h.toLowerCase().includes(headerPattern.toLowerCase()) ||
        headerPattern.toLowerCase().includes(h.toLowerCase())
      );
      const value = index !== -1 ? values[index] || '' : '';
      console.log(`Recherche "${headerPattern}": index=${index}, valeur="${value}"`);
      return value;
    };

    // Try different variations of ID field
    const adId = getValueByHeader('ID de la publicité') || 
                 getValueByHeader('ID publicité') || 
                 getValueByHeader('Ad ID') ||
                 getValueByHeader('ID');
                 
    if (!adId) {
      console.log('ID de publicité non trouvé. Headers disponibles:', headers);
      return null;
    }

    const startDateStr = getValueByHeader('Date de début') || getValueByHeader('Start Date');
    const endDateStr = getValueByHeader('Date de fin') || getValueByHeader('End Date');
    
    const startDate = this.parseDate(startDateStr);
    const endDate = this.parseDate(endDateStr);
    
    if (!startDate || !endDate) {
      console.log('Dates invalides:', { startDateStr, endDateStr, startDate, endDate });
      return null;
    }

    const audienceTotal = parseInt(getValueByHeader('Audience totale en Europe') || 
                                 getValueByHeader('Audience Europe') ||
                                 getValueByHeader('Total Audience')) || 0;
    const daysActive = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      ad_id: adId,
      brand: getValueByHeader('Marque') || getValueByHeader('Brand') || 'Unknown',
      link_title: getValueByHeader('Titre du lien') || getValueByHeader('Link Title'),
      audience_eu_total: audienceTotal,
      start_date: startDate,
      end_date: endDate,
      audience_fr_18_24_h: parseInt(getValueByHeader('Audience FR 18-24 H')) || 0,
      audience_fr_18_24_f: parseInt(getValueByHeader('Audience FR 18-24 F')) || 0,
      audience_fr_25_34_h: parseInt(getValueByHeader('Audience FR 25-34 H')) || 0,
      audience_fr_25_34_f: parseInt(getValueByHeader('Audience FR 25-34 F')) || 0,
      audience_fr_35_44_h: parseInt(getValueByHeader('Audience FR 35-44 H')) || 0,
      audience_fr_35_44_f: parseInt(getValueByHeader('Audience FR 35-44 F')) || 0,
      audience_fr_45_54_h: parseInt(getValueByHeader('Audience FR 45-54 H')) || 0,
      audience_fr_45_54_f: parseInt(getValueByHeader('Audience FR 45-54 F')) || 0,
      audience_fr_55_64_h: parseInt(getValueByHeader('Audience FR 55-64 H')) || 0,
      audience_fr_55_64_f: parseInt(getValueByHeader('Audience FR 55-64 F')) || 0,
      audience_fr_65_plus_h: parseInt(getValueByHeader('Audience FR 65+ H')) || 0,
      audience_fr_65_plus_f: parseInt(getValueByHeader('Audience FR 65+ F')) || 0,
      days_active: daysActive,
      budget_estimated: audienceTotal * 5, // CPM estimé à 5€
      start_month: new Date(startDate).toISOString().substring(0, 7)
    };
  },

  parseDate(dateStr: string): string | null {
    if (!dateStr) return null;
    
    // Handle DD/MM/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    
    // Handle other formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().substring(0, 10);
    }
    
    return null;
  }
};
