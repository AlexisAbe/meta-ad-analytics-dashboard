
import { supabase } from '@/integrations/supabase/client';
import { AdsData } from '@/types/ads';

export const adsDataService = {
  async getAllAds(): Promise<AdsData[]> {
    const { data, error } = await supabase
      .from('ads_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ads:', error);
      throw error;
    }
    
    return data || [];
  },

  async getAdsByBrands(brands: string[]): Promise<AdsData[]> {
    if (brands.length === 0) return this.getAllAds();
    
    const { data, error } = await supabase
      .from('ads_data')
      .select('*')
      .in('brand', brands)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ads by brands:', error);
      throw error;
    }
    
    return data || [];
  },

  async insertAds(ads: AdsData[]): Promise<void> {
    const { error } = await supabase
      .from('ads_data')
      .insert(ads);
    
    if (error) {
      console.error('Error inserting ads:', error);
      throw error;
    }
  },

  async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from('ads_data')
      .select('brand')
      .order('brand');
    
    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
    
    const uniqueBrands = [...new Set(data?.map(item => item.brand) || [])];
    return uniqueBrands;
  }
};
