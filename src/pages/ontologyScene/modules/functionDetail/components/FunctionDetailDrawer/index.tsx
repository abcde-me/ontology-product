import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  ContentWithCopy,
  OsDrawer,
  OSDrawerProps
} from '@/pages/ontologyScene/componens';
import {
  InputType,
  OntologyFunctionItem,
  OntologyFunctionParam
} from '@/pages/ontologyScene/types/ontologyFunction';
import {
  Empty,
  Pagination,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import styles from './index.module.scss';
import { CopyItemIcon, SearchTable } from '@ceai-front/arco-material';

interface IProps extends OSDrawerProps {
  data?: OntologyFunctionItem;
}

interface ParamRow {
  name: string;
  type: string;
}

const DEFAULT_PAGE_SIZE = 5;

const INPUT_COLUMNS: TableColumnProps<ParamRow>[] = [
  {
    title: '入参名称',
    dataIndex: 'name',
    render: (value: string) => value || '-'
  },
  {
    title: '入参类型',
    dataIndex: 'type',
    render: (value: string) => value || '-'
  }
];

const OUTPUT_COLUMNS: TableColumnProps<ParamRow>[] = [
  {
    title: '出参名称',
    dataIndex: 'name',
    render: (value: string) => value || '-'
  },
  {
    title: '出参类型',
    dataIndex: 'type',
    render: (value: string) => value || '-'
  }
];

const toParamRow = (param: OntologyFunctionParam): ParamRow => {
  return {
    name: param?.name || '-',
    type: param?.type ? String(param.type) : '-'
  };
};

const splitParams = (params?: OntologyFunctionParam[]) => {
  const inputParams: ParamRow[] = [];
  const outputParams: ParamRow[] = [];

  (params || []).forEach((param) => {
    const row = toParamRow(param);
    if (param.inputType === InputType.Output) {
      outputParams.push(row);
    } else {
      inputParams.push(row);
    }
  });

  return { inputParams, outputParams };
};

const getPagedData = (list: ParamRow[], current: number, pageSize: number) => {
  const start = (current - 1) * pageSize;
  return list.slice(start, start + pageSize);
};

export const FunctionDetailDrawer = (props: IProps) => {
  const { data, className, title, footer, ...drawerProps } = props;
  // Pagination state for input/output tables is maintained separately.
  const [inputPagination, setInputPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });
  const [outputPagination, setOutputPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const basicInfo = useMemo(() => {
    return {
      displayName: data?.name || '-',
      panelId: data?.code || '-',
      description: data?.description || '-'
    };
  }, [data]);

  const { inputParams, outputParams } = useMemo(() => {
    return splitParams(data?.params);
  }, [data]);

  const inputTableData = useMemo(() => {
    return getPagedData(
      inputParams,
      inputPagination.current,
      inputPagination.pageSize
    );
  }, [inputParams, inputPagination]);

  const outputTableData = useMemo(() => {
    return getPagedData(
      outputParams,
      outputPagination.current,
      outputPagination.pageSize
    );
  }, [outputParams, outputPagination]);

  const COMMON_PAGINATION = {
    showJumper: false,
    showMore: false,
    sizeCanChange: false,
    pageSize: 10,
    simple: true
  };
  return (
    <OsDrawer
      {...drawerProps}
      title={title ?? '函数详情'}
      footer={footer ?? null}
      className={classNames(styles['function-detail-drawer'], className)}
    >
      <div className={styles['drawer-content']}>
        {/* 基本信息 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>基本信息</div>
          <div className={styles['info-grid']}>
            <div className={styles['info-item']}>
              <div className={styles['info-label']}>显示名称</div>
              <div className={styles['info-value']}>
                {basicInfo.displayName}
              </div>
            </div>
            <div className={styles['info-item']}>
              <div className={styles['info-label']}>面板ID</div>
              <div className={styles['info-value']}>
                <ContentWithCopy value={basicInfo.panelId} />
              </div>
            </div>
            <div className={styles['info-item']}>
              <div className={styles['info-label']}>描述说明</div>
              <div className={styles['info-value']}>
                {basicInfo.description}
              </div>
            </div>
          </div>
        </div>

        {/* 输入详情 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>输入详情</div>
          <Table
            className={styles['detail-table']}
            columns={INPUT_COLUMNS}
            data={inputTableData}
            pagination={COMMON_PAGINATION}
            border={false}
          />
        </div>

        {/* 输出详情 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>输出详情</div>
          <Table
            className={styles['detail-table']}
            data={outputTableData}
            columns={OUTPUT_COLUMNS}
            border={false}
            pagination={COMMON_PAGINATION}
          />
        </div>
      </div>
    </OsDrawer>
  );
};
