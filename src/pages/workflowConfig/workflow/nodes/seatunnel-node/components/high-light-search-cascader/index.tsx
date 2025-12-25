import React from 'react';
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
      showSearch={{
        renderOption(input, option) {
          return option.pathLabel?.map((item, index, array) => {
            return (
              <>
                {highlight(item, input)}
                {index !== array.length - 1 && ` > `}
              </>
            );
          });
        }
      }}
      renderFormat={(valueShow) => `${valueShow.join(' > ')}`}
    />
  );
};
