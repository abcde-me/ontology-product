import React, { useState } from 'react';
import styles from './index.module.scss';
import { GlobalTooltip, NoDataCard } from '@ceai-front/arco-material';
import {
  Button,
  Form,
  Input,
  InputProps,
  Select
} from '@arco-design/web-react';
import { IconPlayArrowFill } from '@arco-design/web-react/icon';
import { ParamsTestDialog } from '../../components';
import {
  ActionSchema,
  BehaviorActionDetail,
  OntologyActionParam,
  TYPE2COMP_OPTIONS,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import {
  InputType,
  OntologyFunctionDetail
} from '@/pages/ontologyScene/types/ontologyFunction';
import classNames from 'classnames';

const InputWithTooltip = (props: InputProps) => {
  const { value, readOnly, ...otherProps } = props;
  return readOnly ? (
    <GlobalTooltip.Ellipsis
      className={classNames(otherProps.className)}
      text={value || '-'}
    />
  ) : (
    <Input value={value} readOnly {...otherProps} />
  );
};

export const ParamsSetting = (
  props: CustomFormItemCompProps<any> & {
    functionDetail?: OntologyFunctionDetail;
    actionDetail?: BehaviorActionDetail;
  }
) => {
  const { actionDetail = {}, functionDetail } = props;
  const [paramsTest, setParamsTest] = useState(false);
  const { form, disabled } = Form.useFormContext();
  const functionParams: OntologyActionParam[] = Form.useWatch(
    'function_params',
    form
  );
  const validateRules: ValidateRule[] = Form.useWatch('validationRules', form);
  const testParams = () => {
    const validateFields = validateRules.flatMap(
      ({ enabledValidation }, index) => {
        if (!enabledValidation) return [];
        return [
          `validationRules[${index}].ruleConfig`,
          `validationRules[${index}].failMessage`
        ];
      }
    );
    form
      .validate(validateFields)
      .then(() => {
        setParamsTest(true);
      })
      .catch(console.error);
  };

  const closeDialog = () => {
    setParamsTest(false);
  };

  const functionHasParam = !!functionDetail?.params?.filter(
    (p) => p.inputType === InputType.Input
  )?.length;

  return (
    <div className={styles['params-setting']}>
      <div className={styles['comp-header']}>
        <div
          className={
            'font-PingFangSc text-[14px] font-medium leading-[22px] text-black'
          }
        >
          参数配置列表
        </div>
        <Button size={'mini'} onClick={testParams}>
          测试
        </Button>
      </div>
      <div className={styles['comp-content']}>
        {functionHasParam ? (
          <Form.List field={'function_params'}>
            {(fields) => {
              return (
                <>
                  <div className={styles['params-item']}>
                    <div className={styles['field']}>参数显示名称</div>
                    <div className={styles['field']}>id</div>
                    <div className={styles['field']}>参数类型</div>
                    <div className={styles['field']}>界面控件</div>
                  </div>
                  {fields.map(({ field, key }, index) => {
                    const {
                      type,
                      name: paramName,
                      code
                    }: OntologyActionParam = form.getFieldValue(field);
                    return (
                      <div className={styles['params-item']} key={key}>
                        <Form.Item
                          field={`${field}.name`}
                          className={'mb-2 overflow-hidden'}
                        >
                          <InputWithTooltip readOnly className={'border-0'} />
                        </Form.Item>
                        <Form.Item
                          field={`${field}.code`}
                          className={'mb-2 overflow-hidden'}
                        >
                          <InputWithTooltip readOnly className={'border-0'} />
                        </Form.Item>
                        <Form.Item field={`${field}.type`} className={'mb-2'}>
                          <Input readOnly className={'border-0'} />
                        </Form.Item>
                        <Form.Item field={`${field}.uiType`} className={'mb-2'}>
                          <Select
                            placeholder={'请选择界面控件'}
                            disabled={disabled}
                            options={TYPE2COMP_OPTIONS[type]}
                            getPopupContainer={(node) =>
                              node.parentElement || document.body
                            }
                          />
                        </Form.Item>
                      </div>
                    );
                  })}
                </>
              );
            }}
          </Form.List>
        ) : (
          <NoDataCard type={'block'} title={'暂无入参配置'} />
        )}
      </div>

      <ParamsTestDialog
        onClose={closeDialog}
        visible={paramsTest}
        onOk={closeDialog}
        data={functionParams}
        validateRules={validateRules}
        actionData={actionDetail}
        functionData={props.functionDetail}
      />
    </div>
  );
};
