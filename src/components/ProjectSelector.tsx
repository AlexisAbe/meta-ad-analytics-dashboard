
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types/projects';

interface ProjectSelectorProps {
  selectedProject?: Project;
  onProjectSelect: (project: Project | undefined) => void;
}

export const ProjectSelector = ({ selectedProject, onProjectSelect }: ProjectSelectorProps) => {
  const { projects, createProject, updateProject, deleteProject, isCreating, isUpdating, isDeleting } = useProjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    createProject({
      name: newProjectName,
      description: newProjectDescription || undefined,
    });
    
    setNewProjectName('');
    setNewProjectDescription('');
    setIsCreateDialogOpen(false);
  };

  const handleEditProject = () => {
    if (!editingProject || !newProjectName.trim()) return;
    
    updateProject({
      id: editingProject.id,
      updates: {
        name: newProjectName,
        description: newProjectDescription || undefined,
      }
    });
    
    setNewProjectName('');
    setNewProjectDescription('');
    setIsEditDialogOpen(false);
    setEditingProject(null);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description || '');
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Gestion des projets
        </CardTitle>
        <CardDescription>
          Sélectionnez un projet pour organiser vos analyses ou créez-en un nouveau
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select 
            value={selectedProject?.id || ''} 
            onValueChange={(value) => {
              const project = projects.find(p => p.id === value);
              onProjectSelect(project);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner un projet..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau projet</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau projet pour organiser vos analyses publicitaires
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du projet</Label>
                  <Input
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Mon projet d'analyse..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Description du projet..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()}>
                  {isCreating ? 'Création...' : 'Créer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {selectedProject && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium">{selectedProject.name}</p>
              {selectedProject.description && (
                <p className="text-sm text-gray-600">{selectedProject.description}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(selectedProject)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteProject(selectedProject.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le projet</DialogTitle>
              <DialogDescription>
                Modifiez les informations de votre projet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom du projet</Label>
                <Input
                  id="edit-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Mon projet d'analyse..."
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (optionnel)</Label>
                <Textarea
                  id="edit-description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Description du projet..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditProject} disabled={isUpdating || !newProjectName.trim()}>
                {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
