import { Alert, Message, Modal, Select, Table } from '@arco-design/web-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import OpenAPISchemaValidator from 'openapi-schema-validator';
import cn from 'classnames';
import './schemaModel.less';

const validator = new OpenAPISchemaValidator({
  version: 3,
  // optional
  extensions: {
    /* place any properties here to extend the schema. */
  }
});

monaco.editor.defineTheme('appforge-theme', {
  base: 'vs',
  inherit: true,
  colors: {
    'editorGutter.background': '#007DFA',
    'editorLineNumber.foreground': '#fff',
    'editorLineNumber.activeForeground': '#fff',
    'scrollbar.shadow': '#00000000'
  },
  rules: []
});

export function SchemaModel(props: {
  visible: boolean;
  schema: string;
  onSubmit: (newSchema: string) => Promise<any>;
  onCancel: () => void;
}) {
  const { visible, schema, onCancel, onSubmit } = props;
  const [value, setValue] = useState('');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (visible) {
      try {
        const formated = JSON.stringify(JSON.parse(schema), null, 4);
        setValue(formated);
      } catch (err) {
        setValue(schema);
      }
    }
  }, [schema, visible]);

  const tools = useMemo(() => {
    try {
      if (!value) return [];
      const obj = JSON.parse(value);
      const paths = Object.keys(obj.paths);
      const tools = [];
      paths.forEach((path) => {
        const item = obj.paths[path];
        const methods = Object.keys(item);
        methods.forEach((method) => {
          tools.push({
            method: method,
            des: item[method].summary,
            name: item[method].operationId,
            path
          });
        });
      });
      return tools;
    } catch (err) {
      return [];
    }
  }, [value]);

  const checkErr = (val: string) => {
    try {
      const schemaObj = JSON.parse(val);
      const res = validator.validate(schemaObj);
      if (res.errors?.length > 0) {
        return '格式错误,详细信息:' + JSON.stringify(res.errors, null, 2);
      }
      return '';
    } catch (err) {
      return '格式错误,详细信息:' + err?.message;
    }
  };

  return (
    <Modal
      className="schema-modal"
      visible={visible}
      style={{ width: '960px' }}
      title="代码配置"
      onCancel={onCancel}
      okButtonProps={{
        disabled: !!err
      }}
      onOk={async () => {
        try {
          const err = checkErr(value);
          if (err) {
            Message.warning(err);
            return;
          }
          const noFomat = JSON.stringify(JSON.parse(value));
          await onSubmit(noFomat);
          Message.success('保存成功');
          onCancel();
        } catch (err) {
          Message.error(err?.message);
        }
      }}
    >
      <div className="rounded-[8px] bg-[var(--color-bg-3)] p-[25px]">
        <div className="mb-[8px] flex items-center justify-between">
          <span className="mb-[8px] text-[14px] font-[600]">配置参数</span>
          <Select
            disabled
            size="mini"
            options={[{ label: 'JSON', value: 'json' }]}
            className="w-[108px]"
            defaultValue="json"
          ></Select>
        </div>
        <div className="rounded-[8px]">
          <MonacoEditor
            width="100%"
            height="320px"
            language="json"
            theme="appforge-theme"
            value={value}
            editorDidMount={(ref) => {
              editorRef.current = ref;
            }}
            onChange={(val) => {
              setValue(val);
              const err = checkErr(val);
              setErr(err);
            }}
            className={cn('plugin-config-editor')}
            options={{
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              minimap: { enabled: false }
            }}
          />
        </div>
        {err ? (
          <Alert className="mt-[15px]" type="error" content={err}></Alert>
        ) : null}
        <div className="mt-[15px] text-[14px] font-[600]">可用工具</div>
        <Table
          size="small"
          className="mt-[8px]"
          data={tools}
          noDataElement={<></>}
          pagination={false}
          rowKey="name"
          border
          borderCell
          columns={[
            { title: '名称', dataIndex: 'name', width: 100 },
            { title: '描述', dataIndex: 'des', width: 200 },
            { title: '方法', dataIndex: 'method', width: 100 },
            { title: '路径', dataIndex: 'path', width: 150 }
          ]}
          scroll={{ x: true }}
        />
      </div>
    </Modal>
  );
}
