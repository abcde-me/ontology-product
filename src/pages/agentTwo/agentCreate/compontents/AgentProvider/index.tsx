import React, { useEffect } from 'react';
import { useCreation } from 'ahooks';
import { EditorContext } from './Context';
import { AgentEditor } from './Agent';
import { useParams } from '@/hooks/useParmas';

interface AgentProviderProps {
  children: React.ReactNode | React.ReactNode[];
  agentStore?: AgentEditor;
}
const AgentProvider = ({ children, agentStore }: AgentProviderProps) => {
  const id = useParams('id');
  console.log('id', id);
  const agent = useCreation(() => {
    if (agentStore) {
      return agentStore;
    }
    return new AgentEditor(id);
  }, [agentStore]);

  useEffect(() => {
    agent.infoStore.getAgentInfoData({ id });
  }, [id]);

  return (
    <EditorContext.Provider value={agent}>{children}</EditorContext.Provider>
  );
};

export default AgentProvider;
