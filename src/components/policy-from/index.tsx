import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import styles from './index.module.scss';
import { Form, Radio, Space, Slider, Switch } from '@arco-design/web-react';
import { useState } from 'react';

const INIT_FROM_VALUE = {
  reranking_enable: true,
  search_method: 'Hybrid',
  score_threshold_enabled: true,
  score_threshold: 0.1,
  top_k: 20,
  weights: 0.7
};

function DemoForm(props, ref) {
  const { FuncChildFrom, seteditPolicy, initParams = {} } = props;
  const [form] = Form.useForm();

  const [formvalues, setformvalues] = useState<any>({
    search_method: 'Hybrid'
  });
  //交互事件
  useImperativeHandle(ref, () => ({
    submitEditeditPolicy: () => {
      submitEditeditPolicy();
    },
    clearEditeditPolicy: () => {
      clearEditeditPolicy();
    }
  }));

  const onChange = (changeValue, values) => {
    console.log('onChange: ', changeValue, values);
    setformvalues(values);
  };
  const retrievalVlist = [
    {
      value: 'Hybrid',
      name: '混合检索',
      placeholder:
        '同时执行向量检索（语义）和全文检索（关键词）。 系统将两者的结果合并并重新排序，提供综合优势。'
    },
    {
      value: 'Vector',
      name: '向量检索',
      placeholder:
        '基于语义相似度的先进方法。 将数据转换为“向量”，查找语义上最相关或最相似的文本片段。'
    },
    {
      value: 'FullText',
      name: '全文检索',
      placeholder:
        '也称关键词检索，通过扫描文档，查找与用户查询关键词完全匹配的内容。对术语、代码等查询快速精确。'
    }
  ];
  const submitEditeditPolicy = async () => {
    try {
      const values = await form.validate();
      console.log('验证通过', values);
      FuncChildFrom(values);
      seteditPolicy(false);
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };
  const clearEditeditPolicy = () => {
    form.resetFields();
  };

  const formItemLayout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 16
    }
  };
  return (
    <Form
      className={styles.fromstylePolicy}
      form={form}
      onChange={onChange}
      initialValues={INIT_FROM_VALUE}
      {...formItemLayout}
    >
      <div className={styles.headername}>检索策略</div>
      <Form.Item
        label=""
        field="search_method"
        className={styles.retrievalV}
        wrapperCol={{
          span: 24
        }}
      >
        <Radio.Group
          onChange={(e) => {
            // e.target.value 获取当前选中的值
            // console.log('选中的值:', e);
          }}
        >
          {retrievalVlist.map((e, index) => {
            return (
              <Radio value={e.value} key={index}>
                {({ checked }) => {
                  return (
                    <Space
                      align="start"
                      className={
                        styles['custom-radio-card'] +
                        ' ' +
                        (checked ? styles['custom-radio-card-checked'] : '')
                      }
                    >
                      {/* <div className={styles['custom-radio-card-mask']}>
                        <div className={styles['custom-radio-card-mask-dot']}></div>
                      </div> */}
                      <div className={styles.policybox}>
                        <div className={styles['custom-radio-card-title']}>
                          {e.name}
                        </div>
                        <div className={styles['policy-text']}>
                          {e.placeholder}
                        </div>
                      </div>
                    </Space>
                  );
                }}
              </Radio>
            );
          })}
        </Radio.Group>
      </Form.Item>
      <div className={styles.headername}>重排序配置</div>

      <Form.Item
        label="重排序："
        field="reranking_enable"
        rules={[{ required: true, message: '请选择' }]}
        triggerPropName="checked"
      >
        <Switch checkedText="开" uncheckedText="关" />
      </Form.Item>

      <Form.Item
        label="Top K："
        field="top_k"
        rules={[{ required: true, message: '请选择' }]}
        help="返回相似度最高的前K个结果(1～50)"
      >
        <Slider showInput min={1} max={50} step={1} />
      </Form.Item>

      <Form.Item
        label="Score阈值："
        help="系统会筛选出与输⼊ Query 的匹配分 ≥ 此阈值的切⽚，低于阈值的会被过滤。(0.00～1.00)"
      >
        <div className="flex w-full items-center gap-[16px]">
          <Form.Item
            field="score_threshold_enabled"
            triggerPropName="checked"
            noStyle
            rules={[{ required: true, message: '请选择' }]}
          >
            <Switch checkedText="开" uncheckedText="关" />
          </Form.Item>
          <Form.Item
            shouldUpdate={(prev, next) =>
              prev.score_threshold_enabled !== next.score_threshold_enabled
            }
            noStyle
          >
            {() => {
              const scoreThresholdEnabled =
                form.getFieldValue('score_threshold_enabled') ??
                INIT_FROM_VALUE.score_threshold_enabled;
              return (
                <Form.Item
                  field="score_threshold"
                  noStyle
                  className="flex-1"
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <Slider
                    showInput
                    min={0}
                    max={1}
                    step={0.1}
                    disabled={!scoreThresholdEnabled}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </div>
      </Form.Item>
      {formvalues.search_method == 'Hybrid' ? (
        <Form.Item
          shouldUpdate={(prev, next) => prev.weights !== next.weights}
          noStyle
        >
          {() => {
            const weightsValue =
              form.getFieldValue('weights') ?? INIT_FROM_VALUE.weights;
            const keywordValue = 1 - weightsValue;
            return (
              <Form.Item
                label="按比例分配："
                field="weights"
                rules={[{ required: true, message: '请选择' }]}
                help={
                  <>
                    <div className="flex items-center justify-between">
                      <span>
                        语义{' '}
                        <span className="text-primary-6">
                          {weightsValue.toFixed(2)}
                        </span>
                      </span>
                      <span>
                        关键词{' '}
                        <span className="text-primary-6">
                          {keywordValue.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <span>通过调整分数赋权比例,决定两种检索方式的优先度。</span>
                  </>
                }
              >
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={weightsValue}
                  onChange={(value) => {
                    form.setFieldValue('weights', value);
                    form.setFieldValue('reordering', 1 - Number(value));
                  }}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
      ) : null}
    </Form>
  );
}

export default forwardRef(DemoForm);
