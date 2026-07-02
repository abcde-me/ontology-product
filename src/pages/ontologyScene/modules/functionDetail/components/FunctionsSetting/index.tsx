import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  ensureFunctionObjectTypeMetadata,
  isDatasetEmptyTableSqlError
} from '@/pages/ontologyScene/modules/functionDetail/services/ensureFunctionObjectTypeMetadata';
import { fetchSceneObjectTypeQueryProfiles } from '@/pages/ontologyScene/modules/functionDetail/services/fetchSceneOntologyContext';
import { sanitizeOntologyFunctionRuntimeApi } from '@/pages/ontologyScene/modules/functionDetail/services/sanitizeOntologyFunctionRuntimeApi';
import { stripQueryObjectsWhere } from '@/pages/ontologyScene/modules/functionDetail/services/stripQueryObjectsWhere';
import {
  fixOntologyFunctionCode,
  type FixedOntologyFunctionCode
} from '@/pages/ontologyScene/modules/functionDetail/services/fixOntologyFunctionCode';
import styles from './index.module.scss';
import { ProButton } from '@ceai-front/arco-material';
import {
  IconClose,
  IconDelete,
  IconExpand,
  IconFile,
  IconLoading,
  IconPlayArrowFill,
  IconPlus,
  IconRecordStop,
  IconShrink,
  IconToLeft,
  IconToRight
} from '@arco-design/web-react/icon';
import {
  Button,
  Form,
  FormItemProps,
  Input,
  Message,
  Tooltip
} from '@arco-design/web-react';
import { SelectWithNoData } from '@/components/new-no-data-comps';
import { useFullscreen, useRequest } from 'ahooks';
import {
  DataWithUiSelect,
  FunctionScript,
  SdkDocumentation
} from '@/pages/ontologyScene/modules/functionDetail/components';
import {
  OntologyFunctionParam,
  OntologyFunctionSchema,
  OutputTypeOptions,
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import classNames from 'classnames';
import { getFunctionSDK } from '@/api/ontologySceneLibrary/ontologyFunction';
import {
  FormItem,
  ObjInsValue,
  ResizeBoxWithCursorChange
} from '@/pages/ontologyScene/components';
import { buildTestFunctionData } from '@/pages/ontologyScene/modules/functionDetail/utils';
import { useParams } from 'react-router-dom';
import { UploadItem } from '@arco-design/web-react/es/Upload';
import useTestFunction from '@/pages/ontologyScene/hooks/useTestFunction';
import { isNil } from 'lodash-es';

const CompWithTooltip = (Comp: React.FC<any>) => {
  return ({ content, ...other }) => (
    <Tooltip
      content={content}
      getPopupContainer={() => {
        return (
          document.querySelector('#functionSettingContainer') || document.body
        );
      }}
    >
      <Comp {...other} />
    </Tooltip>
  );
};

const FormItemWithTooltip = CompWithTooltip(Form.Item);

const ButtonWithTooltip = CompWithTooltip(Button);

const DivWithTooltip = CompWithTooltip((props) => {
  return <div {...props} />;
});

export const FunctionsSetting = (props: {
  disabled: boolean;
  extra?: React.ReactNode;
}) => {
  const { form, disabled: readonly, isSubmitting } = Form.useFormContext();
  const functionCode = Form.useWatch('code', form);
  const ref = useRef<HTMLDivElement>(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(ref);
  const [showDoc, setShowDoc] = useState(false);
  const { id: OSid, functionId } = useParams<Record<string, string>>();

  const [dropTriggerClass, setDropTriggerClass] = useState({
    left: '',
    right: ''
  });
  const functionScriptRef = useRef();
  const smartFixAbortRef = useRef<AbortController | null>(null);

  const {
    startTest,
    stopTest,
    runLog: runLogInfo,
    testIng
  } = useTestFunction();

  const [closeParamsSetting, setCloseParamsSetting] = useState(false);
  const [smartFixing, setSmartFixing] = useState(false);
  const [fixResult, setFixResult] = useState<Pick<
    FixedOntologyFunctionCode,
    'changeSummary' | 'changeDetails'
  > | null>(null);

  const disabled = readonly || testIng || props.disabled;

  const { data: content, loading: SDKLoading } = useRequest(() => {
    return getFunctionSDK();
  });

  const getInputAndOutputRules = (field: 'input' | 'output') => {
    return [
      {
        validator(v, onInValid) {
          if (!v) {
            return onInValid('请输入参数名称');
          }
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) {
            return onInValid('请输入正确的参数名称');
          }
          const sameKey = form
            .getFieldValue(field)
            .filter(({ name }) => name === v);
          if (sameKey.length > 1) {
            return onInValid('参数名重复');
          }
        }
      }
    ];
  };

  const currentRunLog =
    runLogInfo?.runLog?.map((item) => item.run_log).join('\n') || '';

  const handleTest = async () => {
    setFixResult(null);

    try {
      const res = (await form.validate()) as Required<OntologyFunctionSchema>;

      const queryProfiles = await fetchSceneObjectTypeQueryProfiles(+OSid);
      let runtimeSanitized = sanitizeOntologyFunctionRuntimeApi(
        String(res.content ?? ''),
        { queryProfiles }
      );
      let sanitizedContent = runtimeSanitized.content;

      // 最终兜底：只要函数使用了 query_objects，就彻底剥离 where（后端 where 不可用）
      if (/query_objects/i.test(sanitizedContent)) {
        const finalStrip = stripQueryObjectsWhere(sanitizedContent);
        if (finalStrip.changed) {
          sanitizedContent = finalStrip.content;
          runtimeSanitized = {
            ...runtimeSanitized,
            content: sanitizedContent,
            changed: true,
            notes: [...runtimeSanitized.notes, ...finalStrip.notes]
          };
        }
      }

      const testPayload = { ...res, content: sanitizedContent };

      if (runtimeSanitized.changed) {
        form.setFieldValue('content', sanitizedContent);
        Message.info(
          runtimeSanitized.notes[0] ||
            '已校正 query_objects 调用（含 select 字段或改写 ObjectRef.Type），正在测试'
        );
      }

      Message.loading({
        content: '正在检查并准备 dataset 实例同步环境…',
        duration: 0
      });

      const metadataCheck = await ensureFunctionObjectTypeMetadata(
        +OSid,
        String(testPayload.content ?? ''),
        testPayload.input || []
      );

      Message.clear();

      if (!metadataCheck.ready) {
        Message.error(metadataCheck.message || '函数执行环境未就绪');
        return;
      }

      if (metadataCheck.syncTriggered && metadataCheck.message) {
        Message.success(metadataCheck.message);
      }

      const functionTest = buildTestFunctionData(testPayload, {
        pk: functionId ? +functionId : undefined
      });
      startTest({ ...functionTest, id: +OSid });
    } catch (error) {
      Message.clear();
      console.error(error);
      setCloseParamsSetting(false);
    }
  };

  const handleSmartFix = async () => {
    if (props.disabled) {
      Message.warning('该函数已被行为绑定，不可智能修改');
      return;
    }

    const values = form.getFieldsValue() as OntologyFunctionSchema;
    const functionCodeValue = String(values.code ?? '').trim();
    const content = String(values.content ?? '').trim();

    if (!functionCodeValue) {
      Message.warning('请先填写函数名称(id)');
      return;
    }
    if (!content) {
      Message.warning('函数代码为空，无法智能修改');
      return;
    }
    if (!currentRunLog) {
      Message.warning('暂无运行报错信息');
      return;
    }

    smartFixAbortRef.current?.abort();
    const controller = new AbortController();
    smartFixAbortRef.current = controller;
    setSmartFixing(true);

    try {
      const fixed = await fixOntologyFunctionCode({
        name: values.name,
        code: functionCodeValue,
        description: values.description,
        input: values.input || [],
        output: values.output || [],
        content,
        errorLog: currentRunLog,
        sceneId: +OSid,
        signal: controller.signal
      });

      form.setFieldsValue({
        input: fixed.input,
        output: fixed.output,
        content: fixed.content
      });
      setFixResult({
        changeSummary: fixed.changeSummary,
        changeDetails: fixed.changeDetails
      });
      Message.success(
        '已根据报错信息与当前场景库本体结构完成智能修改，请查看修改说明后重新运行'
      );
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        return;
      }
      Message.error(
        (error as Error)?.message || '智能修改函数代码失败，请稍后重试'
      );
    } finally {
      setSmartFixing(false);
    }
  };

  useEffect(() => {
    return () => {
      smartFixAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (runLogInfo?.run_status !== 3 || !currentRunLog) {
      return;
    }

    if (isDatasetEmptyTableSqlError(currentRunLog)) {
      Message.warning(
        'query_objects 查询失败：对象类型尚未在 dataset 注册物理表（SQL Error 1064）。请前往场景库「对象类型」列表，对引用类型执行「配置实例同步」，待同步成功后再测试'
      );
    }
  }, [runLogInfo?.run_status, currentRunLog]);

  const getPopoverContainer = () => {
    return isFullscreen ? ref.current || document.body : document.body;
  };

  useEffect(() => {
    Message.config({
      getContainer() {
        return isFullscreen ? ref.current || document.body : document.body;
      }
    });
  }, [isFullscreen]);

  return (
    <div
      className={styles['function-setting']}
      ref={ref}
      id={'functionSettingContainer'}
    >
      {closeParamsSetting && (
        <div
          className={styles['close-params-setting']}
          onClick={() => {
            setCloseParamsSetting(false);
          }}
        >
          <IconToRight />
          <div>参数配置列表</div>
        </div>
      )}
      <ResizeBoxWithCursorChange
        minWidth={600}
        directions={['right']}
        className={`h-full w-1/2  ${closeParamsSetting ? 'hidden' : ''}`}
        style={{
          minWidth: '540px'
        }}
        triggerClassName={dropTriggerClass.left}
        onMovingEnd={() => {
          // @ts-ignore
          const funcW = functionScriptRef.current?.getWidth();
          setDropTriggerClass((p) => ({
            ...p,
            left: funcW <= 295 ? styles['left-max'] : ''
          }));
        }}
      >
        <div className={styles['left']}>
          <div className={styles['header']}>
            <div>参数配置列表</div>
            <IconToLeft
              className={'cursor-pointer'}
              onClick={() => {
                setCloseParamsSetting(true);
              }}
            />
          </div>
          <div className={styles['body']}>
            <Form.List field={'input'}>
              {(fields, { add, remove }) => {
                return (
                  <>
                    <div
                      className={styles['params-item']}
                      style={{
                        borderBottom: '1px solid #DFE2EB',
                        marginBottom: '8px'
                      }}
                    >
                      <p className={styles['param-name-item']}>入参名称</p>
                      <p className={styles['param-value-item']}>
                        类型与试运行值（运行请输入）
                      </p>
                      <div className={'w-4 flex-shrink-0'} />
                    </div>
                    {fields.map(({ field, key }, index) => {
                      return (
                        <div className={styles['params-item']} key={index}>
                          <FormItemWithTooltip
                            content={
                              props.disabled
                                ? '该函数已被行为绑定，不可修改'
                                : ''
                            }
                            className={`mb-0 ${styles['param-name-item']}`}
                            field={`${field}.name`}
                            rules={getInputAndOutputRules('input')}
                            dependencies={fields.flatMap((f) =>
                              key === f.key ? [] : `${f.field}.name`
                            )}
                          >
                            <Input
                              placeholder={''}
                              disabled={disabled}
                              maxLength={100}
                              showWordLimit
                              className={`overflow-ellipsis whitespace-nowrap ${styles['param-name-input']}`}
                            />
                          </FormItemWithTooltip>
                          <Form.Item
                            className={`mb-0 overflow-hidden ${styles['param-value-item']}`}
                            field={`${field}.uiTypeAndValue`}
                            rules={[
                              {
                                validateTrigger: 'onFinish',
                                validator(
                                  value: OntologyFunctionParam['uiTypeAndValue'],
                                  onError
                                ) {
                                  const { uiType, paramValue } = value!;
                                  if (!paramValue) {
                                    return onError('请填写参数值');
                                  }
                                  const [dataType] = uiType!.split('_');
                                  if (dataType === ParamType.Attachment) {
                                    const files = paramValue as UploadItem[];
                                    if (!files.length) {
                                      return onError('请选择文件');
                                    }
                                    if (
                                      (paramValue as UploadItem[]).some(
                                        ({ status }) => status === 'error'
                                      )
                                    ) {
                                      onError('文件上传失败，请重新上传');
                                      return;
                                    }
                                    if (
                                      (paramValue as UploadItem[]).some(
                                        ({ status }) => status !== 'done'
                                      )
                                    ) {
                                      onError('文件正在上传，请稍候');
                                      return;
                                    }
                                  }
                                  if (
                                    [
                                      ParamType.ObjectSet,
                                      ParamType.ObjectOne
                                    ].includes(dataType as ParamType)
                                  ) {
                                    const { objInsID } =
                                      paramValue as ObjInsValue;
                                    if (
                                      isNil(objInsID) ||
                                      (Array.isArray(objInsID) &&
                                        !objInsID.length)
                                    ) {
                                      return onError('请选择对象实例');
                                    }
                                  }
                                }
                              }
                            ]}
                          >
                            <DataWithUiSelect
                              readonly={props.disabled}
                              disabledConfig={{
                                // 数据类型选择框跟随禁用状态
                                uiType: disabled,
                                // 数据值填写组件只有在测试中禁用，其他时间保持可用状态
                                paramValue: testIng
                              }}
                              onParamValueChange={(v) => {
                                form.setFields({
                                  [`${field}.uiTypeAndValue`]: {
                                    error: undefined
                                  }
                                });
                              }}
                              getPopupContainer={getPopoverContainer}
                            />
                          </Form.Item>
                          {/*记录id但是不展示*/}
                          <Form.Item className={'hidden'} field={`${field}.id`}>
                            <Input />
                          </Form.Item>
                          <ButtonWithTooltip
                            content={
                              props.disabled
                                ? '该函数已被行为绑定，不可删除'
                                : ''
                            }
                            type={'text'}
                            className={styles['del-field']}
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;
                              remove(index);
                              setTimeout(() => {
                                form
                                  .validate(
                                    fields.map(({ field }) => `${field}.name`)
                                  )
                                  .catch(console.error);
                              }, 0);
                            }}
                            icon={<IconDelete className={`mt-2 text-[16px]`} />}
                          />
                        </div>
                      );
                    })}
                    <ButtonWithTooltip
                      type={'text'}
                      icon={<IconPlus />}
                      className={'h-auto pl-0'}
                      disabled={disabled}
                      onClick={() =>
                        add({
                          name: `arg${fields.length + 1}`,
                          uiTypeAndValue: {
                            uiType: `${ParamType.String}_${UiType.Input}`
                          }
                        })
                      }
                      content={
                        props.disabled ? '该函数已被行为绑定，不可添加' : ''
                      }
                    >
                      添加
                    </ButtonWithTooltip>
                  </>
                );
              }}
            </Form.List>
            <div className={'py-4 pr-6'}>
              <div className={'h-[1px] bg-[#EBEEF5]'} />
            </div>
            <Form.List field={'output'}>
              {(fields, { add, remove }) => {
                return (
                  <>
                    <div
                      className={`${styles['params-item']}`}
                      style={{
                        borderBottom: '1px solid #DFE2EB',
                        marginBottom: '8px'
                      }}
                    >
                      <p className={styles['param-name-item']}>出参名称</p>
                      <p className={styles['param-value-item']}>数据类型</p>
                      <div className={'w-4 flex-shrink-0'} />
                    </div>
                    {fields.map(({ field, key }, index) => {
                      return (
                        <div
                          className={`${styles['params-item']} ${styles['output-params-item']}`}
                          key={index}
                        >
                          <FormItemWithTooltip
                            content={
                              props.disabled
                                ? '该函数已被行为绑定，不可修改'
                                : ''
                            }
                            className={`mb-0 mr-2 flex-1 ${styles['param-name-item']}`}
                            field={`${field}.name`}
                            rules={getInputAndOutputRules('output')}
                            dependencies={fields.flatMap((f) =>
                              key === f.key ? [] : `${f.field}.name`
                            )}
                          >
                            <Input
                              placeholder={''}
                              disabled={disabled}
                              maxLength={100}
                              showWordLimit
                              className={styles['param-name-input']}
                            />
                          </FormItemWithTooltip>
                          <FormItemWithTooltip
                            content={
                              props.disabled
                                ? '该函数已被行为绑定，不可修改'
                                : ''
                            }
                            className={`mb-0  mr-2 min-w-[400px] flex-1`}
                            field={`${field}.type`}
                          >
                            <SelectWithNoData
                              placeholder={''}
                              options={OutputTypeOptions}
                              disabled={disabled}
                              getPopupContainer={getPopoverContainer}
                            />
                          </FormItemWithTooltip>
                          {/*记录id但是不展示*/}
                          <Form.Item className={'hidden'} field={`${field}.id`}>
                            <Input />
                          </Form.Item>
                          <ButtonWithTooltip
                            content={
                              props.disabled
                                ? '该函数已被行为绑定，不可删除'
                                : ''
                            }
                            type={'text'}
                            className={styles['del-field']}
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;
                              remove(index);
                              setTimeout(() => {
                                form
                                  .validate(
                                    fields.map(({ field }) => `${field}.name`)
                                  )
                                  .catch(console.error);
                              }, 0);
                            }}
                            icon={<IconDelete className={`mt-2 text-[16px]`} />}
                          />
                        </div>
                      );
                    })}
                    <Tooltip>
                      <ButtonWithTooltip
                        content={
                          props.disabled ? '该函数已被行为绑定，不可添加' : ''
                        }
                        type={'text'}
                        icon={<IconPlus />}
                        className={'h-auto pl-0'}
                        disabled={disabled}
                        onClick={() => {
                          add({
                            name: `var_${fields.length + 1}`,
                            type: ParamType.Float
                          });
                        }}
                      >
                        添加
                      </ButtonWithTooltip>
                    </Tooltip>
                  </>
                );
              }}
            </Form.List>
          </div>
        </div>
      </ResizeBoxWithCursorChange>
      <div
        className={classNames({
          [styles['right']]: true,
          [styles['show-sdk']]: showDoc
        })}
      >
        <div className={styles['header']}>
          <div className={styles['full-screen']}>
            {isFullscreen ? (
              <Tooltip
                content={'退出全屏'}
                position={'bottom'}
                getPopupContainer={() => {
                  return ref.current || document.body;
                }}
              >
                <IconShrink
                  onClick={() => exitFullscreen()}
                  className={'hover:cursor-pointer'}
                />
              </Tooltip>
            ) : (
              <Tooltip content={'全屏'}>
                <IconExpand
                  className={'hover:cursor-pointer'}
                  onClick={() => enterFullscreen()}
                />
              </Tooltip>
            )}
          </div>
          {!showDoc && (
            <Button
              icon={<IconFile />}
              size={'mini'}
              type={'default'}
              className={'flex items-center gap-1'}
              onClick={() => {
                setShowDoc(true);
              }}
              disabled={SDKLoading}
            >
              <p className={'text-[14px] font-[500]'}>SDK开发文档</p>
            </Button>
          )}
          <Button
            icon={testIng ? <IconRecordStop /> : <IconPlayArrowFill />}
            size={'mini'}
            onClick={testIng ? stopTest : handleTest}
            type={'outline'}
          >
            {testIng ? '停止测试' : '测试'}
          </Button>
        </div>
        <FormItemWithTooltip
          content={props.disabled ? '该函数已被行为绑定，不可修改' : ''}
          field={'content'}
          className={'mb-0 flex-1 overflow-hidden'}
        >
          <FunctionScript
            className={classNames({
              'hidden-border': showDoc
            })}
            functionCode={functionCode}
            ref={functionScriptRef}
            runInfo={runLogInfo}
            disabled={disabled}
            isFullscreen={isFullscreen}
            smartFixing={smartFixing}
            fixResult={fixResult}
            onSmartFix={handleSmartFix}
          />
        </FormItemWithTooltip>
      </div>
      {showDoc && (
        <ResizeBoxWithCursorChange
          directions={['left']}
          className={'h-full w-[300px] min-w-[300px] '}
          minWidth={300}
          style={{
            minWidth: '300px'
          }}
          triggerClassName={classNames([
            styles['resize-box-trigger'],
            dropTriggerClass.right
          ])}
          onMovingEnd={() => {
            // @ts-ignore
            const funcW = functionScriptRef.current?.getWidth();
            setDropTriggerClass((p) => ({
              ...p,
              right: funcW <= 295 ? styles['right-max'] : ''
            }));
          }}
        >
          <div className={styles['sdk']}>
            <div className={`${styles['header']} text-[16px] `}>
              <div
                className={
                  'font-PingFangSc text-[14px] font-[500] leading-6 text-[#0F131F]'
                }
              >
                SDK开发文档
              </div>
              <IconClose
                className={'hover:cursor-pointer'}
                onClick={() => setShowDoc(false)}
              />
            </div>
            <SdkDocumentation content={content} />
          </div>
        </ResizeBoxWithCursorChange>
      )}
    </div>
  );
};
