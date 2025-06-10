
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Users, Calendar, ExternalLink, Info } from 'lucide-react';
import { useTopAds } from '@/hooks/useProjects';
import { TopAd } from '@/types/projects';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { budgetCalculator } from '@/services/budgetCalculator';
import { AdsData } from '@/types/ads';
import { BudgetCalculationTooltip } from './BudgetCalculationTooltip';

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

  const AdCard = ({ ad }: { ad: typeof topAdsByReachWithBudget[0] }) => {
    console.log('TopAds AdCard - Données:', {
      ad_id: ad.ad_id,
      snapshot_url: ad.snapshot_url,
      start_date: ad.start_date,
      month: ad.month,
      calculated_budget: ad.calculatedBudget,
      original_budget: ad.budget_estimated,
      cpm_source: ad.budgetCalculation?.cpmSource
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
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{ad.brand}</Badge>
                <Badge variant="secondary">#{ad.rank}</Badge>
                <Badge className={`text-xs ${dateStatus.color}`}>
                  {dateStatus.label}
                </Badge>
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
    );
  };

  const groupAdsByMonth = (ads: typeof topAdsByReachWithBudget) => {
    const grouped = ads.reduce((acc, ad) => {
      const monthKey = format(new Date(ad.month), 'MMMM yyyy', { locale: fr });
      if (!acc[monthKey]) acc[monthKey] = {};
      if (!acc[monthKey][ad.brand]) acc[monthKey][ad.brand] = [];
      acc[monthKey][ad.brand].push(ad);
      return acc;
    }, {} as Record<string, Record<string, typeof topAdsByReachWithBudget>>);
    
    return grouped;
  };

  const renderAnalysis = (ads: typeof topAdsByReachWithBudget, title: string, icon: React.ReactNode) => {
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
          <div key={month}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {icon}
              {month}
            </h3>
            
            {Object.entries(brandAds).map(([brand, ads]) => (
              <div key={brand} className="mb-6">
                <h4 className="font-medium text-base mb-3 text-gray-700">{brand}</h4>
                <div className="space-y-2">
                  {ads.map((ad) => (
                    <AdCard key={`${ad.ad_id}-${ad.month}`} ad={ad} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

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
            {renderAnalysis(topAdsByReachWithBudget, "Publicités avec le plus grand reach", <Users className="h-5 w-5 text-blue-500" />)}
          </TabsContent>
          
          <TabsContent value="duration" className="mt-6">
            {renderAnalysis(topAdsByDurationWithBudget, "Publicités avec la plus longue durée", <Clock className="h-5 w-5 text-green-500" />)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
