
export const headerMatcher = {
  getValueByHeader(headers: string[], values: string[], headerPatterns: string[]): string {
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
  }
};
