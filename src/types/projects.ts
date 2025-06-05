
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TopAd {
  brand: string;
  month: string;
  ad_id: string;
  link_title: string;
  reach: number;
  duration: number;
  budget_estimated: number;
  start_date: string;
  end_date: string;
  rank: number;
}

export interface TopAdsAnalysis {
  byReach: TopAd[];
  byDuration: TopAd[];
}
