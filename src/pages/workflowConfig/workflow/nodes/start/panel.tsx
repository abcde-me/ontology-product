import { FC, useRef } from 'react'
import React from 'react'
import produce from 'immer'
import { useTranslation } from 'react-i18next'
import RemoveEffectVarConfirm from '../_base/components/remove-effect-var-confirm'
import VarList from './components/var-list'
import VarItem from './components/var-item'
import useConfig from './use-config'
import type { StartNodeType } from './types'
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split'
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field'
import AddButton from '@/pages/workflowConfig/components/button/add-button'
import ConfigVarModal from '@/pages/workflowConfig/app/config-modal'
import type { InputVar, NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import { ChangeType } from '@/pages/workflowConfig/workflow/types'
import {
  Form,
  Input,
  Select,
  Checkbox,
} from '@arco-design/web-react';
import {
  IconMinusCircle,
  IconPlus,
} from '@arco-design/web-react/icon';
import { v4 as uuid4 } from 'uuid'
import { cloneDeep, debounce } from 'lodash-es'

const i18nPrefix = 'workflow.nodes.start'

const Panel: FC<NodePanelProps<StartNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [form] = Form.useForm();
  const removeCallback = useRef<any>()
  const {
    readOnly,
    isChatMode,
    inputs,
    isShowAddVarModal,
    showAddVarModal,
    handleAddVariable,
    hideAddVarModal,
    handleVarListChange,
    isShowRemoveVarConfirm,
    hideRemoveVarConfirm,
    onRemoveVarConfirm,
    isVarUsedInNodes,
  } = useConfig(id, data)

  const handleAddVarConfirm = (payload: InputVar) => {
    // console.log('handleAddVarConfirm', payload)
    handleAddVariable(payload)
    hideAddVarModal()
  }

  const handleAdd = () => {
    // console.log('add', form.getFieldValue('vars'))
    const vars = form.getFieldValue('vars')
    vars.length && handleAddVariable(vars[vars.length - 1])
  }
  const handleRemove = (index: number, cb: () => void) => {
    // console.log('handleRemove', index, form.getFieldValue('vars'))
    const list = form.getFieldValue('vars') as InputVar[]
    const newList = produce(list, (draft) => {
      draft.splice(index, 1)
    })
    handleVarListChange(newList, {
      index,
      payload: {
        type: ChangeType.remove,
        payload: {
          beforeKey: list[index].variable,
        },
      },
    })
    removeCallback.current = cb
    if (!isVarUsedInNodes([id, list[index].variable || ''])) {
      cb()
    }
  }
  const handleChange = debounce((index: number, prop: string, newVal?: any) => {
    console.log('handleChange', newVal, index, prop, form.getFieldValue('vars'), inputs.variables)
    const newVarsVals = form.getFieldValue('vars')
    const oldVariableVal = inputs.variables[index].variable
    const newVariableVal = newVarsVals[index].variable
    const moreInfo = oldVariableVal === newVariableVal
      ? undefined
      : {
        type: ChangeType.changeVarName,
        payload: { beforeKey: oldVariableVal || '', afterKey: newVariableVal },
      }

    const isVariableNameValid = new Set([...form.getFieldValue('vars').map(v => v.variable)]).size === form.getFieldValue('vars').length
    if (!isVariableNameValid)
      return

    if (newVal !== undefined) {
      newVarsVals[index][prop] = newVal
    }

    handleVarListChange(newVarsVals, {
      index,
      payload: moreInfo,
    })
    
  }, 300)

  return (
    <div className='mt-[16px] wk-node-panel-content start-panel-content'>
      <div className='mb-[16px] title-txt'>输入变量</div>
      <Form
        form={form}
        disabled={readOnly}
        autoComplete='off'
        labelCol={{span: 0}}
        wrapperCol={{span: 24}}
        initialValues={{
          vars: cloneDeep(inputs.variables || []),
        }}
        layout="vertical"
        onValuesChange={(_, v) => {
          // console.log('valuechange', _, v);
          if (v.vars.some(v => !v || !v.type || !v.id)) {
            form.setFieldValue('vars',
              v.vars.map(v => (v ?? {variable: '', label: '', required: false, type: 'string', id: uuid4()}
            )))
          }
          // window.setTimeout(async() => {
          //   try {
          //     await form.validate()
          //   } catch{}
          // })
        }}
      >
        <Form.List field='vars'>
          {(fields, { add, remove }) => {
            return <div className='w-full'>
              {
                !fields.length ? <div className='empty-vars'>未配置变量</div> : fields.map((item, index) => {
                  return (
                    <div key={index} className='var-item-wrapper mb-[16px]'>
                      <div className='line1'>
                        <div className='var-name'>
                          <span className='field-txt'>变量名</span>
                          <Form.Item
                            field={item.field + '.variable'}
                            rules={[
                              {
                                required: true,
                                message: '变量名称不可为空'
                              },
                              {
                                match: /^[A-Za-z][A-Za-z0-9_-]*$/,
                                message: '字母、数字_、-，以字母开头'
                              },
                              {
                                validator(value, callback) {
                                  const vars = form.getFieldValue('vars')
                                  if (vars.filter(v => v.variable === value).length > 1) {
                                    callback('变量名不能重复')
                                  } else {
                                    callback()
                                  }
                                },
                              }
                            ]}
                          >
                            <Input placeholder='请输入' showWordLimit maxLength={20} onChange={() => handleChange(index, 'variable')}/>
                          </Form.Item>
                        </div>
                        <div className='var-type'>
                          <span className='field-txt'>类型</span>
                          <Form.Item field={item.field + '.type'} rules={[{ required: true, message: '请选择类型' }]}>
                            <Select onChange={() => handleChange(index, 'type')}>
                              <Select.Option value="string">String</Select.Option>
                              <Select.Option value="integer">Integer</Select.Option>
                              <Select.Option value="number">Number</Select.Option>
                              <Select.Option value="boolean">Boolean</Select.Option>
                              <Select.Option value="array">Array</Select.Option>
                            </Select>
                          </Form.Item>
                        </div>
                        <div className='var-required'>
                          <span className='field-txt'>必填</span>
                          <Form.Item field={item.field + '.required'} triggerPropName='checked'>
                            <div className='w-full flex items-center justify-between'>
                              <Checkbox onChange={v => handleChange(index, 'required', v)}/>
                              <IconMinusCircle
                                className='size-[16px] cursor-pointer'
                                onClick={() => {
                                  if (readOnly) return
                                  handleRemove(index, () => {
                                    remove(index);
                                  });
                                }}/>
                            </div>
                          </Form.Item>
                        </div>
                      </div>
                      <div className='line-other'>
                        <span className='field-txt'>默认值</span>
                        <Form.Item field={item.field + '.default'} noStyle>
                          <Input placeholder='没有传入该变量时使用默认值' onChange={v => handleChange(index, 'default')}/>
                        </Form.Item>
                      </div>
                      <div className='line-other mt-[16px]'>
                        <span className='field-txt'>描述</span>
                        <Form.Item field={item.field + '.label'} noStyle>
                          <Input placeholder='帮助大模型了解变量作用' onChange={v => handleChange(index, 'label')}/>
                        </Form.Item>
                      </div>
                    </div>
                  )
                })
              }
              {!readOnly && <div className='add-btn w-full' onClick={() => {add(); handleAdd();}}>
                  <IconPlus className='size-[14px] mr-[4px] text-[#979797]'/>添加
                </div>
              }
            </div>
          }}
        </Form.List>
      </Form>

      {/* <div className='px-4 pb-2 space-y-4'>
        <Field
          title={t(`${i18nPrefix}.inputField`)}
          operations={
            !readOnly ? <AddButton onClick={showAddVarModal} /> : undefined
          }
        >
          <>
            <VarList
              readonly={readOnly}
              list={inputs.variables || []}
              onChange={handleVarListChange}
            />

            <div className='mt-1 space-y-1 hidden'>
              <Split className='my-2' />
              {
                isChatMode && (
                  <VarItem
                    readonly
                    payload={{
                      variable: 'sys.query',
                    } as any}
                    rightContent={
                      <div className='text-xs font-normal text-gray-500'>
                        String
                      </div>
                    }
                  />)
              }

              <VarItem
                readonly
                showLegacyBadge={!isChatMode}
                payload={{
                  variable: 'sys.files',
                } as any}
                rightContent={
                  <div className='text-xs font-normal text-gray-500'>
                    Array[File]
                  </div>
                }
              />
              {
                isChatMode && (
                  <>
                    <VarItem
                      readonly
                      payload={{
                        variable: 'sys.dialogue_count',
                      } as any}
                      rightContent={
                        <div className='text-xs font-normal text-gray-500'>
                          Number
                        </div>
                      }
                    />
                    <VarItem
                      readonly
                      payload={{
                        variable: 'sys.conversation_id',
                      } as any}
                      rightContent={
                        <div className='text-xs font-normal text-gray-500'>
                          String
                        </div>
                      }
                    />
                  </>
                )
              }
              <VarItem
                readonly
                payload={{
                  variable: 'sys.user_id',
                } as any}
                rightContent={
                  <div className='text-xs font-normal text-gray-500'>
                    String
                  </div>
                }
              />
              <VarItem
                readonly
                payload={{
                  variable: 'sys.app_id',
                } as any}
                rightContent={
                  <div className='text-xs font-normal text-gray-500'>
                    String
                  </div>
                }
              />
              <VarItem
                readonly
                payload={{
                  variable: 'sys.workflow_id',
                } as any}
                rightContent={
                  <div className='text-xs font-normal text-gray-500'>
                    String
                  </div>
                }
              />
              <VarItem
                readonly
                payload={{
                  variable: 'sys.workflow_run_id',
                } as any}
                rightContent={
                  <div className='text-xs font-normal text-gray-500'>
                    String
                  </div>
                }
              />
            </div>

          </>
        </Field>
      </div> */}

      {isShowAddVarModal && (
        <ConfigVarModal
          isCreate
          supportFile
          isShow={isShowAddVarModal}
          onClose={hideAddVarModal}
          onConfirm={handleAddVarConfirm}
          varKeys={inputs.variables.map(v => v.variable)}
        />
      )}

      <RemoveEffectVarConfirm
        isShow={isShowRemoveVarConfirm}
        onCancel={hideRemoveVarConfirm}
        onConfirm={() => {
          removeCallback.current?.()
          onRemoveVarConfirm()
        }}
      />
    </div>
  )
}

export default React.memo(Panel)
