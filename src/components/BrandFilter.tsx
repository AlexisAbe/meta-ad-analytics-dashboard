
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

interface BrandFilterProps {
  brands: string[];
  selectedBrands: string[];
  onBrandToggle: (brand: string) => void;
  onClearFilters: () => void;
}

export const BrandFilter = ({ 
  brands, 
  selectedBrands, 
  onBrandToggle, 
  onClearFilters 
}: BrandFilterProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtrer par marque</span>
        </div>
        {selectedBrands.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Effacer filtres
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {brands.map(brand => (
          <Badge
            key={brand}
            variant={selectedBrands.includes(brand) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onBrandToggle(brand)}
          >
            {brand}
          </Badge>
        ))}
      </div>
    </div>
  );
};
