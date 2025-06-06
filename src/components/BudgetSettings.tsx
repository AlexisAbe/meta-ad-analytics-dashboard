
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Trash2, Calendar } from 'lucide-react';
import { BudgetSettings as BudgetSettingsType, AdType } from '@/types/budget';
import { budgetCalculator } from '@/services/budgetCalculator';

interface BudgetSettingsProps {
  onSettingsChange: (settings: Partial<BudgetSettingsType>) => void;
}

export const BudgetSettings = ({ onSettingsChange }: BudgetSettingsProps) => {
  const [settings, setSettings] = useState<BudgetSettingsType>(budgetCalculator.getSettings());
  const [newSector, setNewSector] = useState('');
  const [newSectorCpm, setNewSectorCpm] = useState('');
  const [useForcedEndDate, setUseForcedEndDate] = useState(!!settings.forcedEndDate);

  const updateSettings = (newSettings: Partial<BudgetSettingsType>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  const updateCpmByType = (type: AdType, cpm: number) => {
    updateSettings({
      cpmByType: { ...settings.cpmByType, [type]: cpm }
    });
  };

  const addSector = () => {
    if (newSector && newSectorCpm) {
      updateSettings({
        cpmBySector: { 
          ...settings.cpmBySector, 
          [newSector]: parseFloat(newSectorCpm) 
        }
      });
      setNewSector('');
      setNewSectorCpm('');
    }
  };

  const removeSector = (sector: string) => {
    const { [sector]: removed, ...rest } = settings.cpmBySector;
    updateSettings({ cpmBySector: rest });
  };

  const handleForcedEndDateChange = (enabled: boolean) => {
    setUseForcedEndDate(enabled);
    if (enabled) {
      updateSettings({ forcedEndDate: new Date() });
    } else {
      const { forcedEndDate, ...rest } = settings;
      updateSettings(rest);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Paramètres de calcul de budget
        </CardTitle>
        <CardDescription>
          Configurez les CPM et paramètres pour l'estimation des budgets publicitaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CPM par défaut */}
        <div className="space-y-2">
          <Label htmlFor="defaultCpm">CPM par défaut (€)</Label>
          <Input
            id="defaultCpm"
            type="number"
            step="0.1"
            value={settings.defaultCpm}
            onChange={(e) => updateSettings({ defaultCpm: parseFloat(e.target.value) || 6 })}
            className="w-32"
          />
        </div>

        <Separator />

        {/* CPM par type de publicité */}
        <div className="space-y-4">
          <Label className="text-base font-medium">CPM par type de publicité</Label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(settings.cpmByType).map(([type, cpm]) => (
              <div key={type} className="flex items-center gap-2">
                <Label className="w-20">{type}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cpm}
                  onChange={(e) => updateCpmByType(type as AdType, parseFloat(e.target.value) || 6)}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">€</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* CPM par secteur */}
        <div className="space-y-4">
          <Label className="text-base font-medium">CPM par secteur d'activité</Label>
          
          {/* Secteurs existants */}
          <div className="space-y-2">
            {Object.entries(settings.cpmBySector).map(([sector, cpm]) => (
              <div key={sector} className="flex items-center gap-2">
                <Badge variant="outline" className="w-20">{sector}</Badge>
                <Input
                  type="number"
                  step="0.1"
                  value={cpm}
                  onChange={(e) => updateSettings({
                    cpmBySector: { 
                      ...settings.cpmBySector, 
                      [sector]: parseFloat(e.target.value) || 6 
                    }
                  })}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">€</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSector(sector)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Ajouter un nouveau secteur */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nouveau secteur"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              className="w-32"
            />
            <Input
              placeholder="CPM"
              type="number"
              step="0.1"
              value={newSectorCpm}
              onChange={(e) => setNewSectorCpm(e.target.value)}
              className="w-20"
            />
            <Button onClick={addSector} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Date de fin forcée */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Forcer la date de fin d'analyse
            </Label>
            <p className="text-sm text-gray-600">
              Utilise aujourd'hui comme date de fin pour toutes les publicités actives
            </p>
          </div>
          <Switch
            checked={useForcedEndDate}
            onCheckedChange={handleForcedEndDateChange}
          />
        </div>

        {useForcedEndDate && (
          <div className="ml-6">
            <Input
              type="date"
              value={settings.forcedEndDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateSettings({ 
                forcedEndDate: e.target.value ? new Date(e.target.value) : undefined 
              })}
              className="w-40"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
