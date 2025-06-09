import React, {
  memo,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  RiErrorWarningFill,
} from '@remixicon/react'
import { useSelectOrDelete } from '../../hooks'
import type { WorkflowNodesMap } from './node'
import { WorkflowVariableBlockNode } from './node'
import {
  DELETE_WORKFLOW_VARIABLE_BLOCK_COMMAND,
  UPDATE_WORKFLOW_NODES_MAP,
} from './index'
import cn from '@/pages/workflowConfig/utils/classnames'
// import { Variable02 } from '@/app/components/base/icons/src/vender/solid/development'
// import { BubbleX, Env } from '@/app/components/base/icons/src/vender/line/others'
// import { VarBlockIcon } from '@/pages/workflowConfig/workflow/block-icon'
// import { Line3 } from '@/app/components/base/icons/src/public/common'
import { isConversationVar, isENV, isSystemVar } from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/utils'
import Tooltip from '@/pages/workflowConfig/components/tooltip'
import { isExceptionVariable } from '@/pages/workflowConfig/workflow/utils'

type WorkflowVariableBlockComponentProps = {
  nodeKey: string
  variables: string[]
  workflowNodesMap: WorkflowNodesMap
}

const WorkflowVariableBlockComponent = ({
  nodeKey,
  variables,
  workflowNodesMap = {},
}: WorkflowVariableBlockComponentProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [editor] = useLexicalComposerContext()
  const [ref, isSelected] = useSelectOrDelete(nodeKey, DELETE_WORKFLOW_VARIABLE_BLOCK_COMMAND)
  const variablesLength = variables.length
  const varName = (
    () => {
      const isSystem = isSystemVar(variables)
      const varName = variablesLength >= 3 ? (variables).slice(-2).join('.') : variables[variablesLength - 1]
      return `${isSystem ? 'sys.' : ''}${varName}`
    }
  )()
  const [localWorkflowNodesMap, setLocalWorkflowNodesMap] = useState<WorkflowNodesMap>(workflowNodesMap)
  const node = localWorkflowNodesMap![variables[0]]
  const isEnv = isENV(variables)
  const isChatVar = isConversationVar(variables)
  const isException = isExceptionVariable(varName, node?.type)

  useEffect(() => {
    if (!editor.hasNodes([WorkflowVariableBlockNode]))
      throw new Error('WorkflowVariableBlockPlugin: WorkflowVariableBlock not registered on editor')

    return mergeRegister(
      editor.registerCommand(
        UPDATE_WORKFLOW_NODES_MAP,
        (workflowNodesMap: WorkflowNodesMap) => {
          setLocalWorkflowNodesMap(workflowNodesMap)

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])

  const Item = (
    <div
      className={cn(
        'mx-0.5 relative group/wrap flex items-center h-[20px] px-[8px] rounded-[4px] border-[0.5px] select-none',
        isSelected ? ' border-state-accent-solid bg-state-accent-hover' : 'border-[#CBD5E1] bg-components-badge-white-to-dark',
        !node && !isEnv && !isChatVar && '!border-state-destructive-solid !bg-state-destructive-hover',
      )}
      ref={ref}
    >
      {!isEnv && !isChatVar && (
        <div className='flex items-center'>
          {/* {
            node?.type && (
              <div className='p-[1px]'>
                <VarBlockIcon
                  className='!text-text-secondary'
                  type={node?.type}
                />
              </div>
            )
          } */}
          <div className='shrink-0 max-w-[60px] text-xs font-medium text-[#0F172A] text-[12px]/[20px] truncate' title={node?.title} style={{
          }}>{node?.title}</div>
          <span className='text-[#0F172A] mx-[2px]'>/</span>
          {/* <Line3 className='mr-0.5 text-divider-deep'></Line3> */}
        </div>
      )}
      <div className='flex items-center text-text-accent'>
        {/* {!isEnv && !isChatVar && <Variable02 className={cn('shrink-0 w-3.5 h-3.5', isException && 'text-text-warning')} />}
        {isEnv && <Env className='shrink-0 w-3.5 h-3.5 text-util-colors-violet-violet-600' />}
        {isChatVar && <BubbleX className='w-3.5 h-3.5 text-util-colors-teal-teal-700' />} */}
        <div className={cn(
          'shrink-0 text-xs text-[#007DFA] font-medium text-[12px]/[20px] truncate',
          isEnv && 'text-util-colors-violet-violet-600',
          isChatVar && 'text-util-colors-teal-teal-700',
          isException && 'text-text-warning',
        )} title={varName}>{varName}</div>
        {
          !node && !isEnv && !isChatVar && (
            <RiErrorWarningFill className='ml-0.5 w-3 h-3 text-text-destructive' />
          )
        }
      </div>
    </div>
  )

  if (!node && !isEnv && !isChatVar) {
    return (
      <Tooltip popupContent={t('workflow.errorMsg.invalidVariable')}>
        {Item}
      </Tooltip>
    )
  }

  return Item
}

export default memo(WorkflowVariableBlockComponent)
