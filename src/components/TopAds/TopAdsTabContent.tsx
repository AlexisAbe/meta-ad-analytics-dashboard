
import React from 'react';
import { TopAd } from '@/types/projects';
import { BudgetCalculation } from '@/types/budget';
import { AdsData } from '@/types/ads';
import { TopAdsMonthSection } from './TopAdsMonthSection';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TopAdsTabContentProps {
  ads: (TopAd & {
    calculatedBudget: number;
    budgetCalculation: BudgetCalculation;
    adsData: AdsData;
  })[];
  title: string;
  icon: React.ReactNode;
  allAds?: AdsData[]; // Pour la comparaison démographique
}

export const TopAdsTabContent = ({ ads, title, icon, allAds = [] }: TopAdsTabContentProps) => {
  const groupAdsByMonth = (adsData: typeof ads) => {
    const grouped = adsData.reduce((acc, ad) => {
      const monthKey = format(new Date(ad.month), 'MMMM yyyy', { locale: fr });
      if (!acc[monthKey]) acc[monthKey] = {};
      if (!acc[monthKey][ad.brand]) acc[monthKey][ad.brand] = [];
      acc[monthKey][ad.brand].push(ad);
      return acc;
    }, {} as Record<string, Record<string, typeof ads>>);
    
    return grouped;
  };

  const groupedAds = groupAdsByMonth(ads);
  
  if (Object.keys(groupedAds).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune donnée disponible pour ce projet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedAds).map(([month, brandAds]) => (
        <TopAdsMonthSection 
          key={month} 
          month={month} 
          brandAds={brandAds} 
          icon={icon}
          allAds={allAds}
        />
      ))}
    </div>
  );
};
