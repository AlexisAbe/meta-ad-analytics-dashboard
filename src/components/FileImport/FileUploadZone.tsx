
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, AlertCircle } from 'lucide-react';
import { Project } from '@/types/projects';
import { toast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  selectedProject?: Project;
  forcedBrand?: string;
  selectedFile: File | null;
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
}

export const FileUploadZone = ({
  selectedProject,
  forcedBrand,
  selectedFile,
  isProcessing,
  onFileSelect
}: FileUploadZoneProps) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      onFileSelect(file);
    } else {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner un fichier .xlsx, .xls ou .csv",
        variant: "destructive",
      });
    }
  }, [onFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedProject && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span><strong>Attention :</strong> Sélectionnez un projet avant d'importer des données.</span>
        </div>
      )}

      {selectedProject && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Projet :</strong> {selectedProject.name}
          {forcedBrand && (
            <>
              <br />
              <strong>Marque forcée :</strong> <Badge variant="outline" className="ml-1">{forcedBrand}</Badge>
              <br />
              <span className="text-xs text-blue-600">Cette marque sera appliquée à toutes les lignes importées</span>
            </>
          )}
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Déposez votre fichier ici</p>
        <p className="text-sm text-gray-600 mb-4">ou cliquez pour sélectionner un fichier</p>
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInputChange}
          className="max-w-xs mx-auto"
          disabled={!selectedProject || isProcessing}
        />
        <p className="text-xs text-gray-500 mt-2">
          Formats supportés : .xlsx, .xls, .csv
        </p>
        <p className="text-xs text-blue-600 mt-1">
          ✅ Les dates Excel sont automatiquement converties au format YYYY-MM-DD
        </p>
      </div>

      {selectedFile && (
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {isProcessing && (
              <Badge variant="outline">Traitement...</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
