import React, { useState } from 'react';
import styles from './index.module.scss';
import { NoDataCard } from '@ceai-front/arco-material';
import { Button } from '@arco-design/web-react';
import { IconPlayArrowFill } from '@arco-design/web-react/icon';
import { ParamsTestDialog } from '../../components';

export const ParamsSetting = (props: CustomFormItemCompProps<any>) => {
  const [paramsTest, setParamsTest] = useState(false);
  const [currentPrams, setCurrentPrams] = useState<any>();
  const testParams = () => {
    setParamsTest(true);
    setCurrentPrams({});
  };

  const closeDialog = () => {
    setParamsTest(false);
    setCurrentPrams({});
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
          试运行
        </Button>
      </div>
      <div className={styles['comp-content']}>
        <NoDataCard type={'block'} title={'请先选择函数'} />
      </div>
      <ParamsTestDialog
        onClose={closeDialog}
        visible={paramsTest}
        onOk={closeDialog}
        data={currentPrams}
      />
    </div>
  );
};
