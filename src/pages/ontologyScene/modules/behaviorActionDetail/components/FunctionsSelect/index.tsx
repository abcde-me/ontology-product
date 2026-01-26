import React from 'react';
import { Button, Select } from '@arco-design/web-react';

interface FunctionValue {
  name: string;
}

export const FunctionsSelect = (props: CustomFormCompProps<FunctionValue>) => {
  return (
    <div className={'flex w-full items-center gap-3'}>
      <Select placeholder={'请选择行为动作的函数'} className={'flex-1'} />
      <Button type={'text'} className={'flex-shrink-0 p-0'}>
        查看代码
      </Button>
    </div>
  );
};
