
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Clock, Users } from 'lucide-react';
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
    };
  };

  // Calcul des budgets avec la nouvelle logique pour chaque liste
  const topAdsByReachWithBudget = useMemo(() => {
    return topAdsByReach.map(ad => {
      const adsData = convertTopAdToAdsData(ad);
      const calculation = budgetCalculator.calculateBudget(adsData);
      return {
        ...ad,
        calculatedBudget: calculation.estimatedBudget,
        budgetCalculation: calculation,
        adsData
      };
    });
  }, [topAdsByReach]);

  const topAdsByDurationWithBudget = useMemo(() => {
    return topAdsByDuration.map(ad => {
      const adsData = convertTopAdToAdsData(ad);
      const calculation = budgetCalculator.calculateBudget(adsData);
      return {
        ...ad,
        calculatedBudget: calculation.estimatedBudget,
        budgetCalculation: calculation,
        adsData
      };
    });
  }, [topAdsByDuration]);

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
            />
          </TabsContent>
          
          <TabsContent value="duration" className="mt-6">
            <TopAdsTabContent 
              ads={topAdsByDurationWithBudget}
              title="Publicités avec la plus longue durée"
              icon={<Clock className="h-5 w-5 text-green-500" />}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
