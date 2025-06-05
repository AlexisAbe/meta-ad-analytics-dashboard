
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adsDataService } from '@/services/adsDataService';
import { AdsData } from '@/types/ads';
import { toast } from '@/hooks/use-toast';

export const useAdsData = (
  selectedBrands: string[] = [], 
  projectId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const queryClient = useQueryClient();
  
  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ['ads', selectedBrands, projectId, startDate, endDate],
    queryFn: () => selectedBrands.length > 0 
      ? adsDataService.getAdsByBrands(selectedBrands, projectId, startDate, endDate)
      : adsDataService.getAllAds(projectId, startDate, endDate),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands', projectId],
    queryFn: () => adsDataService.getBrands(projectId),
  });

  const insertMutation = useMutation({
    mutationFn: (newAds: AdsData[]) => adsDataService.insertAds(newAds, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['topAds'] });
      toast({
        title: "Succès",
        description: "Données importées/mises à jour avec succès",
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
