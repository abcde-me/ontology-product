import React from 'react';
import NotebookToolbar from './NotebookToolbar';
import NotebookContent from './NotebookContent';
import './NotebookWorkspace.scss';

const NotebookWorkspace: React.FC = () => {
  return (
    <div className="notebook-workspace">
      <NotebookToolbar />
      <NotebookContent />
    </div>
  );
};

export default NotebookWorkspace;
