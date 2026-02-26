import React, { useState } from 'react';
import {
  BehaviorActionItem,
  RuleName,
  TYPE2RULE_TYPES
} from '@/pages/ontologyScene/types/behaviorActions';
import styles from './index.module.scss';
import { OsDrawer, PyCodeContent } from '@/pages/ontologyScene/componens';
import { Form, Tabs } from '@arco-design/web-react';
import { IconEdit } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import { isNil } from 'lodash-es';
import { ValidateRules } from '@/pages/ontologyScene/componens/ValidateRules';
import { ParamType } from '@/pages/ontologyScene/types/ontologyFunction';

interface IProps {
  show: boolean;
  onClose: () => void;
  data?: BehaviorActionItem;
}

export const BehaviorDetail = (props: IProps) => {
  const { data, onClose, show } = props;
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('');
  const [form] = Form.useForm();
  const { data: functionInfo } = useRequest(
    () => {
      if (isNil(data)) return Promise.resolve(undefined);
      return getFunctionDetail(data.functionId!);
    },
    {
      refreshDeps: [data?.functionId]
    }
  );

  return (
    <OsDrawer
      visible={show}
      footer={null}
      onCancel={onClose}
      className={styles['behavior-detail']}
      title={'行为详情'}
      maskClosable
      closable
      onEdit={() => {
        history.push(
          `/tenant/compute/modaforge/ontologyScene/detail/undefined/behaviorActions/edit/${data?.id}`
        );
      }}
    >
      <div className={'flex flex-col gap-3'}>
        <div>
          <div
            className={
              'mb-3 font-PingFangSc text-[14px] font-medium leading-[22px] text-[#0F131F]'
            }
          >
            基本信息
          </div>
          <div className={'flex w-full flex-wrap'}>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>行为名称：</div>
              <div className={styles['item-value']}>这是名称</div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>描述说明：</div>
              <div className={styles['item-value']}>这是描述</div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>所属对象类型：</div>
              <div className={styles['item-value']}>
                <div className={styles['icon-content']}>
                  <IconEdit />
                </div>
                <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称
                </div>
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>函数：</div>
              <div className={styles['item-value']}>函数</div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>id：</div>
              <div className={styles['item-value']}>id</div>
            </div>
          </div>
        </div>
        <div className={styles['behavior-other-info']}>
          <Tabs
            activeTab={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              if (key === 'rules') {
                form.setFieldsValue({
                  validationRules: data?.params.flatMap((param) => {
                    const { name, type, enabledValidation, validationRule } =
                      param;
                    if (
                      ![
                        ParamType.Integer,
                        ParamType.String,
                        ParamType.Float
                      ].includes(type)
                    )
                      return [];
                    return {
                      enabledValidation: enabledValidation!,
                      failMessage: validationRule?.failMessage || '',
                      rule_name:
                        validationRule?.ruleName ||
                        TYPE2RULE_TYPES[type][0].value,
                      ruleConfig:
                        validationRule?.ruleName === RuleName.EnumRule
                          ? param.validationRule?.ruleConfig?.options.toString()
                          : param.validationRule?.ruleConfig,
                      name,
                      type
                    };
                  })
                });
              }
            }}
          >
            <Tabs.TabPane title={'参数配置（5）'} key={'params'} />
            <Tabs.TabPane title={'校验规则（5）'} key={'rules'} />
            <Tabs.TabPane title={'函数'} key={'function'} />
          </Tabs>
          {activeTab === 'function' && (
            <PyCodeContent value={functionInfo?.content} readOnly />
          )}
          {activeTab === 'rules' && (
            <Form form={form} disabled>
              <ValidateRules readonly />
            </Form>
          )}
        </div>
      </div>
    </OsDrawer>
  );
};
