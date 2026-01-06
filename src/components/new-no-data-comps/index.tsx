import {
  Cascader,
  CascaderProps,
  Select,
  SelectProps
} from '@arco-design/web-react';
import React from 'react';
import { NoDataCard } from '@ceai-front/arco-material';

export const SelectWithNoData = (props: SelectProps) => {
  return (
    <Select
      {...props}
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
