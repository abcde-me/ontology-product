import { RiLoopLeftLine, RiArrowLeftRightLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import {
  type CaseItem,
  type HandleAddSubVariableCondition,
  type HandleRemoveCondition,
  type HandleToggleConditionLogicalOperator,
  type HandleToggleSubVariableConditionLogicalOperator,
  type HandleUpdateCondition,
  type HandleUpdateSubVariableCondition,
  LogicalOperator,
  type handleRemoveSubVariableCondition
} from '../../types';
import ConditionItem from './condition-item';
import type {
  Node,
  NodeOutPutVar,
  Var
} from '@/pages/workflowConfig/workflow/types';
import cn from '@/pages/workflowConfig/utils/classnames';
import { IconSwap } from '@arco-design/web-react/icon';

interface ConditionListProps {
  isSubVariable?: boolean;
  disabled?: boolean;
  caseId: string;
  conditionId?: string;
  caseItem: CaseItem;
  onRemoveCondition?: HandleRemoveCondition;
  onUpdateCondition?: HandleUpdateCondition;
  onToggleConditionLogicalOperator?: HandleToggleConditionLogicalOperator;
  nodeId: string;
  nodesOutputVars: NodeOutPutVar[];
  availableNodes: Node[];
  numberVariables: NodeOutPutVar[];
  filterVar: (varPayload: Var) => boolean;
  varsIsVarFileAttribute: Record<string, boolean>;
  onAddSubVariableCondition?: HandleAddSubVariableCondition;
  onRemoveSubVariableCondition?: handleRemoveSubVariableCondition;
  onUpdateSubVariableCondition?: HandleUpdateSubVariableCondition;
  onToggleSubVariableConditionLogicalOperator?: HandleToggleSubVariableConditionLogicalOperator;
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
  filterVar
}: ConditionListProps) => {
  const { conditions, logical_operator } = caseItem;

  const doToggleConditionLogicalOperator = useCallback(() => {
    if (isSubVariable)
      onToggleSubVariableConditionLogicalOperator?.(caseId, conditionId!);
    else onToggleConditionLogicalOperator?.(caseId);
  }, [
    caseId,
    conditionId,
    isSubVariable,
    onToggleConditionLogicalOperator,
    onToggleSubVariableConditionLogicalOperator
  ]);

  const isValueFieldShort = useMemo(() => {
    if (isSubVariable && conditions.length > 1) return true;

    return false;
  }, [conditions.length, isSubVariable]);
  const conditionItemClassName = useMemo(() => {
    if (!isSubVariable) return '';
    if (conditions.length < 2) return '';
    return logical_operator === LogicalOperator.and ? 'pl-[51px]' : 'pl-[42px]';
  }, [conditions.length, isSubVariable, logical_operator]);

  return (
    <div
      className={cn('condition-list relative', !isSubVariable && 'pl-[40px]')}
    >
      {conditions.length > 1 && (
        <div
          className={cn(
            'logical-operator-label absolute bottom-0 left-0 top-0 w-[40px]',
            isSubVariable &&
              logical_operator === LogicalOperator.and &&
              'left-[-10px]',
            isSubVariable &&
              logical_operator === LogicalOperator.or &&
              'left-[-18px]'
          )}
        >
          <div className="absolute bottom-4 left-[20px] top-4 w-[20px] rounded-l-none border border-r-0 border-[#E8E9EB]"></div>
          <div className="absolute right-0 top-1/2 h-[29px] w-4 -translate-y-1/2 bg-components-panel-bg"></div>
          <div
            className="absolute right-1 top-1/2 flex h-[20px] -translate-y-1/2 cursor-pointer select-none items-center rounded-none bg-[white] px-1 text-[10px] font-semibold text-text-accent-secondary"
            onClick={doToggleConditionLogicalOperator}
          >
            {/* {logical_operator.toUpperCase()}
              <RiArrowLeftRightLine className='ml-0.5 w-3 h-3' /> */}
            <span className="text-[12px]/[20px] text-[#151B26]">
              {logical_operator === LogicalOperator.and ? '且' : '或'}
            </span>
            <IconSwap className="ml-[2px] h-[12px] w-[12px] text-[#151B26]" />
          </div>
        </div>
      )}
      {caseItem.conditions.map((condition) => (
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
          onToggleSubVariableConditionLogicalOperator={
            onToggleSubVariableConditionLogicalOperator
          }
          nodeId={nodeId}
          nodesOutputVars={nodesOutputVars}
          availableNodes={availableNodes}
          filterVar={filterVar}
          numberVariables={numberVariables}
          file={
            varsIsVarFileAttribute[condition.id]
              ? { key: (condition.variable_selector || []).slice(-1)[0] }
              : undefined
          }
          isSubVariableKey={isSubVariable}
        />
      ))}
    </div>
  );
};

export default ConditionList;
