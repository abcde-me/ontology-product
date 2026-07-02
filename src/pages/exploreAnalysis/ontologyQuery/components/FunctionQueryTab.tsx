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
import { BehaviorDetail } from '@/pages/ontologyScene/modules/behaviorActions/components';
import { FunctionDetailDrawer } from '@/pages/ontologyScene/components/FunctionDetailDrawer';
import { SCENE_QUERY_ALL_VALUE } from '../constants';
import {
  loadFunctionQueryCache,
  queryFunctions
} from '../services/functionQuery';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import type { FunctionQueryFormValues, FunctionQueryRow } from '../types';
import { SceneQuerySelect } from './SceneQuerySelect';
import styles from '../index.module.scss';

const defaultFormValues: FunctionQueryFormValues = {
  functionCode: '',
  functionName: '',
  description: '',
  relatedAction: '',
  sceneName: SCENE_QUERY_ALL_VALUE
};

export const FunctionQueryTab: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm<FunctionQueryFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FunctionQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [functionDetailVisible, setFunctionDetailVisible] = useState(false);
  const [selectedFunctionId, setSelectedFunctionId] = useState<number>();
  const [behaviorDetailVisible, setBehaviorDetailVisible] = useState(false);
  const [selectedBehaviorId, setSelectedBehaviorId] = useState<number>();

  const fetchList = useCallback(
    async (page = pageNo, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const result = await queryFunctions({
          ...values,
          pageNo: page,
          pageSize: size
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(result.pageNo);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('查询函数失败:', error);
        Message.error('查询函数失败');
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
        await loadFunctionQueryCache(true);
        form.setFieldsValue(defaultFormValues);
        const result = await queryFunctions({
          ...defaultFormValues,
          pageNo: 1,
          pageSize: 10
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(1);
        setPageSize(10);
      } catch (error) {
        console.error('加载函数数据失败:', error);
        Message.error('加载函数数据失败');
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

  const closeAllDrawers = () => {
    setFunctionDetailVisible(false);
    setSelectedFunctionId(undefined);
    setBehaviorDetailVisible(false);
    setSelectedBehaviorId(undefined);
  };

  const handleViewFunction = (record: FunctionQueryRow) => {
    if (!record.id) {
      return;
    }
    closeAllDrawers();
    setSelectedFunctionId(record.id);
    setFunctionDetailVisible(true);
  };

  const handleViewBehavior = (record: FunctionQueryRow) => {
    if (!record.relatedActionId) {
      return;
    }
    closeAllDrawers();
    setSelectedBehaviorId(record.relatedActionId);
    setBehaviorDetailVisible(true);
  };

  const handleViewScene = (record: FunctionQueryRow) => {
    history.push(`/tenant/compute/onto/ontologyScene/detail/${record.sceneId}`);
  };

  const columns: ColumnProps<FunctionQueryRow>[] = useMemo(
    () => [
      {
        title: '函数名称',
        dataIndex: 'code',
        width: 200,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '显示名称',
        dataIndex: 'name',
        width: 180,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleViewFunction(record)}
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
        width: 320,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '关联行为',
        dataIndex: 'relatedActionText',
        width: 260,
        ellipsis: true,
        render: (value, record) => {
          if (!value) {
            return <GlobalTooltip.Ellipsis text="-" />;
          }

          if (!record.relatedActionId) {
            return <GlobalTooltip.Ellipsis text={value} />;
          }

          return (
            <div
              className="hover:cursor-pointer"
              onClick={() => handleViewBehavior(record)}
            >
              <GlobalTooltip.Ellipsis
                text={value}
                className={styles['link-text']}
              />
            </div>
          );
        }
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
                field="functionCode"
                className={`${styles['query-form-field']} ${styles['query-form-field-id']}`}
              >
                <Input allowClear placeholder="函数名称" />
              </Form.Item>
              <Form.Item
                field="functionName"
                className={`${styles['query-form-field']} ${styles['query-form-field-name']}`}
              >
                <Input allowClear placeholder="函数显示名称" />
              </Form.Item>
              <Form.Item
                field="description"
                className={`${styles['query-form-field']} ${styles['query-form-field-desc']}`}
              >
                <Input allowClear placeholder="描述说明" />
              </Form.Item>
              <Form.Item
                field="relatedAction"
                className={`${styles['query-form-field']} ${styles['query-form-field-endpoint']}`}
              >
                <Input allowClear placeholder="关联行为" />
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
          rowKey: (record) => `${record.sceneId}-${record.id ?? record.code}`,
          border: false,
          pagination: false,
          scroll: { x: 1180 }
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

      <FunctionDetailDrawer
        visible={functionDetailVisible}
        data={selectedFunctionId}
        onCancel={() => {
          setFunctionDetailVisible(false);
          setSelectedFunctionId(undefined);
          removeStaleArcoOverlays();
        }}
      />

      <BehaviorDetail
        show={behaviorDetailVisible}
        actionItem={selectedBehaviorId}
        onClose={() => {
          setBehaviorDetailVisible(false);
          setSelectedBehaviorId(undefined);
          removeStaleArcoOverlays();
        }}
      />
    </>
  );
};
