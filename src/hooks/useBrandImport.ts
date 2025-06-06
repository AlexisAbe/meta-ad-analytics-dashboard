
import { useState } from 'react';
import { dataProcessor } from '@/services/dataProcessor';
import { useAdsData } from '@/hooks/useAdsData';
import { toast } from '@/hooks/use-toast';
import { Project } from '@/types/projects';

export interface BrandImportData {
  id: string;
  brandName: string;
  rawData: string;
  preview: string[][];
}

export const useBrandImport = (selectedProject?: Project) => {
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

  const processBrand = (brandData: BrandImportData) => {
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

    if (!brandData.brandName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom de marque",
        variant: "destructive",
      });
      return;
    }

    try {
      const processed = dataProcessor.processSheetData(brandData.rawData, brandData.brandName.trim());
      
      if (processed.errors.length > 0) {
        toast({
          title: "Attention",
          description: `${processed.errors.length} erreurs détectées lors du traitement pour ${brandData.brandName}`,
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

  const processAllBrands = () => {
    const validBrands = brandImports.filter(brand => brand.rawData.trim() && brand.brandName.trim());
    
    if (validBrands.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à traiter ou nom de marque manquant",
        variant: "destructive",
      });
      return;
    }

    validBrands.forEach(brand => processBrand(brand));
  };

  return {
    brandImports,
    activeTab,
    setActiveTab,
    addBrandTab,
    removeBrandTab,
    updateBrandData,
    processBrand,
    processAllBrands,
    isInserting
  };
};
