
import { AdsData } from '@/types/ads';
import { dateParser } from '@/utils/dateParser';
import { brandExtractor } from '@/utils/brandExtractor';
import { dataExtractor } from '@/utils/dataExtractor';

export const adMapper = {
  mapRowToAd(headers: string[], values: string[], forcedBrandName?: string): AdsData | null {
    console.log('🔗 Mapping avec headers:', headers.slice(0, 10));
    console.log('🔗 Mapping avec values:', values.slice(0, 10));
    
    // Extract ID with exact Google Sheets header - MUST be first column
    const adId = values[0]?.trim();
    
    console.log('🆔 ID extrait (première colonne):', adId);
                 
    if (!adId || adId === '') {
      console.log('❌ ID de publicité vide dans la première colonne');
      return null;
    }

    // Extract dates using the data extractor
    const { startDate, endDate } = dataExtractor.extractDates(headers, values);
    
    if (!startDate) {
      console.log('❌ Date de début manquante ou invalide');
      return null;
    }
    
    // Extract other fields using the data extractor
    const extractedData = dataExtractor.extractAdFields(headers, values);
    
    console.log('📊 Champs extraits:', {
      adId,
      audienceTotal: extractedData.audienceTotal,
      linkTitle: extractedData.linkTitle?.substring(0, 30),
      adBody: extractedData.adBody?.substring(0, 30),
      snapshotUrl: extractedData.snapshotUrl?.substring(0, 50)
    });

    // Utiliser le nom de marque forcé ou extraire intelligemment
    const brand = forcedBrandName || brandExtractor.extractBrand(
      extractedData.adBody, 
      extractedData.linkTitle, 
      extractedData.linkCaption
    );
    
    const daysActive = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
    
    const result = {
      ad_id: adId,
      brand,
      snapshot_url: extractedData.snapshotUrl,
      ad_body: extractedData.adBody,
      link_caption: extractedData.linkCaption,
      link_description: extractedData.linkDescription,
      link_title: extractedData.linkTitle,
      audience_eu_total: extractedData.audienceTotal,
      start_date: startDate,
      end_date: endDate,
      audience_fr_18_24_h: extractedData.audienceData.fr_18_24_h,
      audience_fr_18_24_f: extractedData.audienceData.fr_18_24_f,
      audience_fr_25_34_h: extractedData.audienceData.fr_25_34_h,
      audience_fr_25_34_f: extractedData.audienceData.fr_25_34_f,
      audience_fr_35_44_h: extractedData.audienceData.fr_35_44_h,
      audience_fr_35_44_f: extractedData.audienceData.fr_35_44_f,
      audience_fr_45_54_h: extractedData.audienceData.fr_45_54_h,
      audience_fr_45_54_f: extractedData.audienceData.fr_45_54_f,
      audience_fr_55_64_h: extractedData.audienceData.fr_55_64_h,
      audience_fr_55_64_f: extractedData.audienceData.fr_55_64_f,
      audience_fr_65_plus_h: extractedData.audienceData.fr_65_plus_h,
      audience_fr_65_plus_f: extractedData.audienceData.fr_65_plus_f,
      days_active: daysActive,
      budget_estimated: extractedData.audienceTotal * 5, // CPM estimé à 5€
      start_month: new Date(startDate).toISOString().substring(0, 7)
    };
    
    console.log('🎯 Objet final créé:', {
      ad_id: result.ad_id,
      start_date: result.start_date,
      start_month: result.start_month,
      brand: result.brand
    });
    
    return result;
  }
};
