import React, { createContext, useContext, useState } from 'react';

interface ProjectContextType {
  projectId: string;
  setProjectId: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

let currentProjectId = '';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [projectId, setProjectId] = useState('');
  currentProjectId = projectId;

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context)
    throw new Error('useProject must be used within a ProjectProvider');
  return context;
};

// Getter for API interceptor
export const getCurrentProjectId = () => currentProjectId;
