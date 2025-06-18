import React, {
  memo,
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { groupBy } from 'lodash-es'
import BlockIcon from '../block-icon'
import { BlockEnum } from '../types'
import {
  useIsChatMode,
  useNodesExtraData,
} from '../hooks'
import { BLOCK_CLASSIFICATIONS } from './constants'
import { useBlocks } from './hooks'
import type { ToolDefaultValue } from './types'
import Tooltip from '@/pages/workflowConfig/components/tooltip'

type BlocksProps = {
  searchText: string
  onSelect: (type: BlockEnum, tool?: ToolDefaultValue) => void
  availableBlocksTypes?: BlockEnum[]
}
const Blocks = ({
  searchText,
  onSelect,
  availableBlocksTypes = [],
}: BlocksProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const isChatMode = useIsChatMode()
  const nodesExtraData = useNodesExtraData()
  const blocks = useBlocks()

  const groups = useMemo(() => {
    return BLOCK_CLASSIFICATIONS.reduce((acc, classification) => {
      const list = groupBy(blocks, 'classification')[classification].filter((block) => {
        return block.title.toLowerCase().includes(searchText.toLowerCase()) && availableBlocksTypes.includes(block.type)
      })

      return {
        ...acc,
        [classification]: list,
      }
    }, {} as Record<string, typeof blocks>)
  }, [blocks, searchText, availableBlocksTypes])
  const isEmpty = Object.values(groups).every(list => !list.length)

  // 过滤暂时无用节点
  const renderGroup = useCallback((classification: string) => {
    const list = groups[classification].filter(b =>
      b.type !== BlockEnum.Start &&
      b.type !== BlockEnum.Text &&
      b.type !== BlockEnum.Pic &&
      b.type !== BlockEnum.Audio &&
      b.type !== BlockEnum.Cleaning &&
      b.type !== BlockEnum.Enhancement
    )

    return (
      <div
        key={classification}
        className='mb-1 last-of-type:mb-0 block-nodes-group'
      >
        {
          classification !== '-' && !!list.length && (
            <div className='nodes-group-title flex items-start px-3 h-[22px] text-xs font-medium text-text-tertiary'>
              {t(`workflow.tabs.${classification}`)}
            </div>
          )
        }
        {
          list.map(block => (
            <Tooltip
              key={block.type}
              position='right'
              popupClassName='w-[200px] rounded-[12px] p-[16px]'
              popupContent={(
                <div>
                  <div className='flex gap-x-[8px] items-center mb-[8px]'>
                    <BlockIcon
                      size='md'
                      className='size-[20px]'
                      type={block.type}
                    />
                    <div className='system-md-medium text-text-primary text-[16px]/[24px] '>{block.title}</div>
                  </div>
                  <div className='text-text-tertiary system-xs-regular text-[12px]/[20px] text-[#6E7B8D]'>{nodesExtraData[block.type].about}</div>
                </div>
              )}
            >
              <div
                key={block.type}
                className='nodes-group-item flex items-center px-3 w-full h-8 rounded-lg hover:bg-state-base-hover cursor-pointer'
                onClick={() => onSelect(block.type)}
              >
                <BlockIcon
                  className='mr-[8px] shrink-0 w-[20px] h-[20px] node-icon'
                  type={block.type}
                />
                <div className='text-sm text-text-secondary node-title'>{block.title}</div>
              </div>
            </Tooltip>
          ))
        }
      </div>
    )
  }, [groups, nodesExtraData, onSelect, t])

  return (
    <div className='block-nodes-list'>
      {
        isEmpty && (
          <div className='flex items-center justify-center px-3 h-[22px] text-xs font-medium text-text-tertiary'>未搜索到节点</div>
        )
      }
      {
        !isEmpty && BLOCK_CLASSIFICATIONS.map(renderGroup)
      }
    </div>
  )
}

export default memo(Blocks)
