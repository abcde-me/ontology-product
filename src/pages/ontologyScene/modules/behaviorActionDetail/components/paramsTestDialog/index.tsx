import React, { useCallback } from 'react';
import { Form, Modal } from '@arco-design/web-react';
import styles from '././index.module.scss';
import { DotStatus, NoDataCard, ProButton } from '@ceai-front/arco-material';
import { IconLoading, IconPlayArrowFill } from '@arco-design/web-react/icon';
import {
  BehaviorActionDetail,
  EnumRule,
  LengthRule,
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
  OntologyFunctionDetail,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import { isNil } from 'lodash-es';
import useTestFunction from '@/pages/ontologyScene/hooks/useTestFunction';
import { useParams } from 'react-router-dom';

interface IProps {
  visible: boolean;
  data: OntologyActionParam[];
  onOk?: () => void;
  onClose: () => void;
  validateRules: ValidateRule[];
  actionData: BehaviorActionDetail;
  functionData?: OntologyFunctionDetail;
}

export const ParamsTestDialog = (props: IProps) => {
  const { data, visible, onClose, validateRules, actionData } = props;
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
              return onError(`请填写${name}`);
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
                if (
                  !(ruleConfig as EnumRule).options.includes(value.toString())
                ) {
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

  return (
    <Modal
      title={'参数测试'}
      footer={null}
      visible={visible}
      style={{ width: '900px' }}
      className={styles['params-dialog']}
      onCancel={closeModal}
    >
      <div className={styles['params-dialog-content']}>
        <div className={styles['left']}>
          <div className={styles['header']}>参数配置</div>
          <div className={styles['body']}>
            <Form
              autoComplete={'off'}
              layout={'vertical'}
              form={form}
              disabled={loading || testIng}
            >
              {data?.map((param) => {
                const { name, code, uiType } = param;
                return (
                  <Form.Item
                    required
                    key={code}
                    label={name}
                    field={code}
                    rules={
                      field2Rule?.[name] || [
                        { required: true, message: '请输入参数值' }
                      ]
                    }
                  >
                    {renderComponentByUiType(uiType, OSId ? +OSId : undefined)}
                  </Form.Item>
                );
              })}
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
          <div className={styles['body']}>
            {!runInfo?.run_status ? (
              <NoDataCard
                type={'block'}
                title={
                  loading || testIng ? '行为测试中...' : '请先在左侧配置参数'
                }
              />
            ) : (
              <div className={styles['run-log']}>
                {runInfo.runLog
                  .map((item) => ('run_log' in item ? item.run_log : ''))
                  .join('\n')}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
