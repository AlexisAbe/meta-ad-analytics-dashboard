
import React from 'react';
import { TopAd } from '@/types/projects';
import { BudgetCalculation } from '@/types/budget';
import { AdsData } from '@/types/ads';
import { TopAdCard } from './TopAdCard';

interface TopAdsMonthSectionProps {
  month: string;
  brandAds: Record<string, (TopAd & {
    calculatedBudget: number;
    budgetCalculation: BudgetCalculation;
    adsData: AdsData;
  })[]>;
  icon: React.ReactNode;
}

export const TopAdsMonthSection = ({ month, brandAds, icon }: TopAdsMonthSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {icon}
        {month}
      </h3>
      
      {Object.entries(brandAds).map(([brand, ads]) => (
        <div key={brand} className="mb-6">
          <h4 className="font-medium text-base mb-3 text-gray-700">{brand}</h4>
          <div className="space-y-2">
            {ads.map((ad) => (
              <TopAdCard key={`${ad.ad_id}-${ad.month}`} ad={ad} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
