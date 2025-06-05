
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, AlertCircle, Plus, X } from 'lucide-react';
import { Project } from '@/types/projects';
import { useBrandImport } from '@/hooks/useBrandImport';
import { BrandImportTab } from './BrandImport/BrandImportTab';

interface BrandDataImportProps {
  selectedProject?: Project;
}

export const BrandDataImport = ({ selectedProject }: BrandDataImportProps) => {
  const {
    brandImports,
    activeTab,
    setActiveTab,
    addBrandTab,
    removeBrandTab,
    updateBrandData,
    processBrand,
    processAllBrands,
    isInserting
  } = useBrandImport(selectedProject);

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
            <br />
            <strong>Note :</strong> Les données seront étiquetées avec le nom de marque que vous spécifiez. Les imports multiples sont autorisés.
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={addBrandTab}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une marque
          </Button>
          <Button 
            onClick={processAllBrands}
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
            <BrandImportTab
              key={brand.id}
              brand={brand}
              onUpdate={updateBrandData}
              onProcess={processBrand}
              isProcessing={isInserting}
              disabled={!selectedProject}
            />
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
