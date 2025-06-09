import { createContext, useContext } from 'react';
import { MemberEditor } from './Member';

export const EditorContext = createContext<MemberEditor | null>(null);

export function useMemberEditor() {
  return useContext(EditorContext)!;
}
