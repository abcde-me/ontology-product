import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.scss';
import { ProButton } from '@ceai-front/arco-material';
import {
  IconClose,
  IconDelete,
  IconExpand,
  IconFile,
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
  OutputTypeOptions,
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import classNames from 'classnames';
import { getFunctionSDK } from '@/api/ontologySceneLibrary/ontologyFunction';
import { ResizeBoxWithCursorChange } from '@/pages/ontologyScene/componens';
import { isNil } from 'lodash-es';

export const FunctionsSetting = () => {
  const { form, disabled: readonly, isSubmitting } = Form.useFormContext();
  const ref = useRef(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(ref);
  const [showDoc, setShowDoc] = useState(false);
  const [testIng, setTestIng] = useState(false);

  const disabled = readonly || testIng;

  const inputParams: OntologyFunctionParam[] = Form.useWatch('input', form);

  const testAble = useMemo(() => {
    return inputParams?.every(
      ({ uiTypeAndValue }) => !isNil(uiTypeAndValue?.paramValue)
    );
  }, [inputParams]);

  const { data: content, loading: SDKLoading } = useRequest(() => {
    return getFunctionSDK();
  });

  const getInputAndOutputRules = (field: 'input' | 'output') => {
    return [
      {
        validator(v, onInValid) {
          if (!v) {
            return;
          }
          const sameKey = form
            .getFieldValue(field)
            .filter(({ name }) => name === v);
          if (sameKey.length > 1) {
            onInValid('参数名重复');
            return;
          }
        }
      }
    ];
  };

  const handleTest = () => {
    Message.success('开始测试');
    setTestIng(true);
  };
  const handleStopTest = () => {
    setTimeout(() => {
      setTestIng(false);
    }, 2000);
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
                            className={'mb-0 flex-1'}
                            field={`${field}.uiTypeAndValue`}
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
                            <Input placeholder={''} />
                          </Form.Item>
                          <Form.Item
                            className={`mb-0  flex-1`}
                            field={`${field}.type`}
                          >
                            <SelectWithNoData
                              placeholder={''}
                              options={OutputTypeOptions}
                            />
                          </Form.Item>
                          <IconDelete
                            className={`mt-2 text-[16px] hover:cursor-pointer`}
                            onClick={() => {
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
            icon={testIng ? <IconRecordStop /> : <IconPlayArrowFill />}
            size={'mini'}
            disabled={!testAble}
            onClick={testIng ? handleStopTest : handleTest}
          >
            {testIng ? '停止运行' : '运行'}
          </Button>
        </div>
        <div className={`w-max ${styles['fullscreen-statue']}`}></div>
        <Form.Item noStyle field={'content'}>
          <FunctionScript />
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
