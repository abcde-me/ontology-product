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
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import { FunctionDetailDrawer } from '@/pages/ontologyScene/components/FunctionDetailDrawer';
import { SCENE_QUERY_ALL_VALUE } from '../constants';
import {
  loadBehaviorQueryCache,
  queryBehaviors
} from '../services/behaviorQuery';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import type { BehaviorQueryFormValues, BehaviorQueryRow } from '../types';
import { SceneQuerySelect } from './SceneQuerySelect';
import styles from '../index.module.scss';

const defaultFormValues: BehaviorQueryFormValues = {
  behaviorId: '',
  behaviorName: '',
  description: '',
  objectTypeName: '',
  functionName: '',
  sceneName: SCENE_QUERY_ALL_VALUE
};

export const BehaviorQueryTab: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm<BehaviorQueryFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BehaviorQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [behaviorDetailVisible, setBehaviorDetailVisible] = useState(false);
  const [selectedBehaviorId, setSelectedBehaviorId] = useState<number>();
  const [objectTypeDetailVisible, setObjectTypeDetailVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] =
    useState<BehaviorQueryRow | null>(null);
  const [functionDetailVisible, setFunctionDetailVisible] = useState(false);
  const [selectedFunctionId, setSelectedFunctionId] = useState<number>();

  const fetchList = useCallback(
    async (page = pageNo, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const result = await queryBehaviors({
          ...values,
          pageNo: page,
          pageSize: size
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(result.pageNo);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('查询行为失败:', error);
        Message.error('查询行为失败');
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
        await loadBehaviorQueryCache(true);
        form.setFieldsValue(defaultFormValues);
        const result = await queryBehaviors({
          ...defaultFormValues,
          pageNo: 1,
          pageSize: 10
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(1);
        setPageSize(10);
      } catch (error) {
        console.error('加载行为数据失败:', error);
        Message.error('加载行为数据失败');
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
    setBehaviorDetailVisible(false);
    setSelectedBehaviorId(undefined);
    setObjectTypeDetailVisible(false);
    setSelectedObjectType(null);
    setFunctionDetailVisible(false);
    setSelectedFunctionId(undefined);
  };

  const handleViewBehavior = (record: BehaviorQueryRow) => {
    if (!record.id) {
      return;
    }
    closeAllDrawers();
    setSelectedBehaviorId(record.id);
    setBehaviorDetailVisible(true);
  };

  const handleViewObjectType = (record: BehaviorQueryRow) => {
    const objectTypeId =
      record.objectTypeId ?? Number(record.ontologyObjectTypeId);
    if (!objectTypeId || objectTypeId < 0) {
      return;
    }
    closeAllDrawers();
    setSelectedObjectType(record);
    setObjectTypeDetailVisible(true);
  };

  const handleViewFunction = (record: BehaviorQueryRow) => {
    if (!record.functionId) {
      return;
    }
    closeAllDrawers();
    setSelectedFunctionId(record.functionId);
    setFunctionDetailVisible(true);
  };

  const handleViewScene = (record: BehaviorQueryRow) => {
    history.push(`/tenant/compute/onto/ontologyScene/detail/${record.sceneId}`);
  };

  const isObjectTypeClickable = (record: BehaviorQueryRow) => {
    const objectTypeId =
      record.objectTypeId ?? Number(record.ontologyObjectTypeId);
    return Boolean(objectTypeId && objectTypeId >= 0 && record.objectTypeName);
  };

  const columns: ColumnProps<BehaviorQueryRow>[] = useMemo(
    () => [
      {
        title: '行为ID',
        dataIndex: 'code',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '行为名称',
        dataIndex: 'name',
        width: 180,
        ellipsis: true,
        render: (value, record) => (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleViewBehavior(record)}
          >
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className={styles['link-text']}
            />
          </div>
        )
      },
      {
        title: '行为描述',
        dataIndex: 'description',
        width: 320,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '绑定对象类型',
        dataIndex: 'objectTypeName',
        width: 180,
        ellipsis: true,
        render: (value, record) => {
          const displayName = value || record.objectType || '全局行为';

          if (!isObjectTypeClickable(record)) {
            return <GlobalTooltip.Ellipsis text={displayName} />;
          }

          return (
            <div
              className="hover:cursor-pointer"
              onClick={() => handleViewObjectType(record)}
            >
              <GlobalTooltip.Ellipsis
                text={displayName}
                className={styles['link-text']}
              />
            </div>
          );
        }
      },
      {
        title: '绑定函数',
        dataIndex: 'functionName',
        width: 200,
        ellipsis: true,
        render: (value, record) => {
          if (!value) {
            return <GlobalTooltip.Ellipsis text="-" />;
          }

          if (!record.functionId) {
            return <GlobalTooltip.Ellipsis text={value} />;
          }

          return (
            <div
              className="hover:cursor-pointer"
              onClick={() => handleViewFunction(record)}
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
                field="behaviorId"
                className={`${styles['query-form-field']} ${styles['query-form-field-id']}`}
              >
                <Input allowClear placeholder="行为 ID" />
              </Form.Item>
              <Form.Item
                field="behaviorName"
                className={`${styles['query-form-field']} ${styles['query-form-field-name']}`}
              >
                <Input allowClear placeholder="行为名称" />
              </Form.Item>
              <Form.Item
                field="description"
                className={`${styles['query-form-field']} ${styles['query-form-field-desc']}`}
              >
                <Input allowClear placeholder="行为描述" />
              </Form.Item>
              <Form.Item
                field="objectTypeName"
                className={`${styles['query-form-field']} ${styles['query-form-field-scene']}`}
              >
                <Input allowClear placeholder="绑定对象类型" />
              </Form.Item>
              <Form.Item
                field="functionName"
                className={`${styles['query-form-field']} ${styles['query-form-field-endpoint']}`}
              >
                <Input allowClear placeholder="绑定函数" />
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
          scroll: { x: 1260 }
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

      <BehaviorDetail
        show={behaviorDetailVisible}
        actionItem={selectedBehaviorId}
        onClose={() => {
          setBehaviorDetailVisible(false);
          setSelectedBehaviorId(undefined);
          removeStaleArcoOverlays();
        }}
      />

      {objectTypeDetailVisible && selectedObjectType && (
        <ObjectTypeDetailDrawer
          visible={objectTypeDetailVisible}
          objectTypeId={String(
            selectedObjectType.objectTypeId ??
              selectedObjectType.ontologyObjectTypeId
          )}
          ontologyModelId={selectedObjectType.sceneId}
          onClose={() => {
            setObjectTypeDetailVisible(false);
            setSelectedObjectType(null);
            removeStaleArcoOverlays();
          }}
        />
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
    </>
  );
};
