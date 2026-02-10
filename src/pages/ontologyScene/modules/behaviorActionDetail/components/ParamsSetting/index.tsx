import React, { useState } from 'react';
import styles from './index.module.scss';
import { NoDataCard } from '@ceai-front/arco-material';
import { Button, Form, Input, Select } from '@arco-design/web-react';
import { IconPlayArrowFill } from '@arco-design/web-react/icon';
import { ParamsTestDialog } from '../../components';
import {
  OntologyActionParam,
  TYPE2COMP_OPTIONS
} from '@/pages/ontologyScene/types/behaviorActions';

export const ParamsSetting = (props: CustomFormItemCompProps<any>) => {
  const [paramsTest, setParamsTest] = useState(true);
  const [currentPrams, setCurrentPrams] = useState<any>();
  const { form, disabled } = Form.useFormContext();
  const functionParams: OntologyActionParam[] = Form.useWatch(
    'function_params',
    form
  );
  const testParams = () => {
    setParamsTest(true);
    // setCurrentPrams({});
  };

  const closeDialog = () => {
    setParamsTest(false);
    // setCurrentPrams({});
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
      />
    </div>
  );
};
