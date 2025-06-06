
export interface ColumnMapping {
  [key: string]: number | null;
}

export const columnDetector = {
  detectColumns(headers: string[]): Record<string, number | null> {
    const mapping: Record<string, number | null> = {
      ad_id: null,
      snapshot_url: null,
      body: null,
      legend: null,
      description: null,
      title: null,
      audience_total: null,
      start_date: null,
      end_date: null,
      format: null,
      brand: null,
      sector: null
    };

    const fieldPatterns = {
      ad_id: ['ID de la publicité', 'Ad ID', 'ID', 'id', 'ad_id'],
      snapshot_url: ['URL de la snapshot', 'Snapshot URL', 'URL snapshot', 'snapshot_url'],
      body: ['Corps de la publicité', 'Ad Body', 'Corps', 'Body', 'body'],
      legend: ['Légendes du lien', 'Link Caption', 'Légendes', 'legend'],
      description: ['Description du lien', 'Link Description', 'Description', 'description'],
      title: ['Titre du lien', 'Link Title', 'Titre', 'title'],
      audience_total: ['Audience totale en Europe', 'Audience Europe', 'Total Audience', 'audience_total'],
      start_date: ['Date de début', 'Start Date', 'Début', 'start_date'],
      end_date: ['Date de fin', 'End Date', 'Fin', 'end_date'],
      format: ['Format créatif', 'Creative Format', 'Format', 'format'],
      brand: ['Marque', 'Brand', 'brand'],
      sector: ['Secteur', 'Sector', 'sector']
    };

    Object.entries(fieldPatterns).forEach(([field, patterns]) => {
      const index = headers.findIndex(header => 
        patterns.some(pattern => 
          header.toLowerCase().trim().includes(pattern.toLowerCase())
        )
      );
      mapping[field] = index !== -1 ? index : null;
    });

    return mapping;
  }
};
