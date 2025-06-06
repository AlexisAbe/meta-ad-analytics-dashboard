
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Users, Calendar, ExternalLink, Info, User } from 'lucide-react';
import { TopAd } from '@/types/projects';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BudgetCalculation } from '@/types/budget';
import { AdsData } from '@/types/ads';
import { BudgetCalculationTooltip } from '../BudgetCalculationTooltip';
import { AudienceModal } from '../Demographics/AudienceModal';
import { DemographicBadge } from '../Demographics/DemographicBadge';
import { demographicUtils } from '@/utils/demographicUtils';

interface TopAdCardProps {
  ad: TopAd & {
    calculatedBudget: number;
    budgetCalculation: BudgetCalculation;
    adsData: AdsData;
  };
  allAds?: AdsData[];
}

export const TopAdCard = ({ ad, allAds = [] }: TopAdCardProps) => {
  const [showAudienceModal, setShowAudienceModal] = useState(false);

  // Utiliser le nouvel utilitaire pour calculer les données démographiques
  const demographicDisplay = demographicUtils.calculateDisplayData([ad.adsData]);

  console.log('TopAdCard - Données démographiques calculées:', {
    ad_id: ad.ad_id,
    hasData: demographicDisplay.hasData,
    completeness: demographicDisplay.completeness,
    showButton: demographicDisplay.showAudienceButton,
    badgeVariant: demographicDisplay.badgeVariant,
    availableGroups: demographicDisplay.availableAgeGroups
  });

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
    <>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline">{ad.brand}</Badge>
                <Badge variant="secondary">#{ad.rank}</Badge>
                <Badge className={`text-xs ${dateStatus.color}`}>
                  {dateStatus.label}
                </Badge>
                
                {/* Badge démographique utilisant le nouveau composant */}
                <DemographicBadge data={demographicDisplay} />
                
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
                
                {/* Bouton "Voir l'audience" affiché dès que hasData === true */}
                {demographicDisplay.showAudienceButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAudienceModal(true)}
                    className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
                    title="Voir l'analyse d'audience détaillée"
                  >
                    <User className="h-3 w-3 mr-1" />
                    Voir l'audience
                  </Button>
                )}
                
                {!hasValidUrl && (
                  <span className="text-xs text-gray-400">Pas d'URL</span>
                )}
              </div>
              <h4 className="font-medium text-sm mb-1 line-clamp-2">
                {ad.link_title || ad.ad_id}
              </h4>
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
                <span>{ad.reach.toLocaleString()} reach</span>
                {ad.budgetCalculation?.isValid && (
                  <span className="text-xs text-gray-500">
                    ~{ad.budgetCalculation.estimatedImpressions.toLocaleString()} impressions
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span>{ad.duration} jours</span>
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
                    {ad.budgetCalculation?.isValid ? `${ad.calculatedBudget.toLocaleString()}€` : 'N/A'}
                  </span>
                  {ad.budgetCalculation?.isValid && (
                    <span className="text-xs text-gray-500">
                      CPM: {ad.budgetCalculation.appliedCpm}€
                    </span>
                  )}
                </div>
                {ad.budgetCalculation?.isValid && (
                  <BudgetCalculationTooltip ad={ad.adsData} calculation={ad.budgetCalculation}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Info className="h-3 w-3" />
                    </Button>
                  </BudgetCalculationTooltip>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal d'analyse d'audience */}
      <AudienceModal
        isOpen={showAudienceModal}
        onClose={() => setShowAudienceModal(false)}
        ad={ad.adsData}
        allAds={allAds}
        showComparison={allAds.length > 0}
      />
    </>
  );
};
