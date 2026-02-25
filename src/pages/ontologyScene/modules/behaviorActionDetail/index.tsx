import React, { useEffect } from 'react';
import styles from './index.module.scss';
import { Form, Input, Message, Select } from '@arco-design/web-react';
import { ProButton } from '@ceai-front/arco-material';
import {
  FunctionsSelect,
  ParamsSetting,
  ValidateRules
} from '@/pages/ontologyScene/modules/behaviorActionDetail/components';
import { useHistory, useParams } from 'react-router-dom';
import { FormItem, ObjectTypeSelect } from '@/pages/ontologyScene/componens';
import { useRequest } from 'ahooks';
import {
  getActionDetail,
  saveBehaviorAction
} from '@/api/ontologySceneLibrary/ontologyAction';
import {
  buildActionDetail,
  buildActionSchema,
  buildFunctionSchema
} from '@/pages/ontologyScene/modules/behaviorActionDetail/utils';
import { isNil } from 'lodash-es';
import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import { InputType } from '@/pages/ontologyScene/types/ontologyFunction';
import { IconLeft } from '@arco-design/web-react/icon';

const { TextArea } = Input;

export default function BehaviorActionDetailPage() {
  const history = useHistory();
  const [form] = Form.useForm();
  const { id: OSId, pageMode, actionId } = useParams<Record<string, string>>();
  const currentFunction = Form.useWatch('functionId', form);

  const goBack = () => {
    history.replace(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/behaviorActions`
    );
  };

  const { data: actionDetail, loading: actionLoading } = useRequest(
    () => {
      if (actionId === '_NEW_') return Promise.resolve(undefined);
      return getActionDetail(actionId);
    },
    {
      refreshDeps: [actionId]
    }
  );

  const saveAction = async () => {
    const values = await form.validate();
    saveBehaviorAction({
      ...(actionDetail || {}),
      ...buildActionDetail(values),
      ontologyModelID: +OSId
    }).then((res) => {
      Message.success({
        content: '保存成功',
        duration: 500,
        onClose: goBack
      });
    });
    console.log(values);
  };

  const { data: functionData, loading: functionLoading } = useRequest(
    () => {
      if (isNil(currentFunction)) return Promise.resolve(undefined);
      return getFunctionDetail(currentFunction);
    },
    {
      refreshDeps: [currentFunction]
    }
  );

  useEffect(() => {
    if (!actionDetail) {
      return;
    }
    form.setFieldsValue(buildActionSchema(actionDetail));
  }, [actionDetail]);

  useEffect(() => {
    form.setFieldsValue(buildFunctionSchema(functionData));
  }, [functionData]);

  const functionHasParam = !!functionData?.params?.filter(
    (p) => p.inputType === InputType.Input
  )?.length;

  return (
    <div
      className={`${styles['behavior-action-detail']} flex h-full w-full flex-col `}
    >
      <div className={`${styles['page-header']} text-default`}>
        <ProButton
          icon={<IconLeft />}
          size={'default'}
          type={'outline'}
          onClick={goBack}
        />
        {`${pageMode === 'edit' ? '编辑' : '创建'}行为`}
      </div>
      <div className={`${styles['page-body']}`}>
        <Form
          autoComplete={'off'}
          form={form}
          labelAlign={'left'}
          disabled={actionLoading}
        >
          <div className={'module-title'}>基本信息</div>
          <FormItem
            label="行为名称"
            field="name"
            required
            rules={[{ required: true, message: '请输入行为动作名称' }]}
          >
            <Input
              placeholder="请输入关键字名称"
              maxLength={50}
              showWordLimit
            />
          </FormItem>

          <FormItem
            label="行为id"
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
          <FormItem label="绑定对象类型" field="objectTypeId" required>
            <ObjectTypeSelect placeholder={'请选择绑定对象类型'} />
          </FormItem>
          <FormItem label="函数" field="functionId" required>
            <FunctionsSelect />
          </FormItem>
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.functionId !== next.functionId}
          >
            {({ functionId }) => {
              return (
                <>
                  <FormItem label="入参配置" required>
                    {isNil(functionId) ? (
                      <p className={'text-[#7D859C]'}>请先选择函数</p>
                    ) : functionHasParam ? (
                      <ParamsSetting />
                    ) : (
                      <p className={'text-[#7D859C]'}>暂无入参配置</p>
                    )}
                  </FormItem>
                  <FormItem label="校验规则" required>
                    {isNil(functionId) ? (
                      <p className={'text-[#7D859C]'}>请先选择函数</p>
                    ) : functionHasParam ? (
                      <ValidateRules />
                    ) : (
                      <p className={'text-[#7D859C]'}>暂无校验规则</p>
                    )}
                  </FormItem>
                </>
              );
            }}
          </Form.Item>
        </Form>
      </div>
      <div className={`${styles['page-footer']}`}>
        <ProButton type="primary" onClick={saveAction} loadingText="处理中...">
          确认
        </ProButton>
        <ProButton type={'outline'} onClick={goBack}>
          取消
        </ProButton>
      </div>
    </div>
  );
}
