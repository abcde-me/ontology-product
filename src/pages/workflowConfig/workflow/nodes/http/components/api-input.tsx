
import type { FC } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowDownSLine } from '@remixicon/react'
import { Method } from '../types'
import Selector from '../../_base/components/selector'
import useAvailableVarList from '../../_base/hooks/use-available-var-list'
import { VarType } from '../../../types'
import type { Var } from '../../../types'
import cn from '@/pages/workflowConfig/utils/classnames'
import Input from '@/pages/workflowConfig/workflow/nodes/_base/components/input-support-select-var'
import { isValidURL } from '@/utils/valiate'

const MethodOptions = [
  { label: 'GET', value: Method.get },
  { label: 'POST', value: Method.post },
  { label: 'HEAD', value: Method.head },
  { label: 'PATCH', value: Method.patch },
  { label: 'PUT', value: Method.put },
  { label: 'DELETE', value: Method.delete },
]
type Props = {
  nodeId: string
  readonly: boolean
  method: Method
  onMethodChange: (method: Method) => void
  url: string
  onUrlChange: (url: string) => void
}

const ApiInput: FC<Props> = ({
  nodeId,
  readonly,
  method,
  onMethodChange,
  url,
  onUrlChange,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const [isFocus, setIsFocus] = useState(false)
  const [isError, setIsError] = useState(false)
  const { availableVars, availableNodesWithParent } = useAvailableVarList(nodeId, {
    onlyLeafNodeVar: false,
    filterVar: (varPayload: Var) => {
      return [VarType.string, VarType.number, VarType.secret].includes(varPayload.type)
    },
  })

  const urlChanged = (url: string) => {
    console.log('url', url)
    if (!url) return
    if (isValidURL(url) || (url.includes('{{#') && url.includes('#}}'))) {
      setIsError(false)
      onUrlChange(url)
    } else {
      setIsError(true)
      onUrlChange('')
    }
  }

  return (
    <div className='flex items-start  space-x-1'>
      <Selector
        value={method}
        onChange={onMethodChange}
        options={MethodOptions}
        trigger={
          <div className={cn(readonly && 'cursor-pointer', 'h-[32px] shrink-0 flex items-center px-2.5 bg-[white] border-[#CBD5E1] border-[1px] rounded-[6px]')} >
            <div className='w-12 pl-0.5 leading-[18px] text-xs font-medium text-gray-900 uppercase'>{method}</div>
            {!readonly && <RiArrowDownSLine className='ml-1 w-3.5 h-3.5 text-gray-700' />}
          </div>
        }
        popupClassName='top-[34px] w-[108px]'
        showChecked
        readonly={readonly}
      />
      <div className='w-0 grow relative'>
        <Input
          instanceId='http-api-url'
          className={cn(isFocus ? 'shadow-xs bg-gray-50 border-gray-300' : 'bg-gray-100 border-gray-100', 'h-[32px] w-full rounded-[4px] px-3 py-[6px] !pt-[5px] border outline-input')}
          value={url}
          onChange={urlChanged}
          readOnly={readonly}
          nodesOutputVars={availableVars}
          availableNodes={availableNodesWithParent}
          onFocusChange={setIsFocus}
          placeholder={!readonly ? t('workflow.nodes.http.apiPlaceholder')! : ''}
          placeholderClassName='!leading-[21px]'
        />
        <div className={`${isError ? '' : 'hidden'} absolute -bottom-[18px] left-0 text-[#EF4444] text-[12px]/[18px]`}>URL格式错误</div>
      </div>
      
    </div >
  )
}
export default React.memo(ApiInput)
