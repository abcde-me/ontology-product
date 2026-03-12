import React, { useEffect, useState } from 'react';
import {
  EnumRule,
  OntologyActionParam,
  RuleName,
  TYPE2COMP_OPTIONS,
  TYPE2RULE_TYPES,
  UI_TYPE_LABEL,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import styles from './index.module.scss';
import {
  ContentWithCopy,
  OsDrawer,
  PyCodeContent
} from '@/pages/ontologyScene/componens';
import { Form, Table, TableColumnProps, Tabs } from '@arco-design/web-react';
import { useHistory, useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import { isNil } from 'lodash-es';
import { ValidateRules } from '@/pages/ontologyScene/componens/ValidateRules';
import {
  InputType,
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import { getActionDetail } from '@/api/ontologySceneLibrary/ontologyAction';
import ObjectTypeTag from '../../../../componens/ObjectTypeTag';
import NoDataEmpty from '@/components/NoDataEmpty';
import { EllipsisPopover, NoDataCard } from '@ceai-front/arco-material';
import { ValidateRuleCard } from '@/pages/ontologyScene/modules/behaviorActions/components';

interface IProps {
  show: boolean;
  onClose: () => void;
  actionItem?: number;
}

export const BehaviorDetail = (props: IProps) => {
  const { actionItem, onClose, show } = props;
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('params');
  const [validateRules, setValidateRules] = useState<ValidateRule[]>([]);
  const [inputParams, setInputParams] = useState<OntologyActionParam[]>([]);
  const { id: OSId } = useParams<Record<string, string>>();
  const { data: actionDetail } = useRequest(
    () => {
      return getActionDetail(actionItem!);
    },
    {
      refreshDeps: [actionItem],
      ready: !isNil(actionItem)
    }
  );
  const { data: functionInfo } = useRequest(
    () => {
      if (isNil(actionDetail?.functionId)) return Promise.resolve(undefined);
      return getFunctionDetail(actionDetail!.functionId);
    },
    {
      refreshDeps: [actionDetail],
      ready: !!actionDetail
    }
  );

  const paramColumns: TableColumnProps<OntologyActionParam>[] = [
    {
      title: '参数显示名称',
      dataIndex: 'name',
      key: 'name',
      width: 160
    },

    {
      title: '参数ID',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render(value) {
        return value ? <ContentWithCopy value={value} /> : '-';
      }
    },

    {
      title: '数据类型',
      dataIndex: 'type',
      key: 'type',
      width: 140
    },
    {
      title: '界面控件',
      dataIndex: 'uiType',
      key: 'uiType',
      width: 160,
      render: (type: UiType = UiType.Input) => {
        return UI_TYPE_LABEL[type];
      }
    }
  ];

  useEffect(() => {
    const inputParams: OntologyActionParam[] = [],
      validateRules: ValidateRule[] = [];
    actionDetail?.params?.forEach((param) => {
      const { name, type, enabledValidation, validationRule, inputType } =
        param;
      if (inputType === InputType.Input) {
        inputParams.push(param);
        if (
          [ParamType.Integer, ParamType.String, ParamType.Float].includes(type)
        ) {
          const rule: ValidateRule = {
            enabledValidation: enabledValidation!,
            failMessage: validationRule?.failMessage || '',
            rule_name:
              validationRule?.ruleName || TYPE2RULE_TYPES[type][0].value,
            ruleConfig: param.validationRule?.ruleConfig,
            name,
            type
          };
          validateRules.push(rule);
        }
      }
      setInputParams(inputParams);
      setValidateRules(validateRules);
    });
  }, [actionDetail]);

  return (
    <OsDrawer
      visible={show}
      footer={null}
      onCancel={onClose}
      className={styles['behavior-detail']}
      title={'行为详情'}
      maskClosable
      closable
      afterClose={() => {
        setActiveTab('params');
      }}
      onEdit={() => {
        history.push(
          `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/behaviorActions/edit/${actionItem}`
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
          <div className={'flex w-full flex-wrap overflow-hidden'}>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>行为名称：</div>
              <div className={styles['item-value']}>
                <EllipsisPopover
                  value={actionDetail?.description || '-'}
                  preferTypography
                  ellipsis={{
                    showTooltip: {
                      type: 'tooltip'
                    }
                  }}
                >
                  {actionDetail?.name || '-'}
                </EllipsisPopover>
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>描述说明：</div>
              <div className={styles['item-value']}>
                <EllipsisPopover
                  value={actionDetail?.description || '-'}
                  preferTypography
                  ellipsis={{
                    showTooltip: {
                      type: 'tooltip'
                    }
                  }}
                >
                  {actionDetail?.description || '-'}
                </EllipsisPopover>
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>所属对象类型：</div>
              <div className={styles['item-value']}>
                <ObjectTypeTag
                  ontologyObjectTypeIcon={
                    actionDetail?.ontologyObjectTypeIcon || '-'
                  }
                  ontologyObjectTypeName={actionDetail?.objectTypeName || '-'}
                  ontologyObjectTypeId={String(
                    actionDetail?.ontologyObjectTypeId ||
                      actionDetail?.objectTypeId ||
                      ''
                  )}
                  onClick={() => {}}
                  className={styles['obj-tag']}
                />
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>函数：</div>
              <div className={styles['item-value']}>
                {actionDetail?.functionName || '-'}
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>行为id：</div>
              <div className={styles['item-value']}>
                <ContentWithCopy value={(actionDetail?.id || '-').toString()} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles['behavior-other-info']}>
          <Tabs
            activeTab={activeTab}
            onChange={(key) => {
              setActiveTab(key);
            }}
          >
            <Tabs.TabPane
              title={`参数配置（${inputParams.length}）`}
              key={'params'}
            />
            <Tabs.TabPane
              title={`校验规则（${validateRules.length}）`}
              key={'rules'}
            />
            <Tabs.TabPane title={'函数'} key={'function'} />
          </Tabs>
          {activeTab === 'params' && (
            <div className={'h-full w-full'}>
              <Table
                pagination={false}
                data={inputParams}
                columns={paramColumns}
                border={false}
                noDataElement={<NoDataCard title="暂无数据" type={'global'} />}
              />
            </div>
          )}
          {activeTab === 'function' && (
            <PyCodeContent value={functionInfo?.content} readOnly />
          )}
          {activeTab === 'rules' && (
            <>
              {!validateRules.length && (
                <NoDataCard type={'block'} title={'暂无校验规则'} />
              )}
              {validateRules?.map((rule, index) => (
                <ValidateRuleCard key={`${rule.rule_name}_index`} rule={rule} />
              ))}
            </>
          )}
        </div>
      </div>
    </OsDrawer>
  );
};
