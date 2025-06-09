import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, Message, Radio, TreeSelect, Select, Space } from '@arco-design/web-react';
import {
  IconDelete,
  IconSettings,
  IconCopy
} from '@arco-design/web-react/icon';
import OptimizationIcon from '@/assets/optimization.svg';
import { get } from 'lodash';
import CreateByCustom from './createByCustom'
import CreateByCrispe from './createByCrispe'
import CreateByFewShot from './createByFewShot'


type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  submit: () => void;
};

export const CreateDrawer: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, submit } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
 
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
      className="create-prompt-drawer"
      title="新增模板"
      confirmLoading={loading}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => confirmAction()}
    >
      <Form
        autoComplete="off"
        className="create-prompt-form"
        layout="vertical"
        form={form}
        initialValues={{type: 'Custom'}}
      >
        <div className="sub-title">基本信息</div>
        <Form.Item field="name" required label="Prompt名称">
          <Input placeholder='请输入名称' />
        </Form.Item>
        <div className="sub-title">模板内容及优化</div>
        <Form.Item field="type" required label="Prompt框架">
          <Radio.Group name='card-radio-group'>
            {['Custom', 'CRISPE', 'Few-shot'].map((item) => {
              return (
                <Radio key={item} value={item}>
                  {({ checked }) => {
                    return (
                      <Space
                        align='start'
                        className={`custom-radio-card ${checked ? 'custom-radio-card-checked' : ''}`}
                      >
                        <div className='custom-radio-card-mask'>
                          <div className='custom-radio-card-mask-dot'></div>
                        </div>
                        <div className='custom-radio-card-title'>{item}</div>
                      </Space>
                    );
                  }}
                </Radio>
              );
            })}
          </Radio.Group>
        </Form.Item>
        { type === 'Custom' && <CreateByCustom /> }
        { type === 'CRISPE' && <CreateByCrispe /> }
        { type === 'Few-shot' && <CreateByFewShot /> }

        <Form.Item field="vars" label="变量" shouldUpdate={true}>
          <table className='vars-table'>
            <colgroup>
              <col style={{width: '20%'}}></col>
              <col style={{width: '60%'}}></col>
              <col style={{width: '20%'}}></col>
            </colgroup>
            <thead>
              <tr><th>变量 KEY</th><th>字段名称</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>destination</td>
                <td>旅行目的地</td>
                <td>
                  <IconDelete className='cursor-pointer size-[16px] text-[#334155] mr-[8px]'/>
                  <IconSettings className='cursor-pointer size-[16px] text-[#334155]'/>
                </td>
              </tr>
              <tr>
                <td>num_day</td>
                <td>num_day</td>
                <td>
                  <IconDelete className='cursor-pointer size-[16px] text-[#334155] mr-[8px]'/>
                  <IconSettings className='cursor-pointer size-[16px] text-[#334155]'/>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr><td colSpan={3}>添加</td></tr>
            </tfoot>
          </table>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
