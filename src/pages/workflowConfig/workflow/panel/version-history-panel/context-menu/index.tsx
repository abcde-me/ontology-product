import React, { type FC, useCallback } from 'react'
import { RiMoreFill, RiMore2Fill } from '@remixicon/react'
import { VersionHistoryContextMenuOptions } from '../../../types'
import MenuItem from './menu-item'
import useContextMenu from './use-context-menu'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/pages/workflowConfig/components/portal-to-follow-elem'
import Button from '@/pages/workflowConfig/components/button'
import Divider from '@/pages/workflowConfig/components/divider'

export type ContextMenuProps = {
  isShowDelete: boolean
  isNamedVersion: boolean
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleClickMenuItem: (operation: VersionHistoryContextMenuOptions) => void
}

const ContextMenu: FC<ContextMenuProps> = (props: ContextMenuProps) => {
  const { isShowDelete, handleClickMenuItem, open, setOpen } = props
  const {
    deleteOperation,
    options,
  } = useContextMenu(props)

  const handleClickTrigger = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setOpen(v => !v)
  }, [setOpen])

  return (
    <PortalToFollowElem
      placement={'bottom-end'}
      offset={{
        mainAxis: 4,
        crossAxis: 0,
      }}
      open={open}
      onOpenChange={setOpen}
    >
      <PortalToFollowElemTrigger>
        <Button size='small' className='px-1 border-none' styleCss={{minWidth: 'unset !important', background: 'none', boxShadow: 'none'}} onClick={handleClickTrigger}>
          <RiMoreFill className='size-[16px] hover:text-[#007DFA]' />
        </Button>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className='z-10'>
        <div className='flex flex-col w-[120px] rounded-[4px] border-[0.5px] py-[4px] border-components-panel-border bg-components-panel-bg-blur shadow-lg shadow-shadow-shadow-5 backdrop-blur-[5px]'>
          <div className='flex flex-col'>
            {
              options.map((option) => {
                return (
                  <MenuItem
                    key={option.key}
                    item={option}
                    onClick={handleClickMenuItem.bind(null, option.key)}
                  />
                )
              })
            }
          </div>
          {
            isShowDelete && (
              <>
                <Divider type='horizontal' className='h-[1px] bg-divider-subtle my-0' />
                <div className=''>
                  <MenuItem
                    item={deleteOperation}
                    isDestructive
                    onClick={handleClickMenuItem.bind(null, VersionHistoryContextMenuOptions.delete)}
                  />
                </div>
              </>
            )
          }
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default React.memo(ContextMenu)
