import * as React from 'react';
import { useImperativeHandle, forwardRef } from 'react';
import { Breadcrumb } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';

function BreadcrumbCom(props: any, ref: any) {
  const history = useHistory();
  const { list } = props;
  useImperativeHandle(ref, () => ({}));
  return (
    <Breadcrumb className="size-[12px] h-[40px] w-full font-normal leading-[40px]">
      {list.map((item: any, index: number) => {
        return (
          <Breadcrumb.Item
            key={index}
            className={item.href ? 'cursor-pointer' : ''}
            onClick={() => {
              if (item.href) history.push(item.href);
            }}
          >
            {item.name}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}

export default forwardRef(BreadcrumbCom);
