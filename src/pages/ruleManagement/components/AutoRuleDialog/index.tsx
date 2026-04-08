import React from 'react';
import {
  DrawerWithEditBtn,
  DrawerWithEditBtnProps
} from '@/components/DrawerWithEditBtn';
import { useHistory } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getAutoRuleDetail } from '@/api/businessAutomation/list';
import styles from './index.module.scss';
import { PaginationProps, Spin } from '@arco-design/web-react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { RuleSettingConfig } from '@/pages/ruleManagement/components';
import classNames from 'classnames';

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

const DEFAULT_PAGINATION: PaginationProps = {
  pageSize: 5,
  simple: true,
  showTotal: true
};

export const AutoRuleDialog = (
  props: DrawerWithEditBtnProps & {
    ruleId?: string | number;
  }
) => {
  const { ruleId, ...other } = props;
  const history = useHistory();

  const { data: ruleDetail, loading } = useRequest(
    () => {
      return getAutoRuleDetail(ruleId!);
    },
    {
      ready: !!ruleId,
      refreshDeps: [ruleId]
    }
  );

  return (
    <DrawerWithEditBtn
      onEdit={() => {
        if (ruleId) {
          history.push(
            `/tenant/compute/onto/businessAutomation/management/info/edit/${ruleId}`
          );
        }
      }}
      footer={null}
      autoFocus={false}
      title={'规则详情'}
      {...other}
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
                    {ruleDetail?.triggerType || '-'}
                  </div>
                </div>
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
              <RuleSettingConfig mode={'item'} ruleData={ruleDetail} />
            </div>
            <div className={styles['time-config']}>
              <FormItemGroup title={'每当以下时间'} className={'mb-4'} />
              <div className={`${styles['info-item']}`}>
                <div className={styles['info-item-label']}>周期设置：</div>
                <div className={styles['info-item-value']}>
                  2026 03-30 09:00:00
                </div>
              </div>
            </div>
            <div className={styles['when-action-config']}>
              <FormItemGroup title={'当发生以下事件'} className={'mb-4'} />
              <div className={'flex flex-wrap gap-4 overflow-hidden'}>
                <div className={`${styles['info-item']}`}>
                  <div className={styles['info-item-label']}>变更种类：</div>
                  <div className={styles['info-item-value']}>
                    2026 03-30 09:00:00
                  </div>
                </div>
                <div className={`${styles['info-item']}`}>
                  <div className={styles['info-item-label']}>本体场景：</div>
                  <div className={styles['info-item-value']}>
                    2026 03-30 09:00:00
                  </div>
                </div>
                <div className={`${styles['info-item']}`}>
                  <div className={styles['info-item-label']}>对象类型：</div>
                  <div className={styles['info-item-value']}>
                    2026 03-30 09:00:00
                  </div>
                </div>
                <div className={`${styles['info-item']}`}>
                  <div className={styles['info-item-label']}>对象实例：</div>
                  <div className={styles['info-item-value']}>
                    2026 03-30 09:00:00
                  </div>
                </div>
              </div>
              <div className={`${styles['info-item']} mt-4`}>
                <div className={styles['info-item-label']}>属性条件：</div>
                <div className={styles['info-item-value']}>
                  2026 03-30 09:00:00
                </div>
              </div>
            </div>
            <div className={styles['condition-config']}>
              <FormItemGroup title={'且满足以下条件'} className={'mb-4'} />
              <div className={`${styles['info-item']} mb-4`}>
                <div className={styles['info-item-label']}>条件函数：</div>
                <div className={styles['info-item-value']}>
                  2026 03-30 09:00:00
                </div>
              </div>
              <div className={`${styles['info-item']}`}>
                <div className={styles['info-item-label']}>参数配置：</div>
                <div className={styles['info-item-value']}>
                  2026 03-30 09:00:00
                </div>
              </div>
            </div>
            <div className={styles['action-config']}>
              <FormItemGroup title={'系统将执行以下动作'} className={'mb-4'} />
              <div className={`${styles['info-item']} mb-4`}>
                <div className={styles['info-item-label']}>绑定行为：</div>
                <div className={styles['info-item-value']}>
                  2026 03-30 09:00:00
                </div>
              </div>
              <div className={`${styles['info-item']}`}>
                <div className={styles['info-item-label']}>参数配置：</div>
                <div className={styles['info-item-value']}>
                  2026 03-30 09:00:00
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DrawerWithEditBtn>
  );
};
