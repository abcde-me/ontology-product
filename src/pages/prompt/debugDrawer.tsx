import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, Message, Radio, TreeSelect, Select } from '@arco-design/web-react';
import {
  IconInfoCircle
} from '@arco-design/web-react/icon';
import { get } from 'lodash';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  submit: () => void;
};

export const DebugDrawer: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, submit } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [debugText, setDebugText] = useState('')
  const type = Form.useWatch('type', form);



  useEffect(() => {

  }, [])

  const onChange = (value: any, extra: any) => {
    console.log('onChange', value, extra);
  }

  const confirmAction = async () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);
          const formValue = form.getFields();
          // await editKnowledge(record.id, formValue);
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
      width={720}
      className="debug-prompt-drawer"
      title="调试Prompt"
      confirmLoading={loading}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => confirmAction()}
    >
      <Form
        autoComplete="off"
        className="debug-prompt-form"
        layout="vertical"
        form={form}
        initialValues={{type: 'inner'}}
      >
        <Form.Item field="type" required label="模型服务">
          <Radio.Group>
            <Radio value="inner">内置模型</Radio>
            <Radio value="custom">自定义模型</Radio>
          </Radio.Group>
          <Select
            placeholder='模型名称'
            style={{ width: '100%', marginTop: '8px' }}
          ></Select>
          <Select
            placeholder='请选择'
            style={{ width: '100%', marginTop: '8px' }}
          ></Select>
        </Form.Item>
        <Form.Item field="vars" required label="变量与值">
          <table className='vars-table'>
            <colgroup>
              <col style={{width: '30%'}}></col>
              <col style={{width: '70%'}}></col>
            </colgroup>
            <thead>
              <tr><th>变量 KEY</th><th>字段名称</th></tr>
            </thead>
            <tbody>
              <tr><td>destination</td><td>旅行目的地</td></tr>
              <tr><td>num_day</td><td>num_day</td></tr>
            </tbody>
          </table>
        </Form.Item>
        <div className='debug-content'>
          <Button className="w-[80px]">再次调试</Button>
          <Input.TextArea
            maxLength={8000}
            showWordLimit
            value={debugText}
            style={{ height: 258, width: '100%' }}
          />
        </div>
      </Form>
    </Drawer>
  );
};
