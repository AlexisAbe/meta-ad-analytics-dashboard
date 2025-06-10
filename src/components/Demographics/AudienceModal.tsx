
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, X, ExternalLink, Calendar, Info } from 'lucide-react';
import { AdsData } from '@/types/ads';
import { DemographicChart } from './DemographicChart';
import { demographicAnalyzer } from '@/services/demographicAnalyzer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: AdsData;
  allAds?: AdsData[]; // Pour calculer la moyenne globale
  showComparison?: boolean;
}

export const AudienceModal = ({ 
  isOpen, 
  onClose, 
  ad, 
  allAds = [], 
  showComparison = false 
}: AudienceModalProps) => {
  // État local pour le toggle de comparaison
  const [showComparisonLocal, setShowComparisonLocal] = useState(showComparison);

  // Calculer les données démographiques pour cette publicité
  const adDemographics = demographicAnalyzer.calculateDemographicBreakdown([ad]);
  
  // Calculer la moyenne globale si demandée
  const comparison = showComparisonLocal && allAds.length > 0 
    ? demographicAnalyzer.compareToAverage(
        adDemographics.breakdown,
        demographicAnalyzer.calculateGlobalAverage(allAds)
      )
    : undefined;

  const hasValidUrl = ad.snapshot_url && 
    ad.snapshot_url.trim() !== '' && 
    ad.snapshot_url.startsWith('http');

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Message d'erreur uniquement si vraiment aucune donnée
  const showNoDataMessage = !adDemographics.hasData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5" />
                Analyse d'audience
              </DialogTitle>
              <DialogDescription className="text-left">
                Répartition démographique détaillée pour cette publicité
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Informations sur la publicité */}
        <div className="border-b pb-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{ad.brand}</Badge>
            {hasValidUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(ad.snapshot_url, '_blank')}
                className="h-6 px-2 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Voir pub
              </Button>
            )}
          </div>
          
          <h3 className="font-medium mb-2 line-clamp-2">
            {ad.link_title || ad.ad_body || ad.ad_id}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(ad.start_date)}</span>
              {ad.end_date && (
                <>
                  <span>→</span>
                  <span>{formatDate(ad.end_date)}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{ad.audience_eu_total.toLocaleString()} reach EU</span>
            </div>
          </div>

          {/* Indicateurs de complétude */}
          {adDemographics.hasData && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {adDemographics.availableAgeGroups.length}/6 tranches disponibles ({adDemographics.completeness}%)
              </Badge>
              {adDemographics.completeness < 100 && (
                <Badge variant="secondary" className="text-xs text-orange-700 bg-orange-100">
                  <Info className="h-3 w-3 mr-1" />
                  Données partielles
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Message d'aide seulement si vraiment aucune donnée */}
        {showNoDataMessage && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="font-medium text-gray-700 mb-2">Données démographiques non disponibles</h4>
            <p className="text-sm text-gray-500 mb-4">
              Aucun champ démographique détecté dans ce fichier.
            </p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded border">
              <p className="font-medium mb-1">Formats supportés :</p>
              <p>"Audience FR 25-34 Homme", "FR_35_44_Female", "45-54 H"...</p>
            </div>
          </div>
        )}

        {/* Options de vue - seulement si on a des données et des données de comparaison */}
        {adDemographics.hasData && allAds.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Affichage :</span>
            <Button
              variant={!showComparisonLocal ? "default" : "outline"}
              size="sm"
              onClick={() => setShowComparisonLocal(false)}
            >
              Vue simple
            </Button>
            <Button
              variant={showComparisonLocal ? "default" : "outline"}
              size="sm"
              onClick={() => setShowComparisonLocal(true)}
            >
              vs Moyenne globale
            </Button>
          </div>
        )}

        {/* Graphique démographique - afficher dès qu'on a des données */}
        {adDemographics.hasData && (
          <DemographicChart
            data={adDemographics}
            comparison={comparison}
            showComparison={showComparisonLocal}
            title="Répartition démographique (France)"
          />
        )}

        {/* Message informatif si des tranches sont manquantes */}
        {adDemographics.hasData && adDemographics.completeness < 100 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Certaines tranches d'âge ne sont pas renseignées dans cette publicité.</p>
                <p className="text-xs text-blue-700">
                  Tranches disponibles : {adDemographics.availableAgeGroups.join(', ')} ans ({adDemographics.completeness}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
