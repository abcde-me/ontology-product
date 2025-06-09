import {
  Form,
  Input,
  Link,
  Select,
  Space,
  Switch,
  Table
} from '@arco-design/web-react';
import { IconMinusCircle, IconPlusCircle } from '@arco-design/web-react/icon';
import React, { useImperativeHandle, useState } from 'react';
import './ParamForm.scss';

let id = 0;
function generateId() {
  return 'key' + id++;
}
type FieldType = {
  parentPath: string;
  path: string;
  children: FieldType[];
  remove: () => void;
};
export type DataType<T = {}> = {
  name: string;
  des: string;
  /**string,number,array,object等类型 */
  type: string;
  /**参数放置的位置 */
  method: 'header' | 'path' | 'query' | 'body';
  required: boolean;
  children: DataType<T>[];
} & T;
function ParamForm(props: { isOutput?: boolean }, ref) {
  const [form] = Form.useForm();
  const { isOutput = false } = props;
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [fields, setFields] = useState<FieldType[]>([]);

  useImperativeHandle(
    ref,
    () => {
      return {
        async validate() {
          await form.validate();

          const getChildren = (fields: FieldType[]): DataType[] => {
            const res: DataType[] = [];
            fields.forEach((field) => {
              const { type, name, des, required, method } = form.getFieldValue(
                field.path
              );
              const data = {
                type,
                name,
                des,
                required,
                method,
                children: []
              };
              res.push(data);
              if (field.children) {
                data.children = getChildren(field.children);
              }
            });
            return res;
          };
          const res = getChildren(fields);
          return res;
        },
        setData(values: DataType[]) {
          const getChildren = (
            params: DataType[],
            parentField: FieldType
          ): FieldType[] => {
            const fields: FieldType[] = (params || []).map((item, index) => {
              const path = `${parentField ? parentField.path + '.' : ''}${generateId()}`;
              form.setFieldValue(path, item);
              const field: FieldType = {
                path,
                parentPath: parentField ? parentField.path : '',
                children: [],
                remove() {
                  if (!parentField)
                    setFields((fields) =>
                      fields.filter((item) => item !== field)
                    );
                  else {
                    parentField.children = parentField.children.filter(
                      (item) => item !== field
                    );
                    setFields((fields) => [...fields]);
                  }
                }
              };
              field.children = getChildren(item.children, field);
              if (field.children.length > 0)
                setExpandedRowKeys((keys) => keys.concat(field.path));
              return field;
            });
            return fields;
          };
          const fields = getChildren(values || [], null);
          setFields(fields);
        }
      };
    },
    [fields, form]
  );

  const addChild = (item: FieldType) => {
    setFields((items) => {
      const child: FieldType = {
        path: item.path + `.${generateId()}`,
        children: [],
        parentPath: item.path,
        remove: () => {}
      };
      item.children.push(child);
      child.remove = () => {
        item.children = item.children.filter((i) => i !== child);
        setFields((items) => [...items]);
      };
      return [...items];
    });
    setExpandedRowKeys((rows) => rows.concat(item.path));
  };

  const clearChildren = (item: FieldType) => {
    form.clearFields(item.children.map((child) => child.path));
    item.children = [];
    setFields((items) => [...items]);
  };
  return (
    <div>
      <Form
        className="mb-[8px]"
        onChange={(_, vals) => {
          console.log('vals:', vals);
        }}
        validateMessages={{ required: '必填项' }}
        form={form}
      >
        <Table
          className="params-table"
          pagination={false}
          noDataElement={<></>}
          tableLayoutFixed
          rowKey="path"
          expandedRowKeys={expandedRowKeys}
          onExpandedRowsChange={(rows) => {
            setExpandedRowKeys(rows);
          }}
          columns={[
            {
              title: '参数名称',
              width: 100,
              dataIndex: 'name',
              render(_, item) {
                if (
                  item.parentPath &&
                  form.getFieldValue(item.parentPath)?.type === 'array'
                ) {
                  return <Input disabled value="[Array Item]" />;
                }
                return (
                  <Form.Item
                    className="mb-0"
                    field={item.path + '.name'}
                    wrapperCol={{ span: 24 }}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                );
              }
            },
            {
              title: '参数描述',
              dataIndex: 'des',
              width: 100,
              render(_, item) {
                return (
                  <Form.Item
                    className="mb-0"
                    field={item.path + '.des'}
                    rules={[{ required: true }]}
                    wrapperCol={{ span: 24 }}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                );
              }
            },
            {
              title: '参数类型',
              dataIndex: 'type',
              width: 50,
              render(_, item) {
                return (
                  <Form.Item
                    className="mb-0"
                    field={item.path + '.type'}
                    rules={[{ required: true }]}
                    wrapperCol={{ span: 24 }}
                  >
                    <Select
                      className="w-full"
                      options={[
                        {
                          label: 'String',
                          value: 'string'
                        },
                        {
                          label: 'Integer',
                          value: 'integer'
                        },
                        {
                          label: 'Number',
                          value: 'number'
                        },
                        {
                          label: 'Object',
                          value: 'object'
                        },
                        {
                          label: 'Array',
                          value: 'array'
                        },
                        {
                          label: 'Boolean',
                          value: 'boolean'
                        }
                      ]}
                      onChange={(val) => {
                        clearChildren(item);
                        if (val === 'object' || val === 'array') {
                          addChild(item);
                          return;
                        }
                      }}
                    />
                  </Form.Item>
                );
              }
            },
            isOutput
              ? null
              : {
                  title: '传入方法',
                  dataIndex: 'method',
                  width: 50,
                  render(_, item) {
                    return (
                      <Form.Item
                        className="mb-0"
                        field={item.path + '.method'}
                        rules={[{ required: true }]}
                        wrapperCol={{ span: 24 }}
                      >
                        <Select
                          className="w-full"
                          options={[
                            { label: 'Body', value: 'body' },
                            { label: 'Path', value: 'path' },
                            { label: 'Query', value: 'query' },
                            { label: 'Header', value: 'header' }
                          ]}
                        />
                      </Form.Item>
                    );
                  }
                },
            {
              title: '是否必填',
              dataIndex: 'required',
              width: 50,
              render(_, item) {
                return (
                  <Form.Item
                    className="mb-0"
                    triggerPropName="checked"
                    field={item.path + '.required'}
                  >
                    <Switch />
                  </Form.Item>
                );
              }
            },
            {
              title: '',
              width: 20,
              render(_, item, index) {
                const type = form.getFieldValue(item.path + '.type');
                return (
                  <Space>
                    <Link
                      icon={
                        <IconMinusCircle
                          className="text-[16px]"
                          onClick={() => {
                            item.remove();
                          }}
                        />
                      }
                    ></Link>
                    {type === 'object' ? (
                      <Link
                        icon={
                          <IconPlusCircle
                            className="text-[16px]"
                            onClick={() => {
                              addChild(item);
                            }}
                          />
                        }
                      ></Link>
                    ) : null}
                  </Space>
                );
              }
            }
          ].filter(Boolean)}
          data={fields}
        />
      </Form>
      <Link
        icon={<IconPlusCircle />}
        onClick={() => {
          setFields((fields) => {
            const item = {
              path: generateId(),
              children: [],
              remove: () => {
                setFields((fields) => fields.filter((field) => field !== item));
              },
              parentPath: ''
            } as FieldType;
            return fields.concat(item);
          });
        }}
      >
        添加参数
      </Link>
    </div>
  );
}

export default React.forwardRef(ParamForm);
