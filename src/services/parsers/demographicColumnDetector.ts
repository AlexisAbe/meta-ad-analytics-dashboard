
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
          // Chercher le pattern d'âge dans le header
          if (normalizedHeader.includes(agePattern.toLowerCase())) {
            // Déterminer le genre
            let gender: 'h' | 'f' | null = null;
            
            // Chercher les patterns masculins
            if (genderPatterns.male.some(pattern => normalizedHeader.includes(pattern.toLowerCase()))) {
              gender = 'h';
            }
            // Chercher les patterns féminins
            else if (genderPatterns.female.some(pattern => normalizedHeader.includes(pattern.toLowerCase()))) {
              gender = 'f';
            }
            
            if (gender) {
              const fieldKey = `audience_fr_${key}_${gender}` as keyof DemographicColumnMapping;
              if (mapping[fieldKey] === null) { // Première correspondance trouvée
                mapping[fieldKey] = index;
                console.log(`🎯 Colonne démographique détectée: ${header} -> ${fieldKey}`);
              }
            }
          }
        });
      });
    });

    return mapping;
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
      'audience_fr_18_24_h ou "18-24 homme"',
      'audience_fr_18_24_f ou "18-24 femme"',
      'audience_fr_25_34_h ou "25-34 H"',
      'audience_fr_25_34_f ou "25-34 F"',
      'audience_fr_35_44_h ou "35-44 men"',
      'audience_fr_35_44_f ou "35-44 women"',
      '... et ainsi de suite pour toutes les tranches d\'âge'
    ];
  }
};
