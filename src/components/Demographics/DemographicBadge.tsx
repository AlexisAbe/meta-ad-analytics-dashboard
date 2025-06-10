
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { DemographicDisplayData } from '@/utils/demographicUtils';

interface DemographicBadgeProps {
  data: DemographicDisplayData;
  size?: 'sm' | 'md';
}

export const DemographicBadge = ({ data, size = 'sm' }: DemographicBadgeProps) => {
  if (data.badgeVariant === 'none') {
    return null;
  }

  const badgeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  
  if (data.badgeVariant === 'complete') {
    return (
      <Badge variant="secondary" className={`${badgeClass} bg-green-100 text-green-800`}>
        {data.badgeText}
      </Badge>
    );
  }

  if (data.badgeVariant === 'partial') {
    return (
      <Badge variant="secondary" className={`${badgeClass} bg-orange-100 text-orange-800`}>
        <Info className="h-3 w-3 mr-1" />
        {data.badgeText}
      </Badge>
    );
  }

  return null;
};
