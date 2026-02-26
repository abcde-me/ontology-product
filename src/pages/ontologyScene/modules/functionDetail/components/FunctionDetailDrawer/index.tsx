import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { OsDrawer, OSDrawerProps } from '@/pages/ontologyScene/componens';
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

interface IProps extends OSDrawerProps {
  data?: OntologyFunctionItem;
}

interface BasicInfo {
  displayName: string;
  panelId: string;
  description: string;
}

interface ParamRow {
  name: string;
  type: string;
}

const DEFAULT_PAGE_SIZE = 5;

// Mock data for standalone display without API wiring.
const MOCK_BASIC_INFO: BasicInfo = {
  displayName: '函数示例',
  panelId: 'panel_function_001',
  description: '用于演示函数参数详情展示的示例数据。'
};

const MOCK_INPUT_PARAMS: ParamRow[] = [
  { name: 'device_id', type: 'String' },
  { name: 'start_time', type: 'Timestamp' },
  { name: 'end_time', type: 'Timestamp' },
  { name: 'with_detail', type: 'Boolean' },
  { name: 'page_size', type: 'Int' },
  { name: 'page_index', type: 'Int' }
];

const MOCK_OUTPUT_PARAMS: ParamRow[] = [
  { name: 'success', type: 'Boolean' },
  { name: 'message', type: 'String' },
  { name: 'data_list', type: 'Array' },
  { name: 'total', type: 'Int' }
];

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

  const basicInfo = useMemo<BasicInfo>(() => {
    return {
      displayName: data?.name ?? MOCK_BASIC_INFO.displayName,
      panelId:
        data?.code ?? (data?.id ? String(data.id) : MOCK_BASIC_INFO.panelId),
      description: data?.description ?? MOCK_BASIC_INFO.description
    };
  }, [data]);

  const { inputParams, outputParams } = useMemo(() => {
    if (data?.params?.length) {
      return splitParams(data.params);
    }
    return {
      inputParams: MOCK_INPUT_PARAMS,
      outputParams: MOCK_OUTPUT_PARAMS
    };
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
              <div className={styles['info-value']}>{basicInfo.panelId}</div>
            </div>
            <div className={styles['info-item']}>
              <div className={styles['info-label']}>描述说明</div>
              <div className={styles['info-value']}>
                {basicInfo.description}
              </div>
            </div>
          </div>
        </div>

        <div className={styles['section-divider']} />

        {/* 输入详情 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>输入详情</div>
          <Table
            className={styles['detail-table']}
            columns={INPUT_COLUMNS}
            data={inputTableData}
            pagination={false}
            border={false}
            rowKey="name"
          />
          <div className={styles['pagination-wrapper']}>
            <Pagination
              size="small"
              current={inputPagination.current}
              pageSize={inputPagination.pageSize}
              total={inputParams.length}
              onChange={(page, pageSize) => {
                setInputPagination((prev) => ({
                  current: page,
                  pageSize: pageSize || prev.pageSize
                }));
              }}
            />
          </div>
        </div>

        <div className={styles['section-divider']} />

        {/* 输出详情 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>输出详情</div>
          <Table
            className={styles['detail-table']}
            columns={OUTPUT_COLUMNS}
            data={outputTableData}
            pagination={false}
            border={false}
            rowKey="name"
          />
          <div className={styles['pagination-wrapper']}>
            <Pagination
              size="small"
              current={outputPagination.current}
              pageSize={outputPagination.pageSize}
              total={outputParams.length}
              onChange={(page, pageSize) => {
                setOutputPagination((prev) => ({
                  current: page,
                  pageSize: pageSize || prev.pageSize
                }));
              }}
            />
          </div>
        </div>
      </div>
    </OsDrawer>
  );
};
