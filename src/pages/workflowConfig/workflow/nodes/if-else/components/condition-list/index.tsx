import { RiLoopLeftLine, RiArrowLeftRightLine } from '@remixicon/react'
import React, { useCallback, useMemo } from 'react'
import {
  type CaseItem,
  type HandleAddSubVariableCondition,
  type HandleRemoveCondition,
  type HandleToggleConditionLogicalOperator,
  type HandleToggleSubVariableConditionLogicalOperator,
  type HandleUpdateCondition,
  type HandleUpdateSubVariableCondition,
  LogicalOperator,
  type handleRemoveSubVariableCondition,
} from '../../types'
import ConditionItem from './condition-item'
import type {
  Node,
  NodeOutPutVar,
  Var,
} from '@/pages/workflowConfig/workflow/types'
import cn from '@/pages/workflowConfig/utils/classnames'
import { IconSwap } from '@arco-design/web-react/icon'

interface ConditionListProps {
  isSubVariable?: boolean
  disabled?: boolean
  caseId: string
  conditionId?: string
  caseItem: CaseItem
  onRemoveCondition?: HandleRemoveCondition
  onUpdateCondition?: HandleUpdateCondition
  onToggleConditionLogicalOperator?: HandleToggleConditionLogicalOperator
  nodeId: string
  nodesOutputVars: NodeOutPutVar[]
  availableNodes: Node[]
  numberVariables: NodeOutPutVar[]
  filterVar: (varPayload: Var) => boolean
  varsIsVarFileAttribute: Record<string, boolean>
  onAddSubVariableCondition?: HandleAddSubVariableCondition
  onRemoveSubVariableCondition?: handleRemoveSubVariableCondition
  onUpdateSubVariableCondition?: HandleUpdateSubVariableCondition
  onToggleSubVariableConditionLogicalOperator?: HandleToggleSubVariableConditionLogicalOperator
}
const ConditionList = ({
  isSubVariable,
  disabled,
  caseId,
  conditionId,
  caseItem,
  onUpdateCondition,
  onRemoveCondition,
  onToggleConditionLogicalOperator,
  onAddSubVariableCondition,
  onRemoveSubVariableCondition,
  onUpdateSubVariableCondition,
  onToggleSubVariableConditionLogicalOperator,
  nodeId,
  nodesOutputVars,
  availableNodes,
  numberVariables,
  varsIsVarFileAttribute,
  filterVar,
}: ConditionListProps) => {
  const { conditions, logical_operator } = caseItem

  const doToggleConditionLogicalOperator = useCallback(() => {
    if (isSubVariable)
      onToggleSubVariableConditionLogicalOperator?.(caseId!, conditionId!)
    else
      onToggleConditionLogicalOperator?.(caseId)
  }, [caseId, conditionId, isSubVariable, onToggleConditionLogicalOperator, onToggleSubVariableConditionLogicalOperator])

  const isValueFieldShort = useMemo(() => {
    if (isSubVariable && conditions.length > 1)
      return true

    return false
  }, [conditions.length, isSubVariable])
  const conditionItemClassName = useMemo(() => {
    if (!isSubVariable)
      return ''
    if (conditions.length < 2)
      return ''
    return logical_operator === LogicalOperator.and ? 'pl-[51px]' : 'pl-[42px]'
  }, [conditions.length, isSubVariable, logical_operator])

  return (
    <div className={cn('relative condition-list', !isSubVariable && 'pl-[40px]')}>
      {
        conditions.length > 1 && (
          <div className={cn(
            'absolute top-0 bottom-0 left-0 w-[40px] logical-operator-label',
            isSubVariable && logical_operator === LogicalOperator.and && 'left-[-10px]',
            isSubVariable && logical_operator === LogicalOperator.or && 'left-[-18px]',
          )}>
            <div className='absolute top-4 bottom-4 left-[20px] w-[20px] border border-[#E8E9EB] rounded-l-none border-r-0'></div>
            <div className='absolute top-1/2 -translate-y-1/2 right-0 w-4 h-[29px] bg-components-panel-bg'></div>
            <div
              className='absolute top-1/2 right-1 -translate-y-1/2 flex items-center px-1 h-[20px] rounded-none bg-[white] text-text-accent-secondary text-[10px] font-semibold cursor-pointer select-none'
              onClick={doToggleConditionLogicalOperator}
            >
              {/* {logical_operator.toUpperCase()}
              <RiArrowLeftRightLine className='ml-0.5 w-3 h-3' /> */}
              <span className='text-[#151B26] text-[12px]/[20px]'>{logical_operator === LogicalOperator.and ? '且' : '或'}</span>
              <IconSwap className='ml-[2px] w-[12px] h-[12px] text-[#151B26]'/>
            </div>
          </div>
        )
      }
      {
        caseItem.conditions.map(condition => (
          <ConditionItem
            key={condition.id}
            className={conditionItemClassName}
            disabled={disabled}
            caseId={caseId}
            conditionId={isSubVariable ? conditionId! : condition.id}
            condition={condition}
            isValueFieldShort={isValueFieldShort}
            onUpdateCondition={onUpdateCondition}
            onRemoveCondition={onRemoveCondition}
            onAddSubVariableCondition={onAddSubVariableCondition}
            onRemoveSubVariableCondition={onRemoveSubVariableCondition}
            onUpdateSubVariableCondition={onUpdateSubVariableCondition}
            onToggleSubVariableConditionLogicalOperator={onToggleSubVariableConditionLogicalOperator}
            nodeId={nodeId}
            nodesOutputVars={nodesOutputVars}
            availableNodes={availableNodes}
            filterVar={filterVar}
            numberVariables={numberVariables}
            file={varsIsVarFileAttribute[condition.id] ? { key: (condition.variable_selector || []).slice(-1)[0] } : undefined}
            isSubVariableKey={isSubVariable}
          />
        ))
      }
    </div>
  )
}

export default ConditionList
