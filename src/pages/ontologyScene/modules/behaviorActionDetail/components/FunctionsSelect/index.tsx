import React, { useMemo } from 'react';
import { Button, Select } from '@arco-design/web-react';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';

interface FunctionValue {
  name: string;
}

const MOCK = [
  {
    label: '函数名称',
    value: 'name',
    describe: '描述456654656565'
  },
  {
    label: '函数名称1',
    value: 'name1',
    describe: '这是一个神奇的函数'
  }
];

export const FunctionsSelect = (
  props: CustomFormItemCompProps<FunctionValue>
) => {
  const { data: allFunctions = [] } = useRequest(() => {
    return Promise.resolve(MOCK);
  });

  const labelMap = useMemo(() => {
    return allFunctions.reduce<Record<string, string>>((acc, cur) => {
      return {
        ...acc,
        [cur.value.toString()]: cur.label
      };
    }, {});
  }, [allFunctions]);

  return (
    <div className={'flex w-full items-center gap-3'}>
      <Select
        placeholder={'请选择行为动作的函数'}
        className={'flex-1'}
        renderFormat={(_, value) => {
          if (isNil(value)) return null;
          return labelMap[value.toString()];
        }}
        value={props.value as any}
        allowClear
        onChange={(val) => props.onChange?.(val)}
      >
        {allFunctions.map((item) => {
          const { label, value, describe } = item;
          return (
            <Select.Option key={value} value={value}>
              <div
                className={
                  'mb-[2px] pt-2 font-PingFangSc text-[14px] leading-[22px] text-[#0F131F]'
                }
              >
                {label}
              </div>
              <div
                className={
                  'pb-2 font-PingFangSc text-[12px] leading-[22px] text-[#7D859C]'
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
