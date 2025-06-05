
export interface AdsData {
  id?: string;
  ad_id: string;
  brand: string;
  snapshot_url?: string;
  ad_body?: string;
  link_caption?: string;
  link_description?: string;
  link_title?: string;
  audience_eu_total: number;
  start_date: string;
  end_date: string;
  audience_fr_18_24_h?: number;
  audience_fr_18_24_f?: number;
  audience_fr_25_34_h?: number;
  audience_fr_25_34_f?: number;
  audience_fr_35_44_h?: number;
  audience_fr_35_44_f?: number;
  audience_fr_45_54_h?: number;
  audience_fr_45_54_f?: number;
  audience_fr_55_64_h?: number;
  audience_fr_55_64_f?: number;
  audience_fr_65_plus_h?: number;
  audience_fr_65_plus_f?: number;
  days_active: number;
  budget_estimated: number;
  creative_format?: string;
  start_month: string;
  created_at?: string;
}

export interface KPIData {
  activeAds: number;
  newAdsThisMonth: number;
  avgDuration: number;
  totalReach: number;
  estimatedBudget: number;
  renewalRate: number;
}

export interface ProcessedSheetData {
  data: AdsData[];
  errors: string[];
  preview: string[][];
}
