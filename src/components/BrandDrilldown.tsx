
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Building, Crown, Users } from 'lucide-react';
import { AdsData } from '@/types/ads';

interface BrandDrilldownProps {
  ads: AdsData[];
  selectedBrands: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const BrandDrilldown = ({ ads, selectedBrands }: BrandDrilldownProps) => {
  const brandStats = useMemo(() => {
    const stats: { [key: string]: { ads: number; reach: number; budget: number; avgDuration: number } } = {};
    
    ads.forEach(ad => {
      if (!stats[ad.brand]) {
        stats[ad.brand] = { ads: 0, reach: 0, budget: 0, avgDuration: 0 };
      }
      stats[ad.brand].ads += 1;
      stats[ad.brand].reach += ad.audience_eu_total;
      stats[ad.brand].budget += ad.budget_estimated;
      stats[ad.brand].avgDuration += ad.days_active;
    });

    return Object.entries(stats).map(([brand, data]) => ({
      brand,
      ads: data.ads,
      reach: data.reach,
      budget: Math.round(data.budget / 1000),
      avgDuration: Math.round((data.avgDuration / data.ads) * 10) / 10,
    })).sort((a, b) => b.reach - a.reach);
  }, [ads]);

  const pieData = brandStats.map(stat => ({
    name: stat.brand,
    value: stat.reach,
  }));

  const topCampaigns = useMemo(() => {
    return ads
      .filter(ad => selectedBrands.length === 0 || selectedBrands.includes(ad.brand))
      .sort((a, b) => b.audience_eu_total - a.audience_eu_total)
      .slice(0, 10);
  }, [ads, selectedBrands]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Répartition du Reach par Marque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Reach']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance par Marque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brandStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ads" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Top 10 Campagnes par Reach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCampaigns.map((ad, index) => (
              <div key={ad.ad_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium truncate max-w-96">
                      {ad.link_title || ad.ad_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ad.brand} • {ad.days_active} jours
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{ad.audience_eu_total.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">reach</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
