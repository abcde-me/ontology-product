import React, { useEffect, useMemo, useState } from 'react';

import { Message, Spin, Table, Tabs } from '@arco-design/web-react';

import type { ColumnProps } from '@arco-design/web-react/es/Table';

import { GlobalTooltip } from '@ceai-front/arco-material';

import { useHistory, useParams } from 'react-router-dom';

import PageHeader from '@/components/PageHeader';

import type { DataResourceField, DataResourceTable } from './types';

import { fetchDataResourceDetail } from './services/api';

import { fetchDataResourceSampleData } from './services/sampleData';

import styles from './index.module.scss';

const LIST_PATH = '/tenant/compute/onto/dataConnection/dataResource';

const DETAIL_TAB_FIELDS = 'fields';

const DETAIL_TAB_SAMPLE = 'sample';

const FIELD_TABLE_MIN_WIDTH = 960;

const formatSampleCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }

  return String(value);
};

const fieldColumns: ColumnProps<DataResourceField>[] = [
  {
    title: '序号',

    width: 64,

    align: 'center',

    render: (_, __, index) => index + 1
  },

  {
    title: '字段名称',

    dataIndex: 'fieldName',

    width: 220,

    ellipsis: true,

    render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
  },

  {
    title: '字段注释',

    dataIndex: 'fieldComment',

    ellipsis: true,

    render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
  },

  {
    title: '字段类型',

    dataIndex: 'fieldType',

    width: 200,

    ellipsis: true,

    render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
  }
];

export default function DataResourceDetail() {
  const history = useHistory();

  const { id = '' } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<DataResourceTable | null>(null);

  const [activeTab, setActiveTab] = useState(DETAIL_TAB_FIELDS);

  const [sampleRows, setSampleRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchDataResourceDetail(id);

        if (!active) {
          return;
        }

        if (!data) {
          Message.error('数据表不存在');

          history.replace(LIST_PATH);

          return;
        }

        setDetail(data);

        const samples = await fetchDataResourceSampleData(id);

        if (active) {
          setSampleRows(samples);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [history, id]);

  const pageTitle = useMemo(
    () => detail?.tableName || '数据表详情',

    [detail?.tableName]
  );

  const sampleColumns = useMemo<ColumnProps<Record<string, unknown>>[]>(() => {
    if (!detail) {
      return [];
    }

    return [
      {
        title: '序号',

        width: 64,

        align: 'center',

        render: (_, __, index) => index + 1
      },

      ...detail.fields.map((field) => ({
        title: field.fieldComment || field.fieldName,

        dataIndex: field.fieldName,

        width: 180,

        ellipsis: true,

        render: (value: unknown) => (
          <GlobalTooltip.Ellipsis text={formatSampleCellValue(value)} />
        )
      }))
    ];
  }, [detail]);

  const sampleTableMinWidth = useMemo(() => {
    if (!detail) {
      return FIELD_TABLE_MIN_WIDTH;
    }

    return 64 + detail.fields.length * 180;
  }, [detail]);

  return (
    <div className={styles['data-resource-detail-page']}>
      <PageHeader
        showBack
        backPath={LIST_PATH}
        title={pageTitle}
        subTitle="查看表元数据及标准化字段清单"
      />

      <Spin loading={loading} className="mt-4 w-full">
        {detail ? (
          <>
            <div className={styles['detail-summary']}>
              <div className={styles['detail-summary-row']}>
                <span className={styles['detail-summary-label']}>
                  数据库类型：
                </span>

                <span className={styles['detail-summary-value']}>
                  {detail.databaseType}
                </span>
              </div>

              <div className={styles['detail-summary-row']}>
                <span className={styles['detail-summary-label']}>表名：</span>

                <span className={styles['detail-summary-value']}>
                  {detail.tableName}
                </span>
              </div>

              <div className={styles['detail-summary-row']}>
                <span className={styles['detail-summary-label']}>表注释：</span>

                <span className={styles['detail-summary-value']}>
                  {detail.tableComment}
                </span>
              </div>

              <div className={styles['detail-summary-row']}>
                <span className={styles['detail-summary-label']}>
                  来源系统：
                </span>

                <span className={styles['detail-summary-value']}>
                  {detail.sourceSystem}
                </span>
              </div>
            </div>

            <Tabs
              activeTab={activeTab}
              className={styles['detail-tabs']}
              onChange={setActiveTab}
            >
              <Tabs.TabPane key={DETAIL_TAB_FIELDS} title="字段信息">
                <Table
                  className={styles['detail-fields-table']}
                  columns={fieldColumns}
                  data={detail.fields}
                  rowKey="fieldName"
                  pagination={false}
                  border={false}
                  tableLayoutFixed
                  scroll={{ x: FIELD_TABLE_MIN_WIDTH }}
                />
              </Tabs.TabPane>

              <Tabs.TabPane key={DETAIL_TAB_SAMPLE} title="示例数据">
                <Table
                  className={styles['detail-fields-table']}
                  columns={sampleColumns}
                  data={sampleRows}
                  rowKey={(_, index) => String(index)}
                  pagination={false}
                  border={false}
                  tableLayoutFixed
                  scroll={{ x: sampleTableMinWidth }}
                />
              </Tabs.TabPane>
            </Tabs>
          </>
        ) : null}
      </Spin>
    </div>
  );
}
