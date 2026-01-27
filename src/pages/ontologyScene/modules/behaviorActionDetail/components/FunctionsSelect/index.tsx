import React from 'react';
import { Button, Select } from '@arco-design/web-react';

interface FunctionValue {
  name: string;
}

const MOCK = [
  {
    label: '函数名称',
    value: 'name',
    describe: '描述456654656565'
  }
];

export const FunctionsSelect = (props: CustomFormCompProps<FunctionValue>) => {
  return (
    <div className={'flex w-full items-center gap-3'}>
      <Select
        placeholder={'请选择行为动作的函数'}
        className={'flex-1'}
        popupVisible
        renderFormat={(option, value) => {
          debugger;
          return value;
        }}
      >
        {MOCK.map((item) => {
          const { label, value, describe } = item;
          return (
            <Select.Option key={value} value={value}>
              <div
                className={
                  'mb-[2px] font-PingFangSc text-[14px] leading-[22px] text-[#0F131F]'
                }
              >
                {label}
              </div>
              <div
                className={
                  'font-PingFangSc text-[12px] leading-[18px] text-[#7D859C]'
                }
              >
                {describe}
              </div>
            </Select.Option>
          );
        })}
      </Select>
      <Button type={'text'} className={'flex-shrink-0 p-0'}>
        查看代码
      </Button>
    </div>
  );
};
