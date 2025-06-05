
import { useMemo } from 'react';
import { AdsData, KPIData } from '@/types/ads';

export const useKPIs = (ads: AdsData[]): KPIData => {
  return useMemo(() => {
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);
    
    // 1. Publicités actives (end_date >= aujourd'hui)
    const activeAds = ads.filter(ad => new Date(ad.end_date) >= today).length;
    
    // 2. Nouvelles publicités ce mois
    const newAdsThisMonth = ads.filter(ad => ad.start_month === currentMonth).length;
    
    // 3. Durée moyenne d'activité
    const avgDuration = ads.length > 0 
      ? ads.reduce((sum, ad) => sum + ad.days_active, 0) / ads.length 
      : 0;
    
    // 4. Reach cumulé total
    const totalReach = ads.reduce((sum, ad) => sum + ad.audience_eu_total, 0);
    
    // 5. Budget estimé total
    const estimatedBudget = ads.reduce((sum, ad) => sum + ad.budget_estimated, 0);
    
    // 6. Taux de renouvellement (campagnes courtes < 14 jours)
    const shortCampaigns = ads.filter(ad => ad.days_active < 14).length;
    const renewalRate = ads.length > 0 ? (shortCampaigns / ads.length) * 100 : 0;
    
    return {
      activeAds,
      newAdsThisMonth,
      avgDuration: Math.round(avgDuration * 10) / 10,
      totalReach,
      estimatedBudget: Math.round(estimatedBudget),
      renewalRate: Math.round(renewalRate * 10) / 10,
    };
  }, [ads]);
};
