
export type AdRawData = {
  ad_id: string;
  snapshot_url: string;
  body: string;
  legend?: string;
  description?: string;
  title?: string;
  audience_total: number;
  start_date: string; // ISO format attendu
  end_date?: string;
  brand?: string;
  format?: 'Vidéo' | 'Image' | 'Carrousel' | 'Inconnu';
  sector?: string;
  audience_breakdown?: Record<string, number>; // ex: "18-24_H": 421, "25-34_F": 934
  status: 'valide' | 'exclue' | 'incomplète';
  exclusion_reason?: string;
};

export interface ParsedImportResult {
  data: AdRawData[];
  errors: string[];
  warnings: string[];
  totalLines: number;
  validLines: number;
  excludedLines: number;
  incompleteLines: number;
}
