import { FC } from 'react';
import React, { memo } from 'react';
import { useNodesReadOnly } from '../hooks';
import Checklist from './checklist';
import ZoomInOut from './zoom-in-out';
import AddBlock from './add-block';
import UndoRedo from './undo-redo';

export type HeaderProps = {
  handleUndo: () => void;
  handleRedo: () => void;
};

const Header: FC<HeaderProps> = (props) => {
  const { nodesReadOnly, getNodesReadOnly } = useNodesReadOnly();

  return (
    <div className="app-workflow-page-sub-header absolute left-0 top-0 z-10 flex items-center">
      <AddBlock />
      <div className="separator" />
      <ZoomInOut />
      <div className="separator" />
      <UndoRedo handleUndo={props.handleUndo} handleRedo={props.handleRedo} />
      <div className="separator" />
      <Checklist disabled={nodesReadOnly} />
    </div>
  );
};

export default memo(Header);
