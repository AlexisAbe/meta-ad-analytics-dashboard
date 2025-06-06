
import { AdRawData, ParsedImportResult } from '@/types/adRawData';
import { dateParser } from '@/utils/dateParser';

export const intelligentParser = {
  parseRawInputToAdData(rawInput: string, forcedBrand?: string): ParsedImportResult {
    console.log('🚀 Début du parsing intelligent des données');
    
    const result: ParsedImportResult = {
      data: [],
      errors: [],
      warnings: [],
      totalLines: 0,
      validLines: 0,
      excludedLines: 0,
      incompleteLines: 0
    };

    if (!rawInput.trim()) {
      result.errors.push('Aucune donnée fournie');
      return result;
    }

    // Étape 1: Détection du séparateur
    const separator = this.detectSeparator(rawInput);
    console.log('🔍 Séparateur détecté:', separator === '\t' ? 'TAB' : separator);

    // Étape 2: Nettoyage et normalisation
    const normalizedData = this.normalizeRawData(rawInput, separator);
    const lines = normalizedData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      result.errors.push('Il faut au moins une ligne d\'en-têtes et une ligne de données');
      return result;
    }

    // Étape 3: Analyse des headers
    const headers = lines[0].split('\t');
    const headerMapping = this.createHeaderMapping(headers);
    console.log('📋 Mapping des colonnes:', headerMapping);

    // Étape 4: Traitement des lignes de données
    result.totalLines = lines.length - 1;
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split('\t');
        const adData = this.parseLineToAdData(values, headerMapping, forcedBrand, i + 1);
        
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

    console.log('✅ Parsing terminé:', {
      total: result.totalLines,
      valides: result.validLines,
      exclues: result.excludedLines,
      incomplètes: result.incompleteLines
    });

    return result;
  },

  detectSeparator(rawInput: string): string {
    const lines = rawInput.split('\n').slice(0, 3); // Analyser les 3 premières lignes
    
    const separators = ['\t', ';', ','];
    const scores = separators.map(sep => {
      const counts = lines.map(line => line.split(sep).length);
      const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
      const consistency = counts.every(count => Math.abs(count - avgCount) <= 1);
      
      return {
        separator: sep,
        avgColumns: avgCount,
        consistency: consistency ? 1 : 0,
        score: avgColumns * (consistency ? 2 : 0.5)
      };
    });

    const bestSeparator = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return bestSeparator.separator;
  },

  normalizeRawData(rawInput: string, separator: string): string {
    // Gestion des sauts de ligne dans les cellules (problème fréquent avec Excel)
    let normalized = rawInput
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Si le séparateur n'est pas une tabulation, on convertit
    if (separator !== '\t') {
      normalized = normalized
        .split('\n')
        .map(line => line.split(separator).join('\t'))
        .join('\n');
    }

    // Nettoyer les guillemets inutiles
    normalized = normalized.replace(/"([^"]*?)"/g, '$1');

    return normalized;
  },

  createHeaderMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};
    
    const fieldMappings = {
      ad_id: ['ID de la publicité', 'Ad ID', 'ID', 'id'],
      snapshot_url: ['URL de la snapshot', 'Snapshot URL', 'URL snapshot'],
      body: ['Corps de la publicité', 'Ad Body', 'Corps', 'Body'],
      legend: ['Légendes du lien', 'Link Caption', 'Légendes'],
      description: ['Description du lien', 'Link Description', 'Description'],
      title: ['Titre du lien', 'Link Title', 'Titre'],
      audience_total: ['Audience totale en Europe', 'Audience Europe', 'Total Audience'],
      start_date: ['Date de début', 'Start Date', 'Début'],
      end_date: ['Date de fin', 'End Date', 'Fin'],
      format: ['Format créatif', 'Creative Format', 'Format']
    };

    Object.entries(fieldMappings).forEach(([field, patterns]) => {
      const index = headers.findIndex(header => 
        patterns.some(pattern => 
          header.toLowerCase().includes(pattern.toLowerCase())
        )
      );
      if (index !== -1) {
        mapping[field] = index;
      }
    });

    return mapping;
  },

  parseLineToAdData(values: string[], mapping: Record<string, number>, forcedBrand?: string, lineNumber?: number): AdRawData | null {
    const getValue = (field: string): string => {
      const index = mapping[field];
      return index !== undefined ? (values[index] || '').trim() : '';
    };

    const ad_id = getValue('ad_id');
    if (!ad_id) {
      console.log(`❌ Ligne ${lineNumber}: ID manquant`);
      return null;
    }

    // Extraction des données de base
    const rawStartDate = getValue('start_date');
    const rawEndDate = getValue('end_date');
    
    const start_date = dateParser.parseDate(rawStartDate);
    const end_date = rawEndDate ? dateParser.parseDate(rawEndDate) : dateParser.getCurrentDate();

    const audience_total = parseInt(getValue('audience_total')) || 0;
    const body = getValue('body');
    const title = getValue('title');

    // Détermination du statut
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

    // Détection automatique du format
    const format = this.detectAdFormat(body, title, getValue('format'));

    // Extraction de la marque
    const brand = forcedBrand || this.extractBrand(body, title) || 'Marque non identifiée';

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
      status,
      exclusion_reason
    };

    console.log(`📋 Ligne ${lineNumber} - Status: ${status}`, {
      ad_id,
      audience_total,
      brand,
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
    
    return 'Image'; // Par défaut
  },

  extractBrand(body: string, title: string): string | undefined {
    const content = `${body} ${title}`.toLowerCase();
    
    // Marques courantes détectables
    const brands = ['picard', 'swapn', 'carrefour', 'leclerc'];
    
    for (const brand of brands) {
      if (content.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }
    
    return undefined;
  }
};
