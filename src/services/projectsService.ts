
import { supabase } from '@/integrations/supabase/client';
import { Project, TopAd } from '@/types/projects';

export const projectsService = {
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    
    return data || [];
  },

  async createProject(project: { name: string; description?: string }): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }
    
    return data;
  },

  async updateProject(id: string, updates: { name?: string; description?: string }): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  async getTopAdsByProject(
    projectId: string, 
    limit: number = 10, 
    metric: 'reach' | 'duration' = 'reach'
  ): Promise<TopAd[]> {
    console.log('🔍 Calling getTopAdsByProject with:', { projectId, limit, metric });
    
    const { data, error } = await supabase
      .rpc('get_top_ads_by_project', {
        p_project_id: projectId,
        p_limit: limit,
        p_metric: metric
      });
    
    if (error) {
      console.error('Error fetching top ads:', error);
      throw error;
    }
    
    console.log('📊 Raw data from get_top_ads_by_project:', data);
    console.log('📊 First item structure:', data?.[0]);
    console.log('📊 Snapshot URLs in data:', data?.map(item => ({ 
      ad_id: item.ad_id, 
      snapshot_url: item.snapshot_url,
      has_snapshot_url: !!item.snapshot_url 
    })));
    
    return data || [];
  }
};
