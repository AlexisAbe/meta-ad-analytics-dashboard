
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Clock, Calendar, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { AdsData } from '@/types/ads';
import { estimateBudget } from '@/services/budgetCalculator';
import { BudgetCalculationTooltip } from './BudgetCalculationTooltip';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdCardProps {
  ad: AdsData;
  showBrand?: boolean;
}

export const AdCard = ({ ad, showBrand = true }: AdCardProps) => {
  const budgetCalc = estimateBudget(ad);
  
  const hasValidUrl = ad.snapshot_url && 
    ad.snapshot_url.trim() !== '' && 
    ad.snapshot_url.startsWith('http');

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getDateStatus = () => {
    if (!ad.end_date) {
      return { label: 'En cours', color: 'bg-green-100 text-green-800' };
    }
    
    const endDate = new Date(ad.end_date);
    const today = new Date();
    
    if (endDate >= today) {
      return { label: 'Actif', color: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Terminé', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const dateStatus = getDateStatus();

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {showBrand && <Badge variant="outline">{ad.brand}</Badge>}
              <Badge variant="secondary" className="text-xs">
                {budgetCalc.adType}
              </Badge>
              <Badge className={`text-xs ${dateStatus.color}`}>
                {dateStatus.label}
              </Badge>
              {!budgetCalc.isValid && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Données incomplètes
                </Badge>
              )}
              {budgetCalc.hasIncompleteData && budgetCalc.isValid && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Partiel
                </Badge>
              )}
              {hasValidUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(ad.snapshot_url, '_blank')}
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Voir pub
                </Button>
              )}
            </div>
            <h4 className="font-medium text-sm mb-1 line-clamp-2">
              {ad.link_title || ad.ad_body || ad.ad_id}
            </h4>
            {ad.link_caption && (
              <p className="text-xs text-gray-600 mb-2">{ad.link_caption}</p>
            )}
          </div>
        </div>
        
        {/* Affichage systématique des dates */}
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">Début :</span>
              <span className="font-medium">{formatDate(ad.start_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Fin :</span>
              <span className="font-medium">
                {ad.end_date ? formatDate(ad.end_date) : 'Encore active'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div className="flex flex-col">
              <span>{ad.audience_eu_total.toLocaleString()} reach</span>
              {budgetCalc.isValid && (
                <span className="text-xs text-gray-500">
                  ~{budgetCalc.estimatedImpressions.toLocaleString()} impressions
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span>{budgetCalc.duration} jours</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>{format(new Date(ad.start_date), 'MMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <div className="flex items-center gap-1">
              <div className="flex flex-col">
                <span className="font-medium">
                  {budgetCalc.isValid ? `${budgetCalc.estimatedBudget.toLocaleString()}€` : 'N/A'}
                </span>
                {budgetCalc.isValid && (
                  <span className="text-xs text-gray-500">
                    CPM: {budgetCalc.appliedCpm}€
                  </span>
                )}
              </div>
              {budgetCalc.isValid && (
                <BudgetCalculationTooltip ad={ad} calculation={budgetCalc}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-3 w-3" />
                  </Button>
                </BudgetCalculationTooltip>
              )}
            </div>
          </div>
        </div>

        {/* Raison d'exclusion si applicable */}
        {!budgetCalc.isValid && budgetCalc.exclusionReason && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            {budgetCalc.exclusionReason}
          </div>
        )}

        {/* Affichage des champs manquants pour données partielles */}
        {budgetCalc.hasIncompleteData && budgetCalc.isValid && budgetCalc.missingFields.length > 0 && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <div className="flex items-center gap-1 text-orange-800 mb-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Données partielles</span>
            </div>
            <div className="text-orange-700">
              Champs manquants : {budgetCalc.missingFields.join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
