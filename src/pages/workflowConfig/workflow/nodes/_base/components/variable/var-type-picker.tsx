import type { FC } from 'react'
import React, { useCallback, useState } from 'react'
import { RiArrowDownSLine } from '@remixicon/react'
import cn from '@/pages/workflowConfig/utils/classnames'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/pages/workflowConfig/components/portal-to-follow-elem'
import { RiCheckLine } from '@remixicon/react'
import { VarType } from '@/pages/workflowConfig/workflow/types'

type Props = {
  className?: string
  readonly: boolean
  value: string
  onChange: (value: string) => void
}

// const TYPES = [VarType.string, VarType.number, VarType.arrayNumber, VarType.arrayString, VarType.arrayObject, VarType.object]
const TYPES = [VarType.string, VarType.integer, VarType.number, VarType.boolean, VarType.time, VarType.object, VarType.array]

const VarReferencePicker: FC<Props> = ({
  readonly,
  className,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false)

  const handleChange = useCallback((type: string) => {
    return () => {
      setOpen(false)
      onChange(type)
    }
  }, [onChange])

  return (
    <div className={cn(className, !readonly && 'cursor-pointer select-none')}>
      <PortalToFollowElem
        open={open}
        onOpenChange={setOpen}
        placement='bottom-start'
        offset={4}
      >
        <PortalToFollowElemTrigger onClick={() => setOpen(!open)} className='w-min-[120px] cursor-pointer'>
          <div className='flex items-center h-8 justify-between px-2.5 rounded-[4px] bg-[white] border-[#CBD5E1] border-[1px] text-gray-900 text-[13px]'>
            <div className='capitalize grow w-0 truncate' title={value}>{value}</div>
            <RiArrowDownSLine className='shrink-0 w-3.5 h-3.5 text-gray-700' />
          </div>
        </PortalToFollowElemTrigger>
        <PortalToFollowElemContent style={{
          zIndex: 100,
        }}>
          <div className='w-[120px] py-1 bg-white rounded-[4px] shadow-sm'>
            {TYPES.map(type => (
              <div
                key={type}
                className='flex items-center h-[30px] justify-between pl-3 pr-2 rounded-none hover:bg-gray-100 text-gray-900 text-[13px] cursor-pointer'
                onClick={handleChange(type)}
              >
                <div className='w-0 grow capitalize truncate'>{type}</div>
                {type === value && <RiCheckLine className='shrink-0 w-4 h-4 text-primary-600' />}
              </div>
            ))}
          </div>
        </PortalToFollowElemContent>
      </PortalToFollowElem>
    </div>
  )
}
export default React.memo(VarReferencePicker)
