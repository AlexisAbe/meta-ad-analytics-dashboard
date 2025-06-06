
import * as XLSX from 'xlsx';
import { FileParseResult } from '../fileParser';
import { parseDate } from '@/utils/dateParser';

export const excelParser = {
  async parseExcelFile(file: File): Promise<FileParseResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { 
            type: 'binary',
            cellDates: false,
            dateNF: 'yyyy-mm-dd'
          });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            dateNF: 'yyyy-mm-dd'
          }) as string[][];
          
          const result = this.processRawData(rawData);
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
      
      reader.onerror = () => {
        resolve({
          data: [],
          headers: [],
          totalRows: 0,
          detectedColumns: {},
          errors: ['Erreur lors de la lecture du fichier Excel']
        });
      };
      
      reader.readAsBinaryString(file);
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

    // Conversion des dates Excel pour toutes les lignes
    result.data = rawData.map((row, rowIndex) => {
      if (rowIndex === 0) return row; // Garder les headers intacts
      
      return row.map(cell => {
        if (typeof cell === 'string' && cell.trim()) {
          const parsed = parseDate(cell);
          return parsed || cell;
        }
        return cell;
      });
    });

    return result;
  }
};
