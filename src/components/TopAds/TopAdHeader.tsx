
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, User } from 'lucide-react';
import { DemographicBadge } from '../Demographics/DemographicBadge';
import { DemographicDisplayData } from '@/utils/demographicUtils';

interface TopAdHeaderProps {
  brand: string;
  rank: number;
  dateStatus: {
    label: string;
    color: string;
  };
  demographicDisplay: DemographicDisplayData;
  hasValidUrl: boolean;
  snapshotUrl?: string;
  linkTitle?: string;
  adId: string;
  onShowAudienceModal: () => void;
}

export const TopAdHeader = ({
  brand,
  rank,
  dateStatus,
  demographicDisplay,
  hasValidUrl,
  snapshotUrl,
  linkTitle,
  adId,
  onShowAudienceModal
}: TopAdHeaderProps) => {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant="outline">{brand}</Badge>
        <Badge variant="secondary">#{rank}</Badge>
        <Badge className={`text-xs ${dateStatus.color}`}>
          {dateStatus.label}
        </Badge>
        
        <DemographicBadge data={demographicDisplay} />
        
        {hasValidUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(snapshotUrl, '_blank')}
            className="h-6 px-2 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Voir pub
          </Button>
        )}
        
        {demographicDisplay.showAudienceButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowAudienceModal}
            className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
            title="Voir l'analyse d'audience détaillée"
          >
            <User className="h-3 w-3 mr-1" />
            Voir l'audience
          </Button>
        )}
        
        {!hasValidUrl && (
          <span className="text-xs text-gray-400">Pas d'URL</span>
        )}
      </div>
      <h4 className="font-medium text-sm mb-1 line-clamp-2">
        {linkTitle || adId}
      </h4>
    </div>
  );
};
