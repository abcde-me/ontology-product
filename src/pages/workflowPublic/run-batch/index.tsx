import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiLoader2Line,
  RiPlayLargeFill,
  RiPlayLargeLine,
} from '@remixicon/react'
import CSVReader from './csv-reader'
import CSVDownload from './csv-download'
import Button from '@/pages/workflowConfig/components/button'
import useBreakpoints, { MediaType } from '@/pages/workflowConfig/hooks/use-breakpoints'
import cn from '@/pages/workflowConfig/utils/classnames'
export type IRunBatchProps = {
  vars: { name: string }[]
  onSend: (data: string[][]) => void
  isAllFinished: boolean
}

const RunBatch: FC<IRunBatchProps> = ({
  vars,
  onSend,
  isAllFinished,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const media = useBreakpoints()
  const isPC = media === MediaType.pc

  const [csvData, setCsvData] = React.useState<string[][]>([])
  const [isParsed, setIsParsed] = React.useState(false)
  const handleParsed = (data: string[][]) => {
    setCsvData(data)
    // console.log(data)
    setIsParsed(true)
  }

  const handleSend = () => {
    onSend(csvData)
  }
  const Icon = isAllFinished ? RiPlayLargeFill : RiLoader2Line
  return (
    <div className='run-batch-section'>
      <CSVReader onParsed={handleParsed} />
      <CSVDownload vars={vars} />
      <div className='flex w-full'>
        <Button
          variant="primary"
          className={cn('mt-[20px] w-full custom-primary', !isPC && 'grow')}
          onClick={handleSend}
          disabled={!isParsed || !isAllFinished}
        >
          <Icon className={cn(!isAllFinished && 'animate-spin', 'shrink-0 w-4 h-4 mr-1')} aria-hidden="true" />
          <span className='uppercase text-[13px]'>{t('share.generation.run')}</span>
        </Button>
      </div>
    </div>
  )
}
export default React.memo(RunBatch)
