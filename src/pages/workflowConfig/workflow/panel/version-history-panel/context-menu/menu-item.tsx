import React, { type FC } from 'react'
import type { VersionHistoryContextMenuOptions } from '../../../types'
import cn from '@/pages/workflowConfig/utils/classnames'

type MenuItemProps = {
  item: {
    key: VersionHistoryContextMenuOptions
    name: string
  }
  onClick: (operation: VersionHistoryContextMenuOptions) => void
  isDestructive?: boolean
}

const MenuItem: FC<MenuItemProps> = ({
  item,
  onClick,
  isDestructive = false,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between h-[36px] px-[12px] pt-[6px] pb-[9px] cursor-pointer rounded-none ',
        isDestructive ? 'hover:bg-state-destructive-hover' : 'hover:bg-[#D9EAFF]',
      )}
      onClick={() => {
        onClick(item.key)
      }}
    >
      <div className={cn(
        'flex-1 text-[#151B26] system-md-regular',
        isDestructive && 'hover:text-text-destructive',
      )}>
        {item.name}
      </div>
    </div>
  )
}

export default React.memo(MenuItem)
