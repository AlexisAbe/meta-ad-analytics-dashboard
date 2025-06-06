
import { AdRawData, ParsedImportResult } from '@/types/adRawData';
import { excelParser } from './parsers/excelParser';
import { csvParser } from './parsers/csvParser';
import { dataConverter } from './parsers/dataConverter';
import { columnDetector, ColumnMapping } from './parsers/columnDetector';

export interface FileParseResult {
  data: string[][];
  headers: string[];
  totalRows: number;
  detectedColumns: Record<string, number | null>;
  errors: string[];
}

export { ColumnMapping };

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
      let parseResult: FileParseResult;
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parseResult = await excelParser.parseExcelFile(file);
      } else if (file.name.endsWith('.csv')) {
        parseResult = await csvParser.parseCsvFile(file);
      } else {
        result.errors.push('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
        return result;
      }

      // Détection automatique des colonnes
      parseResult.detectedColumns = columnDetector.detectColumns(parseResult.headers);
      
      return parseResult;
    } catch (error) {
      result.errors.push(`Erreur lors du parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return result;
    }
  },

  convertToAdData(
    rawData: string[][], 
    columnMapping: ColumnMapping, 
    forcedBrand?: string
  ): ParsedImportResult {
    return dataConverter.convertToAdData(rawData, columnMapping, forcedBrand);
  }
};
