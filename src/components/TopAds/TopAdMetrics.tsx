
import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Users, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BudgetCalculation } from '@/types/budget';
import { AdsData } from '@/types/ads';
import { BudgetCalculationTooltip } from '../BudgetCalculationTooltip';

interface TopAdMetricsProps {
  reach: number;
  duration: number;
  startDate: string;
  calculatedBudget: number;
  budgetCalculation: BudgetCalculation;
  adsData: AdsData;
}

export const TopAdMetrics = ({
  reach,
  duration,
  startDate,
  calculatedBudget,
  budgetCalculation,
  adsData
}: TopAdMetricsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-500" />
        <div className="flex flex-col">
          <span>{reach.toLocaleString()} reach</span>
          {budgetCalculation?.isValid && (
            <span className="text-xs text-gray-500">
              ~{budgetCalculation.estimatedImpressions.toLocaleString()} impressions
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-green-500" />
        <span>{duration} jours</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-purple-500" />
        <span>{format(new Date(startDate), 'MMM yyyy', { locale: fr })}</span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-orange-500" />
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <span className="font-medium">
              {budgetCalculation?.isValid ? `${calculatedBudget.toLocaleString()}€` : 'N/A'}
            </span>
            {budgetCalculation?.isValid && (
              <span className="text-xs text-gray-500">
                CPM: {budgetCalculation.appliedCpm}€
              </span>
            )}
          </div>
          {budgetCalculation?.isValid && (
            <BudgetCalculationTooltip ad={adsData} calculation={budgetCalculation}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-3 w-3" />
              </Button>
            </BudgetCalculationTooltip>
          )}
        </div>
      </div>
    </div>
  );
};
