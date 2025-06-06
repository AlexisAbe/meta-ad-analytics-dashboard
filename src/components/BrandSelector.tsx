
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Check, X, AlertCircle } from 'lucide-react';

interface BrandSelectorProps {
  currentBrand?: string;
  detectedBrand?: string;
  onBrandChange: (brand: string) => void;
  showDetectionInfo?: boolean;
}

export const BrandSelector = ({ 
  currentBrand, 
  detectedBrand, 
  onBrandChange, 
  showDetectionInfo = true 
}: BrandSelectorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentBrand || detectedBrand || '');

  const handleSave = () => {
    if (editValue.trim()) {
      onBrandChange(editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(currentBrand || detectedBrand || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayBrand = currentBrand || detectedBrand;
  const isDetected = detectedBrand && !currentBrand;
  const needsManualInput = !displayBrand;

  if (needsManualInput || isEditing) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            {needsManualInput ? 'Marque non détectée' : 'Modifier la marque'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="brandInput" className="text-sm">
              Nom de la marque
            </Label>
            <div className="flex gap-2">
              <Input
                id="brandInput"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Saisir le nom de la marque..."
                className="flex-1"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!editValue.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
              {!needsManualInput && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {showDetectionInfo && detectedBrand && (
            <div className="text-xs text-orange-700">
              Marque détectée automatiquement : <strong>{detectedBrand}</strong>
            </div>
          )}
          
          <p className="text-xs text-orange-600">
            Cette marque sera appliquée à toutes les publicités de cet import
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={isDetected ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}
          >
            {displayBrand}
          </Badge>
          {isDetected && (
            <span className="text-xs text-blue-600">(détectée auto)</span>
          )}
        </div>
        {showDetectionInfo && (
          <p className="text-xs text-gray-600 mt-1">
            Marque qui sera appliquée à toutes les publicités
          </p>
        )}
      </div>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-8 w-8 p-0"
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  );
};
