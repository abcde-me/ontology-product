import type { FC } from 'react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import produce from 'immer'
import RemoveButton from '../remove-button'
import VarReferencePicker from './var-reference-picker'
import Input from '@/pages/workflowConfig/components/input'
import type { ValueSelector, Var, Variable } from '@/pages/workflowConfig/workflow/types'
import { VarType as VarKindType } from '@/pages/workflowConfig/workflow/nodes/tool/types'
import { IconMinusCircle } from '@arco-design/web-react/icon'

type Props = {
  nodeId: string
  readonly: boolean
  list: Variable[]
  onChange: (list: Variable[]) => void
  onVarNameChange?: (oldName: string, newName: string) => void
  isSupportConstantValue?: boolean
  onlyLeafNodeVar?: boolean
  filterVar?: (payload: Var, valueSelector: ValueSelector) => boolean
  isSupportFileVar?: boolean
}

const VarList: FC<Props> = ({
  nodeId,
  readonly,
  list = [],
  onChange,
  onVarNameChange,
  isSupportConstantValue,
  onlyLeafNodeVar,
  filterVar,
  isSupportFileVar = true,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const handleVarNameChange = useCallback((index: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      onVarNameChange?.(list[index].variable, e.target.value)
      const newList = produce(list, (draft) => {
        draft[index].variable = e.target.value
      })
      onChange(newList)
    }
  }, [list, onVarNameChange, onChange])

  const handleVarReferenceChange = useCallback((index: number) => {
    return (value: ValueSelector | string, varKindType: VarKindType) => {
      const newList = produce(list, (draft) => {
        if (!isSupportConstantValue || varKindType === VarKindType.variable) {
          draft[index].value_selector = value as ValueSelector
          if (isSupportConstantValue)
            draft[index].variable_type = VarKindType.variable

          if (!draft[index].variable)
            draft[index].variable = value[value.length - 1]
        }
        else {
          draft[index].variable_type = VarKindType.constant
          draft[index].value_selector = value as ValueSelector
          draft[index].value = value as string
        }
      })
      onChange(newList)
    }
  }, [isSupportConstantValue, list, onChange])

  const handleVarRemove = useCallback((index: number) => {
    return () => {
      const newList = produce(list, (draft) => {
        draft.splice(index, 1)
      })
      onChange(newList)
    }
  }, [list, onChange])

  return (
    <div className='space-y-[8px]'>
      {list.map((item, index) => (
        <div className='flex items-center' key={index}>
          <Input
            wrapperClassName='w-[166px] mr-[8px]'
            className="rounded-[4px] outline-input"
            disabled={readonly}
            value={list[index].variable}
            onChange={handleVarNameChange(index)}
            placeholder={t('workflow.common.variableNamePlaceholder')!}
          />
          <VarReferencePicker
            nodeId={nodeId}
            readonly={readonly}
            isShowNodeName
            className='grow'
            value={item.variable_type === VarKindType.constant ? (item.value || '') : (item.value_selector || [])}
            isSupportConstantValue={isSupportConstantValue}
            onChange={handleVarReferenceChange(index)}
            defaultVarKindType={item.variable_type}
            onlyLeafNodeVar={onlyLeafNodeVar}
            filterVar={filterVar}
            isSupportFileVar={isSupportFileVar}
          />
          {!readonly && (
            // <RemoveButton
            //   className='!p-2 !bg-gray-100 hover:!bg-gray-200 rounded-[4px] ml-[12px]'
            //   onClick={handleVarRemove(index)}
            // />
            <IconMinusCircle
              className='size-[16px] cursor-pointer ml-[12px]'
              onClick={handleVarRemove(index)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
export default React.memo(VarList)
