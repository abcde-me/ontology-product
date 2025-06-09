
import type { FC } from 'react'
import React, { useCallback, useMemo } from 'react'
import produce from 'immer'
import { useTranslation } from 'react-i18next'
import Item from './dataset-item'
import type { DataSet } from '@/pages/workflowConfig/models/datasets'
import { useSelector as useAppContextSelector } from '@/pages/workflowConfig/context/app-context'
import KbIcon from '@/pages/workflowConfig/styles/images/op-icons/kb.svg';
import KbConfigIcon from '@/pages/workflowConfig/styles/images/op-icons/kb-strategy.svg';
import { IconCheckCircleFill, IconMinusCircle } from '@arco-design/web-react/icon'
import { Tooltip } from '@arco-design/web-react'

type Props = {
  list: DataSet[]
  onChange: (list: DataSet[]) => void
  readonly?: boolean
}

const DatasetList: FC<Props> = ({
  list,
  onChange,
  readonly,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const userProfile = useAppContextSelector(s => s.userProfile)

  const handleRemove = useCallback((index: number) => {
    return () => {
      const newList = produce(list, (draft) => {
        draft.splice(index, 1)
      })
      onChange(newList)
    }
  }, [list, onChange])

  const handleChange = useCallback((index: number) => {
    return (value: DataSet) => {
      const newList = produce(list, (draft) => {
        draft[index] = value
      })
      onChange(newList)
    }
  }, [list, onChange])

  const formattedList = useMemo(() => {
    return list.map((item) => {
      const datasetConfig = {
        createdBy: item.created_by,
        partialMemberList: item.partial_member_list || [],
        permission: item.permission,
      }
      return {
        ...item,
        editable: true,
      }
    })
  }, [list, userProfile?.id])

  return (
    <div className='space-y-[8px] kb-item-list'>
      {formattedList.length
        ? formattedList.map((item, index) => {
          return (
            // <Item
            //   key={index}
            //   payload={item}
            //   onRemove={handleRemove(index)}
            //   onChange={handleChange(index)}
            //   readonly={readonly}
            //   // editable={item.editable}
            //   editable={false}
            // />
            <div className='kb-item' key={index}>
              <div className='icon-name flex items-center'>
                <KbIcon className='size-[28px] mr-[8px]'/>
                <span className='text-[#151B26] text-[12px]/[18px]'>{item.name}</span>
              </div>
              <div className='kb-actions cursor-pointer'>
                <IconCheckCircleFill className='text-[#DBF4EE] size-[12px] ok-status'/>
                {!readonly && <>
                    {/* <Tooltip content="知识库配置">
                      <KbConfigIcon className='size-[16px] hover-action mr-[12px]' />
                    </Tooltip> */}
                    <Tooltip content="删除">
                      <IconMinusCircle className='size-[16px] hover-action' onClick={handleRemove(index)}/>
                    </Tooltip>
                  </>
                }
              </div>
            </div>
          )
        })
        : (
          <div className='h-[40px] border-[#CBD5E1] border-[1px] flex items-center justify-center text-xs text-center text-gray-500 rounded-[8px] cursor-default select-none'>
            {t('appDebug.datasetConfig.knowledgeTip')}
          </div>
        )
      }

    </div>
  )
}
export default React.memo(DatasetList)
