
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Calendar } from 'lucide-react';
import { AdsData } from '@/types/ads';

interface SeasonHeatmapProps {
  ads: AdsData[];
}

export const SeasonHeatmap = ({ ads }: SeasonHeatmapProps) => {
  const monthlyData = useMemo(() => {
    const monthlyStats: { [key: string]: { ads: number; reach: number; budget: number } } = {};
    
    ads.forEach(ad => {
      const month = ad.start_month;
      if (!monthlyStats[month]) {
        monthlyStats[month] = { ads: 0, reach: 0, budget: 0 };
      }
      monthlyStats[month].ads += 1;
      monthlyStats[month].reach += ad.audience_eu_total;
      monthlyStats[month].budget += ad.budget_estimated;
    });

    return Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { 
          month: 'short', 
          year: 'numeric' 
        }),
        ads: stats.ads,
        reach: stats.reach,
        budget: Math.round(stats.budget / 1000), // en milliers
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [ads]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Évolution Mensuelle - Nombre de Publicités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ads" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reach Mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Reach']} />
                <Line 
                  type="monotone" 
                  dataKey="reach" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  dot={{ fill: '#00C49F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Mensuel (k€)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}k €`, 'Budget']} />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  dot={{ fill: '#FFBB28' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
