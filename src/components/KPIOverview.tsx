
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  DollarSign, 
  RefreshCw,
  Settings,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useKPIs } from '@/hooks/useKPIs';
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations';
import { BudgetSettings } from './BudgetSettings';
import { DiagnosticPanel } from './DiagnosticPanel';
import { AdsData } from '@/types/ads';
import { BudgetSettings as BudgetSettingsType } from '@/types/budget';

interface KPIOverviewProps {
  ads: AdsData[];
  selectedBrands: string[];
}

export const KPIOverview = ({ ads, selectedBrands }: KPIOverviewProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [budgetSettings, setBudgetSettings] = useState<Partial<BudgetSettingsType>>({});
  
  const kpis = useKPIs(ads);
  const { summary, invalidAds } = useBudgetCalculations(ads, budgetSettings);

  const handleSettingsChange = (newSettings: Partial<BudgetSettingsType>) => {
    setBudgetSettings(newSettings);
  };

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
      value: `${summary.totalBudget.toLocaleString()} €`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtitle: `CPM moyen: ${summary.averageCpm}€`
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
      {/* En-tête avec filtres et paramètres */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Total: {ads.length} publicités</Badge>
          <Badge variant="outline" className="text-green-600">
            Valides: {summary.validAds}
          </Badge>
          {summary.invalidAds > 0 && (
            <Badge variant="outline" className="text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Exclues: {summary.invalidAds}
            </Badge>
          )}
          {selectedBrands.map(brand => (
            <Badge key={brand} variant="secondary">{brand}</Badge>
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Paramètres Budget
        </Button>
      </div>

      {/* Panneau de diagnostic temporaire */}
      <DiagnosticPanel 
        excludedAds={invalidAds}
        totalAds={ads.length}
        validAds={summary.validAds}
      />

      {/* Alertes pour les données exclues */}
      {summary.invalidAds > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">
                  {summary.invalidAds} publicité(s) exclue(s) du calcul
                </h4>
                <div className="text-sm text-orange-700 mt-1">
                  <p>Raisons d'exclusion :</p>
                  <ul className="list-disc list-inside mt-1">
                    {summary.exclusionReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paramètres de budget */}
      {showSettings && (
        <BudgetSettings onSettingsChange={handleSettingsChange} />
      )}

      {/* Cartes KPI */}
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
                {kpi.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informations sur le calcul */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <h4 className="font-medium mb-2">À propos du calcul de budget</h4>
              <p>
                Le budget estimé est calculé avec la formule : <strong>(Audience × CPM) ÷ 1000</strong>
              </p>
              <p className="mt-1">
                CPM appliqué par priorité : Secteur d'activité → Type de publicité → CPM par défaut
              </p>
              <p className="mt-1">
                Les publicités sans date de fin sont considérées comme actives jusqu'à aujourd'hui.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
