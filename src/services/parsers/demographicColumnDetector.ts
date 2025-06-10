
export interface DemographicColumnMapping {
  audience_fr_18_24_h: number | null;
  audience_fr_18_24_f: number | null;
  audience_fr_25_34_h: number | null;
  audience_fr_25_34_f: number | null;
  audience_fr_35_44_h: number | null;
  audience_fr_35_44_f: number | null;
  audience_fr_45_54_h: number | null;
  audience_fr_45_54_f: number | null;
  audience_fr_55_64_h: number | null;
  audience_fr_55_64_f: number | null;
  audience_fr_65_plus_h: number | null;
  audience_fr_65_plus_f: number | null;
}

interface FlexiblePattern {
  regex: RegExp;
  ageGroupMap: (matches: RegExpMatchArray) => string;
  genderMap: (matches: RegExpMatchArray) => string;
  description: string;
}

export const demographicColumnDetector = {
  detectDemographicColumns(headers: string[]): DemographicColumnMapping {
    const mapping: DemographicColumnMapping = {
      audience_fr_18_24_h: null,
      audience_fr_18_24_f: null,
      audience_fr_25_34_h: null,
      audience_fr_25_34_f: null,
      audience_fr_35_44_h: null,
      audience_fr_35_44_f: null,
      audience_fr_45_54_h: null,
      audience_fr_45_54_f: null,
      audience_fr_55_64_h: null,
      audience_fr_55_64_f: null,
      audience_fr_65_plus_h: null,
      audience_fr_65_plus_f: null,
    };

    // Patterns flexibles pour détecter différents formats
    const flexiblePatterns: FlexiblePattern[] = [
      {
        // Format principal : "Audience FR 25-34 Homme"
        regex: /Audience\s*(FR|France)\s*(\d{2})[-_\s](\d{2})\s*(Homme|Femme)/i,
        ageGroupMap: (matches) => `${matches[2]}_${matches[3]}`,
        genderMap: (matches) => matches[4].toLowerCase().startsWith('h') ? 'h' : 'f',
        description: 'Format Audience FR XX-XX Genre'
      },
      {
        // Format avec + : "Audience FR 65+ Femme"
        regex: /Audience\s*(FR|France)\s*(\d{2})\+\s*(Homme|Femme)/i,
        ageGroupMap: (matches) => `${matches[2]}_plus`,
        genderMap: (matches) => matches[3].toLowerCase().startsWith('h') ? 'h' : 'f',
        description: 'Format Audience FR XX+ Genre'
      },
      {
        // Format underscore : "FR_25_34_Male"
        regex: /(FR|France)[-_](\d{2})[-_](\d{2})[-_](Male|Female|Homme|Femme|H|F|M)/i,
        ageGroupMap: (matches) => `${matches[2]}_${matches[3]}`,
        genderMap: (matches) => {
          const gender = matches[4].toLowerCase();
          return (gender.startsWith('h') || gender.startsWith('m')) ? 'h' : 'f';
        },
        description: 'Format FR_XX_XX_Genre'
      },
      {
        // Format underscore avec + : "FR_65_plus_Female"
        regex: /(FR|France)[-_](\d{2})[-_](plus|PLUS|\+)[-_](Male|Female|Homme|Femme|H|F|M)/i,
        ageGroupMap: (matches) => `${matches[2]}_plus`,
        genderMap: (matches) => {
          const gender = matches[4].toLowerCase();
          return (gender.startsWith('h') || gender.startsWith('m')) ? 'h' : 'f';
        },
        description: 'Format FR_XX_plus_Genre'
      },
      {
        // Format simple : "25-34 H" ou "35-44 F"
        regex: /(\d{2})[-_\s](\d{2})\s*(H|F|Homme|Femme|Male|Female)/i,
        ageGroupMap: (matches) => `${matches[1]}_${matches[2]}`,
        genderMap: (matches) => {
          const gender = matches[3].toLowerCase();
          return (gender.startsWith('h') || gender.startsWith('m')) ? 'h' : 'f';
        },
        description: 'Format XX-XX Genre'
      },
      {
        // Format simple avec + : "65+ F"
        regex: /(\d{2})\+\s*(H|F|Homme|Femme|Male|Female)/i,
        ageGroupMap: (matches) => `${matches[1]}_plus`,
        genderMap: (matches) => {
          const gender = matches[2].toLowerCase();
          return (gender.startsWith('h') || gender.startsWith('m')) ? 'h' : 'f';
        },
        description: 'Format XX+ Genre'
      }
    ];

    console.log('🔍 Début détection démographique flexible sur', headers.length, 'colonnes');

    headers.forEach((header, index) => {
      const normalizedHeader = header.trim();
      
      // Essayer chaque pattern flexible
      for (const pattern of flexiblePatterns) {
        const matches = normalizedHeader.match(pattern.regex);
        if (matches) {
          const ageGroup = pattern.ageGroupMap(matches);
          const gender = pattern.genderMap(matches);
          
          // Construire la clé standardisée
          const fieldKey = `audience_fr_${ageGroup}_${gender}` as keyof DemographicColumnMapping;
          
          // Vérifier que la clé existe dans notre mapping
          if (fieldKey in mapping && mapping[fieldKey] === null) {
            mapping[fieldKey] = index;
            console.log(`🎯 Colonne démographique détectée: "${header}" -> ${fieldKey} (${pattern.description})`);
          } else if (fieldKey in mapping) {
            console.log(`⚠️ Colonne démographique déjà mappée: "${header}" -> ${fieldKey}`);
          } else {
            console.log(`❌ Clé inconnue générée: "${header}" -> ${fieldKey}`);
          }
          break; // Arrêter dès qu'un pattern correspond
        }
      }
    });

    // Fallback vers l'ancienne méthode pour les formats standards
    this.detectWithLegacyMethod(headers, mapping);

    const detectedCount = Object.values(mapping).filter(v => v !== null).length;
    console.log('📊 Détection terminée:', {
      totalHeaders: headers.length,
      demographicColumnsFound: detectedCount,
      availableAgeGroups: this.getAvailableAgeGroups(mapping)
    });

    return mapping;
  },

  detectWithLegacyMethod(headers: string[], mapping: DemographicColumnMapping): void {
    const ageGroups = [
      { key: '18_24', patterns: ['18-24', '18_24', '18 24'] },
      { key: '25_34', patterns: ['25-34', '25_34', '25 34'] },
      { key: '35_44', patterns: ['35-44', '35_44', '35 44'] },
      { key: '45_54', patterns: ['45-54', '45_54', '45 54'] },
      { key: '55_64', patterns: ['55-64', '55_64', '55 64'] },
      { key: '65_plus', patterns: ['65+', '65 plus', '65_plus', '65-plus'] },
    ];

    const genderPatterns = {
      male: ['homme', 'h', 'H', 'men', 'male', 'masculin', 'm'],
      female: ['femme', 'f', 'F', 'women', 'female', 'féminin', 'w'],
    };

    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      ageGroups.forEach(({ key, patterns }) => {
        patterns.forEach(agePattern => {
          if (normalizedHeader.includes(agePattern.toLowerCase())) {
            let gender: 'h' | 'f' | null = null;
            
            if (genderPatterns.male.some(pattern => normalizedHeader.includes(pattern.toLowerCase()))) {
              gender = 'h';
            } else if (genderPatterns.female.some(pattern => normalizedHeader.includes(pattern.toLowerCase()))) {
              gender = 'f';
            }
            
            if (gender) {
              const fieldKey = `audience_fr_${key}_${gender}` as keyof DemographicColumnMapping;
              if (mapping[fieldKey] === null) {
                mapping[fieldKey] = index;
                console.log(`🎯 Colonne démographique détectée (legacy): ${header} -> ${fieldKey}`);
              }
            }
          }
        });
      });
    });
  },

  getAvailableAgeGroups(mapping: DemographicColumnMapping): string[] {
    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    return ageGroups.filter(ageGroup => {
      const key = ageGroup.replace('-', '_').replace('+', '_plus');
      const maleKey = `audience_fr_${key}_h` as keyof DemographicColumnMapping;
      const femaleKey = `audience_fr_${key}_f` as keyof DemographicColumnMapping;
      return mapping[maleKey] !== null || mapping[femaleKey] !== null;
    });
  },

  getDemographicFieldLabels(): Record<keyof DemographicColumnMapping, string> {
    return {
      audience_fr_18_24_h: 'Audience France 18-24 ans Hommes',
      audience_fr_18_24_f: 'Audience France 18-24 ans Femmes',
      audience_fr_25_34_h: 'Audience France 25-34 ans Hommes',
      audience_fr_25_34_f: 'Audience France 25-34 ans Femmes',
      audience_fr_35_44_h: 'Audience France 35-44 ans Hommes',
      audience_fr_35_44_f: 'Audience France 35-44 ans Femmes',
      audience_fr_45_54_h: 'Audience France 45-54 ans Hommes',
      audience_fr_45_54_f: 'Audience France 45-54 ans Femmes',
      audience_fr_55_64_h: 'Audience France 55-64 ans Hommes',
      audience_fr_55_64_f: 'Audience France 55-64 ans Femmes',
      audience_fr_65_plus_h: 'Audience France 65+ ans Hommes',
      audience_fr_65_plus_f: 'Audience France 65+ ans Femmes',
    };
  },

  getExpectedColumnExamples(): string[] {
    return [
      'Audience FR 18-24 Homme/Femme',
      'Audience FR 25-34 H/F',
      'FR_35_44_Male/Female',
      '45-54 Homme/Femme',
      '65+ H/F',
      '... formats flexibles supportés'
    ];
  }
};
