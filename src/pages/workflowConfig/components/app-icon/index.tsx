import type { FC } from 'react'
import React from 'react'
import { cva } from 'class-variance-authority'
import type { AppIconType } from '@/pages/workflowConfig/types/app'
import classNames from '@/pages/workflowConfig/utils/classnames'

export type AppIconProps = {
  size?: 'xs' | 'tiny' | 'small' | 'medium' | 'large' | 'xl' | 'xxl'
  rounded?: boolean
  iconType?: AppIconType | null
  icon?: string
  background?: string | null
  imageUrl?: string | null
  className?: string
  innerIcon?: React.ReactNode
  appMode?: string
  onClick?: () => void
}
const appIconVariants = cva(
  'flex items-center justify-center relative text-lg rounded-lg grow-0 shrink-0 overflow-hidden leading-none',
  {
    variants: {
      size: {
        xs: 'w-4 h-4 text-xs',
        tiny: 'w-6 h-6 text-base',
        small: 'w-8 h-8 text-xl',
        medium: 'w-9 h-9 text-[22px]',
        large: 'w-10 h-10 text-[24px]',
        xl: 'w-12 h-12 text-[28px]',
        xxl: 'w-14 h-14 text-[32px]',
      },
      rounded: {
        true: 'rounded-full',
      },
    },
    defaultVariants: {
      size: 'medium',
      rounded: false,
    },
  })
const AppIcon: FC<AppIconProps> = ({
  size = 'medium',
  rounded = false,
  appMode = '',
  iconType,
  icon,
  background,
  imageUrl,
  className,
  innerIcon,
  onClick,
}) => {
  const isValidImageIcon = iconType === 'image' && imageUrl

  return <span
    className={classNames(appIconVariants({ size, rounded }), className, appMode, 'app-icon-shower', isValidImageIcon ? 'image-icon' : 'emoji-icon')}
    style={{ background: isValidImageIcon ? undefined : (background || '#FFEAD5') }}
    onClick={onClick}
  >
    {isValidImageIcon
      // eslint-disable-next-line
      ? <img src={imageUrl} className="w-full h-full" alt="app icon" />
      : (innerIcon || ((icon && icon !== '') ? '🤖' : '🤖'))
    }
  </span>
}

export default AppIcon
