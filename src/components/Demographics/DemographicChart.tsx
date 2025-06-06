
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { DemographicData, ComparisonData, AgeGroupData } from '@/types/demographics';
import { DemographicBadge } from './DemographicBadge';
import { demographicUtils } from '@/utils/demographicUtils';

interface DemographicChartProps {
  data: DemographicData;
  comparison?: ComparisonData;
  showComparison?: boolean;
  title?: string;
}

export const DemographicChart = ({ 
  data, 
  comparison, 
  showComparison = false,
  title = "Répartition Démographique"
}: DemographicChartProps) => {
  const messages = demographicUtils.getMessages();
  
  if (!data.hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{messages.noDataTitle}</p>
            <p className="text-sm mt-1">{messages.noDataHelp}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const breakdown = showComparison && comparison ? comparison.current : data.breakdown;
  const demographicDisplay = demographicUtils.calculateDisplayData([{ 
    ad_id: 'temp', 
    brand: 'temp', 
    audience_eu_total: data.totalAudience, 
    start_date: '', 
    end_date: '', 
    days_active: 0, 
    budget_estimated: 0, 
    start_month: '',
    ...Object.fromEntries(
      Object.entries(breakdown).flatMap(([ageGroup, groupData]) => {
        const key = ageGroup.replace('-', '_').replace('+', '_plus');
        return [
          [`audience_fr_${key}_h`, groupData.men],
          [`audience_fr_${key}_f`, groupData.women]
        ];
      })
    )
  } as any]);

  const renderAgeGroup = (ageGroup: string, groupData: AgeGroupData) => {
    // Masquer les tranches sans données
    if (!groupData.hasData || groupData.total === 0) {
      return null;
    }

    const menPercentage = groupData.total > 0 ? (groupData.men / groupData.total) * 100 : 0;
    const womenPercentage = 100 - menPercentage;

    return (
      <div key={ageGroup} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{ageGroup} ans</span>
            {groupData.overRepresented && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Sur-représenté
              </Badge>
            )}
            {showComparison && groupData.vsAverage && groupData.vsAverage < -20 && (
              <Badge variant="outline" className="text-xs text-blue-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                Sous-représenté
              </Badge>
            )}
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">
              {groupData.total.toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs">
              {groupData.percentage.toFixed(1)}%
              {showComparison && groupData.vsAverage && (
                <span className={`ml-1 ${groupData.vsAverage > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                  ({groupData.vsAverage > 0 ? '+' : ''}{groupData.vsAverage.toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Barre de répartition hommes/femmes */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-blue-500 transition-all duration-300 hover:bg-blue-600 group relative"
              style={{ width: `${menPercentage}%` }}
              title={`Hommes: ${groupData.men.toLocaleString()} (${menPercentage.toFixed(1)}%)`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {menPercentage > 20 && (
                  <span className="text-xs font-medium text-white">
                    {menPercentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <div 
              className="bg-pink-500 transition-all duration-300 hover:bg-pink-600 group relative"
              style={{ width: `${womenPercentage}%` }}
              title={`Femmes: ${groupData.women.toLocaleString()} (${womenPercentage.toFixed(1)}%)`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {womenPercentage > 20 && (
                  <span className="text-xs font-medium text-white">
                    {womenPercentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Détails au hover */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>👨 {groupData.men.toLocaleString()}</span>
          <span>👩 {groupData.women.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  // Filtrer pour n'afficher que les tranches avec des données
  const visibleAgeGroups = Object.entries(breakdown).filter(([_, groupData]) => 
    groupData.hasData && groupData.total > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Total : {data.totalAudience.toLocaleString()} personnes
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Hommes</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span>Femmes</span>
            </div>
          </div>
        </div>
        
        {/* Badge de complétude utilisant le nouveau composant */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {data.availableAgeGroups.length}/6 tranches disponibles ({data.completeness}%)
          </Badge>
          <DemographicBadge data={demographicDisplay} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleAgeGroups.map(([ageGroup, groupData]) => 
          renderAgeGroup(ageGroup, groupData)
        )}
        
        {/* Message informatif pour les tranches manquantes */}
        {data.completeness < 100 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm text-blue-800">
              <p>{messages.partialDataInfo}</p>
              <p className="text-xs text-blue-700 mt-1">
                {messages.partialDataDetail(data.availableAgeGroups, data.completeness)}
              </p>
            </div>
          </div>
        )}
        
        {/* Insights de comparaison */}
        {showComparison && comparison && comparison.insights.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
            <h4 className="font-medium text-sm text-orange-800 mb-2">Insights</h4>
            <ul className="space-y-1">
              {comparison.insights.map((insight, index) => (
                <li key={index} className="text-xs text-orange-700">
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
