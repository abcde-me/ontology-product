import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { Button, Form, Input, Message, Select } from '@arco-design/web-react';
import { ProButton } from '@ceai-front/arco-material';
import {
  FunctionsSelect,
  ParamsSetting,
  ValidateRules
} from '@/pages/ontologyScene/modules/behaviorActionDetail/components';
import { useHistory, useParams } from 'react-router-dom';
import { FormItem, ObjectTypeSelect } from '@/pages/ontologyScene/components';
import { useRequest } from 'ahooks';
import {
  getActionDetail,
  getActionList,
  saveBehaviorAction
} from '@/api/ontologySceneLibrary/ontologyAction';
import {
  buildActionDetail,
  buildActionSchema,
  buildFunctionSchema
} from '@/pages/ontologyScene/modules/behaviorActionDetail/utils';
import { isNil } from 'lodash-es';
import {
  getFunctionDetail,
  getFunctionList
} from '@/api/ontologySceneLibrary/ontologyFunction';
import {
  InputType,
  OntologyFunctionDetail,
  OntologyFunctionItem
} from '@/pages/ontologyScene/types/ontologyFunction';
import { IconLeft } from '@arco-design/web-react/icon';
import {
  ActionSchema,
  BehaviorActionDetail,
  BehaviorActionItem
} from '@/pages/ontologyScene/types/behaviorActions';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import { useAutoOntologyIdentifierFromName } from '@/pages/ontologyScene/hooks/useAutoOntologyIdentifierFromName';
import {
  ONTOLOGY_IDENTIFIER_EXTRA,
  ontologyIdentifierValidatorRule
} from '@/utils/ontologyIdentifier';

const { TextArea } = Input;

