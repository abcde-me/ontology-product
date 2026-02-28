import React from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { ObjectTypeSelect } from '../../componens';
import { SelectWithNoData } from '@/components/new-no-data-comps';

export const ObjectInterfaceSelect = (
  props: CustomFormItemCompProps<React.Key[][]>
) => {
  const { value, onChange, disabled, className } = props;
  return (
    <div className={classNames([styles['obj-interface'], className])}>
      <ObjectTypeSelect className={styles['obj-one']} />
      <SelectWithNoData
        className={styles['interface']}
        placeholder={'请先选择对象类型'}
      />
    </div>
  );
};
