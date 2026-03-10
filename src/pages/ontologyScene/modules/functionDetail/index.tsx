import React, { useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { Form, Input, Message } from '@arco-design/web-react';
import { ProButton } from '@ceai-front/arco-material';
import { useHistory, useParams } from 'react-router-dom';
import { FormItem } from '@/pages/ontologyScene/componens';
import { FunctionsSetting } from '@/pages/ontologyScene/modules/functionDetail/components';
import { useDebounceFn, useRequest } from 'ahooks';
import {
  DEFAULT_FUNCTION_CONTENT,
  DEFAULT_FUNCTION_SCHEMA,
  OntologyFunctionDetail,
  OntologyFunctionItem,
  OntologyFunctionParam,
  OntologyFunctionSchema,
  ParamType
} from '@/pages/ontologyScene/types/ontologyFunction';
import {
  buildFunctionDetail,
  buildFunctionSchema,
  buildPythonFunctionScript
} from '@/pages/ontologyScene/modules/functionDetail/utils';
import { isNil } from 'lodash-es';
import {
  getFunctionDetail,
  getFunctionList,
  saveFunction
} from '@/api/ontologySceneLibrary/ontologyFunction';
import { BehaviorLogItem } from '@/pages/ontologyScene/modules/behaviorLog/types';
import { IconLeft } from '@arco-design/web-react/icon';
import { usePermission } from '@/hooks';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';

const { TextArea } = Input;

export default function OSFunctionDetailPage() {
  const history = useHistory();
  const [form] = Form.useForm();
  const bodyRef = useRef<HTMLDivElement>(null);
  const {
    id: OSId,
    pageMode,
    functionId
  } = useParams<Record<string, string>>();

  const { hasAnyPermission } = usePermission();

  const { data: functionDetail, loading } = useRequest(
    () => {
      if (functionId === '_NEW_') return Promise.resolve(null);
      return getFunctionDetail(functionId);
    },
    {
      refreshDeps: [OSId, functionId]
    }
  );

  const goBack = () => {
    history.replace(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/functions`
    );
  };

  // 提交数据时忽略掉入参的value以及类型，因为类型一定会有值，value只在测试的时候才校验
  const validateBeforeSave = async (data: OntologyFunctionSchema) => {
    const fields = ['code', 'name', 'output'];
    data.input?.forEach((param, i) => {
      fields.push(`input[${i}].name`);
    });
    return form.validate(fields);
  };

  const saveAction = async () => {
    try {
      const allValues: OntologyFunctionSchema = form.getFieldsValue();
      await validateBeforeSave(allValues);
      const res = await saveFunction({
        ...(functionDetail || {}),
        ...buildFunctionDetail(allValues),
        ontologyModelID: +OSId
      });
      if (res.message !== 'ok') {
        Message.error({ content: res.message, duration: 500 });
        return;
      }
      Message.success({
        content: `成功${pageMode === 'edit' ? '编辑' : '创建'}函数`,
        duration: 500,
        onClose() {
          goBack();
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!functionDetail) {
      form.setFieldsValue(DEFAULT_FUNCTION_SCHEMA);
      return;
    }
    form.setFieldsValue(buildFunctionSchema(functionDetail));
  }, [functionDetail]);

  const getParamNames = () => {
    const { input, output } = form.getFieldsValue(['input', 'output']);
    // 默认校验code
    const validateFields = ['code'];
    const fields = (input as OntologyFunctionParam[])
      .map((p, i) => {
        return `input[${i}].name`;
      })
      .concat(
        (output as OntologyFunctionParam[]).map((p, i) => {
          return `output[${i}].name`;
        })
      );
    // 没有出入参时，无需遍历name
    return validateFields.concat(fields);
  };

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
        {`${pageMode === 'edit' ? '编辑' : '创建'}函数`}
      </div>
      <div className={`${styles['page-body']}`} ref={bodyRef}>
        <Form
          autoComplete={'off'}
          form={form}
          disabled={loading}
          labelAlign={'left'}
          className={`overflow-auto ${styles['function-form']}`}
          onValuesChange={(c, values) => {
            // 只有参数或函数id改变时，再去校验数据合法性构建py代码
            const aboutPyCode = ['name', 'content'].some((f) => f in c);
            if (aboutPyCode) return;
            // 触发表单校验
            form
              .validate(getParamNames())
              .then((res) => {
                // 参数合法，构建py代码
                form.setFieldsValue({
                  content: buildPythonFunctionScript(values as any)
                });
              })
              .catch(console.error);
          }}
        >
          <div className={'module-title'}>基本信息</div>
          <FormItem
            label="显示名称"
            field="name"
            tooltip={'在界面上的中文展示名称，方便业务人员阅读与识别'}
            required
            extra={
              '支持中文、英文、数字、下划线，2～50字符，不可与已有名称重复'
            }
            rules={[
              {
                validator(v, onError) {
                  const value = v as string;
                  if (isNil(value) || !value.trim()) {
                    return onError('请输入名称');
                  }
                  // 中文、英文、数字、下划线
                  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(value)) {
                    return onError('请输入正确的名称');
                  }
                  if (value.trim().length < 2) {
                    return onError('显示名称至少2字符');
                  }
                  return getFunctionList({
                    ontologyModelID: +OSId,
                    pageNum: 1,
                    pageSize: 10,
                    filter: value
                  }).then((res) => {
                    if (
                      res.items?.filter(
                        (item: OntologyFunctionItem) =>
                          item.name === value &&
                          item.id!.toString() !== functionId
                      ).length
                    ) {
                      onError('显示名称不可重复');
                    }
                  });
                }
              }
            ]}
          >
            <Input
              placeholder="请输入函数名称用于在界面上展示，如关联推理"
              maxLength={50}
              showWordLimit
            />
          </FormItem>
          <FormItem
            label="函数名称(id)"
            field="code"
            tooltip={'函数名称将作为本体语义下的唯一标识'}
            required
            extra={'支持英文、数字、下划线，2～100字符，不可与已有名称重复'}
            rules={[
              {
                validator(v, onError) {
                  const value = v as string;
                  if (isNil(v) || !value.trim()) {
                    return onError('请输入函数名称');
                  }
                  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    return onError(
                      '函数名称(id)格式错误，仅支持英文、数字、下划线'
                    );
                  }
                  if (value.trim().length < 2) {
                    return onError('函数名称至少2字符');
                  }
                  return getFunctionList({
                    ontologyModelID: +OSId,
                    pageNum: 1,
                    pageSize: 10,
                    filter: value
                  }).then((res) => {
                    if (
                      res.items?.filter(
                        (item: OntologyFunctionItem) =>
                          item.code === value &&
                          item.id!.toString() !== functionId
                      ).length
                    ) {
                      onError('函数名称(id)不可重复');
                      return Promise.resolve();
                    }
                  });
                }
              }
            ]}
          >
            <Input
              placeholder="请输入id用于唯一标识符，如infer_affiliation"
              maxLength={100}
              showWordLimit
              disabled={pageMode === 'edit'}
            />
          </FormItem>

          <FormItem label="描述说明" field="description" required={false}>
            <TextArea
              placeholder="请输入描述说明"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showWordLimit
            />
          </FormItem>
          <div className={styles['params-setting-container']}>
            <div className={'module-title'}>函数配置与校验</div>
            <FormItem
              wrapperCol={{ span: 24 }}
              className={`flex-1 ${styles['function']}`}
              onClick={() => {
                if (!bodyRef?.current) return;
                bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
              }}
            >
              <FunctionsSetting disabled={!!functionDetail?.boundAction} />
            </FormItem>
          </div>
        </Form>
      </div>
      <div className={`${styles['page-footer']}`}>
        <PermissionWrapper
          anyPermission={[
            ONTOLOGY_PERMISSIONS.MODIFY,
            ONTOLOGY_PERMISSIONS.CREATE
          ]}
        >
          <ProButton
            type="primary"
            onClick={saveAction}
            loadingText="处理中..."
          >
            确认
          </ProButton>
        </PermissionWrapper>
        <ProButton type={'outline'} onClick={() => history.goBack()}>
          取消
        </ProButton>
      </div>
    </div>
  );
}
