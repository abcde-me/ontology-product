
import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo } from 'react'
import produce from 'immer'
import { uniqueId } from 'lodash-es'
import type { Body, BodyPayload, KeyValue as KeyValueType } from '../../types'
import { BodyPayloadValueType, BodyType } from '../../types'
import KeyValue from '../key-value'
import useAvailableVarList from '../../../_base/hooks/use-available-var-list'
import VarReferencePicker from '../../../_base/components/variable/var-reference-picker'
import cn from '@/pages/workflowConfig/utils/classnames'
import InputWithVar from '@/pages/workflowConfig/workflow/nodes/_base/components/prompt/editor'
import type { ValueSelector, Var } from '@/pages/workflowConfig/workflow/types'
import { VarType } from '@/pages/workflowConfig/workflow/types'
import { Select } from '@arco-design/web-react'
import { RiAddLine } from '@remixicon/react'

const UNIQUE_ID_PREFIX = 'key-value-'

interface Props {
  readonly: boolean
  nodeId: string
  payload: Body
  onChange: (payload: Body) => void
}

const allTypes = [
  BodyType.none,
  BodyType.formData,
  BodyType.xWwwFormUrlencoded,
  BodyType.json,
  BodyType.rawText,
  // BodyType.binary,
]
const bodyTextMap = {
  [BodyType.none]: 'none',
  [BodyType.formData]: 'form-data',
  [BodyType.xWwwFormUrlencoded]: 'x-www-form-urlencoded',
  [BodyType.rawText]: 'raw text',
  [BodyType.json]: 'JSON',
  // [BodyType.binary]: 'binary',
}

const EditBody: FC<Props> = ({
  readonly,
  nodeId,
  payload,
  onChange,
}) => {
  const { type, data } = payload
  const bodyPayload = useMemo(() => {
    if (typeof data === 'string') { // old data
      return []
    }
    return data
  }, [data])
  const stringValue = [BodyType.formData, BodyType.xWwwFormUrlencoded].includes(type) ? '' : (bodyPayload[0]?.value || '')

  const { availableVars, availableNodes } = useAvailableVarList(nodeId, {
    onlyLeafNodeVar: false,
    filterVar: (varPayload: Var) => {
      return [VarType.string, VarType.number, VarType.secret, VarType.arrayNumber, VarType.arrayString].includes(varPayload.type)
    },
  })

  const handleTypeChange = useCallback((e: BodyType) => {
    const newType = e
    const hasKeyValue = [BodyType.formData, BodyType.xWwwFormUrlencoded].includes(newType)
    onChange({
      type: newType,
      data: hasKeyValue
        ? [
          {
            id: uniqueId(UNIQUE_ID_PREFIX),
            type: BodyPayloadValueType.text,
            key: '',
            value: '',
          },
        ]
        : [],
    })
  }, [onChange])

  const handleAddBody = useCallback(() => {
    const newPayload = produce(payload, (draft) => {
      (draft.data as BodyPayload).push({
        id: uniqueId(UNIQUE_ID_PREFIX),
        type: BodyPayloadValueType.text,
        key: '',
        value: '',
      })
    })
    onChange(newPayload)
  }, [onChange, payload])

  const handleBodyPayloadChange = useCallback((newList: KeyValueType[]) => {
    const newPayload = produce(payload, (draft) => {
      draft.data = newList as BodyPayload
    })
    onChange(newPayload)
  }, [onChange, payload])

  const filterOnlyFileVariable = (varPayload: Var) => {
    return [VarType.file, VarType.arrayFile].includes(varPayload.type)
  }

  const handleBodyValueChange = useCallback((value: string) => {
    const newBody = produce(payload, (draft: Body) => {
      if ((draft.data as BodyPayload).length === 0) {
        (draft.data as BodyPayload).push({
          id: uniqueId(UNIQUE_ID_PREFIX),
          type: BodyPayloadValueType.text,
          key: '',
          value: '',
        })
      }
      (draft.data as BodyPayload)[0].value = value
    })
    onChange(newBody)
  }, [onChange, payload])

  const handleFileChange = useCallback((value: ValueSelector | string) => {
    const newBody = produce(payload, (draft: Body) => {
      if ((draft.data as BodyPayload).length === 0) {
        (draft.data as BodyPayload).push({
          id: uniqueId(UNIQUE_ID_PREFIX),
          type: BodyPayloadValueType.file,
        })
      }
      (draft.data as BodyPayload)[0].file = value as ValueSelector
    })
    onChange(newBody)
  }, [onChange, payload])

  return (
    <div>
      {!readonly && [BodyType.formData, BodyType.xWwwFormUrlencoded].includes(type) && <div
        className='absolute top-0 right-0 rounded-[4px] size-[24px] border-[1px] border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#7F8C9F]'
        onClick={handleAddBody}
      >
          <RiAddLine className='w-4 h-4 text-text-tertiary'/>
        </div>
      }
      {/* body type */}
      <div className='flex w-full mb-[16px]'>
        <Select
          onChange={handleTypeChange}
          value={type}
        >
          {allTypes.map(t => (
            <Select.Option key={t} value={t}>{bodyTextMap[t]}</Select.Option>
          ))}
        </Select>
      </div>
      {/* body value */}
      <div className={cn(type !== BodyType.none && 'mt-1')}>
        {type === BodyType.none && null}
        {(type === BodyType.formData || type === BodyType.xWwwFormUrlencoded) && (
          <KeyValue
            readonly={readonly}
            nodeId={nodeId}
            list={bodyPayload as KeyValueType[]}
            onChange={handleBodyPayloadChange}
            onAdd={handleAddBody}
            // isSupportFile={type === BodyType.formData}
            isSupportFile={false}
          />
        )}

        {type === BodyType.rawText && (
          <InputWithVar
            instanceId={'http-body-raw'}
            label="Raw text"
            onChange={handleBodyValueChange}
            value={stringValue}
            justVar
            showAIGenerator={false}
            nodesOutputVars={availableVars}
            availableNodes={availableNodes}
            readOnly={readonly}
            containerWrapperClassName="http-node-panel-raw-editor"
            placeholder="输入raw text，“/”或“{”插入变量…"
          />
        )}

        {type === BodyType.json && (
          <InputWithVar
            instanceId={'http-body-json'}
            label="JSON"
            value={stringValue}
            onChange={handleBodyValueChange}
            justVar
            showAIGenerator={false}
            nodesOutputVars={availableVars}
            availableNodes={availableNodes}
            readOnly={readonly}
            containerWrapperClassName="http-node-panel-json-editor"
            placeholder="输入JSON，“/”或“{”插入变量…"
          />
        )}

        {type === BodyType.binary && (
          <VarReferencePicker
            nodeId={nodeId}
            readonly={readonly}
            value={bodyPayload[0]?.file || []}
            onChange={handleFileChange}
            filterVar={filterOnlyFileVariable}
          />
        )}
      </div>
    </div>
  )
}
export default React.memo(EditBody)
