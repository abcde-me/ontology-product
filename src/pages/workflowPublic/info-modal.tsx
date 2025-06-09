import React from 'react'
import Modal from '@/pages/workflowConfig/components/modal'
import AppIcon from '@/pages/workflowConfig/components/app-icon'
import type { SiteInfo } from '@/pages/workflowConfig/models/share'
import { appDefaultIconBackground } from '@/pages/workflowConfig/config'
import cn from 'classnames'

type Props = {
  data?: SiteInfo
  isShow: boolean
  onClose: () => void
}

const InfoModal = ({
  isShow,
  onClose,
  data,
}: Props) => {
  return (
    <Modal
      isShow={isShow}
      onClose={onClose}
      className='!p-0 min-w-[400px] max-w-[400px]'
      closable
    >
      <div className={cn('pt-10 px-4 pb-8 flex flex-col items-center gap-4')}>
        <AppIcon
          size='xxl'
          iconType={data?.icon_type}
          icon={data?.icon}
          background={data?.icon_background || appDefaultIconBackground}
          imageUrl={data?.icon_url}
        />
        <div className='text-text-secondary system-xl-semibold'>{data?.title}</div>
        <div className='text-text-tertiary system-xs-regular'>
          {/* copyright */}
          {data?.copyright && (
            <div>© {(new Date()).getFullYear()} {data?.copyright}</div>
          )}
          {data?.custom_disclaimer && (
            <div className='mt-2'>{data.custom_disclaimer}</div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default InfoModal
