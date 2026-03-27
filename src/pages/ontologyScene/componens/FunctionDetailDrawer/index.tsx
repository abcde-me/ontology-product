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
import { Message, Table, TableColumnProps } from '@arco-design/web-react';
import styles from './index.module.scss';
import { useRequest } from 'ahooks';
import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import { isNil } from 'lodash-es';
import { EllipsisPopover, GlobalTooltip } from '@ceai-front/arco-material';

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
  showTotal: true,
  sizeCanChange: false,
  pageSize: 6,
  simple: true
};

const INPUT_COLUMNS: TableColumnProps<ParamRow>[] = [
  {
    title: '入参名称',
    dataIndex: 'name',
    ellipsis: true,
    render: (value: string) => {
      return (
        <EllipsisPopover
          value={value || '-'}
          wrapperClassName={'w-full'}
          preferTypography
        />
      );
    }
  },
  {
    title: '入参类型',
    dataIndex: 'type',
    width: 400,
    ellipsis: true,
    render: (value: string) => {
      return (
        <EllipsisPopover
          value={value || '-'}
          wrapperClassName={'w-full'}
          preferTypography
        />
      );
    }
  }
];

const OUTPUT_COLUMNS: TableColumnProps<ParamRow>[] = [
  {
    title: '出参名称',
    dataIndex: 'name',
    ellipsis: true,
    render: (value: string) => {
      return (
        <EllipsisPopover
          value={value || '-'}
          preferTypography
          wrapperClassName={'w-full'}
        />
      );
    }
  },
  {
    title: '出参类型',
    dataIndex: 'type',
    width: 400,
    ellipsis: true,
    render: (value: string) => {
      return <GlobalTooltip.Ellipsis text={value || '-'} />;
    }
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
      getChildrenPopupContainer={(node) => node.parentElement || document.body}
    >
      <div className={styles['drawer-content']}>
        {/* 基本信息 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>基本信息</div>
          <div className={styles['info-grid']}>
            <div className={styles['info-item']}>
              <div className={styles['info-label']}>显示名称</div>
              <div className={styles['info-value']}>
                <GlobalTooltip.Ellipsis
                  text={basicInfo?.displayName || '-'}
                  // wrapperClassName={'w-full'}
                >
                  {basicInfo?.displayName || '-'}
                </GlobalTooltip.Ellipsis>
              </div>
            </div>
            <div className={styles['info-item']}>
              <div
                className={styles['info-label']}
                style={{ width: 90, marginRight: 16 }}
              >
                函数名称(id)
              </div>
              <div className={styles['info-value']}>
                <ContentWithCopy value={basicInfo.panelId} />
              </div>
            </div>
            <div className={styles['info-item']}>
              <div className={styles['info-label']}>描述说明</div>
              <div className={styles['info-value']}>
                <EllipsisPopover
                  value={basicInfo?.description || '-'}
                  // preferTypography
                  wrapperClassName={'w-full'}
                >
                  {basicInfo?.description || '-'}
                </EllipsisPopover>
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
            border={{
              wrapper: true
            }}
          />
        </div>

        {/* 输出详情 */}
        <div className={styles['section']}>
          <div className={styles['section-title']}>输出详情</div>
          <Table
            className={styles['detail-table']}
            data={outputParams}
            columns={OUTPUT_COLUMNS}
            border={{
              wrapper: true
            }}
            pagination={COMMON_PAGINATION}
          />
        </div>
        <div className={styles['section']}>
          <div className={styles['section-title']}>函数</div>
          <PyCodeContent
            value={functionData?.content}
            readOnly
            copy
            fullScreen
          />
        </div>
      </div>
    </OsDrawer>
  );
};
