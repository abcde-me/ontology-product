import { Pagination } from '@arco-design/web-react';
import React from 'react';

interface PagesProps {
  current?: number;
  total?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (page: number, pageSize: number) => void;
}

const Pages: React.FC<PagesProps> = ({current = 1,total = 200,pageSize = 10,onChange,onPageSizeChange}) => {
  console.log('分页参数:', { current, total, pageSize });

  return (
    <Pagination
      // style={{ marginRight: '-1.5px' }}
      current={current}
      total={total}
      pageSize={pageSize}
      sizeCanChange
      showTotal
      showJumper
      onChange={onChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
};

export default Pages;
