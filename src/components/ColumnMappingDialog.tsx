
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ColumnMapping } from '@/services/fileParser';

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onConfirm: () => void;
}

const REQUIRED_FIELDS = ['ad_id', 'audience_total', 'start_date'];
const OPTIONAL_FIELDS = ['snapshot_url', 'body', 'legend', 'description', 'title', 'end_date', 'format', 'brand', 'sector'];

const FIELD_LABELS = {
  ad_id: 'ID Publicité*',
  snapshot_url: 'URL Snapshot',
  body: 'Corps de la pub',
  legend: 'Légende',
  description: 'Description',
  title: 'Titre',
  audience_total: 'Audience totale*',
  start_date: 'Date début*',
  end_date: 'Date fin',
  format: 'Format',
  brand: 'Marque',
  sector: 'Secteur'
};

export const ColumnMappingDialog = ({
  open,
  onOpenChange,
  headers,
  mapping,
  onMappingChange,
  onConfirm
}: ColumnMappingDialogProps) => {
  const updateMapping = (field: string, columnIndex: string) => {
    const newMapping = { ...mapping };
    newMapping[field] = columnIndex === 'none' ? null : parseInt(columnIndex);
    onMappingChange(newMapping);
  };

  const getFieldStatus = (field: string) => {
    const isRequired = REQUIRED_FIELDS.includes(field);
    const isMapped = mapping[field] !== null;
    
    if (isRequired && !isMapped) return 'error';
    if (isMapped) return 'success';
    return 'warning';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const canConfirm = REQUIRED_FIELDS.every(field => mapping[field] !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mapping des colonnes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p><strong>Instructions :</strong> Associez chaque champ aux colonnes de votre fichier.</p>
            <p className="text-blue-700 mt-1">* = Champs obligatoires</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Champs obligatoires */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-red-700">Champs obligatoires</h3>
              <div className="space-y-3">
                {REQUIRED_FIELDS.map(field => {
                  const status = getFieldStatus(field);
                  return (
                    <div key={field} className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <div className="flex-1">
                        <label className="text-sm font-medium">{FIELD_LABELS[field]}</label>
                        <Select 
                          value={mapping[field]?.toString() || 'none'} 
                          onValueChange={(value) => updateMapping(field, value)}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Sélectionner une colonne" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Non mappé</SelectItem>
                            {headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {header || `Colonne ${index + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Champs optionnels */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-700">Champs optionnels</h3>
              <div className="space-y-3">
                {OPTIONAL_FIELDS.map(field => {
                  const status = getFieldStatus(field);
                  return (
                    <div key={field} className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <div className="flex-1">
                        <label className="text-sm font-medium">{FIELD_LABELS[field]}</label>
                        <Select 
                          value={mapping[field]?.toString() || 'none'} 
                          onValueChange={(value) => updateMapping(field, value)}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Sélectionner une colonne" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Non mappé</SelectItem>
                            {headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {header || `Colonne ${index + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Aperçu des colonnes du fichier */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Colonnes détectées dans le fichier</h3>
            <div className="flex flex-wrap gap-2">
              {headers.map((header, index) => (
                <Badge key={index} variant="outline">
                  {index + 1}: {header || 'Sans nom'}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={onConfirm} disabled={!canConfirm}>
              Confirmer le mapping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
