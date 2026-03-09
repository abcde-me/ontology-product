import React, { useState } from 'react';
import styles from './index.module.scss';
import { NoDataCard } from '@ceai-front/arco-material';
import { Button, Form, Input, Select } from '@arco-design/web-react';
import { IconPlayArrowFill } from '@arco-design/web-react/icon';
import { ParamsTestDialog } from '../../components';
import {
  ActionSchema,
  BehaviorActionDetail,
  OntologyActionParam,
  TYPE2COMP_OPTIONS,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';

export const ParamsSetting = (
  props: CustomFormItemCompProps<any> & {
    functionDetail?: OntologyFunctionDetail;
    actionDetail?: BehaviorActionDetail;
  }
) => {
  const { actionDetail = {} } = props;
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
                  const { type }: OntologyActionParam =
                    form.getFieldValue(field);
                  return (
                    <div className={styles['params-item']} key={key}>
                      <Form.Item
                        field={`${field}.name`}
                        className={'mb-2 px-4'}
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item
                        field={`${field}.code`}
                        className={'mb-2 px-4'}
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item
                        field={`${field}.type`}
                        className={'mb-2 px-4'}
                      >
                        <Select disabled />
                      </Form.Item>
                      <Form.Item
                        field={`${field}.uiType`}
                        className={'mb-2 px-4'}
                      >
                        <Select
                          placeholder={'请选择界面控件'}
                          disabled={disabled}
                          options={TYPE2COMP_OPTIONS[type]}
                        />
                      </Form.Item>
                    </div>
                  );
                })}
              </>
            );
          }}
        </Form.List>
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
