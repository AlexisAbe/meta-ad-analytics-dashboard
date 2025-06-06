
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
    let totalAudience = 0;
    let hasAnyData = false;

    // Calculer l'agrégation pour chaque tranche d'âge
    Object.entries(ageGroups).forEach(([ageGroup, fields]) => {
      let totalMen = 0;
      let totalWomen = 0;
      let adsWithData = 0;

      ads.forEach(ad => {
        const menValue = ad[fields.men as keyof AdsData] as number;
        const womenValue = ad[fields.women as keyof AdsData] as number;

        if (menValue !== undefined && menValue !== null && !isNaN(menValue)) {
          totalMen += menValue;
          adsWithData++;
          hasAnyData = true;
        } else {
          if (!missingFields.includes(fields.men)) {
            missingFields.push(fields.men);
          }
        }

        if (womenValue !== undefined && womenValue !== null && !isNaN(womenValue)) {
          totalWomen += womenValue;
          hasAnyData = true;
        } else {
          if (!missingFields.includes(fields.women)) {
            missingFields.push(fields.women);
          }
        }
      });

      const total = totalMen + totalWomen;
      totalAudience += total;

      breakdown[ageGroup as keyof DemographicBreakdown] = {
        total,
        men: totalMen,
        women: totalWomen,
        percentage: 0, // Sera calculé après
        overRepresented: false, // Sera calculé lors de la comparaison
      };
    });

    // Calculer les pourcentages
    Object.keys(breakdown).forEach(ageGroup => {
      const group = breakdown[ageGroup as keyof DemographicBreakdown]!;
      group.percentage = totalAudience > 0 ? (group.total / totalAudience) * 100 : 0;
    });

    return {
      breakdown: breakdown as DemographicBreakdown,
      totalAudience,
      hasData: hasAnyData,
      missingFields: [...new Set(missingFields)],
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
      
      if (averageGroup.percentage > 0) {
        const vsAverage = ((currentGroup.percentage - averageGroup.percentage) / averageGroup.percentage) * 100;
        const overRepresented = vsAverage > 20; // Seuil de 20% au-dessus de la moyenne

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
