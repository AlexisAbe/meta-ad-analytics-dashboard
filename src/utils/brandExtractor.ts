
export const brandExtractor = {
  extractBrand(adBody: string, linkTitle: string, linkCaption: string): string {
    const content = `${adBody} ${linkTitle} ${linkCaption}`.toLowerCase();
    
    // Liste des marques courantes à détecter
    const knownBrands = [
      'picard', 'carrefour', 'leclerc', 'auchan', 'intermarché', 'monoprix',
      'franprix', 'casino', 'super u', 'système u', 'cora', 'match',
      'mcdonalds', 'kfc', 'burger king', 'quick', 'dominos', 'pizza hut',
      'nike', 'adidas', 'puma', 'decathlon', 'go sport',
      'fnac', 'darty', 'boulanger', 'cdiscount', 'amazon', 'zalando',
      'sncf', 'blablacar', 'uber', 'booking', 'airbnb',
      'orange', 'sfr', 'bouygues', 'free', 'red',
      'bmw', 'mercedes', 'audi', 'peugeot', 'renault', 'citroën',
      'credit agricole', 'bnp paribas', 'societe generale', 'lcl', 'boursorama'
    ];
    
    for (const brand of knownBrands) {
      if (content.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }
    
    // Si aucune marque connue, essayer d'extraire depuis l'URL ou le domaine
    const urlMatch = content.match(/([a-zA-Z0-9-]+)\.(?:fr|com|org|net)/);
    if (urlMatch) {
      return urlMatch[1].charAt(0).toUpperCase() + urlMatch[1].slice(1);
    }
    
    return 'Marque non identifiée';
  }
};
