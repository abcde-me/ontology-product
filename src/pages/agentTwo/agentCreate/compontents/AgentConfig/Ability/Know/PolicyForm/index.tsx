import React, { useEffect, useState } from 'react';
import {
  Form,
  Radio,
  Space,
  Slider,
  Modal,
  Message,
  Switch
} from '@arco-design/web-react';
import { useParams } from '@/hooks/useParmas';
import { RetrievalVlist } from '@/pages/agentTwo/agentCreate/constants';

import { useAgentEditor } from '@/pages/agentTwo/agentCreate/compontents/AgentProvider/Context';
import './index.css';

function PolicyForm() {
  const agent = useAgentEditor();
  const id = useParams('id');
  const { knowStore } = agent;
  const { policyFormVisible, selectedKnowledge, policyValues } = knowStore.useGetState();
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<any>({});
  

  // 表单值变化时的处理函数
  const handleFormValuesChange = (changedValues: any) => {
    // 更新本地状态以触发重新渲染
    const currentValues = form.getFieldsValue();
    setFormValues({ ...currentValues, ...changedValues });
    console.log('表单值变化:', changedValues);
  };

  const submitEditeditPolicy = async () => {
    try {
      const values = await form.validate();
      console.log('验证通过', values, selectedKnowledge);
      const params = {
        ...values,
        reranking_model: {
          reranking_provider_name: '',
          reranking_model_name: ''
        }
      }
      knowStore.setPolicyValues(params);
      const res = await agent.infoStore.updateAgentConfigData(id);
      if (res.code === 'Success') {
        Message.success('策略配置成功');
        knowStore.setPolicyFormVisible(false);
      }
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };

  console.log('policyValues', policyValues);

  // 当模态框打开时，设置表单初始值
  useEffect(() => {
    if (policyFormVisible && policyValues && Object.keys(policyValues).length > 0) {
      form.setFieldsValue(policyValues);
      setFormValues(policyValues);
    }
  }, [policyFormVisible, policyValues, form]);

  return (
    <Modal
      title="检索配置"
      autoFocus={false}
      focusLock={true}
      style={{
        width: 800
      }}
      visible={policyFormVisible}
      onCancel={() => {
        knowStore.setPolicyFormVisible(false);
      }}
      onOk={() => {
        submitEditeditPolicy();
      }}
    >
      <Form
        className="fromstylePolicy"
        form={form}
        layout="vertical"
        onValuesChange={handleFormValuesChange}
      >
        <Form.Item label="检索策略" field="search_method" className="retrievalV">
          <Radio.Group>
            {RetrievalVlist.map((e) => (
              <Radio value={e.value} key={e.value}>
                {({ checked }) => (
                  <Space
                    align="start"
                    className={`custom-radio-card ${checked ? 'custom-radio-card-checked' : ''}`}
                  >
                    <div className="custom-radio-card-mask">
                      <div className="custom-radio-card-mask-dot"></div>
                    </div>
                    <div className="policybox">
                      <div className="custom-radio-card-title">
                        {e.name}
                      </div>
                      <div className="policy-text">{e.placeholder}</div>
                    </div>
                  </Space>
                )}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <div className="mb-4 max-w-[500px]">
          <h3 className="text-base font-bold mb-3">排序召回配置</h3>
          
          {(formValues.search_method || form.getFieldValue('search_method') || policyValues?.search_method) === 'hybrid_search' && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="w-28 text-sm font-medium text-gray-500 text-right pr-2">按比例分配：</span>
                <div className="flex-1">
                  <Form.Item className="mb-0" field="weights">
                    <Slider 
                      style={{ width: '100%' }} 
                      min={0} 
                      max={1} 
                      step={0.01} 
                    />
                  </Form.Item>
                </div>
              </div>
              
              <div className="flex justify-between items-center ml-28 mb-1 text-xs">
                <div>语义 {(formValues.weights ?? form.getFieldValue('weights') ?? policyValues?.weights ?? 0).toFixed(2)}</div>
                <div>{(1 - (formValues.weights ?? form.getFieldValue('weights') ?? policyValues?.weights ?? 0)).toFixed(2)} 关键词</div>
              </div>
              
              <div className="ml-28 text-xs text-gray-500 mb-3">
                通过调整匹配分值权重比例，决定两种检索方式的优先度。
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="w-28 text-sm font-medium text-gray-500 text-right pr-1">重排序：</span>
              <Form.Item className="mb-0" field="reranking_enable" triggerPropName="checked">
                <Switch 
                  checkedText="开" 
                  uncheckedText="关" 
                />
              </Form.Item>
            </div>
            
            <div className="ml-28 text-xs text-gray-500 mb-3">
              重排序模型将根据知识库内容与用户问题的语义匹配度对召回切片进行重新排序，从而改进初次排序的结果。
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="w-28 text-sm font-medium text-gray-500 text-right pr-2">Top K：</span>
              <div className="flex-1">
                <Form.Item className="mb-0" field="top_k">
                  <Slider 
                    showInput 
                    style={{ width: '100%' }} 
                    min={1} 
                    max={20} 
                    step={1} 
                  />
                </Form.Item>
              </div>
            </div>
            
            <div className="ml-28 text-xs text-gray-500 mb-3">
              从知识库中召回与输入Query匹配的切片个数的上限值。
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="w-28 text-sm font-medium text-gray-500 text-right pr-2">Score阈值：</span>
              <Form.Item className="mb-0" field="score_threshold_enabled" triggerPropName="checked">
                <Switch 
                  checkedText="开" 
                  uncheckedText="关" 
                />
              </Form.Item>
            </div>
            
            <div className="ml-28 text-xs text-gray-500 mb-3">
              系统会筛选出与输入 Query 的匹配分 ≥ 此阈值的切片，低于阈值的会被过滤。
            </div>
            {
              (formValues.score_threshold_enabled ?? form.getFieldValue('score_threshold_enabled') ?? policyValues?.score_threshold_enabled) &&
                <div className="flex items-center ml-28">
                  <div className="flex-1">
                    <Form.Item className="mb-0" field="score_threshold">
                      <Slider
                        showInput
                        style={{ width: '100%' }}
                        min={0.01}
                        max={0.99}
                        step={0.01}
                      />
                    </Form.Item>
                  </div>
                </div>
            }
          </div>
        </div>
      </Form>
    </Modal>
  );
}

export default PolicyForm;
