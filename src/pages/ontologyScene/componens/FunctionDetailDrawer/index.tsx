import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  ContentWithCopy,
  OsDrawer,
  OSDrawerProps,
  PyCodeContent
} from '@/pages/ontologyScene/componens';
import {
  InputType,
  OntologyFunctionItem,
  OntologyFunctionParam
} from '@/pages/ontologyScene/types/ontologyFunction';
import { Table, TableColumnProps } from '@arco-design/web-react';
import styles from './index.module.scss';
import { useRequest } from 'ahooks';
import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import { isNil } from 'lodash-es';

interface IProps extends OSDrawerProps {
  data?: number;
}

interface ParamRow {
  name: string;
  type: string;
}

const COMMON_PAGINATION = {
  showJumper: false,
  showMore: false,
  sizeCanChange: false,
  pageSize: 10,
  simple: true
};

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

export const FunctionDetailDrawer = (props: IProps) => {
  const { data, className, title, footer, ...drawerProps } = props;

  const { data: functionData, loading } = useRequest(
    () => {
      if (isNil(data)) return Promise.resolve(undefined);
      return getFunctionDetail(data);
    },
    {
      refreshDeps: [data]
    }
  );

  const basicInfo = useMemo(() => {
    return {
      displayName: functionData?.name || '-',
      panelId: functionData?.code || '-',
      description: functionData?.description || '-'
    };
  }, [functionData]);

  const { inputParams, outputParams } = useMemo(() => {
    return splitParams(functionData?.params);
  }, [functionData]);
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
              <div className={styles['info-label']}>函数名称(id)</div>
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
            data={inputParams}
            pagination={COMMON_PAGINATION}
            border={false}
          />
        </div>

        {/* 输出详情 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>输出详情</div>
          <Table
            className={styles['detail-table']}
            data={outputParams}
            columns={OUTPUT_COLUMNS}
            border={false}
            pagination={COMMON_PAGINATION}
          />
        </div>
        <div className={styles['section']}>
          <div className={styles['section-title']}>函数</div>
          <PyCodeContent value={functionData?.content} readOnly />
        </div>
      </div>
    </OsDrawer>
  );
};