export default function BehaviorActionDetailPage() {
  const history = useHistory();
  const [form] = Form.useForm();
  const { id: OSId, pageMode, actionId } = useParams<Record<string, string>>();
  const currentFunction = Form.useWatch('functionId', form);
  const currentParams = Form.useWatch('function_params', form);
  const paramRules = Form.useWatch('validationRules', form);
  const behaviorName = Form.useWatch('name', form);
  const behaviorDescription = Form.useWatch('description', form);
  const objectTypeName = Form.useWatch('objectTypeName', form);

  useAutoOntologyIdentifierFromName({
    form,
    ontologyModelID: OSId ? +OSId : undefined,
    nameField: 'name',
    idField: 'code',
    enabled: pageMode === 'create'
  });

  const goBack = () => {
    history.replace(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/behaviorActions`
    );
  };

  const [currentAction, setCurrentAction] = useState<BehaviorActionDetail>();

  const { data: actionDetail, loading: actionLoading } = useRequest(
    () => {
      if (actionId === '_NEW_') return Promise.resolve(undefined);
      return getActionDetail(+actionId);
    },
    {
      refreshDeps: [actionId],
      onSuccess: setCurrentAction
    }
  );

  const saveAction = async () => {
    try {
      await Promise.all(['name', 'code'].map((f: any) => validateSameValue(f)));
      const values = await form.validate();
      saveBehaviorAction({
        ...(actionDetail || {}),
        ...buildActionDetail(values),
        ontologyModelID: +OSId
      }).then((res) => {
        if (res.message !== 'ok') {
          return Message.error({ content: res.message, duration: 3000 });
        }
        Message.success({
          content: `成功${pageMode === 'create' ? '创建' : '编辑'}行为`,
          duration: 3000
        });
        goBack();
      });
    } catch (e) {
      console.error(e);
    }
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
    if (isNil(functionData)) return;
    setCurrentAction((p) => {
      const formValues = form.getFieldsValue();
      const action = buildActionDetail(formValues);
      const outParams =
        functionData?.params?.filter((p) => p.inputType === InputType.Output) ||
        [];
      action?.params?.push(...(outParams as any));
      return {
        ...(p || {}),
        ...action
      };
    });
  }, [functionData, paramRules, currentParams]);

  const functionHasParam = !!functionData?.params?.filter(
    (p) => p.inputType === InputType.Input
  )?.length;

  // 校验是否重名,手动触发校验，减少接口请求次数
  const validateSameValue = (field: 'name' | 'code') => {
    const value = form.getFieldValue(field);
    return getActionList({
      ontologyModelID: +OSId,
      pageNum: 1,
      pageSize: 10,
      filter: value
    }).then((res) => {
      if (
        res.items?.filter(
          (item: BehaviorActionItem) =>
            item[field] === value && item.id!.toString() !== actionId
        ).length
      ) {
        const message =
          field === 'name' ? '行为名称不可重复' : '行为id不可重复';
        form.setFields({
          [field]: {
            error: {
              message
            }
          }
        });
        return Promise.reject(new Error(message));
      }
      form.setFields({
        [field]: {
          error: undefined
        }
      });
      return Promise.resolve();
    });
  };

  const changeFormValues = (changedValues: Partial<ActionSchema>) => {
    const keys = Object.keys(changedValues);
    const pass = keys.some((key) => {
      return ['function_params', 'validationRules'].some((f_v) =>
        key.includes(f_v)
      );
    });
    if (pass) return;
    form.validate(keys).then(() => {
      setCurrentAction((prevState) => {
        const res = { ...prevState };
        keys.forEach((key) => {
          res[key] = changedValues[key];
        });
        return res;
      });
    });
  };

  return (
    <div
      className={`${styles['behavior-action-detail']} flex h-full w-full flex-col `}
    >
      <div className={`${styles['page-header']} text-default`}>
        <Button
          icon={<IconLeft />}
          size={'default'}
          type={'default'}
          onClick={goBack}
        />
        {`${pageMode === 'edit' ? '编辑' : '创建'}行为`}
      </div>
      <div className={`${styles['page-body']}`}>
        <Form
          autoComplete={'off'}
          form={form}
          initialValues={{
            objectTypeId: -1
          }}
          scrollToFirstError
          labelAlign={'left'}
          disabled={actionLoading}
          onValuesChange={changeFormValues}
        >
          <div className={'module-title'}>基本信息</div>
          <FormItem
            label="行为名称"
            field="name"
            required
            rules={[
              {
                validator(v, cb) {
                  const value = v as string;
                  if (!value?.trim()) {
                    return cb('请输入行为名称');
                  }
                }
              }
            ]}
          >
            <Input
              placeholder="请输入行为名称"
              maxLength={50}
              className={'w-[640px]'}
              showWordLimit
              allowClear
              onBlur={(e) => {
                if (!!e.target.value?.trim()) validateSameValue('name');
              }}
            />
          </FormItem>

          <FormItem
            label="行为id"
            required
            field="code"
            extra={ONTOLOGY_IDENTIFIER_EXTRA}
            rules={[
              {
                validator(v, cb) {
                  const value = (v as string)?.trim();
                  if (!value) {
                    return cb('请输入行为id');
                  }
                  ontologyIdentifierValidatorRule.validator(value, cb);
                }
              }
            ]}
          >
            <Input
              placeholder="根据名称自动生成，可修改"
              disabled={pageMode === 'edit'}
              maxLength={100}
              className={'w-[640px]'}
              showWordLimit
              allowClear
              onBlur={(e) => {
                if (!!e.target.value?.trim()) validateSameValue('code');
              }}
            />
          </FormItem>

          <FormItem label="描述说明" field="description" required={false}>
            <TextArea
              placeholder="请输入描述说明"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              className={'w-[640px] break-all'}
              // className={'w-[640px]'}
              wrapperStyle={{ width: '640px' }}
              showWordLimit
            />
          </FormItem>
          <div className={'module-title'}>函数与校验</div>
          <FormItem label="绑定对象类型" field="objectTypeId">
            <ObjectTypeSelect
              getPopupContainer={(node) => node.parentElement || document.body}
              className={'w-[640px]'}
              showAll
              allowClear={false}
              ontologyModelID={+OSId}
              placeholder={'请选择行为动作作用于的对象类型'}
              onChange={(v, obj) => {
                form.setFieldValue('objectTypeId', v);
                const { id, name, icon = 'object-type-1' } = obj || {};

                changeFormValues({
                  objectTypeId: v,
                  objectTypeIcon: icon,
                  objectTypeName: name
                });
              }}
            />
          </FormItem>
          <FormItem
            label="函数"
            field="functionId"
            required
            rules={[
              {
                required: true,
                message: '请选择函数'
              }
            ]}
          >
            <FunctionsSelect
              behaviorName={behaviorName}
              behaviorDescription={behaviorDescription}
              objectTypeName={
                objectTypeName === '全局行为' ? undefined : objectTypeName
              }
              onChange={(v, f: OntologyFunctionDetail) => {
                form.setFieldValue('functionId', v);
                form.setFieldsValue(buildFunctionSchema(f));
                setCurrentAction((p) => {
                  const { name, code, content } = f || {};
                  if (isNil(p)) {
                    return {
                      functionName: name,
                      functionCode: code,
                      functionContent: content
                    };
                  }
                  return {
                    ...p,
                    functionName: name,
                    functionCode: code,
                    functionContent: content
                  };
                });
              }}
              className={'w-[640px]'}
              currentFunctionData={functionData}
            />
          </FormItem>
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.functionId !== next.functionId}
          >
            {({ functionId }) => {
              return (
                <>
                  <FormItem label="入参配置" required={!!functionId}>
                    {isNil(functionId) ? (
                      <p className={'text-[#7D859C]'}>请先选择函数</p>
                    ) : (
                      <ParamsSetting
                        actionDetail={currentAction}
                        functionDetail={functionData}
                      />
                    )}
                  </FormItem>
                  <FormItem label="校验规则" required={functionHasParam}>
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
        <PermissionWrapper
          anyPermission={[
            ONTOLOGY_PERMISSIONS.MODIFY,
            ONTOLOGY_PERMISSIONS.CREATE
          ]}
        >
          <Button type="primary" onClick={saveAction}>
            确认
          </Button>
        </PermissionWrapper>
        <Button type={'default'} onClick={goBack}>
          取消
        </Button>
      </div>
    </div>
  );
}
