import type { FC } from 'react'
import React, { memo } from 'react'
// import { useAllBuiltInTools, useAllCustomTools, useAllWorkflowTools } from '@/service/use-tools'
import type { BlockEnum } from '../types'
import { useTabs } from './hooks'
import type { ToolDefaultValue } from './types'
import { TabsEnum } from './types'
import Blocks from './blocks'
import AllTools from './all-tools'
import cn from '@/pages/workflowConfig/utils/classnames'
import customTools from '@/pages/workflowConfig/mockData/customTools.json'
import workflowTools from '@/pages/workflowConfig/mockData/workflowTools.json'


export type TabsProps = {
  activeTab: TabsEnum
  onActiveTabChange: (activeTab: TabsEnum) => void
  searchText: string
  tags: string[]
  onSelect: (type: BlockEnum, tool?: ToolDefaultValue) => void
  availableBlocksTypes?: BlockEnum[]
  noBlocks?: boolean
}
const Tabs: FC<TabsProps> = ({
  activeTab,
  onActiveTabChange,
  tags,
  searchText,
  onSelect,
  availableBlocksTypes,
  noBlocks,
}) => {
  const tabs = useTabs()
  // const { data: buildInTools } = useAllBuiltInTools()
  // const { data: customTools } = useAllCustomTools()
  // const { data: workflowTools } = useAllWorkflowTools()

  return (
    <div onClick={e => e.stopPropagation()} className="nodes-list-wrapper">
      {/* {
        !noBlocks && (
          <div className='flex items-center border-b-[0.5px] border-divider-subtle nodes-tabs'>
            {
              tabs.map(tab => (
                <div
                  key={tab.key}
                  className={cn(
                    'relative mr-4 pt-1 pb-2 system-sm-medium cursor-pointer nodes-tab',
                    activeTab === tab.key
                      ? 'active text-text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-util-colors-blue-brand-blue-brand-600'
                      : 'text-text-tertiary',
                  )}
                  onClick={() => onActiveTabChange(tab.key)}
                >
                  {tab.name}
                </div>
              ))
            }
          </div>
        )
      } */}
      {
        activeTab === TabsEnum.Blocks && !noBlocks && (
          <Blocks
            searchText={searchText}
            onSelect={onSelect}
            availableBlocksTypes={availableBlocksTypes}
          />
        )
      }
      {
        activeTab === TabsEnum.Tools && (
          <AllTools
            className='w-[315px] all-tools-wrapper'
            searchText={searchText}
            onSelect={onSelect}
            tags={tags}
            buildInTools={[]}
            customTools={(customTools || []) as any[]}
            workflowTools={(workflowTools || []) as any[]}
          />
        )
      }
    </div>
  )
}

export default memo(Tabs)
