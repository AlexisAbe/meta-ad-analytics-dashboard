
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adsDataService } from '@/services/adsDataService';
import { AdsData } from '@/types/ads';
import { toast } from '@/hooks/use-toast';

export const useAdsData = (selectedBrands: string[] = []) => {
  const queryClient = useQueryClient();
  
  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ['ads', selectedBrands],
    queryFn: () => selectedBrands.length > 0 
      ? adsDataService.getAdsByBrands(selectedBrands)
      : adsDataService.getAllAds(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: adsDataService.getBrands,
  });

  const insertMutation = useMutation({
    mutationFn: (newAds: AdsData[]) => adsDataService.insertAds(newAds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({
        title: "Succès",
        description: "Données importées avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'import: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    ads,
    brands,
    isLoading,
    error,
    insertAds: insertMutation.mutate,
    isInserting: insertMutation.isPending,
  };
};
