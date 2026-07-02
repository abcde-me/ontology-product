import React from 'react';
import {
  DrawerWithEditBtn,
  DrawerWithEditBtnProps
} from '@/components/DrawerWithEditBtn';
import { useHistory } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getAutoRuleDetail } from '@/api/businessAutomation/list';
import styles from './index.module.scss';
import { Form, Modal, Spin } from '@arco-design/web-react';
import {
  DotStatus,
  GlobalTooltip,
  TruncatedTagList
} from '@ceai-front/arco-material';
import {
  ActionParams,
  FunctionInfo,
  PropConditions,
  RuleSettingConfig
} from '@/pages/ruleManagement/components';
import classNames from 'classnames';
import {
  AutoRuleDetail,
  ChangeType,
  EXECUTION_MODE_LABEL_MAP,
  ExecutionMode,
  InstanceScope,
  MonthDayMode,
  PeriodType,
  RULE_STATUS_MAP,
  ScheduleConfigRes
} from '@/pages/ruleManagement/types';
import {
  buildFormParams,
  buildObjPropertyInfo,
  getModelIconNode,
  getObjIconComponent,
  handleRuleDetailParams
} from '@/pages/ruleManagement/utils';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import { PyCodeContent } from '@/components/PyCodeContent';
import { GetAutoExecLogRuleSnapshot } from '@/api/businessAutomation/runLog';
import { isNil } from 'lodash-es';
import { ContentWithCopy, OntoModal } from '@/pages/ontologyScene/components';
import { AUTOMATION_PERMISSIONS } from '@/config/permissions';

const CHANGE_TYPE_TEXT = {
  [ChangeType.PropertyChange]: '属性变化',
  [ChangeType.InstanceCreate]: '实例创建',
  [ChangeType.InstanceDelete]: '实例删除'
};

const TRIGGER_TYPE = ['定时触发', '变更触发'];

const WEEK_TEXT = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export const FormItemGroup = ({
  title,
  className
}: {
  title: string;
  className?: string;
}) => {
  return (
    <div className={classNames([styles['form-item-group'], className])}>
      {title}
    </div>
  );
};

// const buildAutoRuleDetail = (data: any): AutoRuleDetail => {};

const parseCron = (config?: ScheduleConfigRes) => {
  if (!config) return '';
  const { periodType, weekDays, monthDays, monthDayMode, time } = config;
  let res = '每';
  if (periodType === PeriodType.Daily) {
    res += '天';
  }
  if (periodType === PeriodType.Weekly) {
    res += `周${weekDays!.map((day) => WEEK_TEXT[day - 1]).join('')}`;
  }
  if (periodType === PeriodType.Monthly) {
    res +=
      monthDayMode === MonthDayMode.Specific
        ? `月 ${monthDays!.map((d) => `${d}号`).join(' ')} `
        : '最后一天';
  }
  res += `${time}触发`;
  return <GlobalTooltip.Ellipsis text={res} />;
};

