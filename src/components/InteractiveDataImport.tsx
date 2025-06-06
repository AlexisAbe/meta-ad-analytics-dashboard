
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { intelligentParser } from '@/services/intelligentParser';
import { useAdsData } from '@/hooks/useAdsData';
import { toast } from '@/hooks/use-toast';
import { Project } from '@/types/projects';
import { AdRawData } from '@/types/adRawData';
import { AdsData } from '@/types/ads';

interface InteractiveDataImportProps {
  selectedProject?: Project;
  forcedBrand?: string;
}

export const InteractiveDataImport = ({ selectedProject, forcedBrand }: InteractiveDataImportProps) => {
  const [rawInput, setRawInput] = useState('');
  const [parsedData, setParsedData] = useState<AdRawData[]>([]);
  const [parseResult, setParseResult] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { insertAds, isInserting } = useAdsData([], selectedProject?.id);

  // Parse automatiquement dès qu'on colle des données
  useEffect(() => {
    if (rawInput.trim()) {
      const result = intelligentParser.parseRawInputToAdData(rawInput, forcedBrand);
      setParseResult(result);
      setParsedData(result.data);
      setIsPreviewMode(true);
    } else {
      setIsPreviewMode(false);
      setParsedData([]);
      setParseResult(null);
    }
  }, [rawInput, forcedBrand]);

  const handleImport = () => {
    if (!selectedProject) {
      toast({
        title: "Projet requis",
        description: "Veuillez sélectionner un projet avant d'importer",
        variant: "destructive",
      });
      return;
    }

    const validAds = parsedData.filter(ad => ad.status === 'valide');
    
    if (validAds.length === 0) {
      toast({
        title: "Aucune donnée valide",
        description: "Aucune publicité valide trouvée à importer",
        variant: "destructive",
      });
      return;
    }

    // Conversion vers le format AdsData existant
    const adsData: AdsData[] = validAds.map(ad => ({
      ad_id: ad.ad_id,
      brand: ad.brand || 'Marque non identifiée',
      project_id: selectedProject.id,
      snapshot_url: ad.snapshot_url,
      ad_body: ad.body,
      link_caption: ad.legend,
      link_description: ad.description,
      link_title: ad.title,
      audience_eu_total: ad.audience_total,
      start_date: ad.start_date,
      end_date: ad.end_date || new Date().toISOString().split('T')[0],
      days_active: ad.start_date && ad.end_date 
        ? Math.ceil((new Date(ad.end_date).getTime() - new Date(ad.start_date).getTime()) / (1000 * 60 * 60 * 24))
        : 1,
      budget_estimated: ad.audience_total * 5,
      creative_format: ad.format,
      start_month: ad.start_date ? new Date(ad.start_date).toISOString().substring(0, 7) : '',
      // Valeurs par défaut pour les champs démographiques
      audience_fr_18_24_h: 0,
      audience_fr_18_24_f: 0,
      audience_fr_25_34_h: 0,
      audience_fr_25_34_f: 0,
      audience_fr_35_44_h: 0,
      audience_fr_35_44_f: 0,
      audience_fr_45_54_h: 0,
      audience_fr_45_54_f: 0,
      audience_fr_55_64_h: 0,
      audience_fr_55_64_f: 0,
      audience_fr_65_plus_h: 0,
      audience_fr_65_plus_f: 0,
    }));

    insertAds(adsData);
  };

  const handleExportExcluded = () => {
    const excludedAds = parsedData.filter(ad => ad.status === 'exclue');
    const csvData = [
      ['ID', 'Audience', 'Date début', 'Date fin', 'Marque', 'Format', 'Raison exclusion'].join(','),
      ...excludedAds.map(ad => [
        ad.ad_id,
        ad.audience_total,
        ad.start_date,
        ad.end_date || 'N/A',
        ad.brand || 'N/A',
        ad.format || 'N/A',
        `"${ad.exclusion_reason || 'Inconnue'}"`
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import intelligent de données publicitaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  <strong>Marque forcée :</strong> {forcedBrand}
                </>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Données à importer (Excel/Google Sheets)
            </label>
            <Textarea
              placeholder="Collez ici vos données copiées depuis Excel ou Google Sheets (avec les en-têtes)..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              disabled={!selectedProject}
            />
            <p className="text-xs text-gray-600 mt-1">
              Les données sont analysées automatiquement dès le collage
            </p>
          </div>

          {/* Badges de statut global */}
          {parseResult && (
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
          )}

          {/* Actions */}
          {isPreviewMode && (
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={!selectedProject || isInserting || parseResult?.validLines === 0}
                className="flex-1"
              >
                {isInserting ? 'Import en cours...' : `Importer ${parseResult?.validLines || 0} publicités valides`}
              </Button>
              {parseResult?.excludedLines > 0 && (
                <Button
                  variant="outline"
                  onClick={handleExportExcluded}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export exclues
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview des données */}
      {isPreviewMode && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Aperçu des données importées ({parsedData.length} lignes)
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
                        <Badge variant="outline" className="text-xs">
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
      )}

      {/* Erreurs de parsing */}
      {parseResult?.errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erreurs de parsing ({parseResult.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-red-700 space-y-1">
              {parseResult.errors.slice(0, 10).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
              {parseResult.errors.length > 10 && (
                <li>... et {parseResult.errors.length - 10} autres erreurs</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
