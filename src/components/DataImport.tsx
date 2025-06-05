
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { adsDataProcessor } from '@/services/adsDataProcessor';
import { useAdsData } from '@/hooks/useAdsData';
import { toast } from '@/hooks/use-toast';

export const DataImport = () => {
  const [rawData, setRawData] = useState('');
  const [preview, setPreview] = useState<string[][]>([]);
  const { insertAds, isInserting } = useAdsData();

  const handleProcess = () => {
    if (!rawData.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller des données à traiter",
        variant: "destructive",
      });
      return;
    }

    try {
      const processed = adsDataProcessor.processSheetData(rawData);
      
      if (processed.errors.length > 0) {
        toast({
          title: "Attention",
          description: `${processed.errors.length} erreurs détectées lors du traitement`,
          variant: "destructive",
        });
        console.log('Erreurs:', processed.errors);
      }

      if (processed.data.length > 0) {
        setPreview(processed.preview);
        insertAds(processed.data);
      } else {
        toast({
          title: "Erreur",
          description: "Aucune donnée valide trouvée",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement des données",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import de données Google Sheets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Note :</strong> Les données existantes seront automatiquement mises à jour si elles ont le même ID de publicité et la même marque.
        </div>
        
        <Textarea
          placeholder="Collez ici les données copiées depuis Google Sheets (Ctrl+V)..."
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          rows={8}
          className="font-mono text-sm"
        />
        
        <Button 
          onClick={handleProcess}
          disabled={!rawData.trim() || isInserting}
          className="w-full"
        >
          {isInserting ? 'Traitement en cours...' : 'Traiter les données'}
        </Button>

        {preview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Aperçu des données (5 premières lignes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className={i === 0 ? 'font-semibold bg-gray-50' : ''}>
                        {row.slice(0, 5).map((cell, j) => (
                          <td key={j} className="border p-1 truncate max-w-32">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
