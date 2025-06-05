
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BrandImportData } from '@/hooks/useBrandImport';

interface BrandImportFormProps {
  brand: BrandImportData;
  onUpdate: (field: keyof BrandImportData, value: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const BrandImportForm = ({ 
  brand, 
  onUpdate, 
  onProcess, 
  isProcessing, 
  disabled 
}: BrandImportFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Nom de la marque <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="ex: Picard, Swapn..."
          value={brand.brandName}
          onChange={(e) => onUpdate('brandName', e.target.value)}
          disabled={disabled}
          className={!brand.brandName.trim() ? 'border-orange-300' : ''}
        />
        <p className="text-xs text-gray-600 mt-1">
          Toutes les publicités importées seront étiquetées avec ce nom de marque
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Données Google Sheets
        </label>
        <Textarea
          placeholder="Collez ici les données copiées depuis Google Sheets (Ctrl+V)..."
          value={brand.rawData}
          onChange={(e) => onUpdate('rawData', e.target.value)}
          rows={8}
          className="font-mono text-sm"
          disabled={disabled}
        />
      </div>

      <Button 
        onClick={onProcess}
        disabled={!brand.rawData.trim() || !brand.brandName.trim() || isProcessing || disabled}
        className="w-full"
      >
        {isProcessing ? 'Traitement en cours...' : `Traiter ${brand.brandName || 'cette marque'}`}
      </Button>
    </div>
  );
};
