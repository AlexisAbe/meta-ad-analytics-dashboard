
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp } from 'lucide-react';
import { AdsData } from '@/types/ads';
import { DemographicChart } from './DemographicChart';
import { demographicAnalyzer } from '@/services/demographicAnalyzer';

interface DemographicOverviewProps {
  ads: AdsData[];
  selectedBrands: string[];
}

export const DemographicOverview = ({ ads, selectedBrands }: DemographicOverviewProps) => {
  const [showComparison, setShowComparison] = useState(false);
  
  // Calculer les données démographiques pour les publicités filtrées
  const currentData = demographicAnalyzer.calculateDemographicBreakdown(ads);
  
  // Calculer la moyenne globale (toutes les publicités) pour la comparaison
  const allAdsData = demographicAnalyzer.calculateGlobalAverage(ads);
  
  // Créer la comparaison si activée
  const comparison = showComparison 
    ? demographicAnalyzer.compareToAverage(currentData.breakdown, allAdsData)
    : undefined;

  if (!currentData.hasData) {
    return null; // Ne pas afficher si pas de données
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec filtres actifs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium">Analyse Démographique</h3>
          {selectedBrands.length > 0 && (
            <div className="flex gap-1">
              {selectedBrands.map(brand => (
                <Badge key={brand} variant="secondary" className="text-xs">
                  {brand}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <Button
          variant={showComparison ? "default" : "outline"}
          size="sm"
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {showComparison ? "Vue simple" : "vs Moyenne"}
        </Button>
      </div>

      {/* Graphique démographique */}
      <DemographicChart
        data={currentData}
        comparison={comparison}
        showComparison={showComparison}
        title="Répartition par Âge et Sexe (France)"
      />
    </div>
  );
};
