import { createContext, useContext } from 'react';
import { OrgEditor } from './Org';

export const EditorContext = createContext<OrgEditor | null>(null);

export function useOrgEditor() {
  return useContext(EditorContext)!;
}
