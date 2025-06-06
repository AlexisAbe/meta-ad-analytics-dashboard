
import { AdsData, ProcessedSheetData } from '@/types/ads';
import { dataValidator } from './dataValidator';
import { adMapper } from './adMapper';

export const dataProcessor = {
  processSheetData(rawData: string, forcedBrandName?: string): ProcessedSheetData {
    const errors: string[] = [];
    const processedData: AdsData[] = [];
    
    if (!rawData.trim()) {
      return { data: [], errors: ['Aucune donnée à traiter'], preview: [] };
    }
    
    console.log('🚀 Début du traitement des données');
    console.log('Données brutes (100 premiers caractères):', rawData.substring(0, 100));
    
    // Validation et correction automatique
    const validation = dataValidator.validateAndCorrectSheetData(rawData);
    
    console.log('📋 Résultat de la validation:', {
      isValid: validation.isValid,
      errorsCount: validation.errors.length,
      warningsCount: validation.warnings.length,
      hasCorrectedData: !!validation.correctedData
    });
    
    // Afficher les messages de validation
    validation.warnings.forEach(warning => {
      console.log('⚠️ Avertissement:', warning);
      errors.push(`Avertissement: ${warning}`);
    });
    
    validation.suggestions.forEach(suggestion => {
      console.log('💡 Suggestion:', suggestion);
    });
    
    if (validation.errors.length > 0) {
      console.log('❌ Erreurs de validation:', validation.errors);
      return { 
        data: [], 
        errors: [...errors, ...validation.errors], 
        preview: [] 
      };
    }
    
    // Utiliser les données corrigées si disponibles
    const dataToProcess = validation.correctedData || rawData;
    const lines = dataToProcess.trim().split('\n');
    
    console.log('📊 Traitement des données corrigées - Nombre de lignes:', lines.length);
    
    if (lines.length === 0) {
      return { data: [], errors: ['Aucune donnée à traiter après validation'], preview: [] };
    }
    
    // Headers expected (first line)
    const headers = lines[0].split('\t');
    const preview = lines.slice(0, 5).map(line => line.split('\t'));
    
    console.log('📝 Headers detectés:', headers);
    console.log('📏 Nombre de colonnes:', headers.length);
    console.log('🏷️ Marque forcée:', forcedBrandName);
    
    if (lines.length > 1) {
      console.log('📄 Première ligne de données (exemple):', lines[1]?.split('\t').slice(0, 10));
    }
    
    // Check if we have enough columns
    if (headers.length < 6) {
      errors.push(`Trop peu de colonnes détectées (${headers.length}). Assurez-vous de copier toutes les colonnes depuis Google Sheets.`);
      return { data: [], errors, preview };
    }
    
    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split('\t');
        console.log(`📋 Ligne ${i + 1} - Nombre de valeurs:`, values.length);
        console.log(`📋 Ligne ${i + 1} - Premières valeurs:`, values.slice(0, 10));
        
        const ad = adMapper.mapRowToAd(headers, values, forcedBrandName);
        if (ad) {
          console.log(`✅ Ligne ${i + 1} - Ad créée:`, {
            ad_id: ad.ad_id,
            start_date: ad.start_date,
            brand: ad.brand,
            snapshot_url: ad.snapshot_url?.substring(0, 50) + '...'
          });
          processedData.push(ad);
        } else {
          console.log(`❌ Ligne ${i + 1} - Données insuffisantes`);
          errors.push(`Ligne ${i + 1}: Données insuffisantes (ID ou date de début manquante)`);
        }
      } catch (error) {
        console.error(`💥 Erreur ligne ${i + 1}:`, error);
        errors.push(`Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
    
    console.log('📈 Données traitées avec succès:', processedData.length);
    console.log('🚨 Erreurs rencontrées:', errors.length);
    
    return { data: processedData, errors, preview };
  }
};
