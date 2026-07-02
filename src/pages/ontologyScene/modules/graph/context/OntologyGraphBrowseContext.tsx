import React, { createContext, useContext } from 'react';

export interface OntologyGraphBrowseParams {
  sceneId: number;
  objectTypeId?: number;
  objectTypeCode?: string;
  focusNeighbors?: boolean;
  instanceId?: string;
  /** 嵌入应用场景等窄容器内，侧抽使用紧凑布局 */
  compactPanel?: boolean;
}

const OntologyGraphBrowseContext =
  createContext<OntologyGraphBrowseParams | null>(null);

export const OntologyGraphBrowseProvider: React.FC<{
  value: OntologyGraphBrowseParams | null;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <OntologyGraphBrowseContext.Provider value={value}>
    {children}
  </OntologyGraphBrowseContext.Provider>
);

export const useOntologyGraphBrowse = () =>
  useContext(OntologyGraphBrowseContext);
