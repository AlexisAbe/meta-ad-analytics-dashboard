import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { AdRawData, ParsedImportResult } from '@/types/adRawData';
import { dateParser } from '@/utils/dateParser';

export interface FileParseResult {
  data: string[][];
  headers: string[];
  totalRows: number;
  detectedColumns: Record<string, number | null>;
  errors: string[];
}

export interface ColumnMapping {
  [key: string]: number | null; // key = champ AdRawData, value = index de colonne
}

export const fileParser = {
  async parseFile(file: File): Promise<FileParseResult> {
    console.log('🔍 Début du parsing de fichier:', file.name, file.type);
    
    const result: FileParseResult = {
      data: [],
      headers: [],
      totalRows: 0,
      detectedColumns: {},
      errors: []
    };

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        return await this.parseExcelFile(file);
      } else if (file.name.endsWith('.csv')) {
        return await this.parseCsvFile(file);
      } else {
        result.errors.push('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
        return result;
      }
    } catch (error) {
      result.errors.push(`Erreur lors du parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return result;
    }
  },

  async parseExcelFile(file: File): Promise<FileParseResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
          
          const result = this.processRawData(jsonData);
          console.log('✅ Fichier Excel parsé avec succès');
          resolve(result);
        } catch (error) {
          resolve({
            data: [],
            headers: [],
            totalRows: 0,
            detectedColumns: {},
            errors: [`Erreur lors du parsing Excel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  async parseCsvFile(file: File): Promise<FileParseResult> {
    return new Promise((resolve) => {
      Papa.parse<string[]>(file, {
        complete: (results: Papa.ParseResult<string[]>) => {
          try {
            const data = results.data as string[][];
            const result = this.processRawData(data);
            console.log('✅ Fichier CSV parsé avec succès');
            resolve(result);
          } catch (error) {
            resolve({
              data: [],
              headers: [],
              totalRows: 0,
              detectedColumns: {},
              errors: [`Erreur lors du parsing CSV: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
            });
          }
        },
        error: (error: Papa.ParseError) => {
          resolve({
            data: [],
            headers: [],
            totalRows: 0,
            detectedColumns: {},
            errors: [`Erreur Papa Parse: ${error.message}`]
          });
        },
        header: false,
        skipEmptyLines: true
      });
    });
  },

  processRawData(rawData: string[][]): FileParseResult {
    const result: FileParseResult = {
      data: rawData,
      headers: [],
      totalRows: rawData.length,
      detectedColumns: {},
      errors: []
    };

    if (rawData.length === 0) {
      result.errors.push('Fichier vide');
      return result;
    }

    // Première ligne = headers
    result.headers = rawData[0] || [];
    result.totalRows = rawData.length - 1; // Exclure la ligne d'en-têtes

    // Détection automatique des colonnes
    result.detectedColumns = this.detectColumns(result.headers);

    return result;
  },

  detectColumns(headers: string[]): Record<string, number | null> {
    const mapping: Record<string, number | null> = {
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
      sector: null
    };

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
      mapping[field] = index !== -1 ? index : null;
    });

    return mapping;
  },

  convertToAdData(
    rawData: string[][], 
    columnMapping: ColumnMapping, 
    forcedBrand?: string
  ): ParsedImportResult {
    console.log('🚀 Conversion vers AdRawData avec mapping:', columnMapping);
    
    const result: ParsedImportResult = {
      data: [],
      errors: [],
      warnings: [],
      totalLines: rawData.length - 1, // Exclure headers
      validLines: 0,
      excludedLines: 0,
      incompleteLines: 0
    };

    // Vérifier les colonnes obligatoires
    if (columnMapping.ad_id === null) {
      result.errors.push('Colonne ID obligatoire manquante');
      return result;
    }

    // Traiter chaque ligne (en excluant les headers)
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
      incomplètes: result.incompleteLines
    });

    return result;
  },

  parseRowToAdData(
    row: string[], 
    mapping: ColumnMapping, 
    forcedBrand?: string, 
    lineNumber?: number
  ): AdRawData | null {
    const getValue = (field: string): string => {
      const index = mapping[field];
      return index !== null && index < row.length ? (row[index] || '').toString().trim() : '';
    };

    const ad_id = getValue('ad_id');
    if (!ad_id) {
      console.log(`❌ Ligne ${lineNumber}: ID manquant`);
      return null;
    }

    // Extraction des données
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

    // Détection du format
    const format = this.detectAdFormat(body, title, getValue('format'));

    // Extraction de la marque
    const brand = forcedBrand || getValue('brand') || this.extractBrand(body, title) || 'Marque non identifiée';

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
