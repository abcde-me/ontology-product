import { DataQueryPermission, DATA_QUERY_PERMISSION_LABEL } from '../types';

/** 偶数 id 默认已授权，奇数 id 默认未授权（演示数据） */
export const resolveQueryPermission = (
  tableId: string
): DataQueryPermission => {
  const id = Number(tableId);
  return id % 2 === 0
    ? DataQueryPermission.AUTHORIZED
    : DataQueryPermission.UNAUTHORIZED;
};

export const QUERY_PERMISSION_FILTERS = [
  {
    text: DATA_QUERY_PERMISSION_LABEL[DataQueryPermission.AUTHORIZED],
    value: DataQueryPermission.AUTHORIZED
  },
  {
    text: DATA_QUERY_PERMISSION_LABEL[DataQueryPermission.UNAUTHORIZED],
    value: DataQueryPermission.UNAUTHORIZED
  }
] as const;
