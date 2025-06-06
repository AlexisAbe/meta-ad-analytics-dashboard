
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useTopAds } from '@/hooks/useProjects';
import { TopAd } from '@/types/projects';
import { budgetCalculator } from '@/services/budgetCalculator';
import { AdsData } from '@/types/ads';
import { TopAdsTabContent } from './TopAds/TopAdsTabContent';

interface TopAdsAnalysisProps {
  projectId?: string;
}

export const TopAdsAnalysis = ({ projectId }: TopAdsAnalysisProps) => {
  const { topAdsByReach, topAdsByDuration, isLoading } = useTopAds(projectId);

  console.log('🔍 TopAdsAnalysis - Données reçues:', {
    projectId,
    topAdsByReach: topAdsByReach.length,
    topAdsByDuration: topAdsByDuration.length,
    sampleReachAd: topAdsByReach[0] ? {
      ad_id: topAdsByReach[0].ad_id,
      reach: topAdsByReach[0].reach,
      duration: topAdsByReach[0].duration
    } : null,
    sampleDurationAd: topAdsByDuration[0] ? {
      ad_id: topAdsByDuration[0].ad_id,
      reach: topAdsByDuration[0].reach,
      duration: topAdsByDuration[0].duration
    } : null
  });

  // Fonction pour convertir TopAd en AdsData pour le calcul de budget
  const convertTopAdToAdsData = (topAd: TopAd): AdsData => {
    return {
      ad_id: topAd.ad_id,
      brand: topAd.brand,
      audience_eu_total: topAd.reach,
      start_date: topAd.start_date,
      end_date: topAd.end_date,
      link_title: topAd.link_title,
      days_active: topAd.duration,
      budget_estimated: topAd.budget_estimated || 0,
      start_month: format(new Date(topAd.start_date), 'yyyy-MM'),
      snapshot_url: topAd.snapshot_url,
      // Ajouter les champs démographiques s'ils existent dans TopAd
      audience_fr_18_24_h: (topAd as any).audience_fr_18_24_h,
      audience_fr_18_24_f: (topAd as any).audience_fr_18_24_f,
      audience_fr_25_34_h: (topAd as any).audience_fr_25_34_h,
      audience_fr_25_34_f: (topAd as any).audience_fr_25_34_f,
      audience_fr_35_44_h: (topAd as any).audience_fr_35_44_h,
      audience_fr_35_44_f: (topAd as any).audience_fr_35_44_f,
      audience_fr_45_54_h: (topAd as any).audience_fr_45_54_h,
      audience_fr_45_54_f: (topAd as any).audience_fr_45_54_f,
      audience_fr_55_64_h: (topAd as any).audience_fr_55_64_h,
      audience_fr_55_64_f: (topAd as any).audience_fr_55_64_f,
      audience_fr_65_plus_h: (topAd as any).audience_fr_65_plus_h,
      audience_fr_65_plus_f: (topAd as any).audience_fr_65_plus_f,
    };
  };

  // Calcul des budgets avec la nouvelle logique pour chaque liste
  const topAdsByReachWithBudget = useMemo(() => {
    const adsWithBudget = topAdsByReach.map(ad => {
      const adsData = convertTopAdToAdsData(ad);
      const calculation = budgetCalculator.calculateBudget(adsData);
      return {
        ...ad,
        calculatedBudget: calculation.estimatedBudget,
        budgetCalculation: calculation,
        adsData
      };
    });

    console.log('📊 Top Ads by Reach (après calcul budget):', adsWithBudget.slice(0, 3).map(ad => ({
      ad_id: ad.ad_id,
      reach: ad.reach,
      rank: ad.rank
    })));

    return adsWithBudget;
  }, [topAdsByReach]);

  const topAdsByDurationWithBudget = useMemo(() => {
    const adsWithBudget = topAdsByDuration.map(ad => {
      const adsData = convertTopAdToAdsData(ad);
      const calculation = budgetCalculator.calculateBudget(adsData);
      return {
        ...ad,
        calculatedBudget: calculation.estimatedBudget,
        budgetCalculation: calculation,
        adsData
      };
    });

    console.log('📊 Top Ads by Duration (après calcul budget):', adsWithBudget.slice(0, 3).map(ad => ({
      ad_id: ad.ad_id,
      duration: ad.duration,
      rank: ad.rank
    })));

    return adsWithBudget;
  }, [topAdsByDuration]);

  // Créer un tableau consolidé de toutes les publicités pour la comparaison démographique
  const allAdsData = useMemo(() => {
    const allAds = [...topAdsByReachWithBudget, ...topAdsByDurationWithBudget];
    const uniqueAds = allAds.filter((ad, index, self) => 
      index === self.findIndex(a => a.ad_id === ad.ad_id)
    );
    return uniqueAds.map(ad => ad.adsData);
  }, [topAdsByReachWithBudget, topAdsByDurationWithBudget]);

  if (!projectId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analyses des meilleures publicités
          </CardTitle>
          <CardDescription>
            Sélectionnez un projet pour voir les analyses mensuelles
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analyses des meilleures publicités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analyses des meilleures publicités
        </CardTitle>
        <CardDescription>
          Top 10 des publicités par mois et par annonceur (budgets recalculés avec CPM hiérarchique)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reach" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reach" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Plus grand reach
            </TabsTrigger>
            <TabsTrigger value="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Plus longue durée
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reach" className="mt-6">
            <TopAdsTabContent 
              ads={topAdsByReachWithBudget}
              title="Publicités avec le plus grand reach"
              icon={<Users className="h-5 w-5 text-blue-500" />}
              allAds={allAdsData}
            />
          </TabsContent>
          
          <TabsContent value="duration" className="mt-6">
            <TopAdsTabContent 
              ads={topAdsByDurationWithBudget}
              title="Publicités avec la plus longue durée"
              icon={<Clock className="h-5 w-5 text-green-500" />}
              allAds={allAdsData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
