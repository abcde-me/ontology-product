import React from 'react';
import styles from './index.module.scss';
import { Select } from '@arco-design/web-react';
import classNames from 'classnames';

export const ObjectInterfaceSelect = (
  props: CustomFormItemCompProps<React.Key[][]>
) => {
  const { value, onChange, disabled, className } = props;
  return (
    <div className={classNames([styles['obj-interface'], className])}>
      <Select
        mode={'multiple'}
        options={[]}
        dropdownRender={(menu) => <div className={'mex-h-[400px]'}>{menu}</div>}
        // notFoundContent={'暂无数据'}
      />
    </div>
  );
};
