
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  correctedData?: string;
  suggestions: string[];
}

export const dataValidator = {
  validateAndCorrectSheetData(rawData: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: []
    };

    if (!rawData.trim()) {
      result.errors.push('Aucune donnée fournie');
      return result;
    }

    const lines = rawData.trim().split('\n');
    console.log('🔍 Validation - Nombre de lignes:', lines.length);

    if (lines.length < 2) {
      result.errors.push('Il faut au moins une ligne d\'en-têtes et une ligne de données');
      return result;
    }

    // Analyse de la structure
    const structureAnalysis = this.analyzeDataStructure(lines);
    console.log('🔍 Analyse structure:', structureAnalysis);

    // Détection du séparateur
    const separator = this.detectSeparator(lines);
    console.log('🔍 Séparateur détecté:', separator);

    if (separator !== '\t') {
      result.warnings.push(`Données séparées par "${separator}" au lieu de tabulations. Tentative de correction...`);
      result.suggestions.push('Copiez directement depuis Google Sheets pour avoir des tabulations');
    }

    // Correction automatique de la structure
    try {
      const correctedLines = this.correctDataStructure(lines, separator, structureAnalysis);
      result.correctedData = correctedLines.join('\n');
      
      // Validation des données corrigées
      const validationCheck = this.validateCorrectedData(correctedLines);
      result.errors.push(...validationCheck.errors);
      result.warnings.push(...validationCheck.warnings);
      result.suggestions.push(...validationCheck.suggestions);
      
      result.isValid = validationCheck.errors.length === 0;
      
    } catch (error) {
      result.errors.push(`Erreur lors de la correction: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return result;
  },

  analyzeDataStructure(lines: string[]) {
    const separatorCounts = {
      tab: 0,
      comma: 0,
      semicolon: 0
    };

    const columnCounts: number[] = [];

    lines.forEach((line, index) => {
      if (line.includes('\t')) separatorCounts.tab++;
      if (line.includes(',')) separatorCounts.comma++;
      if (line.includes(';')) separatorCounts.semicolon++;

      // Compter les colonnes avec différents séparateurs
      const tabCount = line.split('\t').length;
      const commaCount = line.split(',').length;
      const semicolonCount = line.split(';').length;

      columnCounts.push(Math.max(tabCount, commaCount, semicolonCount));
    });

    return {
      separatorCounts,
      columnCounts,
      avgColumns: columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length,
      inconsistentStructure: new Set(columnCounts).size > 2
    };
  },

  detectSeparator(lines: string[]): string {
    const headerLine = lines[0];
    const dataLine = lines[1] || '';

    // Priorité: tabulation > point-virgule > virgule
    if (headerLine.includes('\t') && dataLine.includes('\t')) {
      return '\t';
    }
    if (headerLine.includes(';') && dataLine.includes(';')) {
      return ';';
    }
    if (headerLine.includes(',') && dataLine.includes(',')) {
      return ',';
    }

    return '\t'; // Par défaut
  },

  correctDataStructure(lines: string[], separator: string, analysis: any): string[] {
    const correctedLines: string[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return; // Ignorer les lignes vides

      let values = line.split(separator);
      
      // Nettoyer les valeurs
      values = values.map(value => value.trim().replace(/^"|"$/g, '')); // Supprimer les guillemets

      // Si c'est la première ligne (headers), la garder telle quelle
      if (index === 0) {
        correctedLines.push(values.join('\t'));
        return;
      }

      // Validation spécifique pour les données
      const correctedValues = this.correctDataValues(values, index);
      
      if (correctedValues.length > 0) {
        correctedLines.push(correctedValues.join('\t'));
      }
    });

    return correctedLines;
  },

  correctDataValues(values: string[], lineIndex: number): string[] {
    // Si pas assez de valeurs, ignorer la ligne
    if (values.length < 3) {
      console.log(`⚠️ Ligne ${lineIndex + 1} ignorée: trop peu de valeurs (${values.length})`);
      return [];
    }

    const corrected = [...values];

    // Correction de l'ID (première colonne)
    if (corrected[0]) {
      // Nettoyer l'ID - doit être numérique
      const cleanId = corrected[0].replace(/[^\d]/g, '');
      if (cleanId.length > 10) { // ID Facebook typique
        corrected[0] = cleanId;
      } else if (!cleanId) {
        console.log(`⚠️ Ligne ${lineIndex + 1}: ID invalide "${corrected[0]}"`);
        return []; // Ignorer cette ligne
      }
    }

    // Correction des dates
    corrected.forEach((value, index) => {
      if (this.looksLikeDate(value)) {
        const correctedDate = this.correctDateFormat(value);
        if (correctedDate) {
          corrected[index] = correctedDate;
        }
      }
    });

    return corrected;
  },

  looksLikeDate(value: string): boolean {
    if (!value || value.trim() === '') return false;
    
    // Détecter les patterns de date
    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(value) || // DD/MM/YYYY ou DD-MM-YYYY
           /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(value) || // YYYY/MM/DD
           /^\d{4,5}$/.test(value.trim()); // Nombre Excel (jours depuis 1900)
  },

  correctDateFormat(dateValue: string): string | null {
    if (!dateValue || dateValue.trim() === '') return null;

    const trimmed = dateValue.trim();

    // Si c'est un nombre Excel (jours depuis 1900-01-01)
    if (/^\d{4,5}$/.test(trimmed)) {
      const excelDate = parseInt(trimmed, 10);
      if (excelDate > 1000 && excelDate < 100000) {
        try {
          // Conversion Excel vers date
          const baseDate = new Date(1900, 0, 1);
          const resultDate = new Date(baseDate.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
          
          if (resultDate.getFullYear() >= 2020 && resultDate.getFullYear() <= 2030) {
            const formatted = resultDate.toISOString().substring(0, 10);
            console.log(`📅 Date Excel corrigée: ${trimmed} -> ${formatted}`);
            return formatted;
          }
        } catch (error) {
          console.log(`❌ Erreur conversion date Excel: ${trimmed}`);
        }
      }
    }

    // Formats de date normaux
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const yyyymmddMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return null;
  },

  validateCorrectedData(correctedLines: string[]): { errors: string[], warnings: string[], suggestions: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (correctedLines.length < 2) {
      errors.push('Aucune donnée valide après correction');
      return { errors, warnings, suggestions };
    }

    const headers = correctedLines[0].split('\t');
    console.log('✅ En-têtes après correction:', headers);

    // Vérifier les en-têtes essentiels
    const requiredPatterns = [
      { pattern: /ID.*publicité|Ad.*ID/i, name: 'ID de publicité' },
      { pattern: /Date.*début|Start.*Date/i, name: 'Date de début' },
      { pattern: /Audience.*total|Total.*Audience/i, name: 'Audience totale' }
    ];

    requiredPatterns.forEach(({ pattern, name }) => {
      if (!headers.some(h => pattern.test(h))) {
        warnings.push(`Colonne "${name}" non trouvée dans les en-têtes`);
        suggestions.push(`Vérifiez que la colonne "${name}" est présente dans votre export Google Sheets`);
      }
    });

    // Analyser quelques lignes de données
    const dataLines = correctedLines.slice(1, 6); // 5 premières lignes
    dataLines.forEach((line, index) => {
      const values = line.split('\t');
      
      if (!values[0] || !/^\d+$/.test(values[0])) {
        warnings.push(`Ligne ${index + 2}: ID de publicité invalide "${values[0]}"`);
      }
    });

    if (warnings.length === 0) {
      suggestions.push('✅ Structure des données validée avec succès');
    }

    return { errors, warnings, suggestions };
  }
};
