
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { DataImport } from '@/components/DataImport';
import { KPIOverview } from '@/components/KPIOverview';
import { SeasonHeatmap } from '@/components/SeasonHeatmap';
import { BrandDrilldown } from '@/components/BrandDrilldown';
import { BrandFilter } from '@/components/BrandFilter';
import { useAdsData } from '@/hooks/useAdsData';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const { ads, brands, isLoading } = useAdsData(selectedBrands);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand].slice(0, 5) // Max 5 marques
    );
  };

  const handleExportCSV = () => {
    if (ads.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    const headers = ['ID', 'Marque', 'Titre', 'Reach EU', 'Date début', 'Date fin', 'Durée (jours)', 'Budget estimé'];
    const csvData = [
      headers.join(','),
      ...ads.map(ad => [
        ad.ad_id,
        ad.brand,
        `"${ad.link_title || ''}"`,
        ad.audience_eu_total,
        ad.start_date,
        ad.end_date,
        ad.days_active,
        ad.budget_estimated
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-bench-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Bench</h1>
            <p className="text-gray-600 mt-1">Tableau de bord d'analyse concurrentielle Meta Ads</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Import de données */}
        <div className="mb-8">
          <DataImport />
        </div>

        {/* Filtres */}
        {brands.length > 0 && (
          <div className="mb-6">
            <BrandFilter
              brands={brands}
              selectedBrands={selectedBrands}
              onBrandToggle={handleBrandToggle}
              onClearFilters={() => setSelectedBrands([])}
            />
          </div>
        )}

        {/* Contenu principal */}
        {ads.length > 0 ? (
          <Tabs defaultValue="kpi" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="kpi" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                KPI Overview
              </TabsTrigger>
              <TabsTrigger value="seasonal">Saisonnalité</TabsTrigger>
              <TabsTrigger value="brands">Drill-down</TabsTrigger>
            </TabsList>

            <TabsContent value="kpi">
              <KPIOverview ads={ads} selectedBrands={selectedBrands} />
            </TabsContent>

            <TabsContent value="seasonal">
              <SeasonHeatmap ads={ads} />
            </TabsContent>

            <TabsContent value="brands">
              <BrandDrilldown ads={ads} selectedBrands={selectedBrands} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-600">
              Importez des données depuis Google Sheets pour commencer l'analyse
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
