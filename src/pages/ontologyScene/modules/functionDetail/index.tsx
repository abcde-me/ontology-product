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

  const { data: functionDetail, loading } = useRequest(
    () => {
      if (functionId === '_NEW_') return Promise.resolve(null);
      return getFunctionDetail(functionId).then((res) => {
        return res.data || null;
      });
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

  const saveAction = async () => {
    try {
      const values: OntologyFunctionSchema = await form.validate();
      await saveFunction({
        ...(functionDetail || {}),
        ...buildFunctionDetail(values),
        ontologyModelID: +OSId
      });
      Message.success({
        content: '保存成功',
        duration: 0.5,
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

  return (
    <div
      className={`${styles['behavior-action-detail']} flex h-full w-full flex-col `}
    >
      <div className={`${styles['page-header']} text-default`}>
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
            if ('content' in c) return;
            form.validate().then((res) => {
              form.setFieldsValue({
                content: buildPythonFunctionScript(res)
              });
            });
          }}
        >
          <div className={'module-title'}>基本信息</div>
          <FormItem
            label="显示名称"
            field="name"
            tooltip={'在界面上的中文展示名称，方便业务人员阅读与识别'}
            required
            extra={
              '支持中文、英文、数字、下划线，2～32字符，不可与已有名称重复'
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
                  getFunctionList({
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
                      onError('显示名称已存在');
                    }
                  });
                }
              }
            ]}
          >
            <Input
              placeholder="请输入函数名称用于在界面上展示，如关联推理"
              maxLength={32}
              showWordLimit
            />
          </FormItem>
          <FormItem
            label="函数名称(id)"
            field="code"
            tooltip={'函数名称将作为本体语义下的唯一标识'}
            required
            extra={'支持英文、数字、下划线，2～32字符，不可与已有名称重复'}
            rules={[
              {
                validator(v, onError) {
                  const value = v as string;
                  if (isNil(v) || !value.trim()) {
                    return onError('请输入函数名称');
                  }
                  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    return onError('请输入正确的函数名称');
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
                      onError('函数名称(id)已存在');
                      return Promise.resolve();
                    }
                  });
                }
              }
            ]}
          >
            <Input
              placeholder="请输入id用于唯一标识符，如infer_affiliation"
              maxLength={32}
              showWordLimit
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
              <FunctionsSetting />
            </FormItem>
          </div>
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
