
export const dateParser = {
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
  },

  getCurrentDate(): string {
    return new Date().toISOString().substring(0, 10);
  }
};
