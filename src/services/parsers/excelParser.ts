
import * as XLSX from 'xlsx';
import { FileParseResult } from '../fileParser';

export const excelParser = {
  async parseExcelFile(file: File): Promise<FileParseResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Configuration optimisée pour gérer les dates Excel
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
            header: 1, 
            raw: false,
            dateNF: 'yyyy-mm-dd',
            cellDates: true,
            cellNF: false,
            cellText: false
          }) as string[][];
          
          // Post-traitement pour s'assurer que les dates Excel sont bien converties
          const processedData = this.postProcessExcelData(jsonData);
          
          const result = this.processRawData(processedData);
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

  postProcessExcelData(rawData: string[][]): string[][] {
    return rawData.map((row, rowIndex) => {
      if (rowIndex === 0) return row; // Headers unchanged
      
      return row.map((cell, cellIndex) => {
        if (cell === null || cell === undefined) return '';
        
        const cellStr = cell.toString();
        
        // Détecter les numéros de série Excel pour les dates
        const cellNum = parseFloat(cellStr);
        if (!isNaN(cellNum) && cellNum > 40000 && cellNum < 50000) {
          console.log(`🔄 Conversion date Excel détectée: ${cellStr} (ligne ${rowIndex + 1}, colonne ${cellIndex + 1})`);
          const convertedDate = this.convertExcelSerialToDate(cellNum);
          if (convertedDate) {
            console.log(`✅ Date convertie: ${cellStr} -> ${convertedDate}`);
            return convertedDate;
          }
        }
        
        return cellStr;
      });
    });
  },

  convertExcelSerialToDate(serialNumber: number): string | null {
    try {
      // Excel commence le 1er janvier 1900, mais compte à partir de 1
      const excelEpoch = new Date(1899, 11, 30); // 30 décembre 1899
      const resultDate = new Date(excelEpoch.getTime() + (serialNumber * 24 * 60 * 60 * 1000));
      
      if (!isNaN(resultDate.getTime()) && 
          resultDate.getFullYear() >= 2000 && 
          resultDate.getFullYear() <= 2030) {
        return resultDate.toISOString().substring(0, 10);
      }
      
      return null;
    } catch (error) {
      console.log(`Erreur conversion Excel serial: ${serialNumber}`, error);
      return null;
    }
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
