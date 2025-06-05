
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  DollarSign, 
  RefreshCw 
} from 'lucide-react';
import { useKPIs } from '@/hooks/useKPIs';
import { AdsData } from '@/types/ads';

interface KPIOverviewProps {
  ads: AdsData[];
  selectedBrands: string[];
}

export const KPIOverview = ({ ads, selectedBrands }: KPIOverviewProps) => {
  const kpis = useKPIs(ads);

  const kpiCards = [
    {
      title: 'Publicités Actives',
      value: kpis.activeAds.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Nouvelles ce Mois',
      value: kpis.newAdsThisMonth.toLocaleString(),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Durée Moyenne',
      value: `${kpis.avgDuration} jours`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Reach Total',
      value: kpis.totalReach.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Budget Estimé',
      value: `${(kpis.estimatedBudget / 1000).toFixed(0)}k €`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Taux Renouvellement',
      value: `${kpis.renewalRate}%`,
      icon: RefreshCw,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Total: {ads.length} publicités</Badge>
        {selectedBrands.map(brand => (
          <Badge key={brand} variant="secondary">{brand}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index} className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
