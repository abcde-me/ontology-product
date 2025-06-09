import {
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Space
} from '@arco-design/web-react';
import * as React from 'react';

export const StepTwo: React.FunctionComponent<any> = ({
  segmentationMode,
  setSegmentationMode,
  cRef
}) => {
  React.useImperativeHandle(cRef, () => ({
    onStep
  }));

  const [form] = Form.useForm();
  const onStep = async () => {
    try {
      await form.validate();
      const {
        chunk_overlap,
        max_tokens,
        separator,
        pre_processing_rules: list
      } = form.getFields();
      const pre_processing_rules = pre_processing_rules_list.map((item) => {
        const enabled = list.includes(item.value);
        return {
          id: item.value,
          enabled
        };
      });
      const process_rule = {
        mode: 'custom',
        rules: {
          pre_processing_rules,
          segmentation: { chunk_overlap, max_tokens, separator }
        }
      };
      return process_rule;
    } catch (err) {}
  };

  const segmentationModeList = [
    {
      value: 'automatic',
      title: '自动分段与清洗',
      des: '自动分段与预处理规则'
    },
    {
      value: 'custom',
      title: '自定义',
      des: '自定义分段规则、分段长度及预处理规则'
    }
  ];

  const pre_processing_rules_list = [
    {
      value: 'remove_extra_spaces',
      label: '替换掉连续的空格、换行符和制表符'
    },
    {
      value: 'remove_urls_emails',
      label: '删除所有 URL 和电子邮件地址'
    }
  ];

  return (
    <>
      <div className="mb-[16px] rounded-[8px] bg-[rgb(var(--primary-1))] px-[36px] py-[16px]">
        <Radio.Group
          name="card-radio-group"
          value={segmentationMode}
          className="flex w-full"
          onChange={setSegmentationMode}
        >
          {segmentationModeList.map((item, index) => {
            return (
              <Radio
                key={item.value}
                value={item.value}
                className={`flex-1 pl-[0] ${index === segmentationModeList.length - 1 ? '!mr-[0]' : '!mr-[10]'}`}
              >
                {({ checked }) => {
                  return (
                    <Space
                      align="start"
                      className={`custom-radio-card  ${checked ? 'custom-radio-card-checked' : ''}`}
                    >
                      <div className="custom-radio-card-mask">
                        <div className="custom-radio-card-mask-dot"></div>
                      </div>
                      <div>
                        <div className="custom-radio-card-title">
                          {item.title}
                        </div>
                        <div className="custom-radio-card-des">{item.des}</div>
                      </div>
                    </Space>
                  );
                }}
              </Radio>
            );
          })}
        </Radio.Group>
        {segmentationMode === 'custom' && <Divider />}
        {segmentationMode === 'custom' && (
          <div className="border-[var(--color-border-2))] rounded-[6px] border bg-white px-[16px] py-[12px]">
            <Form
              className="knowledge-form mt-[20px]"
              colon
              form={form}
              autoComplete="off"
              layout="vertical"
              initialValues={{
                separator: '/n',
                max_tokens: 500,
                chunk_overlap: 50,
                pre_processing_rules: ['remove_extra_spaces']
              }}
            >
              <Form.Item
                field="separator"
                label="分段标识符"
                rules={[
                  {
                    required: true,
                    message: `请输入分段标识符`
                  }
                ]}
              >
                <Input className="w-full" />
              </Form.Item>
              <Form.Item
                field="max_tokens"
                label="分段最大长度"
                rules={[
                  {
                    required: true,
                    message: `请输入分段标识符`
                  }
                ]}
              >
                <InputNumber className="w-full" />
              </Form.Item>
              <Form.Item
                field="chunk_overlap"
                label="分段重叠长度"
                rules={[
                  {
                    required: true,
                    message: `请输入分段标识符`
                  }
                ]}
              >
                <InputNumber className="w-full" />
              </Form.Item>
              <Form.Item field="pre_processing_rules" label="文本预处理规则">
                <Checkbox.Group
                  direction="vertical"
                  options={pre_processing_rules_list}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </>
  );
};
