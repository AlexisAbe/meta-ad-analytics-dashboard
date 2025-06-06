
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Info
} from 'lucide-react';
import { AdsData } from '@/types/ads';
import { BudgetCalculation } from '@/types/budget';

interface ExcludedAdData {
  ad: AdsData;
  calculation: BudgetCalculation;
}

interface DiagnosticPanelProps {
  excludedAds: ExcludedAdData[];
  totalAds: number;
  validAds: number;
}

export const DiagnosticPanel = ({ excludedAds, totalAds, validAds }: DiagnosticPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExportCSV = () => {
    const headers = ['ID', 'Marque', 'Audience', 'Date début', 'Date fin', 'Format créatif', 'Raison exclusion'];
    const csvData = [
      headers.join(','),
      ...excludedAds.map(item => [
        item.ad.ad_id,
        item.ad.brand,
        item.ad.audience_eu_total,
        item.ad.start_date,
        item.ad.end_date,
        item.ad.creative_format || 'N/A',
        `"${item.calculation.exclusionReason || 'Inconnue'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `publicites-exclues-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Diagnostic des exclusions
            <Badge variant="outline" className="ml-2">
              {validAds} valides / {totalAds} analysées
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {excludedAds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Export CSV
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-blue-700">
                <p className="font-medium">Analyse en cours : {excludedAds.length} publicités exclues</p>
                <p className="mt-1">
                  Consultez la console pour les logs détaillés ou exportez en CSV pour analyse.
                </p>
              </div>
            </div>
          </div>

          {excludedAds.length > 0 ? (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Publicité</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Date début</TableHead>
                    <TableHead>Date fin</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Raison d'exclusion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excludedAds.slice(0, 20).map((item) => (
                    <TableRow key={item.ad.ad_id}>
                      <TableCell className="font-mono text-xs">
                        {item.ad.ad_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.ad.brand}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.ad.audience_eu_total?.toLocaleString() || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.ad.start_date || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.ad.end_date || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.ad.creative_format || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">
                          {item.calculation.exclusionReason || 'Inconnue'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {excludedAds.length > 20 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ... et {excludedAds.length - 20} autres (voir export CSV)
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Aucune publicité exclue trouvée
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};
