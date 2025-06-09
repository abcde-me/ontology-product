import * as React from 'react';
import {
  Checkbox,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Message,
  Radio,
  Space
} from '@arco-design/web-react';
import { uploadDocument } from '@/api/knowledgeBase';
import { get } from 'lodash';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  record: any;
  knowledgeDetail: any;
  submit: () => void;
};

export const EditDrawer: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, record, knowledgeDetail, submit } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [segmentationMode, setSegmentationMode] = React.useState('automatic');

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

  React.useEffect(() => {
    const chunk_overlap = get(
      record,
      'dataset_process_rule.rules.segmentation.chunk_overlap',
      0
    );
    const max_tokens = get(
      record,
      'dataset_process_rule.rules.segmentation.max_tokens',
      0
    );
    const separator = get(
      record,
      'dataset_process_rule.rules.segmentation.separator',
      ''
    );
    const pre_processing_rules = get(
      record,
      'dataset_process_rule.rules.pre_processing_rules',
      []
    )
      .filter((item) => item.enabled)
      .map((item) => item.id);
    const mode = get(record, 'dataset_process_rule.mode', 'automatic');
    if (mode === 'automatic') {
      form.setFieldsValue({
        separator: '/n',
        max_tokens: 500,
        chunk_overlap: 50,
        pre_processing_rules: ['remove_extra_spaces']
      });
    } else {
      form.setFieldsValue({
        chunk_overlap,
        max_tokens,
        separator,
        pre_processing_rules
      });
    }

    setSegmentationMode(mode);
  }, [form, record]);

  const confirmAction = async () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);

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
          let rule = {};
          if (segmentationMode === 'custom') {
            rule = process_rule;
          } else {
            rule = { rules: {}, mode: 'automatic' };
          }
          const params = {
            original_document_id: record.id,
            doc_form: record.doc_form,
            doc_language: 'Chinese',
            process_rule: rule,
            retrieval_model: knowledgeDetail.retrieval_model_dict
          };
          await uploadDocument(knowledgeDetail.id, params);
          Message.success('编辑成功');
          submit && submit();
          setLoading(false);
          setVisible(false);
        } catch (err) {
          return;
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <Drawer
      width={520}
      className="knowledge-drawer"
      title="文档设置"
      confirmLoading={loading}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => confirmAction()}
    >
      <div className="text-[16px] font-[500] text-[var(--color-text-1)]">
        数据处理
      </div>
      <Radio.Group
        name="card-radio-group"
        value={segmentationMode}
        className="flex w-full flex-col"
        onChange={setSegmentationMode}
      >
        {segmentationModeList.map((item) => {
          return (
            <Radio key={item.value} value={item.value} className="mt-[20px]">
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
    </Drawer>
  );
};
