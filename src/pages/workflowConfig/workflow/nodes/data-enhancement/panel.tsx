import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveEffectVarConfirm from '../_base/components/remove-effect-var-confirm';
import useConfig from './use-config';
import type {
  CodeNodeType,
} from './types';
import { CodeLanguage } from './types';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import {
  Table,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox
} from '@arco-design/web-react';
import { cloneDeep } from 'lodash-es';
import { v4 as uuid4 } from 'uuid';
import './data-enhancement.scss';

const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;
  const TextArea = Input.TextArea;

  const { readOnly, inputs, updateInputs } = useConfig(id, data);

  const [customPromptChecked, setCustomPromptChecked] = useState(false);
  const [isShow, setIsShow] = useState(false);
  useEffect(() => {
    setIsShow(inputs?.app_scenarios === 1 || inputs?.app_scenarios === 5);
    setCustomPromptChecked(inputs?.prompt_checkbox);
  }, [inputs]);

  const onValuesChange = (changeValue: any, values: any) => {
    updateInputs(values);
  };
  return (
    <div className="wk-node-panel-content code-panel-content data-enhancement-panel mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          prompt: inputs?.prompt,
          app_scenarios: 1 || inputs?.app_scenarios,
          enha_modle_id: 1 || inputs?.enha_modle_id,
          vars: cloneDeep(inputs.variables || [])
        }}
        onChange={onValuesChange}
      >
        <FormItem
          layout="inline"
          label="场景选择:"
          labelAlign="left"
          required
          style={{
            display: 'flex',
            alignItems: 'center'
          }}
        />
        <div>
          <FormItem
            layout="horizontal"
            label={null}
            field="app_scenarios"
            labelAlign="left"
            required
            style={{ margin: 0 }}
          >
            <Select
              placeholder="请选择场景"
              style={{ width: '100%', margin: 0 }}
            >
              {/* 按通用（0）、文本分类（1）、文本提取（2）、文本生成（3）、多轮问答（4） */}
              <Option key={1} value={1}>
                按通用
              </Option>
              <Option key={2} value={2}>
                文本分类
              </Option>
              <Option key={3} value={3}>
                文本提取
              </Option>
              <Option key={4} value={4}>
                文本生成
              </Option>
              <Option key={5} value={5}>
                多轮回答
              </Option>
            </Select>
          </FormItem>
          <div className="content-tips-text">
            常见的针对SFT的模型微调场景生成数据集。
          </div>
        </div>
        <div className="content-box">
          {isShow && <><FormItem label="指令生成依赖样本数:" field="sample_num" layout="vertical">
            <InputNumber placeholder="请输入指令" />
          </FormItem>
            <div className="content-tips-text">
              该参数是指从进行生成前的数据集中选择进行生成的记录条数。它会作为context
              部分，增加到prompt 中去。
            </div></>}
          <FormItem label="过滤相似度阈值:" field="similarity_threshold" layout="vertical">
            <InputNumber min={0} max={1} step={0.1} placeholder="请输入阈值" />
          </FormItem>
          <div className="content-tips-text">
            这里通过Rouge-L
            分数来计算生成的训练数据集的相似度，超过这个阀值就认为两条生成数据是相同的，只保留其中之一。
          </div>
          <FormItem label="生成样本数:" field="generate_sample_num" layout="vertical">
            <Input placeholder="请输入样本数" />
          </FormItem>
          <div className="content-tips-text">指定生成的数据集的条数。</div>
        </div>
        <FormItem
          layout="vertical"
          field="sample_data"
          label="数据示例（JSON格式）"
        >
          <TextArea
            placeholder="请在这里输入期望的数据集的示例数据（JSON格式）"
            style={{ minHeight: 64, minWidth: 350 }}
          />
        </FormItem>
        <FormItem field="prompt_checkbox" label={null}>
          <Checkbox
            checked={customPromptChecked} // 绑定选中状态
            onChange={(checked) => setCustomPromptChecked(checked)} // 处理选中状态变化
          >
            自定义提示词
          </Checkbox>
        </FormItem>
        {customPromptChecked && <FormItem field="prompt" label={null}>
          <Input placeholder='请输入提示词' style={{ width: '100%' }} />
        </FormItem>}
        <FormItem
          layout="vertical"
          label="模型选择:"
          field="enha_modle_id"
          labelAlign="left"
          required
        >
          <Select placeholder="请选择模型" style={{ width: '100%' }}>
            <Option key={1} value={1}>
              模型1
            </Option>
            <Option key={2} value={2}>
              模型1
            </Option>
            <Option key={3} value={3}>
              模型3
            </Option>
            <Option key={4} value={4}>
              模型4
            </Option>
            <Option key={5} value={5}>
              模型5
            </Option>
          </Select>
        </FormItem>
        <div className='content-tips-text'>常见的针对SFT的模型微调场景生成数据集。</div>
      </Form>
    </div>
  );
};

export default React.memo(Panel);
