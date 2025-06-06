
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, HelpCircle } from 'lucide-react';
import { demographicColumnDetector } from '@/services/parsers/demographicColumnDetector';

interface DemographicColumnsHelpProps {
  missingColumns?: string[];
  showExamples?: boolean;
}

export const DemographicColumnsHelp = ({ 
  missingColumns = [], 
  showExamples = true 
}: DemographicColumnsHelpProps) => {
  const handleDownloadTemplate = () => {
    // Créer un fichier CSV template avec les colonnes attendues
    const headers = [
      'ID de la publicité',
      'URL de la snapshot',
      'Corps de la publicité',
      'Titre du lien',
      'Audience totale en Europe',
      'Date de début',
      'Date de fin',
      'Marque',
      'Format créatif',
      // Colonnes démographiques
      'Audience France 18-24 Hommes',
      'Audience France 18-24 Femmes',
      'Audience France 25-34 Hommes',
      'Audience France 25-34 Femmes',
      'Audience France 35-44 Hommes',
      'Audience France 35-44 Femmes',
      'Audience France 45-54 Hommes',
      'Audience France 45-54 Femmes',
      'Audience France 55-64 Hommes',
      'Audience France 55-64 Femmes',
      'Audience France 65+ Hommes',
      'Audience France 65+ Femmes'
    ];

    const exampleRow = [
      'AD12345678',
      'https://example.com/snapshot.jpg',
      'Découvrez notre nouvelle collection printemps 2024',
      'Nouvelle Collection',
      '150000',
      '2024-03-01',
      '2024-03-31',
      'Ma Marque',
      'Image',
      // Données démographiques d'exemple
      '12000', '13000', '22000', '23000', '18000', '19000',
      '15000', '16000', '8000', '9000', '3000', '4000'
    ];

    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-import-publicites-demographics.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const examples = demographicColumnDetector.getExpectedColumnExamples();

  return (
    <div className="space-y-4">
      {missingColumns.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Données démographiques non disponibles</p>
              <p className="text-sm">
                Les colonnes suivantes n'ont pas été détectées dans votre fichier :
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {missingColumns.slice(0, 6).map((col, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {col}
                  </Badge>
                ))}
                {missingColumns.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{missingColumns.length - 6} autres
                  </Badge>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showExamples && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1 space-y-3">
              <h4 className="font-medium text-blue-900">
                Formats de colonnes démographiques acceptés
              </h4>
              
              <div className="text-sm text-blue-800 space-y-2">
                <p>Le système détecte automatiquement ces formats :</p>
                <ul className="list-disc pl-4 space-y-1">
                  {examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger un template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
