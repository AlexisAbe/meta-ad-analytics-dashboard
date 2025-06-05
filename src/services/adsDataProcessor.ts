
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
    
    if (headers.length < 6) {
      errors.push(`Trop peu de colonnes détectées (${headers.length}). Assurez-vous de copier toutes les colonnes depuis Google Sheets.`);
      return { data: [], errors, preview };
    }
    
    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split('\t');
        console.log(`Ligne ${i + 1}:`, values.slice(0, 8)); // Log first 8 values
        
        const ad = this.mapRowToAd(headers, values);
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

  mapRowToAd(headers: string[], values: string[]): AdsData | null {
    const getValueByHeader = (headerPatterns: string[]): string => {
      for (const pattern of headerPatterns) {
        const index = headers.findIndex(h => 
          h.toLowerCase().trim() === pattern.toLowerCase().trim() ||
          h.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(h.toLowerCase())
        );
        if (index !== -1) {
          const value = values[index] || '';
          console.log(`Trouvé "${pattern}": index=${index}, valeur="${value.substring(0, 50)}..."`);
          return value;
        }
      }
      console.log(`Aucun pattern trouvé pour:`, headerPatterns);
      return '';
    };

    // Extract ID with exact Google Sheets header
    const adId = getValueByHeader([
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
    const startDateStr = getValueByHeader([
      'Date de début de diffusion de la publicité',
      'Date de début',
      'Start Date'
    ]);
    
    const endDateStr = getValueByHeader([
      'Date de fin de diffusion de la publicité',
      'Date de fin',
      'End Date'
    ]);
    
    const startDate = this.parseDate(startDateStr);
    
    // Si pas de date de début, on ne peut pas traiter
    if (!startDate) {
      console.log('Date de début manquante ou invalide:', startDateStr);
      return null;
    }
    
    // Si pas de date de fin ou date de fin vide, c'est une campagne active -> date d'aujourd'hui
    let endDate: string;
    if (!endDateStr || endDateStr.trim() === '') {
      endDate = new Date().toISOString().substring(0, 10);
      console.log('Date de fin manquante, campagne active détectée. Date de fin assignée:', endDate);
    } else {
      const parsedEndDate = this.parseDate(endDateStr);
      if (!parsedEndDate) {
        // Si la date de fin est invalide, utiliser la date d'aujourd'hui
        endDate = new Date().toISOString().substring(0, 10);
        console.log('Date de fin invalide, utilisation de la date d\'aujourd\'hui:', endDate);
      } else {
        endDate = parsedEndDate;
      }
    }

    // Extract other fields with exact headers
    const audienceTotal = parseInt(getValueByHeader([
      'Audience totale en Europe',
      'Audience Europe',
      'Total Audience'
    ])) || 0;
    
    const linkTitle = getValueByHeader([
      'Titre du lien de la publicité',
      'Titre du lien',
      'Link Title'
    ]);
    
    const adBody = getValueByHeader([
      'Corps de la publicité',
      'Ad Body',
      'Corps'
    ]);
    
    const linkCaption = getValueByHeader([
      'Légendes du lien de la publicité',
      'Link Caption',
      'Légendes'
    ]);
    
    const linkDescription = getValueByHeader([
      'Description du lien de la publicité',
      'Link Description',
      'Description'
    ]);
    
    const snapshotUrl = getValueByHeader([
      'URL de la snapshot de la publicité',
      'Snapshot URL',
      'URL snapshot'
    ]);

    // Extract brand intelligently
    const brand = this.extractBrand(adBody, linkTitle, linkCaption);
    
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
      audience_fr_18_24_h: parseInt(getValueByHeader(['Audience FR 18-24 Homme'])) || 0,
      audience_fr_18_24_f: parseInt(getValueByHeader(['Audience FR 18-24 Femme'])) || 0,
      audience_fr_25_34_h: parseInt(getValueByHeader(['Audience FR 25-34 Homme'])) || 0,
      audience_fr_25_34_f: parseInt(getValueByHeader(['Audience FR 25-34 Femme'])) || 0,
      audience_fr_35_44_h: parseInt(getValueByHeader(['Audience FR 35-44 Homme'])) || 0,
      audience_fr_35_44_f: parseInt(getValueByHeader(['Audience FR 35-44 Femme'])) || 0,
      audience_fr_45_54_h: parseInt(getValueByHeader(['Audience FR 45-54 Homme'])) || 0,
      audience_fr_45_54_f: parseInt(getValueByHeader(['Audience FR 45-54 Femme'])) || 0,
      audience_fr_55_64_h: parseInt(getValueByHeader(['Audience FR 55-64 Homme'])) || 0,
      audience_fr_55_64_f: parseInt(getValueByHeader(['Audience FR 55-64 Femme'])) || 0,
      audience_fr_65_plus_h: parseInt(getValueByHeader(['Audience FR 65+ Homme'])) || 0,
      audience_fr_65_plus_f: parseInt(getValueByHeader(['Audience FR 65+ Femme'])) || 0,
      days_active: daysActive,
      budget_estimated: audienceTotal * 5, // CPM estimé à 5€
      start_month: new Date(startDate).toISOString().substring(0, 7)
    };
  },

  extractBrand(adBody: string, linkTitle: string, linkCaption: string): string {
    const content = `${adBody} ${linkTitle} ${linkCaption}`.toLowerCase();
    
    // Liste des marques courantes à détecter
    const knownBrands = [
      'picard', 'carrefour', 'leclerc', 'auchan', 'intermarché', 'monoprix',
      'franprix', 'casino', 'super u', 'système u', 'cora', 'match',
      'mcdonalds', 'kfc', 'burger king', 'quick', 'dominos', 'pizza hut',
      'nike', 'adidas', 'puma', 'decathlon', 'go sport',
      'fnac', 'darty', 'boulanger', 'cdiscount', 'amazon', 'zalando',
      'sncf', 'blablacar', 'uber', 'booking', 'airbnb',
      'orange', 'sfr', 'bouygues', 'free', 'red',
      'bmw', 'mercedes', 'audi', 'peugeot', 'renault', 'citroën',
      'credit agricole', 'bnp paribas', 'societe generale', 'lcl', 'boursorama'
    ];
    
    for (const brand of knownBrands) {
      if (content.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }
    
    // Si aucune marque connue, essayer d'extraire depuis l'URL ou le domaine
    const urlMatch = content.match(/([a-zA-Z0-9-]+)\.(?:fr|com|org|net)/);
    if (urlMatch) {
      return urlMatch[1].charAt(0).toUpperCase() + urlMatch[1].slice(1);
    }
    
    return 'Marque non identifiée';
  },

  parseDate(dateStr: string): string | null {
    if (!dateStr || dateStr.trim() === '') {
      console.log('Date vide détectée');
      return null;
    }
    
    const cleanDateStr = dateStr.trim();
    
    // Handle DD/MM/YYYY format
    const ddmmyyyyMatch = cleanDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log(`Date DD/MM/YYYY convertie: ${cleanDateStr} -> ${formattedDate}`);
      return formattedDate;
    }
    
    // Handle YYYY-MM-DD format (already correct)
    if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log(`Date YYYY-MM-DD validée: ${cleanDateStr}`);
      return cleanDateStr;
    }
    
    // Try to parse with JavaScript Date (with validation)
    try {
      const date = new Date(cleanDateStr);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        const formattedDate = date.toISOString().substring(0, 10);
        console.log(`Date JavaScript convertie: ${cleanDateStr} -> ${formattedDate}`);
        return formattedDate;
      }
    } catch (error) {
      console.log(`Erreur lors du parsing de la date: ${cleanDateStr}`, error);
    }
    
    console.log(`Date non parsable: ${cleanDateStr}`);
    return null;
  }
};
