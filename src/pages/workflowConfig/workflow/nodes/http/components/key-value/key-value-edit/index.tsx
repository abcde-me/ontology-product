
import type { FC } from 'react'
import React, { useCallback } from 'react'
import produce from 'immer'
import { useTranslation } from 'react-i18next'
import type { KeyValue } from '../../../types'
import KeyValueItem from './item'
import cn from '@/pages/workflowConfig/utils/classnames'

const i18nPrefix = 'workflow.nodes.http'

interface Props {
  readonly: boolean
  nodeId: string
  list: KeyValue[]
  onChange: (newList: KeyValue[]) => void
  onAdd: () => void
  isSupportFile?: boolean
  // onSwitchToBulkEdit: () => void
  keyNotSupportVar?: boolean
  insertVarTipToLeft?: boolean
}

const KeyValueList: FC<Props> = ({
  readonly,
  nodeId,
  list,
  onChange,
  onAdd,
  isSupportFile,
  // onSwitchToBulkEdit,
  keyNotSupportVar,
  insertVarTipToLeft,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const handleChange = useCallback((index: number) => {
    return (newItem: KeyValue) => {
      const newList = produce(list, (draft: any) => {
        draft[index] = newItem
      })
      onChange(newList)
    }
  }, [list, onChange])

  const handleRemove = useCallback((index: number) => {
    return () => {
      const newList = produce(list, (draft: any) => {
        draft.splice(index, 1)
      })
      onChange(newList)
    }
  }, [list, onChange])

  if (!Array.isArray(list))
    return null

  return (
    <div className='rounded-[4px] overflow-hidden flex flex-col gap-y-[8px]'>
      <div className={cn('flex items-center text-[#151B26] text-[12px]/[16px] font-pf-medium mb-[8px] font-medium')}>
        <div className={cn('flex items-center h-full', isSupportFile ? 'w-[140px]' : 'w-1/2')}>变量名</div>
        {isSupportFile && <div className='flex items-center shrink-0 w-[70px] h-full pl-3 border-r border-divider-regular'>{t(`${i18nPrefix}.type`)}</div>}
        <div className={cn('flex h-full items-center justify-between -ml-[8px]', isSupportFile ? 'grow' : 'w-1/2')}>变量值</div>
      </div>
      {
        list.map((item, index) => (
          <KeyValueItem
            key={item.id}
            instanceId={item.id!}
            nodeId={nodeId}
            payload={item}
            onChange={handleChange(index)}
            onRemove={handleRemove(index)}
            isLastItem={index === list.length - 1}
            onAdd={onAdd}
            readonly={readonly}
            canRemove={list.length > 1}
            isSupportFile={isSupportFile}
            keyNotSupportVar={keyNotSupportVar}
            insertVarTipToLeft={insertVarTipToLeft}
          />
        ))
      }
    </div>
  )
}
export default React.memo(KeyValueList)
