
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info, Calculator, AlertTriangle } from 'lucide-react';
import { BudgetCalculation } from '@/types/budget';
import { AdsData } from '@/types/ads';

interface BudgetCalculationTooltipProps {
  ad: AdsData;
  calculation: BudgetCalculation;
  children: React.ReactNode;
}

export const BudgetCalculationTooltip = ({ 
  ad, 
  calculation, 
  children 
}: BudgetCalculationTooltipProps) => {
  const getCpmSourceLabel = () => {
    switch (calculation.cpmSource.source) {
      case 'brand':
        return `Marque (${calculation.cpmSource.sourceKey})`;
      case 'sector':
        return `Secteur (${calculation.cpmSource.sourceKey})`;
      case 'format':
        return `Format (${calculation.cpmSource.sourceKey})`;
      case 'default':
        return 'Valeur par défaut';
      default:
        return 'Inconnu';
    }
  };

  const getCpmSourceColor = () => {
    switch (calculation.cpmSource.source) {
      case 'brand':
        return 'bg-purple-100 text-purple-800';
      case 'sector':
        return 'bg-blue-100 text-blue-800';
      case 'format':
        return 'bg-green-100 text-green-800';
      case 'default':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!calculation.isValid) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent className="max-w-80 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Publicité exclue</span>
              </div>
              <p className="text-sm text-red-700">
                {calculation.exclusionReason}
              </p>
              {calculation.missingFields.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Champs manquants :
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {calculation.missingFields.map(field => (
                      <Badge key={field} variant="destructive" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-96 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Détail du calcul budget</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Audience :</span>
                <div className="font-medium">{ad.audience_eu_total.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Impressions :</span>
                <div className="font-medium">{calculation.estimatedImpressions.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Durée :</span>
                <div className="font-medium">{calculation.duration} jours</div>
              </div>
              <div>
                <span className="text-gray-600">CPM appliqué :</span>
                <div className="font-medium">{calculation.appliedCpm}€</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-600">Source du CPM :</div>
              <Badge className={`text-xs ${getCpmSourceColor()}`}>
                {getCpmSourceLabel()}
              </Badge>
            </div>

            <div className="p-2 bg-blue-50 rounded text-xs">
              <div className="font-medium text-blue-800 mb-1">Formule :</div>
              <div className="text-blue-700">
                Budget = (Audience × 1,3 répétitions × CPM) ÷ 1000
              </div>
              <div className="text-blue-700 mt-1">
                = ({ad.audience_eu_total.toLocaleString()} × 1,3 × {calculation.appliedCpm}€) ÷ 1000
              </div>
              <div className="text-blue-700 font-medium">
                = {calculation.estimatedBudget}€
              </div>
            </div>

            {calculation.hasIncompleteData && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-orange-800 mb-1">
                    Données partiellement incomplètes
                  </div>
                  <div className="text-orange-700">
                    Champs manquants : {calculation.missingFields.join(', ')}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 italic">
              Basé sur une estimation de 1,3 impression par personne
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
