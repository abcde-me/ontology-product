import type { FC } from 'react'
import React, { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useConfig from './use-config'
import ApiInput from './components/api-input'
import KeyValue from './components/key-value'
import EditBody from './components/edit-body'
import AuthorizationModal from './components/authorization'
import type { HttpNodeType, Authorization as AuthorizationPayloadType } from './types'
import { APIType, AuthorizationType, BodyType } from './types'
import Timeout from './components/timeout'
import CurlPanel from './components/curl-panel'
import cn from '@/pages/workflowConfig/utils/classnames'
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field'
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split'
import OutputVars, { VarItem } from '@/pages/workflowConfig/workflow/nodes/_base/components/output-vars'
import { RiSettings2Line, RiArrowGoForwardLine, RiAddLine } from '@remixicon/react'
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import BeforeRunForm from '@/pages/workflowConfig/workflow/nodes/_base/components/before-run-form'
import ResultPanel from '@/pages/workflowConfig/workflow/run/result-panel'
import { InputNumber, Select, Switch } from '@arco-design/web-react'
import produce from 'immer'
import Input from '@/pages/workflowConfig/workflow/nodes/_base/components/input-support-select-var'
import { VarType } from '@/pages/workflowConfig/workflow/types'
import type { Var } from '@/pages/workflowConfig/workflow/types'
import useAvailableVarList from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-available-var-list'

const i18nPrefix = 'workflow.nodes.http'

const Panel: FC<NodePanelProps<HttpNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const {
    readOnly,
    isDataReady,
    inputs,
    handleMethodChange,
    handleUrlChange,
    headers,
    setHeaders,
    addHeader,
    params,
    setParams,
    addParam,
    setBody,
    isShowAuthorization,
    showAuthorization,
    hideAuthorization,
    setAuthorization,
    setTimeout,
    // single run
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    varInputs,
    inputVarValues,
    setInputVarValues,
    runResult,
    isShowCurlPanel,
    showCurlPanel,
    hideCurlPanel,
    handleCurlImport,
  } = useConfig(id, data)

  const [showAuth, setShowAuth] = useState(false)
  const [isFocus, setIsFocus] = useState(false)

  const { availableVars, availableNodesWithParent } = useAvailableVarList(id, {
    onlyLeafNodeVar: false,
    filterVar: (varPayload: Var) => {
      return [VarType.string, VarType.number, VarType.secret].includes(varPayload.type)
    },
  })
  const changeAuth = (checked: boolean) => {
    setShowAuth(checked)
    handleAuthTypeChange(checked ? AuthorizationType.apiKey : AuthorizationType.none)
  }
  const handleAuthTypeChange = (type: string) => {
    const newPayload = produce(inputs.authorization, (draft: AuthorizationPayloadType) => {
      draft.type = type as AuthorizationType
      if (draft.type === AuthorizationType.apiKey && !draft.config) {
        draft.config = {
          type: APIType.bearer,
          api_key: '',
        }
      }
    })
    setAuthorization(newPayload)
  }
  const handleAuthAPITypeChange = (type: string) => {
    const newPayload = produce(inputs.authorization, (draft: AuthorizationPayloadType) => {
      if (!draft.config) {
        draft.config = {
          type: APIType.bearer,
          api_key: '',
        }
      }
      draft.config.api_key = ''
      draft.config.add_to = ''
      draft.config.header = ''
      draft.config.type = type as APIType
    })
    setAuthorization(newPayload)
  }
  const handleAPIKeyChange = (str: string) => {
    const newPayload = produce(inputs.authorization, (draft: AuthorizationPayloadType) => {
      if (!draft.config) {
        draft.config = {
          type: APIType.bearer,
          api_key: '',
        }
      }
      draft.config.api_key = str
    })
    setAuthorization(newPayload)
  }
  const handleAPIKeyOrHeaderChange = (type: 'api_key' | 'header' | 'add_to') => {
    return (val: string) => {
      const newPayload = produce(inputs.authorization, (draft: AuthorizationPayloadType) => {
        if (!draft.config) {
          draft.config = {
            type: APIType.bearer,
            api_key: '',
          }
        }
        draft.config[type] = val
      })
      setAuthorization(newPayload)
    }
  }

  // To prevent prompt editor in body not update data.
  if (!isDataReady)
    return null

  return (
    <div className='mt-[16px] wk-node-panel-content http-panel-content'>
      <div className='mb-[8px] title-txt'>API</div>
      <ApiInput
        nodeId={id}
        readonly={readOnly}
        method={inputs.method}
        onMethodChange={handleMethodChange}
        url={inputs.url}
        onUrlChange={handleUrlChange}
      />
      <Split className='my-[16px]'/>
      <div className='flex items-center justify-between mb-[16px]'>
        <div className='flex'>
          <div className='title-txt'>请求参数</div>
        </div>
        {!readOnly && <div
          className='rounded-[4px] size-[24px] border-[1px] border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#7F8C9F]'
          onClick={addParam}
        >
            <RiAddLine className='w-4 h-4 text-text-tertiary'/>
          </div>
        }
      </div>
      <KeyValue
        nodeId={id}
        list={params}
        onChange={setParams}
        onAdd={addParam}
        readonly={readOnly}
      />
      <Split className='my-[16px]'/>
      <div className='flex items-center justify-between mb-[16px]'>
        <div className='flex'>
          <div className='title-txt'>请求头</div>
        </div>
        {!readOnly && <div
          className='rounded-[4px] size-[24px] border-[1px] border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#7F8C9F]'
          onClick={addHeader}
        >
            <RiAddLine className='w-4 h-4 text-text-tertiary'/>
          </div>
        }
      </div>
      <KeyValue
        nodeId={id}
        list={headers}
        onChange={setHeaders}
        onAdd={addHeader}
        readonly={readOnly}
      />
      <Split className='my-[16px]'/>
      <div className='flex items-center justify-between mb-[16px]'>
        <div className='flex'>
          <div className='title-txt'>鉴权</div>
        </div>
        {!readOnly && <Switch checkedText='开' uncheckedText='关' defaultChecked={showAuth} onChange={v => changeAuth(v)}/>}
      </div>
      {showAuth && <div className='auth-section'>
        <Select
          onChange={handleAuthAPITypeChange}
          value={inputs.authorization.config.type}
        >
          <Select.Option value={APIType.bearer}>Bearer Token</Select.Option>
          <Select.Option value={APIType.custom}>自定义</Select.Option>
        </Select>
        {inputs.authorization.config.type === APIType.bearer && <div className='flex gap-x-[20px] items-center justify-between w-full h-[32px] mt-[16px]'>
            <span className='text-[#0F172A] text-[12px]/[16px]'>Token</span>
            <div className={cn('flex-1 h-full')}>
              <Input
                instanceId='http-api-key'
                className={cn(isFocus ? 'shadow-xs bg-gray-50 border-gray-300' : 'bg-gray-100 border-gray-100', 'w-full rounded-[4px] grow px-3 py-[6px] !pt-[5px] border outline-input h-[32px]')}
                value={inputs.authorization.config.api_key || ''}
                onChange={handleAPIKeyChange}
                nodesOutputVars={availableVars}
                availableNodes={availableNodesWithParent}
                onFocusChange={setIsFocus}
                placeholder={"键入'/'键快速插入变量"}
                placeholderClassName='!leading-[21px]'
              />
            </div>
          </div>
        }
        {inputs.authorization.config.type === APIType.custom && <div className='mt-[16px] flex flex-col gap-y-[8px]'>
            <div className='flex gap-x-[20px] items-center justify-between w-full h-[32px]'>
              <span className='text-[#0F172A] text-[12px]/[16px] w-[40px]'>Key</span>
              <div className={cn('flex-1 h-full')}>
                <Input
                  instanceId='http-api-header'
                  className={cn(isFocus ? 'shadow-xs bg-gray-50 border-gray-300' : 'bg-gray-100 border-gray-100', 'w-full rounded-[4px] grow px-3 py-[6px] !pt-[5px] border outline-input h-[32px]')}
                  value={inputs.authorization.config?.header || ''}
                  onChange={handleAPIKeyOrHeaderChange('header')}
                  nodesOutputVars={availableVars}
                  availableNodes={availableNodesWithParent}
                  onFocusChange={setIsFocus}
                  placeholder={"键入'/'键快速插入变量"}
                  placeholderClassName='!leading-[21px]'
                />
              </div>
            </div>
            <div className='flex gap-x-[20px] items-center justify-between w-full h-[32px]'>
              <span className='text-[#0F172A] text-[12px]/[16px] w-[40px]'>Value</span>
              <div className={cn('flex-1 h-full')}>
                <Input
                  instanceId='http-api-key'
                  className={cn(isFocus ? 'shadow-xs bg-gray-50 border-gray-300' : 'bg-gray-100 border-gray-100', 'w-full rounded-[4px] grow px-3 py-[6px] !pt-[5px] border outline-input h-[32px]')}
                  value={inputs.authorization.config?.api_key || ''}
                  onChange={handleAPIKeyChange}
                  nodesOutputVars={availableVars}
                  availableNodes={availableNodesWithParent}
                  onFocusChange={setIsFocus}
                  placeholder={"键入'/'键快速插入变量"}
                  placeholderClassName='!leading-[21px]'
                />
              </div>
            </div>
            <div className='flex gap-x-[20px] items-center justify-between w-full h-[32px]'>
              <span className='text-[#0F172A] text-[12px]/[16px] w-[40px]'>Add to</span>
              <div className={cn('flex-1 h-full')}>
                <Select
                  onChange={handleAPIKeyOrHeaderChange('add_to')}
                  value={inputs.authorization.config.add_to || 'Header'}
                >
                  <Select.Option value="Header">Header</Select.Option>
                  <Select.Option value="Query">Query</Select.Option>
                </Select>
              </div>
            </div>
          </div>
        }
      </div>}
      <Split className='my-[16px]'/>
      <div className='body-param relative'>
        <div className='flex items-center justify-between mb-[16px]'>
          <div className='flex'>
            <div className='title-txt'>请求体</div>
          </div>
        </div>
        <EditBody
          nodeId={id}
          readonly={readOnly}
          payload={inputs.body}
          onChange={setBody}
        />
      </div>
      <Split className='my-[16px]'/>
      <div className='mb-[16px] title-txt'>超时设置</div>
      <div className='timeout-setting-section flex flex-col gap-y-[8px]'>
        <div className='flex items-center gap-x-[8px] font-pf-medium text-[#151B2] font-medium text-[12px]/[16px]'>
          <div className='flex-1'>重试间隔（秒）</div>
          <div className='flex-1'>重试次数</div>
        </div>
        <div className='flex items-center gap-x-[8px]'>
          <InputNumber
            value={inputs.timeout?.connect || 120}
            min={0}
            max={180}
            className="flex-1"
            onChange={val => setTimeout({...inputs.timeout, connect: val})}
          />
          <InputNumber
            value={inputs.timeout?.try_times || 3}
            min={0}
            max={10}
            className="flex-1"
            onChange={val => setTimeout({...inputs.timeout, try_times: val})}
          />
        </div>
      </div>
      <Split className='my-[16px]'/>
      <div className='mb-[8px] title-txt'>输出</div>
      <>
        <VarItem
          name='body'
          type='string'
          description={t(`${i18nPrefix}.outputVars.body`)}
        />
        <VarItem
          name='status_code'
          type='number'
          description={t(`${i18nPrefix}.outputVars.statusCode`)}
        />
        <VarItem
          name='headers'
          type='object'
          description={t(`${i18nPrefix}.outputVars.headers`)}
        />
      </>
    </div>
  )
}

export default memo(Panel)
