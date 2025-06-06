import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import { fileParser, FileParseResult } from '@/services/fileParser';
import { ExtendedColumnMapping, columnDetector } from '@/services/parsers/columnDetector';
import { ColumnMappingDialog } from './ColumnMappingDialog';
import { FileUploadZone } from './FileImport/FileUploadZone';
import { FileParseResults } from './FileImport/FileParseResults';
import { ImportActions } from './FileImport/ImportActions';
import { DataPreview } from './FileImport/DataPreview';
import { DemographicColumnsHelp } from './Demographics/DemographicColumnsHelp';
import { useAdsData } from '@/hooks/useAdsData';
import { toast } from '@/hooks/use-toast';
import { Project } from '@/types/projects';
import { AdRawData } from '@/types/adRawData';
import { AdsData } from '@/types/ads';

interface FileDataImportProps {
  selectedProject?: Project;
  forcedBrand?: string;
}

export const FileDataImport = ({ selectedProject, forcedBrand }: FileDataImportProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileResult, setFileResult] = useState<FileParseResult | null>(null);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [columnMapping, setColumnMapping] = useState<ExtendedColumnMapping>(columnDetector.createEmptyMapping());
  const [parsedData, setParsedData] = useState<AdRawData[]>([]);
  const [parseResult, setParseResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { insertAds, isInserting } = useAdsData([], selectedProject?.id);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    
    try {
      console.log('📁 Traitement du fichier:', file.name);
      const result = await fileParser.parseFile(file);
      setFileResult(result);
      setColumnMapping(result.detectedColumns as ExtendedColumnMapping);
      
      if (result.errors.length > 0) {
        toast({
          title: "Attention",
          description: `${result.errors.length} erreur(s) détectée(s) lors du parsing`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: `Fichier parsé avec succès (${result.totalRows} lignes)`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la lecture du fichier",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processDataWithMapping = () => {
    if (!fileResult) return;

    console.log('🔄 Traitement avec mapping et marque forcée:', forcedBrand);
    const result = fileParser.convertToAdData(fileResult.data, columnMapping, forcedBrand);
    setParseResult(result);
    setParsedData(result.data);
    setShowMappingDialog(false);

    toast({
      title: "Mapping appliqué",
      description: `${result.validLines} publicités valides détectées${forcedBrand ? ` pour la marque ${forcedBrand}` : ''}`,
    });
  };

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
      // Données démographiques depuis audience_breakdown
      audience_fr_18_24_h: ad.audience_breakdown?.['audience_fr_18_24_h'] || 0,
      audience_fr_18_24_f: ad.audience_breakdown?.['audience_fr_18_24_f'] || 0,
      audience_fr_25_34_h: ad.audience_breakdown?.['audience_fr_25_34_h'] || 0,
      audience_fr_25_34_f: ad.audience_breakdown?.['audience_fr_25_34_f'] || 0,
      audience_fr_35_44_h: ad.audience_breakdown?.['audience_fr_35_44_h'] || 0,
      audience_fr_35_44_f: ad.audience_breakdown?.['audience_fr_35_44_f'] || 0,
      audience_fr_45_54_h: ad.audience_breakdown?.['audience_fr_45_54_h'] || 0,
      audience_fr_45_54_f: ad.audience_breakdown?.['audience_fr_45_54_f'] || 0,
      audience_fr_55_64_h: ad.audience_breakdown?.['audience_fr_55_64_h'] || 0,
      audience_fr_55_64_f: ad.audience_breakdown?.['audience_fr_55_64_f'] || 0,
      audience_fr_65_plus_h: ad.audience_breakdown?.['audience_fr_65_plus_h'] || 0,
      audience_fr_65_plus_f: ad.audience_breakdown?.['audience_fr_65_plus_f'] || 0,
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

  // Déterminer les colonnes démographiques manquantes
  const demographicColumns = [
    'audience_fr_18_24_h', 'audience_fr_18_24_f',
    'audience_fr_25_34_h', 'audience_fr_25_34_f',
    'audience_fr_35_44_h', 'audience_fr_35_44_f',
    'audience_fr_45_54_h', 'audience_fr_45_54_f',
    'audience_fr_55_64_h', 'audience_fr_55_64_f',
    'audience_fr_65_plus_h', 'audience_fr_65_plus_f'
  ];

  const missingDemographicColumns = fileResult ? 
    demographicColumns.filter(col => 
      columnMapping[col as keyof ExtendedColumnMapping] === null
    ) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import de fichier Excel/CSV (Recommandé)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadZone
            selectedProject={selectedProject}
            forcedBrand={forcedBrand}
            selectedFile={selectedFile}
            isProcessing={isProcessing}
            onFileSelect={handleFileSelect}
          />

          <FileParseResults
            fileResult={fileResult}
            isProcessing={isProcessing}
            selectedProject={selectedProject}
            onConfigureMapping={() => setShowMappingDialog(true)}
          />

          {/* Aide pour les colonnes démographiques */}
          {fileResult && missingDemographicColumns.length > 0 && (
            <DemographicColumnsHelp 
              missingColumns={missingDemographicColumns}
              showExamples={true}
            />
          )}

          <ImportActions
            parseResult={parseResult}
            parsedData={parsedData}
            selectedProject={selectedProject}
            isInserting={isInserting}
            onImport={handleImport}
            onExportExcluded={handleExportExcluded}
          />
        </CardContent>
      </Card>

      <DataPreview
        parsedData={parsedData}
        forcedBrand={forcedBrand}
      />

      <ColumnMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        headers={fileResult?.headers || []}
        mapping={columnMapping}
        onMappingChange={setColumnMapping}
        onConfirm={processDataWithMapping}
      />
    </div>
  );
};
