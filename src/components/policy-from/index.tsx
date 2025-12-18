import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import styles from './index.module.scss';
import { Form, Radio, Space, Slider } from '@arco-design/web-react';
import { useState } from 'react';

function DemoForm(props, ref) {
  const { FuncChildFrom, seteditPolicy, initParams = {} } = props;
  const [form] = Form.useForm();
  const [initFromValue, setinitFromValue] = useState({
    reranking_enable: false,
    search_method: 'Hybrid',
    score_threshold_enabled: true,
    score_threshold: 0.1,
    top_k: 50,
    weights: 0.7,
    ...initParams
  });

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
  const onValuesChange = (changeValue, values) => {
    console.log('onValuesChange: ', changeValue, values);
    setformvalues(values);
  };
  const retrievalVlist = [
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
    },
    {
      value: 'Hybird',
      name: '混合检索',
      placeholder:
        '同时执行向量检索（语义）和全文检索（关键词）。 系统将两者的结果合并并重新排序，提供综合优势。'
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
  //
  useEffect(() => {}, []);
  const formItemLayout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 20
    }
  };
  return (
    <Form
      className={styles.fromstylePolicy}
      form={form}
      onValuesChange={onValuesChange}
      initialValues={initFromValue}
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
        label="Top K："
        field="top_k"
        rules={[{ required: true, message: '请选择' }]}
        help="返回相似度最高的前K个结果(1～100)"
      >
        <Slider showInput style={{ width: 480 }} min={1} max={100} step={1} />
      </Form.Item>

      <Form.Item
        label="相似度阈值："
        field="score_threshold"
        rules={[{ required: true, message: '请选择' }]}
        help="过滤相似度低于此阈值的结果(0.00～1.00)"
      >
        <Slider
          showInput
          style={{ width: 480 }}
          min={0} // 设置最小值为 0
          max={1} // 设置最大值为 1
          step={0.01} // 设置步进值，这里设置为 0.01，可以让你得到更精确的值
        />
      </Form.Item>
      {formvalues.search_method == 'Hybird' ? (
        <>
          <Form.Item
            label="语义权重："
            field="weights"
            rules={[{ required: true, message: '请选择' }]}
            help="调高语义权重侧重于理解问题意图(0.0～1.0)"
          >
            <Slider
              showInput
              style={{ width: 480 }}
              min={0} // 设置最小值为 0
              max={1} // 设置最大值为 1
              step={0.1} // 设置步进值，这里设置为 0.1，可以让你得到更精确的值
              onChange={(value) => {
                form.setFieldValue('reordering', 1 - Number(value));
              }}
            />
          </Form.Item>
          <Form.Item
            label="关键词权重："
            field="reordering"
            rules={[{ required: true, message: '请选择' }]}
            help="调高关键词权重侧重于文本的精确匹配(0.0～1.0)"
          >
            <Slider
              showInput
              style={{ width: 480 }}
              min={0} // 设置最小值为 0
              max={1} // 设置最大值为 1
              step={0.1} // 设置步进值，这里设置为 0.1，可以让你得到更精确的值
              onChange={(value) => {
                form.setFieldValue('weights', 1 - Number(value));
              }}
            />
          </Form.Item>
        </>
      ) : null}
    </Form>
  );
}

export default forwardRef(DemoForm);
