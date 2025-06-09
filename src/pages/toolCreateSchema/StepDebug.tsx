import {
  Alert,
  Button,
  Form,
  Input,
  Link,
  Spin,
  Table,
  Tag
} from '@arco-design/web-react';
import { IconMinusCircle, IconPlusCircle } from '@arco-design/web-react/icon';
import * as _ from 'lodash';
import { observer } from 'mobx-react-lite';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import MonacoEditor from 'react-monaco-editor';
import { DataType } from './ParamForm';
import { toolCreateStore } from './model';
import cn from 'classnames';

function StepDebug(props, ref) {
  const inputParams = toolCreateStore.inputParams;
  const [inputParamsData, setInputParamsData] = useState<DataType[]>([]);
  useEffect(() => {
    if (!inputParams) setInputParamsData([]);
    setInputParamsData(inputParams);
  }, [inputParams]);

  useImperativeHandle(
    ref,
    () => {
      return {};
    },
    []
  );

  const getField = (param: DataType) => {
    const findChildren = (item: DataType, prefix: string) => {
      const index = item.children.indexOf(param);
      if (index > -1) {
        if (item.type === 'array') return prefix + `[${index}]`;
        if (item.type === 'object') return prefix + '.' + param.name;
      }
      for (let i = 0; i < item.children.length; i++) {
        const child = item.children[i];
        const res = findChildren(
          child,
          item.type === 'array' ? prefix + `[${i}]` : prefix + '.' + child.name
        );
        if (res) return res;
      }
      return null;
    };
    for (const item of inputParamsData) {
      if (item === param) return item.name;
      const res = findChildren(item, item.name);
      if (res) return res;
    }
    return null;
  };

  const removeChild = (child: DataType) => {
    const values = form.getFieldsValue();
    const remove = (item: DataType, data) => {
      const index = item.children.indexOf(child);
      if (index > -1) {
        item.children.splice(index, 1);
        data.splice(index, 1);
        return true;
      }
      for (let i = 0; i < item.children.length; i++) {
        const child = item.children[i];
        const res = remove(
          child,
          data?.[item.type === 'array' ? data?.[i] : data?.[child.name]]
        );
        if (res) return res;
      }
      return false;
    };
    for (const item of inputParamsData) {
      const res = remove(item, values[item.name]);
      if (res) {
        form.setFieldsValue(values);
        return res;
      }
    }
    return false;
  };

  const columns = [
    {
      title: '参数名',
      dataIndex: 'name',
      width: 100,
      render(val, row: DataType) {
        return (
          <span>
            {row.required ? (
              <span className={cn('text-[rgb(var(--danger-6))]')}>*&nbsp;</span>
            ) : null}

            {val}
          </span>
        );
      }
    },
    { title: '类型', dataIndex: 'type', width: 100 },
    {
      title: '值',
      dataIndex: 'value',
      width: 150,
      render(_, row: DataType) {
        if (row.type === 'array' || row.type === 'object') return null;
        const field = getField(row);
        return (
          <Form.Item
            className="mb-0"
            label=""
            field={field}
            rules={[{ required: row.required }]}
          >
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: '操作',
      width: 50,
      dataIndex: 'actions',
      render(col, row: DataType, index) {
        if (row.type === 'array')
          return (
            <Link
              icon={<IconPlusCircle className="text-[16px]" />}
              onClick={() => {
                row.children.push(_.cloneDeep(row.children[0]));
                setInputParamsData((items) => [...items]);
              }}
            ></Link>
          );
        const field = getField(row);
        if (field.endsWith(`[${index}]`) && index > 0)
          return (
            <IconMinusCircle
              className="text-[16px]"
              onClick={() => {
                removeChild(row);
                setInputParamsData((items) => [...items]);
              }}
            />
          );
        return null;
      }
    }
  ];
  const [form] = Form.useForm();
  return (
    <div className="ml-[100px] mr-[100px] flex flex-auto rounded-[8px] bg-[var(--color-bg-3)] p-[25px]">
      <div className="flex flex-1 flex-col">
        <div className="mb-[12px] text-[14px] font-[600] text-[var(--color-text-1)]">
          输入参数
        </div>
        <div className="flex-auto overflow-auto rounded-[6px]  border border-[var(--color-border-2)]  bg-white">
          <Form form={form} validateMessages={{ required: '必填项' }}>
            <Table
              tableLayoutFixed
              border={false}
              rowKey={(record) => getField(record)}
              pagination={false}
              columns={columns}
              data={inputParamsData}
              className="mb-[8px]"
            />
          </Form>
          <Button
            type="primary"
            className="mb-[12px] ml-[12px]"
            loading={toolCreateStore.debuging}
            onClick={async () => {
              const values = await form.validate();
              console.log(values);
              await toolCreateStore.debugTool(values);
            }}
          >
            运行
          </Button>
        </div>
      </div>
      <div className="ml-[20px] flex flex-1 flex-col">
        <div className="mb-[12px]  text-[14px] font-[600] text-[var(--color-text-1)]">
          调试结果
        </div>
        <div className="flex-auto rounded-[6px] border border-[var(--color-border-2)] bg-white p-[12px]">
          {toolCreateStore.debugRequest ? (
            <Spin block loading={toolCreateStore.debuging}>
              <div className="mb-[8px]">
                <Tag>Request</Tag>
              </div>
              <div className="mb-[8px] overflow-hidden rounded-[6px]">
                <MonacoEditor
                  width="100%"
                  height="320px"
                  language="json"
                  theme="vs-dark"
                  value={toolCreateStore.debugRequest}
                  options={{
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: true,
                    minimap: { enabled: false }
                  }}
                />
              </div>
            </Spin>
          ) : null}
          {toolCreateStore.debugResponseError ? (
            <Alert type="error" content={toolCreateStore.debugResponseError} />
          ) : null}
          {toolCreateStore.debugResponseSuccess ? (
            <Alert
              type="success"
              content={toolCreateStore.debugResponseSuccess}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default observer(forwardRef(StepDebug));
