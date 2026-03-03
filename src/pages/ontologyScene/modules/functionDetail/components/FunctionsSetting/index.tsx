import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  IconShrink
} from '@arco-design/web-react/icon';
import {
  Button,
  Form,
  Input,
  Message,
  ResizeBox,
  Select,
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
import { ResizeBoxWithCursorChange } from '@/pages/ontologyScene/componens';
import { isNil } from 'lodash-es';
import { buildTestFunctionData } from '@/pages/ontologyScene/modules/functionDetail/utils';
import { useParams } from 'react-router-dom';
import { UploadItem } from '@arco-design/web-react/es/Upload';
import useTestFunction from '@/pages/ontologyScene/hooks/useTestFunction';

export const FunctionsSetting = () => {
  const { form, disabled: readonly, isSubmitting } = Form.useFormContext();
  const ref = useRef(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(ref);
  const [showDoc, setShowDoc] = useState(false);

  const { id: OSid, functionId } = useParams<Record<string, string>>();

  const {
    loading: testLoading,
    startTest,
    stopTest,
    runLog: runLogInfo,
    testIng
  } = useTestFunction();
  const disabled = readonly || testIng;

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

  const handleTest = () => {
    form
      .validate()
      .then((res: Required<OntologyFunctionSchema>) => {
        const functionTest = buildTestFunctionData(res, {
          pk: functionId ? +functionId : undefined
        });
        startTest({ ...functionTest, id: +OSid });
      })
      .catch(console.error);
  };

  return (
    <div className={styles['function-setting']} ref={ref}>
      <ResizeBoxWithCursorChange
        minWidth={520}
        maxWidth={isFullscreen ? 597 : 845}
        directions={['right']}
        className={`h-full w-1/2 min-w-[520px]`}
        style={{ maxWidth: isFullscreen ? '597px' : '845px' }}
      >
        <div className={styles['left']}>
          <div className={styles['header']}>
            <div>参数配置列表</div>
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
                      <p>类型与试运行值</p>
                      <div className={'w-4'} />
                    </div>
                    {fields.map(({ field, key }, index) => {
                      return (
                        <div className={styles['params-item']} key={index}>
                          <Form.Item
                            className={`mb-0 flex-1 ${styles['param-name-item']}`}
                            field={`${field}.name`}
                            rules={getInputAndOutputRules('input')}
                            dependencies={fields.flatMap((f) =>
                              key === f.key ? [] : `${f.field}.name`
                            )}
                          >
                            <Input placeholder={''} disabled={disabled} />
                          </Form.Item>
                          <Form.Item
                            className={'mb-0 flex-1 overflow-hidden'}
                            field={`${field}.uiTypeAndValue`}
                            rules={[
                              {
                                validateTrigger: 'onFinish',
                                validator(
                                  value: OntologyFunctionParam['uiTypeAndValue'],
                                  onError
                                ) {
                                  const { uiType, paramValue } = value!;
                                  if (isNil(paramValue)) {
                                    return onError('请填写参数值');
                                  }
                                  const [dataType] = uiType!.split('_');
                                  if (dataType === ParamType.Attachment) {
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
                                }
                              }
                            ]}
                          >
                            <DataWithUiSelect disabled={disabled} />
                          </Form.Item>
                          <IconDelete
                            className={`mt-2 text-[16px] hover:cursor-pointer`}
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
                          />
                        </div>
                      );
                    })}
                    <Button
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
                    >
                      添加
                    </Button>
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
                      <p>数据类型</p>
                      <div className={'w-4'} />
                    </div>
                    {fields.map(({ field, key }, index) => {
                      return (
                        <div
                          className={`${styles['params-item']} ${styles['output-params-item']}`}
                          key={index}
                        >
                          <Form.Item
                            className={`mb-0 flex-1 ${styles['param-name-item']}`}
                            field={`${field}.name`}
                            rules={getInputAndOutputRules('output')}
                            dependencies={fields.flatMap((f) =>
                              key === f.key ? [] : `${f.field}.name`
                            )}
                          >
                            <Input placeholder={''} disabled={disabled} />
                          </Form.Item>
                          <Form.Item
                            className={`mb-0  flex-1`}
                            field={`${field}.type`}
                          >
                            <SelectWithNoData
                              placeholder={''}
                              options={OutputTypeOptions}
                              disabled={disabled}
                            />
                          </Form.Item>
                          <IconDelete
                            className={`mt-2 text-[16px] hover:cursor-pointer`}
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
                          />
                        </div>
                      );
                    })}
                    <Button
                      type={'text'}
                      icon={<IconPlus />}
                      className={'h-auto pl-0'}
                      disabled={disabled}
                      onClick={() => {
                        add({
                          name: `var_${fields.length + 1}`,
                          type: ParamType.String
                        });
                      }}
                    >
                      添加
                    </Button>
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
              <Tooltip content={'退出全屏'} position={'bottom'}>
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
            <ProButton
              icon={<IconFile />}
              size={'mini'}
              type={'outline'}
              onClick={() => {
                setShowDoc(true);
              }}
              disabled={SDKLoading}
            >
              SDK开发文档
            </ProButton>
          )}
          <Button
            icon={
              testLoading ? (
                <IconLoading />
              ) : testIng ? (
                <IconRecordStop />
              ) : (
                <IconPlayArrowFill />
              )
            }
            size={'mini'}
            onClick={testIng ? stopTest : handleTest}
            disabled={testLoading}
          >
            {testIng ? '停止运行' : '运行'}
          </Button>
        </div>
        <div className={`w-max ${styles['fullscreen-statue']}`}></div>
        <Form.Item noStyle field={'content'}>
          <FunctionScript
            className={classNames({
              'hidden-border': showDoc
            })}
            runInfo={runLogInfo}
            disabled={disabled}
            isFullscreen={isFullscreen}
          />
        </Form.Item>
      </div>
      {showDoc && (
        <ResizeBoxWithCursorChange
          directions={['left']}
          className={'h-full w-[300px] min-w-[300px] '}
          minWidth={300}
          maxWidth={isFullscreen ? 377 : 625}
          style={{ maxWidth: isFullscreen ? '377px' : '625px' }}
        >
          <div className={styles['sdk']}>
            <div className={`${styles['header']} text-[16px] `}>
              <div
                className={
                  'font-PingFangSc font-medium leading-6 text-[#0F131F]'
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
