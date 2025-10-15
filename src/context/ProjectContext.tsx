import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage } from '@/utils/storage';
import { ProjectIdKey } from '@/utils/const';

interface ProjectContextType {
  projectId: string[];
  setProjectId: (id: string[]) => void;
  isInitialized: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 初始化时从本地存储读取项目ID
const initProjectId = (): string[] => {
  try {
    const pId = getLocalStorage<string[]>(ProjectIdKey);
    if (Array.isArray(pId) && pId.length === 2) {
      console.log('从本地存储初始化项目ID:', pId);
      return pId;
    }
  } catch (error) {
    console.error('读取本地存储项目ID失败:', error);
  }
  return [];
};

let currentProjectId: string[] = initProjectId();

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [projectId, setProjectId] = useState<string[]>(currentProjectId);
  const [isInitialized, setIsInitialized] = useState<boolean>(
    currentProjectId.length > 0
  );

  // 使用 useEffect 来同步更新 currentProjectId
  useEffect(() => {
    currentProjectId = projectId;
    setIsInitialized(projectId.length > 0);
    console.log(
      'ProjectContext 更新 currentProjectId:',
      projectId,
      'isInitialized:',
      projectId.length > 0
    );
  }, [projectId]);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId, isInitialized }}>
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
