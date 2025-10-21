import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEdges } from 'reactflow';
import ChangeBlock from './change-block';
import { canRunBySingle } from '@/pages/workflowConfig/workflow/utils';
import {
  useNodeDataUpdate,
  useNodesInteractions,
  useNodesReadOnly,
  useNodesSyncDraft
} from '@/pages/workflowConfig/workflow/hooks';
import type { Node } from '@/pages/workflowConfig/workflow/types';
import { BlockEnum } from '@/pages/workflowConfig/workflow/types';

type PanelOperatorPopupProps = {
  id: string;
  data: Node['data'];
  onClosePopup: () => void;
  showHelpLink?: boolean;
};
const PanelOperatorPopup = ({
  id,
  data,
  onClosePopup,
}: PanelOperatorPopupProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const edges = useEdges();
  const {
    handleNodeDelete,
    handleNodesDuplicate,
    handleNodeSelect,
  } = useNodesInteractions();
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const { handleSyncWorkflowDraft } = useNodesSyncDraft();
  const { nodesReadOnly } = useNodesReadOnly();
  const edge = edges.find((edge) => edge.target === id);

  // const showChangeBlock = data.type !== BlockEnum.Start && !nodesReadOnly && data.type !== BlockEnum.Iteration && data.type !== BlockEnum.Loop
  const showChangeBlock = false;

  return (
    <div className="w-[200px] rounded-[4px] border-[0.5px] border-gray-200 bg-white">
      {(showChangeBlock || canRunBySingle()) && (
        <>
          <div className="p-1">
            {canRunBySingle() && (
              <div
                className={`
                      flex h-8 cursor-pointer items-center rounded-lg px-3 text-sm text-gray-700
                      hover:bg-gray-50
                    `}
                onClick={() => {
                  handleNodeSelect(id);
                  handleNodeDataUpdate({ id, data: { _isSingleRun: true } });
                  handleSyncWorkflowDraft(true);
                  onClosePopup();
                }}
              >
                {t('workflow.panel.runThisStep')}
              </div>
            )}
            {showChangeBlock && (
              <ChangeBlock
                nodeId={id}
                nodeData={data}
                sourceHandle={edge?.sourceHandle || 'source'}
              />
            )}
          </div>
          <div className="h-[1px] bg-gray-100"></div>
        </>
      )}
      {data.type !== BlockEnum.Start && !nodesReadOnly && (
        <>
          <div className="pt-[4px]">
            {/* <div
                className='flex items-center justify-between px-[12px] pt-[5px] pb-[7px] h-[32px] text-[14px]/[20px] text-[#151B26] rounded-none cursor-pointer hover:bg-[#D9EAFF]'
                onClick={() => {
                  onClosePopup()
                  handleNodesCopy(id)
                }}
              >
                {t('workflow.common.copy')}
                <ShortcutsName keys={['ctrl', 'c']} />
              </div> */}
            <div
              className="flex h-[32px] cursor-pointer items-center justify-between rounded-none px-[12px] pb-[7px] pt-[5px] text-[14px]/[20px] text-[#151B26] hover:bg-[#D9EAFF]"
              onClick={() => {
                onClosePopup();
                handleNodesDuplicate(id);
              }}
            >
              {t('workflow.common.duplicate')}
              {/* <ShortcutsName keys={['ctrl', 'd']} /> */}
            </div>
          </div>
          <div className="h-[1px] bg-gray-100"></div>
          <div className="pb-[4px]">
            <div
              className={`
                flex h-[32px] cursor-pointer items-center justify-between rounded-none px-[12px] pb-[7px] pt-[5px] text-[14px]/[20px] text-[#151B26]
                hover:bg-rose-50 hover:text-red-500
                `}
              onClick={() => handleNodeDelete(id)}
            >
              {t('common.operation.delete')}
              {/* <ShortcutsName keys={['del']} /> */}
            </div>
          </div>
          <div className="h-[1px] bg-gray-100"></div>
        </>
      )}
      {/* {
        showHelpLink && (
          <>
            <div className='p-1'>
              <a
                href={link}
                target='_blank'
                className='flex items-center px-3 h-8 text-sm text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50'
              >
                {t('workflow.panel.helpLink')}
              </a>
            </div>
            <div className='h-[1px] bg-gray-100'></div>
          </>
        )
      } */}
      {/* <div className='p-1'>
        <div className='px-3 py-2 text-xs text-gray-500'>
          <div className='flex items-center mb-1 h-[22px] font-medium'>
            {t('workflow.panel.about').toLocaleUpperCase()}
          </div>
          <div className='mb-1 text-gray-700 leading-[18px]'>{about}</div>
          <div className='leading-[18px]'>
            {t('workflow.panel.createdBy')} {author}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default memo(PanelOperatorPopup);
