import type { FC } from 'react';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiArrowGoBackLine, RiArrowGoForwardFill } from '@remixicon/react';
import TipPopup from '../operator/tip-popup';
import { useWorkflowHistoryStore } from '../workflow-history-store';
import Divider from '@/pages/workflowConfig/components/divider';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import ViewWorkflowHistory from '@/pages/workflowConfig/workflow/header/view-workflow-history';
import classNames from '@/pages/workflowConfig/utils/classnames';
import RedoIcon from '@/pages/workflowConfig/styles/images/op-icons/redo2.svg';
import UndoIcon from '@/pages/workflowConfig/styles/images/op-icons/undo2.svg';

export type UndoRedoProps = { handleUndo: () => void; handleRedo: () => void };
const UndoRedo: FC<UndoRedoProps> = ({ handleUndo, handleRedo }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { store } = useWorkflowHistoryStore();
  const [buttonsDisabled, setButtonsDisabled] = useState({
    undo: true,
    redo: true
  });

  useEffect(() => {
    const unsubscribe = store.temporal.subscribe((state) => {
      setButtonsDisabled({
        undo: state.pastStates.length === 0,
        redo: state.futureStates.length === 0
      });
    });
    return () => unsubscribe();
  }, [store]);

  const { nodesReadOnly } = useNodesReadOnly();

  return (
    <div className="flex items-center gap-x-[4px]">
      <TipPopup
        title={t('workflow.common.undo')!}
        // shortcuts={['ctrl', 'z']}
      >
        <div
          data-tooltip-id="workflow.undo"
          className={classNames(
            'op-icon select-none text-[#151B26]',
            (nodesReadOnly || buttonsDisabled.undo) &&
              'disabled cursor-not-allowed text-text-disabled hover:bg-transparent hover:text-text-disabled'
          )}
          onClick={() =>
            !nodesReadOnly && !buttonsDisabled.undo && handleUndo()
          }
        >
          <UndoIcon className="size-[16px]" />
        </div>
      </TipPopup>
      <TipPopup
        title={t('workflow.common.redo')!}
        // shortcuts={['ctrl', 'y']}
      >
        <div
          data-tooltip-id="workflow.redo"
          className={classNames(
            'op-icon select-none text-[#151B26]',
            (nodesReadOnly || buttonsDisabled.redo) &&
              'disabled cursor-not-allowed text-text-disabled hover:bg-transparent hover:text-text-disabled'
          )}
          onClick={() =>
            !nodesReadOnly && !buttonsDisabled.redo && handleRedo()
          }
        >
          <RedoIcon className="size-[16px]" />
        </div>
      </TipPopup>
    </div>
  );
};

export default memo(UndoRedo);
