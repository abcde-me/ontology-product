import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Pagination
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { GlobalTooltip, SearchTable } from '@ceai-front/arco-material';
import { useHistory } from 'react-router-dom';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import { SCENE_QUERY_ALL_VALUE } from '../constants';
import {
  loadAttributeQueryCache,
  queryAttributes
} from '../services/attributeQuery';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import type { AttributeQueryFormValues, AttributeQueryRow } from '../types';
import { SceneQuerySelect } from './SceneQuerySelect';
import styles from '../index.module.scss';

const defaultFormValues: AttributeQueryFormValues = {
  attributeId: '',
  attributeName: '',
  attributeType: '',
  objectTypeName: '',
  sceneName: SCENE_QUERY_ALL_VALUE
};

export const AttributeQueryTab: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm<AttributeQueryFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttributeQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] =
    useState<AttributeQueryRow | null>(null);

  const fetchList = useCallback(
    async (page = pageNo, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const result = await queryAttributes({
          ...values,
          pageNo: page,
          pageSize: size
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(result.pageNo);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('查询属性失败:', error);
        Message.error('查询属性失败');
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
        await loadAttributeQueryCache(true);
        form.setFieldsValue(defaultFormValues);
        const result = await queryAttributes({
          ...defaultFormValues,
          pageNo: 1,
          pageSize: 10
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(1);
        setPageSize(10);
      } catch (error) {
        console.error('加载属性数据失败:', error);
        Message.error('加载属性数据失败');
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

  const handleViewAttribute = (record: AttributeQueryRow) => {
    const search = encodeURIComponent(record.name || record.comment || '');
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${record.sceneId}/attributes/list?tab=normal&search=${search}`
    );
  };

  const handleViewObjectType = (record: AttributeQueryRow) => {
    setSelectedObjectType(record);
    setDetailVisible(true);
  };

  const handleViewScene = (record: AttributeQueryRow) => {
    history.push(`/tenant/compute/onto/ontologyScene/detail/${record.sceneId}`);
  };

  const columns: ColumnProps<AttributeQueryRow>[] = useMemo(
    () => [
      {
        title: '属性ID',
        dataIndex: 'name',
        width: 180,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '属性名称',
        dataIndex: 'comment',
        width: 240,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleViewAttribute(record)}
          >
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className={styles['link-text']}
            />
          </div>
        )
      },
      {
        title: '属性类型',
        dataIndex: 'columnType',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '所属对象类型',
        dataIndex: 'ontologyObjectTypeName',
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
        width: 220,
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
                field="attributeId"
                className={`${styles['query-form-field']} ${styles['query-form-field-id']}`}
              >
                <Input allowClear placeholder="属性 ID" />
              </Form.Item>
              <Form.Item
                field="attributeName"
                className={`${styles['query-form-field']} ${styles['query-form-field-name']}`}
              >
                <Input allowClear placeholder="属性名称" />
              </Form.Item>
              <Form.Item
                field="attributeType"
                className={`${styles['query-form-field']} ${styles['query-form-field-desc']}`}
              >
                <Input allowClear placeholder="属性类型" />
              </Form.Item>
              <Form.Item
                field="objectTypeName"
                className={`${styles['query-form-field']} ${styles['query-form-field-endpoint']}`}
              >
                <Input allowClear placeholder="所属对象类型" />
              </Form.Item>
              <Form.Item
                field="sceneName"
                className={`${styles['query-form-field']} ${styles['query-form-field-scene']}`}
              >
                <SceneQuerySelect loading={loading} />
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
          rowKey: (record) =>
            `${record.sceneId}-${record.id ?? record.name}-${record.ontologyObjectTypeId}`,
          border: false,
          pagination: false,
          scroll: { x: 1040 }
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

      {detailVisible && selectedObjectType?.ontologyObjectTypeId && (
        <ObjectTypeDetailDrawer
          visible={detailVisible}
          objectTypeId={String(selectedObjectType.ontologyObjectTypeId)}
          ontologyModelId={selectedObjectType.sceneId}
          defaultActiveTab="attributes"
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
