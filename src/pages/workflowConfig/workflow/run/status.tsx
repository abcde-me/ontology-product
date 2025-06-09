
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import cn from '@/pages/workflowConfig/utils/classnames'
import Indicator from '@/pages/workflowConfig/components/indicator'
import StatusContainer from '@/pages/workflowConfig/workflow/run/status-container'
import React from 'react'

type ResultProps = {
  status: string
  time?: number
  tokens?: number
  error?: string
  exceptionCounts?: number
}

const StatusPanel: FC<ResultProps> = ({
  status,
  time,
  tokens,
  error,
  exceptionCounts,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  return (
    <StatusContainer status={status}>
      <div className='flex'>
        <div className={cn(
          'flex-[33%] max-w-[120px]',
          status === 'partial-succeeded' && 'min-w-[140px]',
        )}>
          <div className='mb-1 text-[#6E7B8D] system-2xs-medium-uppercase'>{t('runLog.resultPanel.status')}</div>
          <div
            className={cn(
              'flex items-center gap-1 system-xs-semibold-uppercase',
              status === 'succeeded' && 'text-util-colors-green-green-600',
              status === 'partial-succeeded' && 'text-util-colors-green-green-600',
              status === 'failed' && 'text-util-colors-red-red-600',
              status === 'stopped' && 'text-util-colors-warning-warning-600',
              status === 'running' && 'text-util-colors-blue-light-blue-light-600',
            )}
          >
            {status === 'running' && (
              <>
                <Indicator color={'blue'} />
                <span>运行中</span>
              </>
            )}
            {status === 'succeeded' && (
              <>
                <Indicator color={'green'} />
                <span>运行成功</span>
              </>
            )}
            {status === 'partial-succeeded' && (
              <>
                <Indicator color={'green'} />
                <span>运行部分成功</span>
              </>
            )}
            {status === 'exception' && (
              <>
                <Indicator color={'yellow'} />
                <span>运行异常</span>
              </>
            )}
            {status === 'failed' && (
              <>
                <Indicator color={'red'} />
                <span>运行失败</span>
              </>
            )}
            {status === 'stopped' && (
              <>
                <Indicator color={'yellow'} />
                <span>运行终止</span>
              </>
            )}
          </div>
        </div>
        <div className='flex-[33%] max-w-[152px]'>
          <div className='mb-1 text-[#6E7B8D] system-2xs-medium-uppercase'>总用时</div>
          <div className='flex items-center gap-1 system-sm-medium text-[#151B26]'>
            {status === 'running' && (
              <div className='w-16 h-2 rounded-sm bg-text-quaternary' />
            )}
            {status !== 'running' && (
              <span className='font-medium'>{time ? `${time?.toFixed(3)}s` : '-'}</span>
            )}
          </div>
        </div>
        <div className='flex-[33%]'>
          <div className='mb-1 text-[#6E7B8D] system-2xs-medium-uppercase'>总消耗</div>
          <div className='flex items-center gap-1 system-sm-medium text-[#151B26]'>
            {status === 'running' && (
              <div className='w-20 h-2 rounded-sm bg-text-quaternary' />
            )}
            {status !== 'running' && (
              <span className='font-medium'>{`${tokens || 0} Tokens`}</span>
            )}
          </div>
        </div>
      </div>
      {status === 'failed' && error && (
        <>
          <div className='my-2 h-[0.5px] bg-divider-subtle'/>
          <div className='system-xs-regular text-text-destructive'>{error}</div>
          {
            !!exceptionCounts && (
              <>
                <div className='my-2 h-[0.5px] bg-divider-subtle'/>
                <div className='system-xs-regular text-text-destructive'>
                  {t('workflow.nodes.common.errorHandle.partialSucceeded.tip', { num: exceptionCounts })}
                </div>
              </>
            )
          }
        </>
      )}
      {
        status === 'partial-succeeded' && !!exceptionCounts && (
          <>
            <div className='my-2 h-[0.5px] bg-divider-deep'/>
            <div className='system-xs-medium text-text-warning'>
              {t('workflow.nodes.common.errorHandle.partialSucceeded.tip', { num: exceptionCounts })}
            </div>
          </>
        )
      }
      {
        status === 'exception' && (
          <>
            <div className='my-2 h-[0.5px] bg-divider-deep'/>
            <div className='system-xs-medium text-text-warning'>
              {error}
              {/* <a
                href='https://docs.dify.ai/guides/workflow/error-handling/error-type'
                target='_blank'
                className='text-text-accent'
              >
                {t('workflow.common.learnMore')}
              </a> */}
            </div>
          </>
        )
      }
    </StatusContainer>
  )
}

export default StatusPanel
