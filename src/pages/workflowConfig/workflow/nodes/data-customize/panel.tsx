import React from 'react';
import { Form } from '@arco-design/web-react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { python } from '@codemirror/legacy-modes/mode/python';

const FormItem = Form.Item;

const Panel = ({ data }) => {
  const [form] = Form.useForm();

  const [value, setValue] = React.useState("console.log('hello world!');");
  const onChange = React.useCallback((val, viewUpdate) => {
    console.log('val:', val);
    setValue(val);
  }, []);

  return (
    <div className="wk-node-panel-content text-parser-panel-content mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          ...data
        }}
        layout="vertical"
        onValuesChange={(_, v: any) => {
          console.log('text parser valuechange', _, v);
        }}
      >
        <FormItem
          label="分段方式："
          field="text_slice_rule"
          labelAlign="left"
          required
          extra="选择切分文本的方式，目前支持按照字符、句子和段落。"
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
