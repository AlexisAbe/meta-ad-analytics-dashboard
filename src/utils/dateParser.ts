
export const dateParser = {
  parseDate(dateStr: string): string | null {
    if (!dateStr || dateStr.trim() === '') {
      console.log('Date vide détectée');
      return null;
    }
    
    const cleanDateStr = dateStr.trim();
    
    // Détecter si c'est un numéro de série Excel (nombre entre 1 et 100000)
    const excelSerialNumber = parseFloat(cleanDateStr);
    if (!isNaN(excelSerialNumber) && excelSerialNumber > 1 && excelSerialNumber < 100000) {
      console.log(`Numéro de série Excel détecté: ${excelSerialNumber}`);
      const excelDate = this.convertExcelSerialToDate(excelSerialNumber);
      if (excelDate) {
        console.log(`Date Excel convertie: ${cleanDateStr} -> ${excelDate}`);
        return excelDate;
      }
    }
    
    // Handle DD/MM/YYYY format
    const ddmmyyyyMatch = cleanDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      // Vérifier que l'année est raisonnable
      const yearNum = parseInt(year, 10);
      if (yearNum < 2000 || yearNum > 2030) {
        console.log(`Année suspecte détectée: ${yearNum}, date: ${cleanDateStr}`);
        return null;
      }
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log(`Date DD/MM/YYYY convertie: ${cleanDateStr} -> ${formattedDate}`);
      return formattedDate;
    }
    
    // Handle YYYY-MM-DD format (already correct)
    if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const yearFromDate = parseInt(cleanDateStr.substring(0, 4), 10);
      if (yearFromDate < 2000 || yearFromDate > 2030) {
        console.log(`Année suspecte dans date YYYY-MM-DD: ${yearFromDate}, date: ${cleanDateStr}`);
        return null;
      }
      console.log(`Date YYYY-MM-DD validée: ${cleanDateStr}`);
      return cleanDateStr;
    }
    
    // Try to parse with JavaScript Date (with validation)
    try {
      const date = new Date(cleanDateStr);
      if (!isNaN(date.getTime()) && date.getFullYear() > 2000 && date.getFullYear() < 2030) {
        const formattedDate = date.toISOString().substring(0, 10);
        console.log(`Date JavaScript convertie: ${cleanDateStr} -> ${formattedDate}`);
        return formattedDate;
      } else {
        console.log(`Date avec année incorrecte: ${date.getFullYear()}, date originale: ${cleanDateStr}`);
      }
    } catch (error) {
      console.log(`Erreur lors du parsing de la date: ${cleanDateStr}`, error);
    }
    
    console.log(`Date non parsable: ${cleanDateStr}`);
    return null;
  },

  convertExcelSerialToDate(serialNumber: number): string | null {
    try {
      // Excel commence le 1er janvier 1900, mais compte à partir de 1
      // Il y a aussi un bug historique dans Excel qui compte 1900 comme année bissextile
      const excelEpoch = new Date(1899, 11, 30); // 30 décembre 1899
      
      // Ajouter le nombre de jours
      const resultDate = new Date(excelEpoch.getTime() + (serialNumber * 24 * 60 * 60 * 1000));
      
      // Vérifier que la date résultante est valide et raisonnable
      if (!isNaN(resultDate.getTime()) && 
          resultDate.getFullYear() >= 2000 && 
          resultDate.getFullYear() <= 2030) {
        return resultDate.toISOString().substring(0, 10);
      }
      
      console.log(`Date Excel hors limites: ${resultDate.getFullYear()}`);
      return null;
    } catch (error) {
      console.log(`Erreur conversion Excel serial: ${serialNumber}`, error);
      return null;
    }
  },

  getCurrentDate(): string {
    return new Date().toISOString().substring(0, 10);
  }
};
