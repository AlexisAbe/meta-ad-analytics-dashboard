
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projectsService';
import { Project } from '@/types/projects';
import { toast } from '@/hooks/use-toast';

export const useProjects = () => {
  const queryClient = useQueryClient();
  
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getAllProjects,
  });

  const createMutation = useMutation({
    mutationFn: (project: { name: string; description?: string }) => 
      projectsService.createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Succès",
        description: "Projet créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; description?: string } }) => 
      projectsService.updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Succès",
        description: "Projet mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Succès",
        description: "Projet supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useTopAds = (projectId?: string) => {
  const { data: topAdsByReach = [], isLoading: isLoadingReach } = useQuery({
    queryKey: ['topAds', projectId, 'reach'],
    queryFn: () => projectsService.getTopAdsByProject(projectId!, 10, 'reach'),
    enabled: !!projectId,
  });

  const { data: topAdsByDuration = [], isLoading: isLoadingDuration } = useQuery({
    queryKey: ['topAds', projectId, 'duration'],
    queryFn: () => projectsService.getTopAdsByProject(projectId!, 10, 'duration'),
    enabled: !!projectId,
  });

  return {
    topAdsByReach,
    topAdsByDuration,
    isLoading: isLoadingReach || isLoadingDuration,
  };
};
