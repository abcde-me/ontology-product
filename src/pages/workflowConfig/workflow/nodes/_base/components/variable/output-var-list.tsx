import type { FC } from 'react'
import React, { useCallback } from 'react'
import produce from 'immer'
import { useTranslation } from 'react-i18next'
import type { OutputVar } from '../../../code/types'
import RemoveButton from '../remove-button'
import VarTypePicker from './var-type-picker'
import Input from '@/pages/workflowConfig/components/input'
import type { VarType } from '@/pages/workflowConfig/workflow/types'
import { checkKeys } from '@/pages/workflowConfig/utils/var'
import Toast from '@/pages/workflowConfig/components/toast'
import { IconMinusCircle } from '@arco-design/web-react/icon'

interface Props {
  readonly: boolean
  outputs: OutputVar
  outputKeyOrders: string[]
  onChange: (payload: OutputVar, changedIndex?: number, newKey?: string) => void
  onRemove: (index: number) => void
}

const OutputVarList: FC<Props> = ({
  readonly,
  outputs,
  outputKeyOrders,
  onChange,
  onRemove,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const list = outputKeyOrders.map((key) => {
    return {
      variable: key,
      variable_type: outputs[key]?.type,
    }
  })
  const handleVarNameChange = useCallback((index: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const oldKey = list[index].variable
      const newKey = e.target.value

      const { isValid, errorKey, errorMessageKey } = checkKeys([newKey], true)
      if (!isValid) {
        Toast.notify({
          type: 'error',
          message: t(`appDebug.varKeyError.${errorMessageKey}`, { key: errorKey }),
        })
        return
      }

      if (list.map(item => item.variable?.trim()).includes(newKey.trim())) {
        Toast.notify({
          type: 'error',
          message: t('appDebug.varKeyError.keyAlreadyExists', { key: newKey }),
        })
        return
      }

      const newOutputs = produce(outputs, (draft) => {
        draft[newKey] = draft[oldKey]
        delete draft[oldKey]
      })
      onChange(newOutputs, index, newKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, onChange, outputs, outputKeyOrders])

  const handleVarTypeChange = useCallback((index: number) => {
    return (value: string) => {
      const key = list[index].variable
      const newOutputs = produce(outputs, (draft) => {
        draft[key].type = value as VarType
      })
      onChange(newOutputs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, onChange, outputs, outputKeyOrders])

  const handleVarRemove = useCallback((index: number) => {
    return () => {
      onRemove(index)
    }
  }, [onRemove])

  return (
    <div className='space-y-[8px]'>
      {list.map((item, index) => (
        <div className='flex items-center' key={index}>
          <Input
            wrapperClassName='w-[166px] mr-[8px]'
            className="rounded-[4px] outline-input"
            readOnly={readonly}
            value={item.variable}
            onChange={handleVarNameChange(index)}
          />
          <VarTypePicker
            readonly={readonly}
            value={item.variable_type}
            className='grow'
            onChange={handleVarTypeChange(index)}
          />
          {/* <RemoveButton
            className='!p-2 !bg-gray-100 hover:!bg-gray-200 rounded-[4px]'
            onClick={handleVarRemove(index)}
          /> */}
          <IconMinusCircle
            className='size-[16px] cursor-pointer ml-[12px]'
            onClick={handleVarRemove(index)}
          />
        </div>
      ))}
    </div>
  )
}
export default React.memo(OutputVarList)
