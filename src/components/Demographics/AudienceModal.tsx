
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
import { Users, X, ExternalLink, Calendar } from 'lucide-react';
import { AdsData } from '@/types/ads';
import { DemographicChart } from './DemographicChart';
import { DemographicBadge } from './DemographicBadge';
import { demographicUtils } from '@/utils/demographicUtils';
import { demographicAnalyzer } from '@/services/demographicAnalyzer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: AdsData;
  allAds?: AdsData[];
  showComparison?: boolean;
}

export const AudienceModal = ({ 
  isOpen, 
  onClose, 
  ad, 
  allAds = [], 
  showComparison = false 
}: AudienceModalProps) => {
  const [showComparisonLocal, setShowComparisonLocal] = useState(showComparison);

  // Utiliser les nouveaux utilitaires
  const demographicDisplay = demographicUtils.calculateDisplayData([ad]);
  const messages = demographicUtils.getMessages();
  
  // Calculer la moyenne globale si demandée
  const comparison = showComparisonLocal && allAds.length > 0 
    ? demographicAnalyzer.compareToAverage(
        demographicDisplay.demographics.breakdown,
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

          {/* Badge de complétude utilisant le nouveau composant */}
          {demographicDisplay.hasData && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {demographicDisplay.availableAgeGroups.length}/6 tranches disponibles ({demographicDisplay.completeness}%)
              </Badge>
              <DemographicBadge data={demographicDisplay} />
            </div>
          )}
        </div>

        {/* Message d'erreur seulement si vraiment aucune donnée */}
        {!demographicDisplay.hasData && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="font-medium text-gray-700 mb-2">{messages.noDataTitle}</h4>
            <p className="text-sm text-gray-500 mb-4">{messages.noDataDescription}</p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded border">
              <p className="font-medium mb-1">Formats supportés :</p>
              <p>{messages.noDataHelp}</p>
            </div>
          </div>
        )}

        {/* Options de vue - seulement si on a des données et des données de comparaison */}
        {demographicDisplay.hasData && allAds.length > 0 && (
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
        {demographicDisplay.hasData && (
          <DemographicChart
            data={demographicDisplay.demographics}
            comparison={comparison}
            showComparison={showComparisonLocal}
            title="Répartition démographique (France)"
          />
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
