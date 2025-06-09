import React, {
  memo,
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNodes } from 'reactflow'
import FormItem from '../nodes/_base/components/before-run-form/form-item'
import {
  BlockEnum,
  InputVarType,
  WorkflowRunningStatus,
} from '../types'
import {
  useStore,
  useWorkflowStore,
} from '../store'
import { useWorkflowRun } from '../hooks'
import type { StartNodeType } from '../nodes/start/types'
import StatusPanel from '../run/status'
import ResultText from '../run/result-text'
import { TransferMethod } from '@/pages/workflowConfig/components/text-generation/types'
import Button from '@/pages/workflowConfig/components/button'
import { useFeatures } from '@/pages/workflowConfig/components/features/hooks'
import {
  getProcessedInputs,
} from '@/pages/workflowConfig/chat/chat/utils'
import { useCheckInputsForms } from '@/pages/workflowConfig/chat/chat/check-input-forms-hooks'
import type {
  AgentLogItemWithChildren,
  NodeTracing,
} from '@/pages/workflowConfig/types/workflow'

interface Props {
  onRun: () => void
}

const InputsPanel = ({
  onRun
}: Props) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const workflowStore = useWorkflowStore()
  const fileSettings = useFeatures(s => s.features.file)
  const nodes = useNodes<StartNodeType>()
  const inputs = useStore(s => s.inputs)
  const files = useStore(s => s.files)
  const workflowRunningData = useStore(s => s.workflowRunningData)
  const {
    handleRun,
    handleStopRun,
  } = useWorkflowRun()
  const startNode = nodes.find(node => node.data.type === BlockEnum.Start)
  const startVariables = startNode?.data.variables
  const { checkInputsForm } = useCheckInputsForms()

  const variables = useMemo(() => {
    const data = startVariables || []
    if (fileSettings?.image?.enabled) {
      return [
        ...data,
        {
          type: InputVarType.files,
          variable: '__image',
          required: false,
          label: 'files',
        },
      ]
    }

    return data
  }, [fileSettings?.image?.enabled, startVariables])

  const handleValueChange = (variable: string, v: any) => {
    const {
      inputs,
      setInputs,
    } = workflowStore.getState()
    if (variable === '__image') {
      workflowStore.setState({
        files: v,
      })
    }
    else {
      setInputs({
        ...inputs,
        [variable]: v,
      })
    }
  }

  const doRun = useCallback(() => {
    if (!checkInputsForm(inputs, variables as any))
      return
    // onRun()
    handleRun({ inputs: getProcessedInputs(inputs, variables as any), files })
  }, [files, handleRun, inputs, variables, checkInputsForm])

  const canRun = useMemo(() => {
    if (files?.some(item => (item.transfer_method as any) === TransferMethod.local_file && !item.upload_file_id))
      return false

    if (variables.some(v => v.required && !inputs[v.variable]))
      return false

    return true
  }, [files, variables, inputs])

  return (
    <div className='px-[16px]'>
      <div className='title-txt mb-[18px]'>输入</div>
      <div className='vars-section'>
        {
          variables.map((variable, index) => (
            <div
              key={variable.variable}
              className='mb-[18px] last-of-type:mb-0'
            >
              <FormItem
                autoFocus={index === 0}
                className='!block'
                payload={variable}
                value={inputs[variable.variable]}
                disabled={workflowRunningData?.result?.status === 'running'}
                onChange={v => handleValueChange(variable.variable, v)}
              />
            </div>
          ))
        }
      </div>
      <div className='flex items-center justify-between my-[16px]'>
        {
          workflowRunningData?.result?.status === 'running' ?
            <div
              className='text-[#151B26] text-[14px]/[18px] font-medium rouned-[4px] cursor-pointer border-[1px] border-[#CBD5E1] w-full flex items-center justify-center h-[32px]'
              onClick={() => {handleStopRun(workflowRunningData?.task_id || '')}}
            >停止</div>
            :
            <Button
              variant='primary'
              disabled={!canRun || workflowRunningData?.result?.status === WorkflowRunningStatus.Running}
              className='w-full custom-primary'
              onClick={doRun}
            >
              {t('workflow.singleRun.startRun')}
            </Button>
        }
        
      </div>
      <div className={`${workflowRunningData?.result?.status || '' ? '' : 'hidden'} mb-[20px]`}>
        <StatusPanel
          status={workflowRunningData?.result?.status || ''}
          time={workflowRunningData?.result?.elapsed_time}
          tokens={workflowRunningData?.result?.total_tokens}
          error={workflowRunningData?.result?.error}
          exceptionCounts={workflowRunningData?.result?.exceptions_count}
        />
        <div className='title-txt mb-[8px] mt-[16px]'>输出</div>
        <ResultText
          isRunning={workflowRunningData?.result?.status === WorkflowRunningStatus.Running || !workflowRunningData?.result}
          outputs={workflowRunningData?.resultText}
          outputsDetail={workflowRunningData?.result?.outputs}
          allFiles={workflowRunningData?.result?.files as any}
          error={workflowRunningData?.result?.error}
          onClick={() => {}}
        />
      </div>
    </div>
  )
}

export default memo(InputsPanel)
