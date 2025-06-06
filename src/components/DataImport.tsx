
import React from 'react';
import { InteractiveDataImport } from './InteractiveDataImport';
import { Project } from '@/types/projects';

interface DataImportProps {
  selectedProject?: Project;
}

export const DataImport = ({ selectedProject }: DataImportProps) => {
  return <InteractiveDataImport selectedProject={selectedProject} />;
};
