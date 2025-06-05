
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Users, Calendar, ExternalLink } from 'lucide-react';
import { useTopAds } from '@/hooks/useProjects';
import { TopAd } from '@/types/projects';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TopAdsAnalysisProps {
  projectId?: string;
}

export const TopAdsAnalysis = ({ projectId }: TopAdsAnalysisProps) => {
  const { topAdsByReach, topAdsByDuration, isLoading } = useTopAds(projectId);

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

  const AdCard = ({ ad }: { ad: TopAd }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{ad.brand}</Badge>
              <Badge variant="secondary">#{ad.rank}</Badge>
            </div>
            <h4 className="font-medium text-sm mb-1 line-clamp-2">
              {ad.link_title || ad.ad_id}
            </h4>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{ad.reach.toLocaleString()} reach</span>
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
            <span>{ad.budget_estimated?.toLocaleString() || 'N/A'}€</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const groupAdsByMonth = (ads: TopAd[]) => {
    const grouped = ads.reduce((acc, ad) => {
      const monthKey = format(new Date(ad.month), 'MMMM yyyy', { locale: fr });
      if (!acc[monthKey]) acc[monthKey] = {};
      if (!acc[monthKey][ad.brand]) acc[monthKey][ad.brand] = [];
      acc[monthKey][ad.brand].push(ad);
      return acc;
    }, {} as Record<string, Record<string, TopAd[]>>);
    
    return grouped;
  };

  const renderAnalysis = (ads: TopAd[], title: string, icon: React.ReactNode) => {
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
          Top 10 des publicités par mois et par annonceur
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
            {renderAnalysis(topAdsByReach, "Publicités avec le plus grand reach", <Users className="h-5 w-5 text-blue-500" />)}
          </TabsContent>
          
          <TabsContent value="duration" className="mt-6">
            {renderAnalysis(topAdsByDuration, "Publicités avec la plus longue durée", <Clock className="h-5 w-5 text-green-500" />)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
