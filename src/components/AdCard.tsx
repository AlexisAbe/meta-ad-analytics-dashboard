
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Clock, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { AdsData } from '@/types/ads';
import { estimateBudget } from '@/services/budgetCalculator';
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

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {showBrand && <Badge variant="outline">{ad.brand}</Badge>}
              <Badge variant="secondary" className="text-xs">
                {budgetCalc.adType}
              </Badge>
              {budgetCalc.isActive && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Actif
                </Badge>
              )}
              {!budgetCalc.isValid && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Données incomplètes
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
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{ad.audience_eu_total.toLocaleString()} reach</span>
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
          </div>
        </div>

        {/* Raison d'exclusion si applicable */}
        {!budgetCalc.isValid && budgetCalc.exclusionReason && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            {budgetCalc.exclusionReason}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
