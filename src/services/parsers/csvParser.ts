
import Papa from 'papaparse';
import { FileParseResult } from '../fileParser';

export const csvParser = {
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
        error: () => {
          resolve({
            data: [],
            headers: [],
            totalRows: 0,
            detectedColumns: {},
            errors: ['Erreur lors du parsing CSV']
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

    result.headers = rawData[0] || [];
    result.totalRows = rawData.length - 1;

    return result;
  }
};
