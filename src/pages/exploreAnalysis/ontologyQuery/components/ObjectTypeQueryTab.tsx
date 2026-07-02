import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Pagination,
  Select
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { GlobalTooltip, SearchTable } from '@ceai-front/arco-material';
import { useHistory } from 'react-router-dom';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import {
  INSTANCE_SYNC_CONFIG_OPTIONS,
  SCENE_QUERY_ALL_VALUE
} from '../constants';
import {
  loadObjectTypeQueryCache,
  queryObjectTypes
} from '../services/objectTypeQuery';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import type { ObjectTypeQueryFormValues, ObjectTypeQueryRow } from '../types';
import { SceneQuerySelect } from './SceneQuerySelect';
import styles from '../index.module.scss';

const Option = Select.Option;

const defaultFormValues: ObjectTypeQueryFormValues = {
  objectTypeId: '',
  objectTypeName: '',
  sceneName: SCENE_QUERY_ALL_VALUE,
  description: '',
  instanceSyncConfig: 'all'
};

export const ObjectTypeQueryTab: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm<ObjectTypeQueryFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ObjectTypeQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] =
    useState<ObjectTypeQueryRow | null>(null);

  const fetchList = useCallback(
    async (page = pageNo, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const result = await queryObjectTypes({
          ...values,
          pageNo: page,
          pageSize: size
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(result.pageNo);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('查询对象类型失败:', error);
        Message.error('查询对象类型失败');
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [form, pageNo, pageSize]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadObjectTypeQueryCache(true);
        form.setFieldsValue(defaultFormValues);
        const result = await queryObjectTypes({
          ...defaultFormValues,
          pageNo: 1,
          pageSize: 10
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(1);
        setPageSize(10);
      } catch (error) {
        console.error('加载对象类型数据失败:', error);
        Message.error('加载对象类型数据失败');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      removeStaleArcoOverlays();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPageNo(1);
    fetchList(1, pageSize);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultFormValues);
    setPageNo(1);
    fetchList(1, pageSize);
  };

  const handleViewObjectType = (record: ObjectTypeQueryRow) => {
    setSelectedObjectType(record);
    setDetailVisible(true);
  };

  const handleViewScene = (record: ObjectTypeQueryRow) => {
    history.push(`/tenant/compute/onto/ontologyScene/detail/${record.sceneId}`);
  };

  const columns: ColumnProps<ObjectTypeQueryRow>[] = useMemo(
    () => [
      {
        title: '对象类型id',
        dataIndex: 'code',
        width: 180,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '对象类型名称',
        dataIndex: 'name',
        width: 240,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleViewObjectType(record)}
          >
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className={styles['link-text']}
            />
          </div>
        )
      },
      {
        title: '本体场景库',
        dataIndex: 'sceneName',
        width: 260,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleViewScene(record)}
          >
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className={styles['link-text']}
            />
          </div>
        )
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '实例同步配置',
        dataIndex: 'enableSyncSourceData',
        width: 120,
        render: (value: boolean | undefined) => (
          <GlobalTooltip.Ellipsis text={value ? '是' : '否'} />
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <SearchTable
        className={styles['query-search-table']}
        searchForm={
          <div className={styles['query-toolbar']}>
            <Form
              form={form}
              layout="inline"
              className={styles['query-form']}
              initialValues={defaultFormValues}
            >
              <Form.Item
                field="objectTypeId"
                className={`${styles['query-form-field']} ${styles['query-form-field-id']}`}
              >
                <Input allowClear placeholder="对象类型 ID" />
              </Form.Item>
              <Form.Item
                field="objectTypeName"
                className={`${styles['query-form-field']} ${styles['query-form-field-name']}`}
              >
                <Input allowClear placeholder="对象类型名称" />
              </Form.Item>
              <Form.Item
                field="sceneName"
                className={`${styles['query-form-field']} ${styles['query-form-field-scene']}`}
              >
                <SceneQuerySelect loading={loading} />
              </Form.Item>
              <Form.Item
                field="description"
                className={`${styles['query-form-field']} ${styles['query-form-field-desc']}`}
              >
                <Input allowClear placeholder="描述说明" />
              </Form.Item>
              <Form.Item
                field="instanceSyncConfig"
                className={`${styles['query-form-field']} ${styles['query-form-field-sync']}`}
              >
                <Select placeholder="实例同步配置">
                  {INSTANCE_SYNC_CONFIG_OPTIONS.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <div className={styles['query-form-actions']}>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button type="secondary" onClick={handleReset}>
                  重置
                </Button>
              </div>
            </Form>
          </div>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: (record) => `${record.sceneId}-${record.id}`,
          border: false,
          pagination: false,
          scroll: { x: 980 }
        }}
      />

      {total > 0 && (
        <div className={styles['query-pagination']}>
          <Pagination
            current={pageNo}
            pageSize={pageSize}
            total={total}
            showTotal
            showJumper
            sizeCanChange
            onChange={(page, size) => {
              setPageNo(page);
              setPageSize(size);
              fetchList(page, size);
            }}
          />
        </div>
      )}

      {detailVisible && selectedObjectType && (
        <ObjectTypeDetailDrawer
          visible={detailVisible}
          objectTypeId={String(selectedObjectType.id)}
          ontologyModelId={selectedObjectType.sceneId}
          onClose={() => {
            setDetailVisible(false);
            setSelectedObjectType(null);
            removeStaleArcoOverlays();
          }}
        />
      )}
    </>
  );
};
