import { FC } from 'react';
import React, { memo } from 'react';
import { useNodesReadOnly } from '../hooks';
import Checklist from './checklist';
import ZoomInOut from './zoom-in-out';
import AddBlock from './add-block';
import UndoRedo from './undo-redo';
import './index.scss';
import { Button } from '@arco-design/web-react';
import { IconCaretRight } from '@arco-design/web-react/icon';
import FlowSetting from './flow-setting';

export type HeaderProps = {
  handleUndo: () => void;
  handleRedo: () => void;
  flowType?: string;
};

const Header: FC<HeaderProps> = (props) => {
  const { nodesReadOnly, getNodesReadOnly } = useNodesReadOnly();
  const { flowType, handleUndo, handleRedo } = props;

  return (
    <div
      className={
        'pointer-events-none absolute left-[20px]  top-[76px] z-10 flex gap-3'
      }
    >
      {flowType === 'struct' && <FlowSetting />}
      <div className="app-workflow-page-sub-header flex h-12 items-center">
        <AddBlock />
        <div className="separator" />
        <ZoomInOut />
        <div className="separator" />
        <UndoRedo handleUndo={handleUndo} handleRedo={handleRedo} />
        <div className="separator" />
        <Checklist disabled={nodesReadOnly} />
      </div>
    </div>
  );
};

export default memo(Header);
