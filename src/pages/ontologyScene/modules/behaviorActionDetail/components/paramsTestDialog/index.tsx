import React, { ComponentProps, useCallback } from 'react';
import { Form, Modal } from '@arco-design/web-react';
import styles from '././index.module.scss';
import {
  DotStatus,
  NoDataCard as AANoDataCard,
  ProButton
} from '@ceai-front/arco-material';
import { IconLoading, IconPlayArrowFill } from '@arco-design/web-react/icon';
import {
  BehaviorActionDetail,
  EnumRule,
  OntologyActionParam,
  RangeRule,
  RuleName,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import {
  buildActionTestItem,
  renderComponentByUiType
} from '@/pages/ontologyScene/utils';
import {
  InputType,
  OntologyFunctionDetail,
  ParamType,
  TestFunction,
  TestFunctionItem,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import { isNil } from 'lodash-es';
import useTestFunction from '@/pages/ontologyScene/hooks/useTestFunction';
import { useParams } from 'react-router-dom';
import { FormItem, ObjInsValue } from '@/pages/ontologyScene/componens';
import { UploadItem } from '@arco-design/web-react/es/Upload';

interface IProps {
  visible: boolean;
  data: OntologyActionParam[];
  onOk?: () => void;
  onClose: () => void;
  validateRules: ValidateRule[];
  actionData: BehaviorActionDetail;
  functionData?: OntologyFunctionDetail;
}

const NoDataCard = (props: ComponentProps<typeof AANoDataCard>) => {
  return (
    <div className={styles['no-data-card']}>
      <AANoDataCard {...props} />
    </div>
  );
};

export const ParamsTestDialog = (props: IProps) => {
  const { data, visible, onClose, validateRules, actionData, functionData } =
    props;
  const [form] = Form.useForm();
  const { id: OSId } = useParams<Record<string, string>>();
  const field2Rule = actionData.params?.reduce((p, c) => {
    const { validationRule, enabledValidation, name } = c;
    const {
      ruleConfig,
      ruleName: rule_name,
      failMessage
    } = validationRule || {};
    if (enabledValidation) {
      p[name] = [
        {
          validator(value, onError) {
            if (isNil(value)) {
              return onError(`请输入参数值`);
            }
            switch (rule_name) {
              case RuleName.RangeRule:
                if (
                  value < (ruleConfig as RangeRule).minValue ||
                  value > (ruleConfig as RangeRule).maxValue
                ) {
                  onError(failMessage);
                }
                break;
              case RuleName.LengthRule:
                const length = value.trim().length;
                if (
                  length < (ruleConfig as RangeRule).minValue ||
                  length > (ruleConfig as RangeRule).maxValue
                ) {
                  onError(failMessage);
                }
                break;
              default:
                if (!(ruleConfig as EnumRule).options.includes(value)) {
                  onError(failMessage);
                }
                break;
            }
          }
        }
      ];
    }
    return p;
  }, {});

  const getOtherFieldRules = (uiType: UiType) => {
    return [
      {
        validator(v, onError) {
          if (!v) {
            return onError(`请输入参数值`);
          }
          if (uiType === UiType.Uploader) {
            const files = v as UploadItem[];
            if (!files.length) {
              return onError('请选择文件');
            }
            if (files.some(({ status }) => status === 'error')) {
              onError('文件上传失败，请重新上传');
              return;
            }
            if (files.some(({ status }) => status !== 'done')) {
              onError('文件正在上传，请稍候');
              return;
            }
          }
          if ([UiType.ObjectSet, UiType.ObjectOne].includes(uiType)) {
            const { objInsID } = v as ObjInsValue;
            if (
              isNil(objInsID) ||
              (Array.isArray(objInsID) && !objInsID.length)
            ) {
              return onError('请选择对象实例');
            }
          }
        }
      }
    ];
  };
  const {
    runLog: runInfo,
    testIng,
    loading,
    startTest,
    clear
  } = useTestFunction();
  const testAction = useCallback(() => {
    const { functionCode, code } = props.actionData;
    form
      .validate()
      .then((res) => {
        startTest({
          list_data: [buildActionTestItem(props.actionData, res)],
          target: [code!],
          id: +OSId,
          run_action_with_validate: true,
          run_type: 'action'
        });
      })
      .catch(console.error);
  }, [props.actionData]);

  const closeModal = () => {
    form.resetFields();
    clear();
    onClose();
  };

  const functionHasParam = !!functionData?.params?.filter(
    (p) => p.inputType === InputType.Input
  )?.length;

  const currentRunLog =
    runInfo?.runLog?.map((item, index) => item.run_log).join('\n') || '';

  const renderRunLog = () => {
    // 初始为0
    if (!runInfo.run_status) {
      return (
        <NoDataCard
          type={'block'}
          title={!functionHasParam ? '函数无入参配置' : '请先在左侧配置参数'}
        />
      );
    }
    if (testIng || loading) {
      return <NoDataCard type={'block'} title={'行为测试中...'} />;
    }
    return <pre className={styles['run-log']}>{currentRunLog}</pre>;
  };

  return (
    <Modal
      title={'参数测试'}
      footer={null}
      visible={visible}
      style={{ width: '900px', height: '600px' }}
      className={styles['params-dialog']}
      getChildrenPopupContainer={(node) => node.parentElement || document.body}
      onCancel={closeModal}
      afterClose={form.resetFields}
      autoFocus={false}
      focusLock={false}
    >
      <div className={styles['params-dialog-content']}>
        <div className={styles['left']}>
          <div className={styles['header']}>参数配置</div>
          <div className={styles['body']}>
            <Form
              autoComplete={'off'}
              layout={'vertical'}
              form={form}
              scrollToFirstError
              autoFocus={false}
              disabled={loading || testIng}
            >
              {functionHasParam ? (
                data?.map((param) => {
                  const { name, code, uiType } = param;
                  return (
                    <FormItem
                      required
                      key={code}
                      label={name}
                      field={code}
                      rules={field2Rule?.[name] || getOtherFieldRules(uiType)}
                    >
                      {renderComponentByUiType(
                        uiType,
                        OSId ? +OSId : undefined
                      )}
                    </FormItem>
                  );
                })
              ) : (
                <NoDataCard type={'block'} title={'函数无入参配置'} />
              )}
            </Form>
          </div>
          <div className={styles['footer']}>
            <ProButton
              type={'primary'}
              icon={<IconPlayArrowFill>/</IconPlayArrowFill>}
              size={'small'}
              onClick={testAction}
              disabled={loading || testIng}
            >
              运行
            </ProButton>
          </div>
        </div>
        <div className={styles['right']}>
          <div className={styles['header']}>
            运行结果
            {!!runInfo && (
              <div>
                {runInfo.run_status === 1 || loading ? (
                  <div className={'flex items-center gap-2 text-[#6E7B8D]'}>
                    运行中
                    <IconLoading style={{ color: '#184FF2' }} />
                  </div>
                ) : (
                  <>
                    {runInfo.run_status === 2 && (
                      <DotStatus color={'#10B981'} text={'运行成功'} />
                    )}
                    {runInfo.run_status === 3 && (
                      <DotStatus color={'#E52E2D'} text={'运行失败'} />
                    )}
                    {runInfo.run_status === 4 && (
                      <DotStatus color={'#E52E2D'} text={'已被手动停止'} />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className={styles['body']}>{renderRunLog()}</div>
        </div>
      </div>
    </Modal>
  );
};
