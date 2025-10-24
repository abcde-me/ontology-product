import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import styles from './index.module.scss';
import { useHistory } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Radio,
  Upload,
  Message,
  Space,
  Slider,
  Switch
} from '@arco-design/web-react';
import {
  IconCheck,
  IconCheckCircle,
  IconUpload
} from '@arco-design/web-react/icon';
import { useState } from 'react';
import { get } from 'lodash';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';

function DemoForm(props, ref) {
  const { FuncChildFrom, seteditPolicy, initParams = {} } = props;
  const [checkedManage, setCheckedManage] = useState(
    initParams.reordering ?? true
  );
  const [checkedManagescore, setCheckedManagescore] = useState(
    initParams.checkedManagescore ?? true
  );
  const [form] = Form.useForm();
  const [initFromValue, setinitFromValue] = useState({
    retrievalV: 'semantic_search',
    weightSettings: 0.6,
    reordering: checkedManage,
    topK: 6,
    scoreSwitch: checkedManagescore,
    scoreValue: 0.6,
    ...initParams
  });

  const [formvalues, setformvalues] = useState<any>({
    retrievalV: 'semantic_search'
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
      value: 'semantic_search',
      name: '向量检索',
      placeholder:
        '基于语义相似度的先进方法。 将数据转换为“向量”，查找语义上最相关或最相似的文本片段。'
    },
    {
      value: 'full_text_search',
      name: '全文检索',
      placeholder:
        '也称关键词检索，通过扫描文档，查找与用户查询关键词完全匹配的内容。对术语、代码等查询快速精确。'
    },
    {
      value: 'hybrid_search',
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
  const handleChangeManage = (checked: boolean) => {
    setCheckedManage(checked);
  };
  const handleChangeManagescore = (checked: boolean) => {
    setCheckedManagescore(checked);
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
        field="retrievalV"
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
        field="topK"
        rules={[{ required: true, message: '请选择' }]}
        help="返回相似度最高的前K个结果(1～100)"
      >
        <Slider showInput style={{ width: 480 }} min={1} max={100} step={1} />
      </Form.Item>

      <Form.Item
        label="相似度阈值："
        field="score"
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
      {formvalues.retrievalV == 'hybrid_search' ? (
        <>
          <Form.Item
            label="语义权重："
            field="weightSettings"
            rules={[{ required: true, message: '请选择' }]}
            help="调高语义权重侧重于理解问题意图(0.0～1.0)"
          >
            <Slider
              showInput
              style={{ width: 480 }}
              min={0} // 设置最小值为 0
              max={1} // 设置最大值为 1
              step={0.1} // 设置步进值，这里设置为 0.1，可以让你得到更精确的值
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
            />
          </Form.Item>
        </>
      ) : null}
    </Form>
  );
}

export default forwardRef(DemoForm);
