
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, AlertCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/projects';
import { useBrandImport } from '@/hooks/useBrandImport';
import { InteractiveDataImport } from './InteractiveDataImport';

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
  } = useBrandImport(selectedProject);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import de données par marque (Version améliorée)
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
            <strong>Note :</strong> Utilisez les onglets ci-dessous pour importer des données avec des marques spécifiques.
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={addBrandTab}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une marque
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
            <div key={brand.id} className={activeTab === brand.id ? 'block' : 'hidden'}>
              <div className="mt-4">
                <InteractiveDataImport 
                  selectedProject={selectedProject}
                  forcedBrand={brand.brandName || undefined}
                />
              </div>
            </div>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
