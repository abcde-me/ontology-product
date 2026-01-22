import React from 'react';
import styles from './index.module.scss';
import { Form, Input } from '@arco-design/web-react';
import { ProButton } from '@ceai-front/arco-material';

const FormItem = Form.Item;
const { TextArea } = Input;

export default function BehaviorActionDetailPage() {
  const saveAction = async () => {};

  return (
    <div
      className={`${styles['behavior-action-detail']} flex h-full w-full flex-col `}
    >
      <div className={`${styles['page-header']} text-default`}>
        创建行为动作
      </div>
      <div className={`${styles['page-body']}`}>
        <Form>
          <div className={'module-title'}>基本信息</div>
          <FormItem
            label="行为动作名称"
            field="name"
            rules={[
              { required: true, message: '请输入行为动作名称' },
              { maxLength: 50, message: '最多 50 个字符' }
            ]}
          >
            <Input
              placeholder="请输入关键字名称"
              maxLength={50}
              showWordLimit
            />
          </FormItem>

          <FormItem
            label="唯一标识"
            field="code"
            rules={[{ required: true, message: '请输入唯一标识' }]}
          >
            <Input placeholder="请输入唯一标识" />
          </FormItem>

          <FormItem label="描述说明" field="description">
            <TextArea
              placeholder="请输入描述说明"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </FormItem>
          <div className={'module-title'}>函数与校验</div>
        </Form>
      </div>
      <div className={`${styles['page-footer']}`}>
        <ProButton type="primary" onClick={saveAction} loadingText="处理中...">
          确认
        </ProButton>
        <ProButton type={'outline'}>取消</ProButton>
      </div>
    </div>
  );
}
