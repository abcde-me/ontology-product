import { createContext, useContext } from 'react';
import { AgentEditor } from './Agent';

export const EditorContext = createContext<AgentEditor | null>(null);

export function useAgentEditor() {
  return useContext(EditorContext)!;
}
