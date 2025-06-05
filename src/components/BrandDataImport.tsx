
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Upload, FileText, AlertCircle, Plus, X } from 'lucide-react';
import { adsDataProcessor } from '@/services/adsDataProcessor';
import { useAdsData } from '@/hooks/useAdsData';
import { toast } from '@/hooks/use-toast';
import { Project } from '@/types/projects';
import { Badge } from '@/components/ui/badge';

interface BrandDataImportProps {
  selectedProject?: Project;
}

interface BrandImportData {
  id: string;
  brandName: string;
  rawData: string;
  preview: string[][];
}

export const BrandDataImport = ({ selectedProject }: BrandDataImportProps) => {
  const [brandImports, setBrandImports] = useState<BrandImportData[]>([
    { id: '1', brandName: '', rawData: '', preview: [] }
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const { insertAds, isInserting } = useAdsData([], selectedProject?.id);

  const addBrandTab = () => {
    const newId = Date.now().toString();
    setBrandImports(prev => [...prev, { 
      id: newId, 
      brandName: '', 
      rawData: '', 
      preview: [] 
    }]);
    setActiveTab(newId);
  };

  const removeBrandTab = (id: string) => {
    if (brandImports.length <= 1) return;
    
    setBrandImports(prev => prev.filter(brand => brand.id !== id));
    
    if (activeTab === id) {
      const remainingBrands = brandImports.filter(brand => brand.id !== id);
      setActiveTab(remainingBrands[0]?.id || '');
    }
  };

  const updateBrandData = (id: string, field: keyof BrandImportData, value: string | string[][]) => {
    setBrandImports(prev => prev.map(brand => 
      brand.id === id ? { ...brand, [field]: value } : brand
    ));
  };

  const handleProcessBrand = (brandData: BrandImportData) => {
    if (!selectedProject) {
      toast({
        title: "Projet requis",
        description: "Veuillez sélectionner un projet avant d'importer des données",
        variant: "destructive",
      });
      return;
    }

    if (!brandData.rawData.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller des données à traiter",
        variant: "destructive",
      });
      return;
    }

    try {
      const processed = adsDataProcessor.processSheetData(brandData.rawData);
      
      if (processed.errors.length > 0) {
        toast({
          title: "Attention",
          description: `${processed.errors.length} erreurs détectées lors du traitement pour ${brandData.brandName || 'cette marque'}`,
          variant: "destructive",
        });
        console.log('Erreurs:', processed.errors);
      }

      if (processed.data.length > 0) {
        updateBrandData(brandData.id, 'preview', processed.preview);
        insertAds(processed.data);
      } else {
        toast({
          title: "Erreur",
          description: "Aucune donnée valide trouvée",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement des données",
        variant: "destructive",
      });
    }
  };

  const handleProcessAll = () => {
    const validBrands = brandImports.filter(brand => brand.rawData.trim());
    
    if (validBrands.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à traiter",
        variant: "destructive",
      });
      return;
    }

    validBrands.forEach(brand => handleProcessBrand(brand));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import de données par marque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedProject && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span><strong>Attention :</strong> Sélectionnez un projet avant d'importer des données.</span>
          </div>
        )}

        {selectedProject && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>Projet sélectionné :</strong> {selectedProject.name}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={addBrandTab}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une marque
          </Button>
          <Button 
            onClick={handleProcessAll}
            disabled={isInserting || !selectedProject}
            className="ml-auto"
          >
            {isInserting ? 'Traitement en cours...' : 'Traiter toutes les marques'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            {brandImports.map((brand) => (
              <TabsTrigger key={brand.id} value={brand.id} className="flex items-center gap-2">
                {brand.brandName || `Marque ${brand.id}`}
                {brandImports.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBrandTab(brand.id);
                    }}
                    className="h-4 w-4 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {brandImports.map((brand) => (
            <TabsContent key={brand.id} value={brand.id} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nom de la marque (optionnel)
                </label>
                <Input
                  placeholder="ex: Nike, Adidas..."
                  value={brand.brandName}
                  onChange={(e) => updateBrandData(brand.id, 'brandName', e.target.value)}
                  disabled={!selectedProject}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Données Google Sheets
                </label>
                <Textarea
                  placeholder="Collez ici les données copiées depuis Google Sheets (Ctrl+V)..."
                  value={brand.rawData}
                  onChange={(e) => updateBrandData(brand.id, 'rawData', e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                  disabled={!selectedProject}
                />
              </div>

              <Button 
                onClick={() => handleProcessBrand(brand)}
                disabled={!brand.rawData.trim() || isInserting || !selectedProject}
                className="w-full"
              >
                {isInserting ? 'Traitement en cours...' : `Traiter ${brand.brandName || 'cette marque'}`}
              </Button>

              {brand.preview.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      Aperçu des données - {brand.brandName || 'Marque'} (5 premières lignes)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <tbody>
                          {brand.preview.map((row, i) => (
                            <tr key={i} className={i === 0 ? 'font-semibold bg-gray-50' : ''}>
                              {row.slice(0, 5).map((cell, j) => (
                                <td key={j} className="border p-1 truncate max-w-32">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