export const AutoRuleDrawer = (
  props: DrawerWithEditBtnProps & {
    ruleId?: string | number;
    // 展示详情、展示规则快照
    mode?: 'view' | 'snapshot';
  }
) => {
  const { ruleId, mode = 'view', ...other } = props;
  const history = useHistory();
  const [form] = Form.useForm();
  const { data: ruleDetail, loading } = useRequest(
    () => {
      const getRule =
        mode === 'view' ? getAutoRuleDetail : GetAutoExecLogRuleSnapshot;
      return getRule(ruleId!)
        .then((res) => {
          handleRuleDetailParams(res);
          return res as AutoRuleDetail;
        })
        .catch((e) => {
          console.error(e);
          return Promise.resolve(undefined);
        });
    },
    {
      ready: !isNil(ruleId),
      refreshDeps: [ruleId, mode],
      onSuccess(data) {
        let functionParams;
        if (data?.gateConfig?.enabled) {
          functionParams = buildFormParams(
            data.gateConfig?.parameters,
            data.gateConfig?.functionInfo?.params
          );
        }
        form.setFieldsValue({
          functionParams,
          actionParams: buildFormParams(
            data?.actionConfig?.parameters,
            data?.actionConfig?.actionInfo?.params
          )
        });
      }
    }
  );

  const IConComponent = (() => {
    if (!ruleDetail?.changeConfig?.objectTypeInfo) return null;
    return getObjIconComponent(ruleDetail.changeConfig.objectTypeInfo);
  })();

  return (
    <DrawerWithEditBtn
      onEdit={
        ruleDetail?.status === 1 || mode === 'snapshot'
          ? undefined
          : () => {
              if (ruleId) {
                history.push(
                  `/tenant/compute/onto/businessAutomation/management/info/edit/${ruleId}`
                );
              }
            }
      }
      footer={null}
      autoFocus={false}
      title={
        mode === 'view' ? (
          '规则详情'
        ) : (
          <div className={'flex items-center gap-2'}>
            规则快照
            <div className={styles['snapshot-time']}>
              {ruleDetail?.snapshotTime}
            </div>
          </div>
        )
      }
      className={styles['auto-rule-drawer']}
      permission={AUTOMATION_PERMISSIONS.MODIFY}
      {...other}
    >
      <div
        className={'info-container h-full overflow-scroll overflow-x-hidden'}
      >
        <div className={styles['auto-rule-info-content']}>
          {loading ? (
            <Spin loading={loading} />
          ) : (
            <>
              <div className={styles['basic-info']}>
                <FormItemGroup title={'基本信息'} />
                <div className={styles['basic-info-content']}>
                  <div className={`${styles['info-item']}`}>
                    <div className={styles['info-item-label']}>规则名称：</div>
                    <div className={styles['info-item-value']}>
                      <GlobalTooltip.Ellipsis text={ruleDetail?.name || '-'} />
                    </div>
                  </div>
                  <div className={`${styles['info-item']}`}>
                    <div className={styles['info-item-label']}>触发方式：</div>
                    <div className={styles['info-item-value']}>
                      {ruleDetail?.triggerType
                        ? TRIGGER_TYPE[ruleDetail.triggerType - 1]
                        : '-'}
                    </div>
                  </div>
                  {mode === 'snapshot' && (
                    <>
                      <div className={`${styles['info-item']}`}>
                        <div className={styles['info-item-label']}>
                          规则id：
                        </div>
                        <div className={styles['info-item-value']}>
                          <ContentWithCopy value={ruleDetail?.id as any} />
                        </div>
                      </div>
                      <div className={`${styles['info-item']}`}>
                        <div className={styles['info-item-label']}>
                          规则状态：
                        </div>
                        <div className={styles['info-item-value']}>
                          <DotStatus
                            color={
                              RULE_STATUS_MAP[ruleDetail?.status || 0].color
                            }
                            text={
                              RULE_STATUS_MAP[ruleDetail?.status || 0].label
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div className={styles['info-item']}>
                    <div className={styles['info-item-label']}>描述说明：</div>
                    <div className={styles['info-item-value']}>
                      <GlobalTooltip.Ellipsis
                        text={ruleDetail?.description || '-'}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <FormItemGroup title={'触发配置'} />
              <div className={styles['trigger-config']}>
                <RuleSettingConfig
                  mode={'item'}
                  ruleData={ruleDetail}
                  properties={
                    ruleDetail?.changeConfig?.objectTypeInfo
                      ?.ontologyPhysicalPropertiesList as any
                  }
                />
              </div>
              {ruleDetail?.triggerType === 1 && (
                <div className={styles['time-config']}>
                  <FormItemGroup title={'每当以下时间'} className={'mb-4'} />
                  <div className={`${styles['info-item']}`}>
                    <div className={styles['info-item-label']}>周期设置：</div>
                    <div className={styles['info-item-value']}>
                      {parseCron(ruleDetail?.scheduleConfig)}
                    </div>
                  </div>
                </div>
              )}
              {ruleDetail?.triggerType === 2 && (
                <div className={styles['when-action-config']}>
                  <FormItemGroup title={'当发生以下事件'} className={'mb-4'} />
                  <div className={'flex flex-wrap gap-4 overflow-hidden'}>
                    <div className={`${styles['info-item']}`}>
                      <div className={styles['info-item-label']}>
                        变更种类：
                      </div>
                      <div className={styles['info-item-value']}>
                        {
                          CHANGE_TYPE_TEXT[
                            ruleDetail?.changeConfig?.changeType ||
                              ChangeType.PropertyChange
                          ]
                        }
                      </div>
                    </div>
                    <div className={`${styles['info-item']}`}>
                      <div className={styles['info-item-label']}>
                        本体场景：
                      </div>
                      <div className={styles['info-item-value']}>
                        <div
                          className={
                            'flex w-full items-center gap-1 overflow-hidden'
                          }
                        >
                          {getModelIconNode(
                            ruleDetail?.modelInfo?.icon,
                            'w-[24px] h-[24px]'
                          )}
                          <GlobalTooltip.Ellipsis
                            text={ruleDetail?.modelInfo?.name || '-'}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`${styles['info-item']}`}>
                      <div className={styles['info-item-label']}>
                        对象类型：
                      </div>
                      <div className={styles['info-item-value']}>
                        <div
                          className={'flex items-center gap-1 overflow-hidden'}
                        >
                          {!!IConComponent && (
                            <IConComponent className={'h-[18px] w-[18px]'} />
                          )}
                          <GlobalTooltip.Ellipsis
                            text={
                              ruleDetail?.changeConfig?.objectTypeInfo?.name ||
                              '-'
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`${styles['info-item']}`}>
                      <div className={styles['info-item-label']}>
                        对象实例：
                      </div>
                      <div className={styles['info-item-value']}>
                        {ruleDetail?.changeConfig?.instanceScope ===
                        InstanceScope.All ? (
                          '全部实例'
                        ) : (
                          <TruncatedTagList
                            tagList={
                              ruleDetail?.changeConfig?.instanceIds || []
                            }
                            // tagProps={{
                            //   className: styles['ins-tag-item']
                            // }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`${styles['info-item']} mt-4`}>
                    <div className={`${styles['info-item-label']} self-start`}>
                      属性条件：
                    </div>
                    <div className={styles['info-item-value']}>
                      <PropConditions
                        value={buildObjPropertyInfo(ruleDetail.changeConfig!)}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}
              <Form form={form} autoFocus={false} autoComplete={'off'}>
                {ruleDetail?.gateConfig?.enabled && (
                  <div className={'mb-4'}>
                    <FormItemGroup
                      title={'且满足以下条件'}
                      className={'mb-4'}
                    />
                    <div className={`${styles['info-item']} mb-4`}>
                      <div className={styles['info-item-label']}>
                        条件函数：
                      </div>
                      <div className={styles['info-item-value']}>
                        <FunctionInfo
                          functionInfo={ruleDetail?.gateConfig?.functionInfo}
                        />
                      </div>
                    </div>
                    <div className={`${styles['info-item']}`}>
                      <div
                        className={`${styles['info-item-label']} self-start`}
                      >
                        参数配置：
                      </div>
                      <div className={styles['info-item-value']}>
                        <ActionParams readOnly field={'functionParams'} />
                      </div>
                    </div>
                  </div>
                )}
                <div className={styles['action-config']}>
                  <FormItemGroup
                    title={'系统将执行以下动作'}
                    className={'mb-4'}
                  />
                  <div className={`${styles['info-item']} mb-4`}>
                    <div className={styles['info-item-label']}>绑定行为：</div>
                    <div className={styles['info-item-value']}>
                      {ruleDetail?.actionConfig?.actionInfo?.name || '-'}
                    </div>
                  </div>
                  <div className={`${styles['info-item']} mb-4`}>
                    <div className={styles['info-item-label']}>执行模式：</div>
                    <div className={styles['info-item-value']}>
                      {EXECUTION_MODE_LABEL_MAP[
                        ruleDetail?.actionConfig?.executionMode ||
                          ExecutionMode.Auto
                      ] || '-'}
                    </div>
                  </div>
                  <div className={`${styles['info-item']}`}>
                    <div className={`${styles['info-item-label']} self-start`}>
                      参数配置：
                    </div>
                    <div className={styles['info-item-value']}>
                      <ActionParams readOnly field={'actionParams'} />
                    </div>
                  </div>
                </div>
              </Form>
            </>
          )}
        </div>
      </div>
    </DrawerWithEditBtn>
  );
};
