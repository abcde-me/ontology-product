import React, { createContext, useContext, ReactNode } from 'react';
import {
  useEditor,
  UseEditorOptions,
  UseEditorReturn
} from '../hooks/useDevelopScriptEditor';

const EditorContext = createContext<UseEditorReturn | null>(null);

interface EditorProviderProps {
  children: ReactNode;
  options: UseEditorOptions;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  options
}) => {
  const editorState = useEditor(options);

  return (
    <EditorContext.Provider value={editorState}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = (): UseEditorReturn => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};
