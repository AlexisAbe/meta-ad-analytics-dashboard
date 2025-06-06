
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { FileParseResult } from '@/services/fileParser';

interface FileParseResultsProps {
  fileResult: FileParseResult;
  isProcessing: boolean;
  selectedProject?: any;
  onConfigureMapping: () => void;
}

export const FileParseResults = ({
  fileResult,
  isProcessing,
  selectedProject,
  onConfigureMapping
}: FileParseResultsProps) => {
  if (!fileResult || isProcessing) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {fileResult.totalRows} lignes de données
        </Badge>
        <Badge variant="outline">
          {fileResult.headers.length} colonnes détectées
        </Badge>
        {fileResult.errors.length > 0 && (
          <Badge variant="destructive">
            {fileResult.errors.length} erreur(s)
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onConfigureMapping}
          disabled={!selectedProject}
        >
          Configurer le mapping des colonnes
        </Button>
      </div>

      {fileResult.errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erreurs de parsing ({fileResult.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-red-700 space-y-1">
              {fileResult.errors.slice(0, 10).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
              {fileResult.errors.length > 10 && (
                <li>... et {fileResult.errors.length - 10} autres erreurs</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
