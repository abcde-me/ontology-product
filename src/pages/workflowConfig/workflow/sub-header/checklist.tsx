import React, {
  memo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  useEdges,
  useNodes,
} from 'reactflow'
import {
  RiCloseLine,
  RiListCheck3,
  RiListCheck2,
  RiAlertFill
} from '@remixicon/react'
import BlockIcon from '../block-icon'
import {
  useChecklist,
  useNodesInteractions,
} from '../hooks'
import type {
  CommonEdgeType,
  CommonNodeType,
} from '../types'
import cn from '@/pages/workflowConfig/utils/classnames'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/pages/workflowConfig/components/portal-to-follow-elem'
import TipPopup from '@/pages/workflowConfig/workflow/operator/tip-popup'
import ChecklistIcon from '@/pages/workflowConfig/styles/images/op-icons/checklist.svg';
import Warning1Icon from '@/pages/workflowConfig/styles/images/op-icons/warning1.svg';
import EmptyIcon from '@/pages/workflowConfig/styles/images/op-icons/empty.svg';

type WorkflowChecklistProps = {
  disabled: boolean
}
const WorkflowChecklist = ({
  disabled,
}: WorkflowChecklistProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [open, setOpen] = useState(false)
  const nodes = useNodes<CommonNodeType>()
  const edges = useEdges<CommonEdgeType>()
  const needWarningNodes = useChecklist(nodes, edges)
  const { handleNodeSelect } = useNodesInteractions()

  return (
    <PortalToFollowElem
      placement='bottom-end'
      offset={{
        mainAxis: 16,
        crossAxis: -310,
      }}
      open={open}
      onOpenChange={setOpen}
    >
      <PortalToFollowElemTrigger onClick={() => !disabled && setOpen(v => !v)}>
        <TipPopup title="检查清单">
          <div
            className={cn(
              'relative flex items-center justify-center',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <div
              className={cn('group op-icon')}
            >
              <ChecklistIcon
                className={cn('size-[16px]')}
              />
            </div>
            {
              !!needWarningNodes.length && (
                <div className='absolute -right-[4px] -top-[4px] rounded-full bg-[#FB923C] size-[8px]'>
                </div>
              )
            }
          </div>
        </TipPopup>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className='z-[12]'>
        <div
          className='w-[326px] rounded-[12px] bg-white border-[0.5px] border-black/5 shadow-lg overflow-y-auto checklist-list-wrapper'
          style={{
            maxHeight: 'calc(2 / 3 * 100vh)',
          }}
        >
          <div className='sticky top-0 bg-white flex items-center pl-4 pr-3 pt-3 h-[24px] text-md font-semibold text-gray-900 z-[1] checklist-header'>
            <div className='grow checklist-title'>{t('workflow.panel.checklist')}{needWarningNodes.length ? `(${needWarningNodes.length})` : ''}</div>
            <div
              className='shrink-0 flex items-center justify-center w-6 h-6 cursor-pointer'
              onClick={() => setOpen(false)}
            >
              <RiCloseLine className='size-[16px] text-gray-500' />
            </div>
          </div>
          <div className='py-2'>
            {
              !!needWarningNodes.length && (
                <>
                  <div className='pl-[8px] text-xs text-gray-400 text-[12px]/[20px] text-[#1E293B]'>{t('workflow.panel.checklistTip')}</div>
                  <div className='py-2 checklist-list'>
                    {
                      needWarningNodes.map(node => (
                        <div
                          key={node.id}
                          className='checklist-list-item mb-[12px] last-of-type:mb-0 border-[0.5px] border-gray-200 bg-white shadow-xs rounded-[4px] cursor-pointer'
                          onClick={() => {
                            handleNodeSelect(node.id)
                            setOpen(false)
                          }}
                        >
                          <div className='flex items-center text-xs font-medium text-gray-700 mb-[12px]'>
                            <BlockIcon
                              type={node.type}
                              className='mr-1.5 size-[16px]'
                              toolIcon={node.toolIcon}
                            />
                            <span className='grow truncate item-title'>
                              {node.title}
                            </span>
                          </div>
                          <div className='border-t-[0.5px] border-t-black/2 item-warnings'>
                            {
                              node.unConnected && (
                                <div className='bg-gray-25 rounded-b-[4px] warnings-item'>
                                  <div className='flex text-xs leading-[18px] text-[#1E293B]'>
                                    <Warning1Icon className='size-[16px] mr-2 text-[#F79009]'/>
                                    {t('workflow.common.needConnectTip')}
                                  </div>
                                </div>
                              )
                            }
                            {
                              node.errorMessage && (
                                <div className='bg-gray-25 rounded-b-[4px] warnings-item'>
                                  <div className='flex text-xs leading-[18px] text-[#1E293B]'>
                                    <Warning1Icon className='size-[16px] mr-2 text-[#F79009]'/>
                                    {node.errorMessage}
                                  </div>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </>
              )
            }
            {
              !needWarningNodes.length && (
                <div className='mx-4 mb-3 py-4 rounded-[4px] bg-gray-50 text-gray-400 text-xs text-center'>
                  {/* <RiListCheck2 className='mx-auto mb-[5px] w-8 h-8 text-gray-300' /> */}
                  <EmptyIcon className='mx-auto mb-[12px] size-[27px] text-gray-300' />
                  {t('workflow.panel.checklistResolved')}
                </div>
              )
            }
          </div>
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default memo(WorkflowChecklist)
