import React, { Fragment } from 'react';
import { Cascader, CascaderProps } from '@arco-design/web-react';

function highlight(label: string, keyword?: string) {
  if (!keyword) return label;

  const reg = new RegExp(`(${keyword})`, 'ig');
  const parts = label.split(reg);

  return (
    <>
      {parts.map((part, index) =>
        reg.test(part) ? (
          <span key={index} className={'font-bold text-[#FF981A]'}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export const HighLightSearchCascader = (props: CascaderProps) => {
  return (
    <Cascader
      {...props}
      //arco 的底层设计问题，想要在远端加载模式高亮搜索只能开启选择即改变，然后自行控制值的改变逻辑
      changeOnSelect
      showSearch={{
        renderOption(input, option, options) {
          return option.pathLabel?.map((item, index, array) => {
            return (
              <Fragment key={item}>
                {highlight(item, input)}
                {index !== array.length - 1 && ` > `}
              </Fragment>
            );
          });
        }
      }}
      renderFormat={(valueShow) => `${valueShow.join(' > ')}`}
    />
  );
};
