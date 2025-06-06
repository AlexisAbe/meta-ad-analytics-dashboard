
import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TopAdDateSectionProps {
  startDate: string;
  endDate?: string;
}

export const TopAdDateSection = ({ startDate, endDate }: TopAdDateSectionProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">Début :</span>
          <span className="font-medium">{formatDate(startDate)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Fin :</span>
          <span className="font-medium">
            {endDate ? formatDate(endDate) : 'Encore active'}
          </span>
        </div>
      </div>
    </div>
  );
};
