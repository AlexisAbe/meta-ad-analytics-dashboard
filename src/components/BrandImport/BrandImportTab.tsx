
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { BrandImportForm } from './BrandImportForm';
import { BrandDataPreview } from './BrandDataPreview';
import { BrandImportData } from '@/hooks/useBrandImport';

interface BrandImportTabProps {
  brand: BrandImportData;
  onUpdate: (id: string, field: keyof BrandImportData, value: string) => void;
  onProcess: (brand: BrandImportData) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const BrandImportTab = ({ 
  brand, 
  onUpdate, 
  onProcess, 
  isProcessing, 
  disabled 
}: BrandImportTabProps) => {
  const handleUpdate = (field: keyof BrandImportData, value: string) => {
    onUpdate(brand.id, field, value);
  };

  const handleProcess = () => {
    onProcess(brand);
  };

  return (
    <TabsContent value={brand.id} className="space-y-4">
      <BrandImportForm
        brand={brand}
        onUpdate={handleUpdate}
        onProcess={handleProcess}
        isProcessing={isProcessing}
        disabled={disabled}
      />
      
      <BrandDataPreview
        brandName={brand.brandName}
        preview={brand.preview}
      />
    </TabsContent>
  );
};
