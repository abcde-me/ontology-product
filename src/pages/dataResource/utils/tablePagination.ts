import type { PaginationProps } from '@arco-design/web-react';

export const buildDataResourcePagination = (
  pagination?: PaginationProps
): PaginationProps => ({
  ...pagination,
  showTotal: (total) => `共 ${total} 条`,
  sizeCanChange: true,
  pageSizeChangeResetCurrent: true,
  sizeOptions: [10, 20, 50],
  showJumper: true
});
