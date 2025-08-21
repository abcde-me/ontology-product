import React from 'react';
import NotebookToolbar from './NotebookToolbar';
import NotebookContent from './NotebookContent';
import './NotebookWorkspace.scss';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
}

const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = ({
  content,
  fileName
}) => {
  return (
    <div className="notebook-workspace">
      <NotebookToolbar />
      <NotebookContent content={content} fileName={fileName} />
    </div>
  );
};

export default NotebookWorkspace;
