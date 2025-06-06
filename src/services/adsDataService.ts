import { supabase } from '@/integrations/supabase/client';
import { AdsData } from '@/types/ads';

export const adsDataService = {
  async getAllAds(projectId?: string, startDate?: Date, endDate?: Date): Promise<AdsData[]> {
    let query = supabase
      .from('ads_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (startDate) {
      query = query.gte('start_date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('start_date', endDate.toISOString().split('T')[0]);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching ads:', error);
      throw error;
    }
    
    return data || [];
  },

  async getAdsByBrands(brands: string[], projectId?: string, startDate?: Date, endDate?: Date): Promise<AdsData[]> {
    if (brands.length === 0) return this.getAllAds(projectId, startDate, endDate);
    
    let query = supabase
      .from('ads_data')
      .select('*')
      .in('brand', brands)
      .order('created_at', { ascending: false });
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (startDate) {
      query = query.gte('start_date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('start_date', endDate.toISOString().split('T')[0]);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching ads by brands:', error);
      throw error;
    }
    
    return data || [];
  },

  async insertAds(ads: AdsData[], projectId?: string): Promise<void> {
    // Ajouter project_id aux données si fourni
    const adsWithProject = ads.map(ad => ({
      ...ad,
      project_id: projectId || ad.project_id
    }));

    // Utiliser insert au lieu d'upsert pour permettre les doublons
    const { error } = await supabase
      .from('ads_data')
      .insert(adsWithProject);
    
    if (error) {
      console.error('Error inserting ads:', error);
      throw error;
    }
    
    console.log(`Successfully inserted ${ads.length} ads (duplicates allowed)`);
  },

  async getBrands(projectId?: string): Promise<string[]> {
    let query = supabase
      .from('ads_data')
      .select('brand')
      .order('brand');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
    
    const uniqueBrands = [...new Set(data?.map(item => item.brand) || [])];
    return uniqueBrands;
  }
};
