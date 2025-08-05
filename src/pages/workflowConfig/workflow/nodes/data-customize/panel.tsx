import React from 'react';
import { Form } from '@arco-design/web-react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { python } from '@codemirror/legacy-modes/mode/python';
import useConfig from './use-config';

const FormItem = Form.Item;

const Panel = ({ id, data }) => {
  const [form] = Form.useForm();

  const [value, setValue] = React.useState("console.log('hello world!');");
  const onChange = React.useCallback((val, viewUpdate) => {
    console.log('val:', val);
    setValue(val);
  }, []);

  const { readOnly, inputs, handleValueChange } = useConfig(id, data);

  return (
    <div className="wk-node-panel-content mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          ...inputs
        }}
        layout="vertical"
        onValuesChange={(_, v: any) => {
          handleValueChange(v);
        }}
      >
        <FormItem
          label="python脚本"
          field="customize_code"
          labelAlign="left"
          required
        >
          <CodeMirror
            value={value}
            height="200px"
            extensions={[StreamLanguage.define(python)]}
            onChange={onChange}
          />
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);
