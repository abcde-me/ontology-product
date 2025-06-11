import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import './index.css';
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
  const [checkedManage, setCheckedManage] = useState(initParams.reordering ?? true);
  const [checkedManagescore, setCheckedManagescore] = useState(initParams.checkedManagescore ?? true);
  const [form] = Form.useForm();
  const [initFromValue, setinitFromValue] = useState({
    retrievalV: 'hybrid_search',
    weightSettings: 0.6,
    reordering: checkedManage,
    topK: 6,
    scoreSwitch: checkedManagescore,
    scoreValue: 0.6,
    ...initParams
  });

  const [formvalues, setformvalues] = useState<any>({
    retrievalV: 'hybrid_search'
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
      value: 'hybrid_search',
      name: '混合检索',
      placeholder:
        '使用全文检索和语义检索两种策略检索知识点，并召回对应切片内容。推荐在需兼顾句子语义理解和关键词匹配的场景下使用，综合效果更优'
    },
    {
      value: 'full_text_search',
      name: '全文检索',
      placeholder:
        '使用全文检索策略检索知识点，并召回对应切片内容，返回与提问Query关键字匹配度高的内容。推荐在需要对提问Query的关键词精准匹配的场景中使用  '
    },
    {
      value: 'semantic_search',
      name: '语义检索',
      placeholder:
        '使用语义检索策略检索知识点，并召回对应切片内容，返回与提问Query含义相匹配内容。推荐在需要对上下文相关性和意图相关性匹配的场景中使用'
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
      span: 3
    },
    wrapperCol: {
      span: 21
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
      className="fromstylePolicy"
      form={form}
      onValuesChange={onValuesChange}
      initialValues={initFromValue}
      {...formItemLayout}
    >
      <div className="headername">检索策略</div>
      <Form.Item
        label=""
        field="retrievalV"
        className="retrievalV"
        wrapperCol={{
          span: 24
        }}
      >
        <Radio.Group
          onChange={(e) => {
            // e.target.value 获取当前选中的值
            console.log('选中的值:', e);
          }}
        >
          {retrievalVlist.map((e, index) => {
            return (
              <Radio value={e.value} key={index}>
                {({ checked }) => {
                  return (
                    <Space
                      align="start"
                      className={`custom-radio-card ${checked ? 'custom-radio-card-checked' : ''}`}
                    >
                      <div className="custom-radio-card-mask">
                        <div className="custom-radio-card-mask-dot"></div>
                      </div>
                      <div className="policybox">
                        <div className="custom-radio-card-title">{e.name}</div>
                        <div className="policy-text"> {e.placeholder}</div>
                      </div>
                    </Space>
                  );
                }}
              </Radio>
            );
          })}
        </Radio.Group>
      </Form.Item>
      <div className="headername">排序召回配置</div>
      {formvalues.retrievalV == 'hybrid_search' ? (
        <Form.Item
          label="权重设置："
          field="weightSettings"
          rules={[{ required: true, message: '请选择' }]}
          help="通过调整分数赋权比例，决定两种检索方式的优先度。"
        >
          <Slider
            showInput
            style={{ width: 280 }}
            min={0} // 设置最小值为 0
            max={1} // 设置最大值为 1
            step={0.01} // 设置步进值，这里设置为 0.01，可以让你得到更精确的值
          />
        </Form.Item>
      ) : null}

      <Form.Item
        label="重排序："
        field="reordering"
        rules={[{ required: true, message: '请选择' }]}
      >
        <Switch
          checked={checkedManage}
          onChange={handleChangeManage}
          checkedText="开"
          uncheckedText="关"
        />
      </Form.Item>

      <Form.Item
        label="Top K："
        field="topK"
        rules={[{ required: true, message: '请选择' }]}
        help="从知识库中召回与输⼊Query匹配的切⽚个数的上限值。"
      >
        <Slider
          showInput
          style={{ width: 280 }}
          min={0} // 设置最小值为 0
          max={20} // 设置最大值为 1
          step={1} // 设置步进值，这里设置为 0.01，可以让你得到更精确的值
        />
      </Form.Item>
      <Form.Item
        label="Score阈值："
        field="score"
        rules={[{ required: true, message: '请选择' }]}
        help="系统会筛选出与输⼊ Query 的匹配分 ≥ 此阈值的切⽚，低于阈值的会被过滤。"
      >
        {' '}
        <Form.Item
          style={{ width: 60 }}
          label=""
          field="scoreSwitch"
          rules={[{ required: true, message: '请选择' }]}
        >
          <Switch
            checked={checkedManagescore}
            onChange={handleChangeManagescore}
            checkedText="开"
            uncheckedText="关"
          />
        </Form.Item>
        <Form.Item
          label=""
          field="scoreValue"
          rules={[{ required: true, message: '请选择' }]}
        >
          <Slider
            showInput
            style={{ width: 280, marginLeft: 10 }}
            min={0} // 设置最小值为 0
            max={1} // 设置最大值为 1
            step={0.01} // 设置步进值，这里设置为 0.01，可以让你得到更精确的值
          />
        </Form.Item>
      </Form.Item>
    </Form>
  );
}

export default forwardRef(DemoForm);
