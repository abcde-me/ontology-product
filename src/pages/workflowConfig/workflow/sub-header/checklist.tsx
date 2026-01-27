import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEdges, useNodes } from 'reactflow';
import {
  RiCloseLine,
  RiListCheck3,
  RiListCheck2,
  RiAlertFill
} from '@remixicon/react';
import BlockIcon from '../block-icon';
import { useChecklist, useNodesInteractions } from '../hooks';
import type { CommonEdgeType, CommonNodeType } from '../types';
import cn from '@/pages/workflowConfig/utils/classnames';
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger
} from '@/pages/workflowConfig/components/portal-to-follow-elem';
import TipPopup from '@/pages/workflowConfig/workflow/operator/tip-popup';
import ChecklistIcon from '@/pages/workflowConfig/styles/images/op-icons/checklist.svg';
import WarningIcon from '@/pages/workflowConfig/styles/images/op-icons/check-warning.svg';
import EmptyIcon from '@/pages/workflowConfig/styles/images/op-icons/empty.svg';

type WorkflowChecklistProps = {
  disabled: boolean;
};
const WorkflowChecklist = ({ disabled }: WorkflowChecklistProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const [open, setOpen] = useState(false);
  const nodes = useNodes<CommonNodeType>();
  const edges = useEdges<CommonEdgeType>();
  const needWarningNodes = useChecklist(nodes, edges);
  const { handleNodeSelect } = useNodesInteractions();

  return (
    <PortalToFollowElem
      placement="bottom-end"
      offset={{
        mainAxis: 16
        // crossAxis: -310
      }}
      open={open}
      onOpenChange={setOpen}
    >
      <PortalToFollowElemTrigger
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <TipPopup title="检查清单">
          <div
            className={cn(
              'relative flex items-center justify-center',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <div className={cn('op-icon group')}>
              <ChecklistIcon className={cn('size-[16px]')} />
            </div>
            {!!needWarningNodes.length && (
              <div className="absolute -right-[4px] -top-[4px] size-[8px] rounded-full bg-[#FB923C]"></div>
            )}
          </div>
        </TipPopup>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className="z-[12]">
        <div
          className="checklist-list-wrapper w-[326px] overflow-y-auto rounded-[12px] border-[0.5px] border-black/5 bg-white shadow-lg"
          style={{
            maxHeight: 'calc(2 / 3 * 100vh)'
          }}
        >
          <div className="text-md checklist-header sticky top-0 z-[1] flex h-[24px] items-center bg-white pl-4 pr-3 pt-3 font-semibold text-gray-900">
            <div className="checklist-title grow">
              {t('workflow.panel.checklist')}
              {needWarningNodes.length ? `(${needWarningNodes.length})` : ''}
            </div>
            <div
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center"
              onClick={() => setOpen(false)}
            >
              <RiCloseLine className="size-[16px] text-gray-500" />
            </div>
          </div>
          <div className="py-2">
            {!!needWarningNodes.length && (
              <>
                <div className="pl-[8px] text-[12px]/[20px] text-xs text-[#1E293B] text-gray-400">
                  {t('workflow.panel.checklistTip')}
                </div>
                <div className="checklist-list py-2">
                  {needWarningNodes.map((node: any) => (
                    <div
                      key={node.id}
                      className="checklist-list-item mb-[12px] cursor-pointer rounded-[4px] border-[0.5px] border-gray-200 bg-white last-of-type:mb-0"
                      onClick={() => {
                        handleNodeSelect(node.id);
                        setOpen(false);
                      }}
                    >
                      <div className="mb-[12px] flex items-center text-xs font-medium text-gray-700">
                        <BlockIcon
                          type={node.type}
                          className="mr-1.5 !size-[16px]"
                          toolIcon={node.toolIcon}
                        />
                        <span className="item-title grow truncate">
                          {node.title}
                        </span>
                      </div>
                      <div className="item-warnings border-t-[0.5px] border-t-black/2">
                        {node.unConnected && (
                          <div className="warnings-item rounded-b-[4px]">
                            <div className="warnings-item-content flex !text-[14px] text-xs leading-[16px] text-[#1E293B]">
                              <WarningIcon className="mr-2 size-[16px] text-[#F79009]" />
                              {t('workflow.common.needConnectTip')}
                            </div>
                          </div>
                        )}
                        {node.errorMessage && (
                          <div className="warnings-item rounded-b-[4px]">
                            <div className="flex !text-[14px] text-xs leading-[16px] text-[#1E293B]">
                              <WarningIcon className="mr-2 size-[16px] text-[#F79009]" />
                              {node.errorMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!needWarningNodes.length && (
              <div className="mx-4 mb-3 rounded-[4px] bg-gray-50 py-4 text-center text-xs text-gray-400">
                {/* <RiListCheck2 className='mx-auto mb-[5px] w-8 h-8 text-gray-300' /> */}
                <EmptyIcon className="mx-auto mb-[12px] size-[27px] text-gray-300" />
                {t('workflow.panel.checklistResolved')}
              </div>
            )}
          </div>
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  );
};

export default memo(WorkflowChecklist);
