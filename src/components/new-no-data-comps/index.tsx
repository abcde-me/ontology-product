import {
  Cascader,
  CascaderProps,
  Select,
  SelectProps
} from '@arco-design/web-react';
import React from 'react';
import { NoDataCard } from '@ceai-front/arco-material';
import classNames from 'classnames';
import styles from './index.module.scss';

export const SelectWithNoData = (props: SelectProps) => {
  const { dropdownMenuClassName, notFoundContent, ...otherProps } = props;

  return (
    <Select
      {...otherProps}
      dropdownMenuClassName={classNames([
        styles['select-dropdown'],
        dropdownMenuClassName
      ])}
      notFoundContent={
        <div className={'flex h-full w-full items-center justify-center'}>
          <NoDataCard type={'block'} />
        </div>
      }
    />
  );
};

export const CascaderWithNoData = (props: CascaderProps) => {
  return (
    <Cascader
      {...props}
      notFoundContent={
        <div className={'flex h-full w-full items-center justify-center'}>
          <NoDataCard type={'block'} />
        </div>
      }
    />
  );
};
