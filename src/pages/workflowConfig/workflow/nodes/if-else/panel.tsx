import type { FC } from 'react'
import React, {
  memo,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiAddLine,
} from '@remixicon/react'
import useConfig from './use-config'
import type { IfElseNodeType } from './types'
import ConditionWrap from './components/condition-wrap'
import Button from '@/pages/workflowConfig/components/button'
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field'
import { IconPlus } from '@arco-design/web-react/icon'

const i18nPrefix = 'workflow.nodes.ifElse'

const Panel: FC<NodePanelProps<IfElseNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const {
    readOnly,
    inputs,
    filterVar,
    handleAddCase,
    handleRemoveCase,
    handleSortCase,
    handleAddCondition,
    handleUpdateCondition,
    handleRemoveCondition,
    handleToggleConditionLogicalOperator,
    handleAddSubVariableCondition,
    handleRemoveSubVariableCondition,
    handleUpdateSubVariableCondition,
    handleToggleSubVariableConditionLogicalOperator,
    nodesOutputVars,
    availableNodes,
    varsIsVarFileAttribute,
  } = useConfig(id, data)
  const cases = inputs.cases || []

  return (
    // <div className='p-1'>
    //   <ConditionWrap
    //     nodeId={id}
    //     cases={cases}
    //     readOnly={readOnly}
    //     handleSortCase={handleSortCase}
    //     handleRemoveCase={handleRemoveCase}
    //     handleAddCondition={handleAddCondition}
    //     handleRemoveCondition={handleRemoveCondition}
    //     handleUpdateCondition={handleUpdateCondition}
    //     handleToggleConditionLogicalOperator={handleToggleConditionLogicalOperator}
    //     handleAddSubVariableCondition={handleAddSubVariableCondition}
    //     handleRemoveSubVariableCondition={handleRemoveSubVariableCondition}
    //     handleUpdateSubVariableCondition={handleUpdateSubVariableCondition}
    //     handleToggleSubVariableConditionLogicalOperator={handleToggleSubVariableConditionLogicalOperator}
    //     nodesOutputVars={nodesOutputVars}
    //     availableNodes={availableNodes}
    //     varsIsVarFileAttribute={varsIsVarFileAttribute}
    //     filterVar={filterVar}
    //   />
    //   <div className='px-4 py-2'>
    //     <Button
    //       className='w-full'
    //       variant='tertiary'
    //       onClick={() => handleAddCase()}
    //       disabled={readOnly}
    //     >
    //       <RiAddLine className='mr-1 w-4 h-4' />
    //       ELIF
    //     </Button>
    //   </div>
    //   <div className='my-2 mx-3 h-[1px] bg-divider-subtle'></div>
    //   <Field
    //     title={t(`${i18nPrefix}.else`)}
    //     className='px-4 py-2'
    //   >
    //     <div className='leading-[18px] text-xs font-normal text-text-tertiary'>{t(`${i18nPrefix}.elseDescription`)}</div>
    //   </Field>
    // </div>
    <div className='mt-[16px] wk-node-panel-content if-else-panel-content'>
      <div className='mb-[16px] title-txt'>条件分支</div>
      <ConditionWrap
        nodeId={id}
        cases={cases}
        readOnly={readOnly}
        handleSortCase={handleSortCase}
        handleRemoveCase={handleRemoveCase}
        handleAddCondition={handleAddCondition}
        handleRemoveCondition={handleRemoveCondition}
        handleUpdateCondition={handleUpdateCondition}
        handleToggleConditionLogicalOperator={handleToggleConditionLogicalOperator}
        handleAddSubVariableCondition={handleAddSubVariableCondition}
        handleRemoveSubVariableCondition={handleRemoveSubVariableCondition}
        handleUpdateSubVariableCondition={handleUpdateSubVariableCondition}
        handleToggleSubVariableConditionLogicalOperator={handleToggleSubVariableConditionLogicalOperator}
        nodesOutputVars={nodesOutputVars}
        availableNodes={availableNodes}
        varsIsVarFileAttribute={varsIsVarFileAttribute}
        filterVar={filterVar}
      />
      {!readOnly && <div className='add-btn w-full mt-[16px]' onClick={() => handleAddCase()}>
          <IconPlus className='size-[14px] mr-[4px] text-[#979797]'/>否则如果
        </div>
      }
      <div className='bordered p-[12px] flex flex-col gap-y-[4px] mt-[16px]'>
        <div className='text-[#0F172A] text-[14px]/[24px] font-medium'>否则</div>
        <div className='text-[#7F8C9F] text-[12px]/[18px]'>用于定义当 if 条件不满足时应执行的逻辑。</div>
      </div>
    </div>
  )
}

export default memo(Panel)
