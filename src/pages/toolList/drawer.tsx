import { addTool, updateTool } from '@/api/tools';
import Avatar from '@/components/avater';
import { newSchema } from '@/utils/openApiSchema';
import {
  AuthHeaderPrefix,
  AuthType,
  CustomCollectionBackend
} from '@/utils/type';
import {
  Drawer,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Table
} from '@arco-design/web-react';
import { IconMinusCircle, IconPlusCircle } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './drawer.css';

export const TOOL_POP_KEY = 'tool-edit-pop';

export default function CreateDrawer(props: {
  visible: boolean;
  onCancel;
  onSuccess: (newProvider?: string) => void;
  collection?: CustomCollectionBackend;
}) {
  const { visible, onCancel, onSuccess, collection } = props;
  const [form] = Form.useForm();
  const [confirmloading, setConfirmloading] = useState(false);
  const history = useHistory();

  //添加一行key-value的方法
  let addItem;

  const onSubmit = async () => {
    try {
      setConfirmloading(true);
      const values = await form.validate();
      const data = {
        credentials: values.credentials || {
          auth_type: AuthType.none
        },
        description: values.description,
        icon: {
          background: '#FEF7C3',
          content: values.avatar || ''
        },
        privacy_policy: values.privacy_policy || '',
        provider: values.title,
        schema: newSchema(collection?.schema)
          .title(values.title)
          .description(values.description)
          .url(values.url || '')
          .getString(),
        schema_type: 'openapi'
      };
      if (!collection) {
        await addTool(data);
        // if (values.approach === 'form')
        //   history.push(
        //     `/tenant/compute/appforge/toolCreate?provider=${values.title}`
        //   );
        // else {
        //   localStorage.setItem(TOOL_POP_KEY, 'true');
        //   history.push(
        //     `/tenant/compute/appforge/toolDetail?name=${values.title}&type=api`
        //   );
        // }
        history.push(
          `/tenant/compute/appforge/toolDetail?name=${values.title}&type=api`
        );
      } else await updateTool({ ...data, original_provider: collection.name });
      onSuccess(
        collection && collection.name !== values.title
          ? values.title
          : undefined
      );
      Message.success('操作成功');
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmloading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    } else {
      if (collection) {
        const schema = newSchema(collection.schema);
        const url = schema.getUrlPrefix();
        const title = schema.getTitle();
        const description = schema.getDescription();
        form.setFieldsValue({
          title,
          description,
          url,
          avatar: collection.icon?.content || '',
          credentials: {
            ...collection.credentials,
            api_key_header:
              collection.credentials?.api_key_header || 'Authorization'
          },
          privacy_policy: collection.privacy_policy || ''
        });
      } else {
        form.setFieldsValue({
          approach: 'form',
          credentials: {
            auth_type: AuthType.none,
            api_key_header_prefix: AuthHeaderPrefix.basic,
            api_key_header: 'Authorization',
            api_key_value: ''
          }
        });
      }
    }
  }, [collection, form, visible]);
  const title = Form.useWatch('title', form);
  const description = Form.useWatch('description', form);
  return (
    <Drawer
      width={750}
      title={collection ? '设置' : '新建插件'}
      visible={visible}
      onCancel={onCancel}
      onOk={async () => {
        await onSubmit();
      }}
      confirmLoading={confirmloading}
    >
      <Form
        layout="vertical"
        form={form}
        validateMessages={{ required: '不能为空' }}
      >
        <div className="mb-[20px] text-[14px] font-[600] text-[var(--color-text-1)]">
          基本信息
        </div>
        <Form.Item field="avatar">
          <Avatar title={title} description={description} />
        </Form.Item>
        <Form.Item
          label="插件名称"
          rules={[
            { required: true, message: '输入不能为空' },
            {
              match: /^[a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5-.]{0,39}$/,
              message:
                '支持 1-40 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头'
            }
          ]}
          field="title"
        >
          <Input
            placeholder="命名插件"
            maxLength={{ length: 40, errorOnly: true }}
            showWordLimit
          />
        </Form.Item>
        <Form.Item label="插件描述" field="description">
          <Input.TextArea
            placeholder="请输入插件描述"
            maxLength={{ length: 255, errorOnly: true }}
            showWordLimit
          />
        </Form.Item>
        {collection ? null : (
          <Form.Item
            label={
              <span className="text-[14px] font-[600] text-[var(--color-text-1)] ">
                插件创建方式
              </span>
            }
            field="approach"
            rules={[{ required: true }]}
          >
            <Radio.Group className="plugin-create-type">
              <Radio value="form">列表方式创建</Radio>
              <Radio value="code">代码方式创建</Radio>
            </Radio.Group>
          </Form.Item>
        )}
        <Form.Item shouldUpdate noStyle>
          {(values) => {
            if (values.approach === 'code') return null;
            return (
              <>
                <div className="mb-[8px] rounded-[8px] bg-[var(--color-bg-2)] p-[12px]">
                  <Form.Item
                    label={
                      <span className="text-[14px] font-[600] text-[var(--color-text-1)] ">
                        插件URL
                      </span>
                    }
                    field="url"
                    rules={[{ required: true }]}
                    className="mb-0"
                  >
                    <Input />
                  </Form.Item>
                </div>

                <div
                  className="mb-[8px] rounded-[8px] bg-[var(--color-bg-2)] p-[12px]"
                  style={{ display: 'none' }}
                >
                  <div className="mb-[8px] flex text-[14px] font-[600] text-[var(--color-text-1)]">
                    Header列表
                    <IconPlusCircle
                      className="ml-auto cursor-pointer text-[16px] hover:text-[rgb(var(--link-6))]"
                      onClick={() => {
                        addItem();
                      }}
                    />
                  </div>
                  <Form.List field="headers">
                    {(fields, { add, remove }) => {
                      addItem = add;
                      return (
                        <Table
                          rowKey="key"
                          pagination={false}
                          noDataElement={<></>}
                          columns={[
                            {
                              title: 'Key',
                              dataIndex: 'key',
                              render(_, item) {
                                return (
                                  <Form.Item
                                    field={item.field + '.key'}
                                    className="mb-0"
                                    rules={[{ required: true }]}
                                  >
                                    <Input />
                                  </Form.Item>
                                );
                              }
                            },
                            {
                              title: 'Value',
                              dataIndex: 'Value',
                              render(_, item) {
                                return (
                                  <Form.Item
                                    field={item.field + '.value'}
                                    className="mb-0"
                                    rules={[{ required: true }]}
                                  >
                                    <Input />
                                  </Form.Item>
                                );
                              }
                            },
                            {
                              title: '',
                              dataIndex: 'actions',
                              render(_, field, index) {
                                return (
                                  <IconMinusCircle
                                    onClick={() => remove(index)}
                                    className="cursor-pointer text-[16px] hover:text-[rgb(var(--link-6))]"
                                  />
                                );
                              }
                            }
                          ]}
                          data={fields}
                        />
                      );
                    }}
                  </Form.List>
                </div>

                <div className="mb-[8px] rounded-[8px] bg-[var(--color-bg-2)] p-[12px]">
                  <Form.Item
                    label={
                      <span className="text-[14px] font-[600] text-[var(--color-text-1)] ">
                        鉴权方法
                      </span>
                    }
                    field="credentials.auth_type"
                    rules={[{ required: true }]}
                    className="last-of-type:mb-0"
                  >
                    <Select
                      options={[
                        { label: '无', value: AuthType.none },
                        { label: 'API Key', value: AuthType.apiKey }
                      ]}
                      getPopupContainer={() => document.body}
                    ></Select>
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {(values) => {
                      if (values.credentials?.auth_type !== AuthType.apiKey)
                        return null;
                      return (
                        <>
                          <Form.Item
                            label="鉴权头部前缀"
                            field="credentials.api_key_header_prefix"
                            rules={[{ required: true }]}
                          >
                            <Radio.Group
                              options={[
                                {
                                  label: 'Basic',
                                  value: AuthHeaderPrefix.basic
                                },
                                {
                                  label: 'Bearer',
                                  value: AuthHeaderPrefix.bearer
                                },
                                {
                                  label: 'Custom',
                                  value: AuthHeaderPrefix.custom
                                }
                              ]}
                            ></Radio.Group>
                          </Form.Item>
                          <Form.Item
                            label="键"
                            field="credentials.api_key_header"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="值"
                            field="credentials.api_key_value"
                            className="mb-0"
                          >
                            <Input />
                          </Form.Item>
                        </>
                      );
                    }}
                  </Form.Item>
                </div>
                <div className="mb-[8px] rounded-[8px] bg-[var(--color-bg-2)] p-[12px]">
                  <Form.Item
                    label={
                      <span className="text-[14px] font-[600] text-[var(--color-text-1)] ">
                        隐私协议
                      </span>
                    }
                    field="privacy_policy"
                  >
                    <Input />
                  </Form.Item>
                </div>
              </>
            );
          }}
        </Form.Item>
      </Form>
    </Drawer>
  );
}
