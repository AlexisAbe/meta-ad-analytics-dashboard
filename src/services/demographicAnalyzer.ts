
import { AdsData } from '@/types/ads';
import { DemographicBreakdown, AgeGroupData, DemographicData, ComparisonData } from '@/types/demographics';

class DemographicAnalyzer {
  private getAgeGroupFields() {
    return {
      '18-24': { men: 'audience_fr_18_24_h', women: 'audience_fr_18_24_f' },
      '25-34': { men: 'audience_fr_25_34_h', women: 'audience_fr_25_34_f' },
      '35-44': { men: 'audience_fr_35_44_h', women: 'audience_fr_35_44_f' },
      '45-54': { men: 'audience_fr_45_54_h', women: 'audience_fr_45_54_f' },
      '55-64': { men: 'audience_fr_55_64_h', women: 'audience_fr_55_64_f' },
      '65+': { men: 'audience_fr_65_plus_h', women: 'audience_fr_65_plus_f' },
    };
  }

  calculateDemographicBreakdown(ads: AdsData[]): DemographicData {
    const ageGroups = this.getAgeGroupFields();
    const breakdown: Partial<DemographicBreakdown> = {};
    const missingFields: string[] = [];
    const availableAgeGroups: string[] = [];
    const missingAgeGroups: string[] = [];
    let totalAudience = 0;
    let hasAnyData = false;

    // Calculer l'agrégation pour chaque tranche d'âge
    Object.entries(ageGroups).forEach(([ageGroup, fields]) => {
      let totalMen = 0;
      let totalWomen = 0;
      let hasGroupData = false;

      ads.forEach(ad => {
        const menValue = ad[fields.men as keyof AdsData] as number;
        const womenValue = ad[fields.women as keyof AdsData] as number;

        if (menValue !== undefined && menValue !== null && !isNaN(menValue) && menValue > 0) {
          totalMen += menValue;
          hasGroupData = true;
          hasAnyData = true;
        } else {
          if (!missingFields.includes(fields.men)) {
            missingFields.push(fields.men);
          }
        }

        if (womenValue !== undefined && womenValue !== null && !isNaN(womenValue) && womenValue > 0) {
          totalWomen += womenValue;
          hasGroupData = true;
          hasAnyData = true;
        } else {
          if (!missingFields.includes(fields.women)) {
            missingFields.push(fields.women);
          }
        }
      });

      const total = totalMen + totalWomen;
      totalAudience += total;

      // Déterminer si cette tranche a des données utilisables
      if (hasGroupData) {
        availableAgeGroups.push(ageGroup);
      } else {
        missingAgeGroups.push(ageGroup);
      }

      breakdown[ageGroup as keyof DemographicBreakdown] = {
        total,
        men: totalMen,
        women: totalWomen,
        percentage: 0, // Sera calculé après
        overRepresented: false,
        hasData: hasGroupData,
      };
    });

    // Calculer les pourcentages uniquement sur les données disponibles
    Object.keys(breakdown).forEach(ageGroup => {
      const group = breakdown[ageGroup as keyof DemographicBreakdown]!;
      group.percentage = totalAudience > 0 ? (group.total / totalAudience) * 100 : 0;
    });

    // Calculer la complétude
    const totalPossibleGroups = Object.keys(ageGroups).length;
    const completeness = (availableAgeGroups.length / totalPossibleGroups) * 100;
    const isUsable = availableAgeGroups.length >= 2; // Au moins 2 tranches pour être utilisable

    console.log('📊 Analyse démographique:', {
      totalAudience,
      availableGroups: availableAgeGroups.length,
      missingGroups: missingAgeGroups.length,
      completeness: Math.round(completeness),
      isUsable
    });

    return {
      breakdown: breakdown as DemographicBreakdown,
      totalAudience,
      hasData: hasAnyData,
      missingFields: [...new Set(missingFields)],
      availableAgeGroups,
      missingAgeGroups,
      completeness: Math.round(completeness),
      isUsable,
    };
  }

  calculateGlobalAverage(allAds: AdsData[]): DemographicBreakdown {
    const globalData = this.calculateDemographicBreakdown(allAds);
    return globalData.breakdown;
  }

  compareToAverage(current: DemographicBreakdown, average: DemographicBreakdown): ComparisonData {
    const insights: string[] = [];
    const comparedBreakdown: DemographicBreakdown = { ...current };

    Object.keys(current).forEach(ageGroup => {
      const currentGroup = current[ageGroup as keyof DemographicBreakdown];
      const averageGroup = average[ageGroup as keyof DemographicBreakdown];
      
      // Ne comparer que si les deux groupes ont des données
      if (currentGroup.hasData && averageGroup.hasData && averageGroup.percentage > 0) {
        const vsAverage = ((currentGroup.percentage - averageGroup.percentage) / averageGroup.percentage) * 100;
        const overRepresented = vsAverage > 20;

        comparedBreakdown[ageGroup as keyof DemographicBreakdown] = {
          ...currentGroup,
          overRepresented,
          vsAverage,
        };

        if (overRepresented) {
          insights.push(`${ageGroup} ans sur-représenté (+${Math.round(vsAverage)}%)`);
        } else if (vsAverage < -20) {
          insights.push(`${ageGroup} ans sous-représenté (${Math.round(vsAverage)}%)`);
        }
      } else {
        // Garder les données originales si pas de comparaison possible
        comparedBreakdown[ageGroup as keyof DemographicBreakdown] = currentGroup;
      }
    });

    return {
      current: comparedBreakdown,
      average,
      insights,
    };
  }

  formatDemographicData(data: DemographicData, comparison?: ComparisonData) {
    const formatted = {
      ...data,
      breakdown: comparison ? comparison.current : data.breakdown,
      insights: comparison?.insights || [],
    };

    return formatted;
  }
}

export const demographicAnalyzer = new DemographicAnalyzer();
