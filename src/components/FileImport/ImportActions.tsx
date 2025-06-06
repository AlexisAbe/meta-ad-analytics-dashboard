
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { AdRawData } from '@/types/adRawData';

interface ImportActionsProps {
  parseResult: any;
  parsedData: AdRawData[];
  selectedProject?: any;
  isInserting: boolean;
  onImport: () => void;
  onExportExcluded: () => void;
}

export const ImportActions = ({
  parseResult,
  parsedData,
  selectedProject,
  isInserting,
  onImport,
  onExportExcluded
}: ImportActionsProps) => {
  if (!parseResult) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          Total: {parseResult.totalLines} lignes
        </Badge>
        <Badge variant="outline" className="text-green-600">
          Valides: {parseResult.validLines}
        </Badge>
        {parseResult.excludedLines > 0 && (
          <Badge variant="outline" className="text-red-600">
            Exclues: {parseResult.excludedLines}
          </Badge>
        )}
        {parseResult.incompleteLines > 0 && (
          <Badge variant="outline" className="text-orange-600">
            Incomplètes: {parseResult.incompleteLines}
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onImport}
          disabled={!selectedProject || isInserting || parseResult?.validLines === 0}
          className="flex-1"
        >
          {isInserting ? 'Import en cours...' : `Importer ${parseResult?.validLines || 0} publicités valides`}
        </Button>
        {parseResult?.excludedLines > 0 && (
          <Button
            variant="outline"
            onClick={onExportExcluded}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export exclues
          </Button>
        )}
      </div>
    </div>
  );
};
