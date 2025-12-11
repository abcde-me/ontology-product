import type { FC } from 'react';
import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiMoreFill, RiPlayLargeLine } from '@remixicon/react';
import {
  useNodeDataUpdate,
  useNodesInteractions,
  useNodesSyncDraft
} from '../../../hooks';
import type { Node } from '../../../types';
import { canRunBySingle } from '../../../utils';
import PanelOperator from './panel-operator';
import { RiStopLine } from '@remixicon/react';
import Tooltip from '@/pages/workflowConfig/components/tooltip';
import TestNode from '@/pages/workflowConfig/workflow/nodes/_base/components/test-node';

type NodeControlProps = Pick<Node, 'id' | 'data'>;
const NodeControl: FC<NodeControlProps> = ({ id, data }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const { handleNodeSelect } = useNodesInteractions();
  const { handleSyncWorkflowDraft } = useNodesSyncDraft();
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return (
    <div
      className={`
      absolute -top-7 right-0 hidden h-7 gap-1 pb-1 group-hover:flex
      ${data.selected && '!flex'}
      ${open && '!flex'}
      `}
    >
      {data.flow_type === 'struct' && (
        <div
          className="flex h-6 w-6 items-center justify-center rounded-[6px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg px-0.5 text-text-tertiary shadow-md backdrop-blur-[5px]"
          onClick={(e) => e.stopPropagation()}
        >
          <TestNode id={id} />
        </div>
      )}
      <div
        className="flex h-6 items-center rounded-[6px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg px-0.5 text-text-tertiary shadow-md backdrop-blur-[5px]"
        onClick={(e) => e.stopPropagation()}
      >
        {canRunBySingle() && (
          <div
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md hover:bg-state-base-hover"
            onClick={() => {
              handleNodeDataUpdate({
                id,
                data: {
                  _isSingleRun: !data._isSingleRun
                }
              });
              handleNodeSelect(id);
              if (!data._isSingleRun) handleSyncWorkflowDraft(true);
            }}
          >
            {data._isSingleRun ? (
              <RiStopLine className="h-3 w-3" />
            ) : (
              <Tooltip
                popupContent={t('workflow.panel.runThisStep')}
                asChild={false}
              >
                <RiPlayLargeLine className="h-3 w-3" />
              </Tooltip>
            )}
          </div>
        )}
        <PanelOperator
          id={id}
          data={data}
          offset={0}
          onOpenChange={handleOpenChange}
          triggerClassName="!w-5 !h-5"
        />
      </div>
    </div>
  );
};

export default memo(NodeControl);
