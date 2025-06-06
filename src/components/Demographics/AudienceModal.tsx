
import React from 'react';
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
  // Calculer les données démographiques pour cette publicité
  const adDemographics = demographicAnalyzer.calculateDemographicBreakdown([ad]);
  
  // Calculer la moyenne globale si demandée
  const comparison = showComparison && allAds.length > 0 
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
        </div>

        {/* Options de vue */}
        {allAds.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Affichage :</span>
            <Button
              variant={!showComparison ? "default" : "outline"}
              size="sm"
              onClick={() => {/* Toggle comparison - à implémenter */}}
            >
              Vue simple
            </Button>
            <Button
              variant={showComparison ? "default" : "outline"}
              size="sm"
              onClick={() => {/* Toggle comparison - à implémenter */}}
            >
              vs Moyenne globale
            </Button>
          </div>
        )}

        {/* Graphique démographique */}
        <DemographicChart
          data={adDemographics}
          comparison={comparison}
          showComparison={showComparison}
          title="Répartition d'audience (France)"
        />

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
