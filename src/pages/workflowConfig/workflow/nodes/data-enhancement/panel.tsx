import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import useConfig from './use-config';
import type { CodeNodeType } from './types';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox
} from '@arco-design/web-react';
import { getModelList } from '@/api/modelV2';
import TextPlan from './textDefault';
import { useUnmountedRef } from 'ahooks';
import './data-enhancement.scss';
import { get } from 'lodash';

const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;
  const TextArea = Input.TextArea;

  const { inputs, onValuesChange, readOnly, setBoostPageData } = useConfig(
    id,
    data
  );
  const getInitialValues = () => {
    const app_scenarios = inputs?.app_scenarios ?? {};
    const app_scenarios_option = app_scenarios?.option ?? {};

    return {
      ...data,
      app_scenarios: {
        name: app_scenarios?.name ?? '通用',
        type: app_scenarios?.type ?? 'tongyong',
        option: {
          sample_num: app_scenarios_option?.sample_num ?? 10,
          similarity_threshold:
            app_scenarios_option?.similarity_threshold ?? 0.7,
          generate_sample_num: app_scenarios_option?.generate_sample_num ?? 100,
          enhanced_proportion: app_scenarios_option?.enhanced_proportion ?? 0.7,
          is_prompt: app_scenarios_option?.enhanced_proportion ?? 0,
          prompt:
            app_scenarios_option?.prompt ??
            TextPlan[app_scenarios_type]?.prompt,
          sample_data:
            app_scenarios_option?.sample_data ??
            TextPlan[app_scenarios_type]?.data
        }
      },
      prompt_checkbox: app_scenarios_option?.is_prompt === 1 ? true : false,
      enha_modle_id: inputs?.enha_modle_id
    };
  };

  const unmountedRef = useUnmountedRef();
  const [modelList, setModelList] = useState<any[]>([]);
  const app_scenarios_type = Form.useWatch('app_scenarios.type', form);
  const prompt_checkbox = Form.useWatch('prompt_checkbox', form);

  const handleSelectChange = (value) => {
    form.setFieldValue('app_scenarios.type', value);
    form.setFieldValue('prompt_checkbox', false);
    form.setFieldValue('app_scenarios.option.prompt', TextPlan[value]?.prompt);
    form.setFieldValue(
      'app_scenarios.option.sample_data',
      TextPlan[value]?.data
    );
  };

  useEffect(() => {
    getModelList().then((res) => {
      if (unmountedRef.current) return;
      const ModelLs =
        res?.data?.find((item) => item.type === 'enha_model')?.model_data || [];
      setModelList(ModelLs);
      const defaultModelId = ModelLs[0]?.id || '';
      const fields = {} as Record<string, any>;

      if (!inputs.enha_modle_id) {
        fields.enha_modle_id = defaultModelId;
      }
      if (Object.keys(fields).length) {
        form.setFieldsValue(fields);
      }
      setBoostPageData(ModelLs);
    });
  }, []);

  return (
    <div className="wk-node-panel-content code-panel-content data-enhancement-panel mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        disabled={readOnly}
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={getInitialValues()}
        onValuesChange={(_, v: any) => {
          onValuesChange(v);
        }}
      >
        <FormItem
          layout="inline"
          label="场景选择:"
          labelAlign="left"
          required
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: 0
          }}
        />
        <div>
          <FormItem
            layout="horizontal"
            label={null}
            field="app_scenarios.name"
            labelAlign="left"
            required
            style={{ margin: 0 }}
            extra="常见的针对SFT的模型微调场景生成数据集。"
          >
            <Select
              placeholder="请选择场景"
              style={{ width: '100%', margin: 0 }}
              onChange={handleSelectChange}
            >
              <Option key="tongyong" value="tongyong">
                通用
              </Option>
              <Option key="fenlei" value="fenlei">
                文本分类
              </Option>
              <Option key="tiqu" value="tiqu">
                文本提取
              </Option>
              <Option key="shengcheng" value="shengcheng">
                文本生成
              </Option>
              <Option key="duolong" value="duolong">
                多轮回答
              </Option>
            </Select>
          </FormItem>
        </div>
        <div className="content-box">
          {(app_scenarios_type === 'tongyong' ||
            app_scenarios_type === 'duolong') && (
            <>
              <FormItem
                label="指令生成依赖样本数:"
                field="app_scenarios.option.sample_num"
                layout="vertical"
                extra="该参数是指从进行生成前的数据集中选择进行生成的记录条数。它会作为context
                部分，增加到prompt 中去。"
                rules={[
                  {
                    type: 'number',
                    min: 1,
                    max: 10000,
                    message: '指令生成依赖样本数范围1~10000'
                  }
                ]}
              >
                <InputNumber min={1} max={10000} placeholder="请输入指令" />
              </FormItem>
            </>
          )}
          {(app_scenarios_type === 'fenlei' ||
            app_scenarios_type === 'shengcheng') && (
            <>
              <FormItem
                label="任务描述增强占比:"
                field="app_scenarios.option.enhanced_proportion"
                layout="vertical"
                extra="节点将基于内置的Prompt配置（暂不支持自定义），仿照种子的格式，通过替换【待分析内容】部分生成增强的数据。假如生成样本数为10条，任务占比为0.3，表示新生成的10条增强数据中，30%（3条）的【待分析内容】部分会被大模型替换为等价表述，70%（7条）的【待分析内容】保持不变，该参数取值范围0
                ~ 1"
                rules={[
                  {
                    type: 'number',
                    min: 0,
                    max: 1,
                    message: '过滤相似度阈值范围为0~1'
                  }
                ]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  placeholder="请输入指令"
                />
              </FormItem>
            </>
          )}
          <FormItem
            label="过滤相似度阈值:"
            field="app_scenarios.option.similarity_threshold"
            layout="vertical"
            extra="这里通过Rouge-L
            分数来计算生成的训练数据集的相似度，超过这个阀值就认为两条生成数据是相同的，只保留其中之一。"
            rules={[
              {
                type: 'number',
                min: 0,
                max: 1,
                message: '过滤相似度阈值范围为0~1'
              }
            ]}
          >
            <InputNumber min={0} max={1} step={0.1} placeholder="请输入阈值" />
          </FormItem>
          <FormItem
            label="生成样本数:"
            field="app_scenarios.option.generate_sample_num"
            layout="vertical"
            extra="指定生成的数据集的条数。"
            rules={[
              {
                type: 'number',
                min: 1,
                max: 20000,
                message: '最大生成样本数范围1~20000'
              }
            ]}
          >
            <InputNumber min={1} max={20000} placeholder="请输入生成样本数" />
          </FormItem>
        </div>
        <FormItem
          layout="vertical"
          field="app_scenarios.option.sample_data"
          label="数据示例（JSON格式）"
          style={{ marginTop: '24px' }}
        >
          <TextArea
            placeholder="请在这里输入期望的数据集的示例数据（JSON格式）"
            style={{ minHeight: 64, minWidth: 350 }}
          />
        </FormItem>
        <FormItem
          field="prompt_checkbox"
          triggerPropName="checked"
          label={null}
        >
          <Checkbox>自定义提示词</Checkbox>
        </FormItem>
        {prompt_checkbox && (
          <FormItem field="app_scenarios.option.prompt" label={null}>
            <TextArea
              style={{ minHeight: 64, minWidth: 350 }}
              placeholder="请输入提示词"
            />
          </FormItem>
        )}
        <FormItem
          layout="vertical"
          label="模型选择:"
          field="enha_modle_id"
          labelAlign="left"
          required
          style={{ margin: 0 }}
          extra="常见的针对SFT的模型微调场景生成数据集。"
        >
          <Select placeholder="请选择模型" style={{ width: '100%' }}>
            {modelList.map((item) => {
              return (
                <Option key={item.id} value={item.id}>
                  {item.type}
                </Option>
              );
            })}
          </Select>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);
