import React from 'react';
import styles from './index.module.scss';
import { Form, Input, Select } from '@arco-design/web-react';
import { ProButton } from '@ceai-front/arco-material';
import {
  FunctionsSelect,
  ParamsSetting,
  ValidRules
} from '@/pages/ontologyScene/modules/behaviorActionDetail/components';
import { useHistory, useParams } from 'react-router-dom';
import { FormItem } from '@/pages/ontologyScene/componens';

const { TextArea } = Input;

export default function BehaviorActionDetailPage() {
  const history = useHistory();
  const [form] = Form.useForm();
  const { id: OSId, pageMode, actionId } = useParams<Record<string, string>>();

  const saveAction = async () => {
    const values = await form.validate();
    console.log(values);
  };

  return (
    <div
      className={`${styles['behavior-action-detail']} flex h-full w-full flex-col `}
    >
      <div className={`${styles['page-header']} text-default`}>
        {`${pageMode === 'edit' ? '编辑' : '创建'}行为`}
      </div>
      <div className={`${styles['page-body']}`}>
        <Form autoComplete={'off'} form={form} labelAlign={'left'}>
          <div className={'module-title'}>基本信息</div>
          <FormItem
            label="行为动作名称"
            field="name"
            required
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
            required
            field="code"
            rules={[{ required: true, message: '请输入唯一标识' }]}
          >
            <Input placeholder="请输入唯一标识" />
          </FormItem>

          <FormItem label="描述说明" field="description" required={false}>
            <TextArea
              placeholder="请输入描述说明"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </FormItem>
          <div className={'module-title'}>函数与校验</div>
          <FormItem label="所属对象类型" field="description" required>
            <Select options={[]} placeholder={'请选择所属对象类型'} />
          </FormItem>
          <FormItem label="函数" field="description" required>
            <FunctionsSelect />
          </FormItem>
          <FormItem label="参数配置" field="description" required>
            <ParamsSetting />
          </FormItem>
          <FormItem label="校验规则" field="description" required>
            <ValidRules />
          </FormItem>
        </Form>
      </div>
      <div className={`${styles['page-footer']}`}>
        <ProButton type="primary" onClick={saveAction} loadingText="处理中...">
          确认
        </ProButton>
        <ProButton type={'outline'} onClick={() => history.goBack()}>
          取消
        </ProButton>
      </div>
    </div>
  );
}
