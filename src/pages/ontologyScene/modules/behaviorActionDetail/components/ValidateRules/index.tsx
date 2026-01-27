import React from 'react';
import styles from './index.module.scss';
import { Button, Switch } from '@arco-design/web-react';
import { IconPlayArrowFill } from '@arco-design/web-react/icon';
import { NoDataCard } from '@ceai-front/arco-material';

export const ValidRules = () => {
  return (
    <div className={styles['validate-rules']}>
      <div className={styles['comp-header']}>
        <div
          className={
            'font-PingFangSc text-[14px] font-medium leading-[22px] text-black'
          }
        >
          参数配置列表
        </div>
        <div className={'flex w-max flex-shrink-0 items-center gap-1'}>
          <div
            className={
              'font-PingFangSc text-[14px] font-normal leading-[22px] text-black'
            }
          >
            启用校验
          </div>
          <Switch />
        </div>
      </div>
      <div className={styles['comp-content']}>
        <NoDataCard type={'block'} title={'请先选择函数'} />
      </div>
    </div>
  );
};
