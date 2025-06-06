
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TopAd } from '@/types/projects';
import { BudgetCalculation } from '@/types/budget';
import { AdsData } from '@/types/ads';
import { AudienceModal } from '../Demographics/AudienceModal';
import { demographicUtils } from '@/utils/demographicUtils';
import { TopAdHeader } from './TopAdHeader';
import { TopAdDateSection } from './TopAdDateSection';
import { TopAdMetrics } from './TopAdMetrics';

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
            <TopAdHeader
              brand={ad.brand}
              rank={ad.rank}
              dateStatus={dateStatus}
              demographicDisplay={demographicDisplay}
              hasValidUrl={hasValidUrl}
              snapshotUrl={ad.snapshot_url}
              linkTitle={ad.link_title}
              adId={ad.ad_id}
              onShowAudienceModal={() => setShowAudienceModal(true)}
            />
          </div>

          <TopAdDateSection
            startDate={ad.start_date}
            endDate={ad.end_date}
          />
          
          <TopAdMetrics
            reach={ad.reach}
            duration={ad.duration}
            startDate={ad.start_date}
            calculatedBudget={ad.calculatedBudget}
            budgetCalculation={ad.budgetCalculation}
            adsData={ad.adsData}
          />
        </CardContent>
      </Card>

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
