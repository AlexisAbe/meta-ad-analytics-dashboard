
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { AdRawData } from '@/types/adRawData';

interface DataPreviewProps {
  parsedData: AdRawData[];
  forcedBrand?: string;
}

export const DataPreview = ({ parsedData, forcedBrand }: DataPreviewProps) => {
  if (parsedData.length === 0) return null;

  const getStatusIcon = (status: AdRawData['status']) => {
    switch (status) {
      case 'valide':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'exclue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'incomplète':
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: AdRawData['status']) => {
    switch (status) {
      case 'valide':
        return 'bg-green-50 border-green-200';
      case 'exclue':
        return 'bg-red-50 border-red-200';
      case 'incomplète':
        return 'bg-orange-50 border-orange-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Aperçu des données importées ({parsedData.length} lignes)</span>
          {forcedBrand && (
            <Badge variant="outline" className="text-sm">
              Marque: {forcedBrand}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statut</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Contenu</TableHead>
                <TableHead>Raison</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedData.slice(0, 20).map((ad, index) => (
                <TableRow key={index} className={getStatusColor(ad.status)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ad.status)}
                      <span className="text-xs capitalize">{ad.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {ad.ad_id}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${ad.brand === forcedBrand ? 'bg-blue-50 border-blue-300' : ''}`}
                    >
                      {ad.brand}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ad.audience_total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs">
                    {ad.start_date}<br />
                    {ad.end_date && `→ ${ad.end_date}`}
                  </TableCell>
                  <TableCell className="text-xs">
                    {ad.format}
                  </TableCell>
                  <TableCell className="max-w-40 truncate text-xs">
                    {ad.title || ad.body}
                  </TableCell>
                  <TableCell className="text-xs">
                    {ad.exclusion_reason && (
                      <Badge variant="destructive" className="text-xs">
                        {ad.exclusion_reason}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {parsedData.length > 20 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              ... et {parsedData.length - 20} autres lignes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
