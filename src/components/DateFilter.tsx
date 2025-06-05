
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  startDate?: Date;
  endDate?: Date;
  onDateChange: (startDate?: Date, endDate?: Date) => void;
}

export const DateFilter = ({ startDate, endDate, onDateChange }: DateFilterProps) => {
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);

  const handleApply = () => {
    onDateChange(tempStartDate, tempEndDate);
  };

  const handleReset = () => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    onDateChange(undefined, undefined);
  };

  const isFiltered = startDate || endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-5 w-5" />
          Filtre par période
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date de début</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !tempStartDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempStartDate ? format(tempStartDate, 'dd/MM/yyyy') : 'Sélectionner...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tempStartDate}
                  onSelect={setTempStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date de fin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !tempEndDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempEndDate ? format(tempEndDate, 'dd/MM/yyyy') : 'Sélectionner...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tempEndDate}
                  onSelect={setTempEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex-1">
            Appliquer le filtre
          </Button>
        </div>

        {isFiltered && (
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            <strong>Période active :</strong> 
            {startDate && ` Du ${format(startDate, 'dd/MM/yyyy', { locale: fr })}`}
            {endDate && ` au ${format(endDate, 'dd/MM/yyyy', { locale: fr })}`}
            {!startDate && endDate && ` Jusqu'au ${format(endDate, 'dd/MM/yyyy', { locale: fr })}`}
            {startDate && !endDate && ` À partir du ${format(startDate, 'dd/MM/yyyy', { locale: fr })}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
