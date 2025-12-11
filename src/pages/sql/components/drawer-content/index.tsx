import React from 'react';
import { Drawer, Form, Input, Button, Checkbox } from '@arco-design/web-react';
import { IconRight } from '@arco-design/web-react/icon';

import styles from './index.module.scss';

interface DrawerContentProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  contentArr?: [];
}

const DrawerContent = ({
  visible,
  setVisible,
  contentArr
}: DrawerContentProps) => {
  const FormItem = Form.Item;
  const [form] = Form.useForm();
  return (
    <div className={styles['drawer-content']}>
      <Drawer
        closeIcon={<IconRight />}
        width={332}
        title={<span>引用参数</span>}
        visible={visible}
        onOk={() => {
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
        maskStyle={{
          display: 'none'
        }}
        // getPopupContainer={() => editorContainerRef && editorContainerRef.current}
      >
        <div>
          {contentArr?.map((item, index) => (
            <Form
              layout="vertical"
              form={form}
              key={index}
              style={{ width: 600 }}
              autoComplete="off"
            >
              <FormItem field={`paramName${index}`} label="参数名：">
                <Input placeholder="请输入参数名" />
              </FormItem>
              <FormItem field={`paramValue${index}`} label="参数值：">
                <Input placeholder="请输入参数值" />
              </FormItem>
            </Form>
          ))}
        </div>
      </Drawer>
    </div>
  );
};

export default DrawerContent;
