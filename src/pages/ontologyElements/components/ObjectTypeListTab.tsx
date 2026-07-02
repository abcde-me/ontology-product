import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Pagination,
  Select,
  Space,
  Tooltip
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { GlobalTooltip, SearchTable } from '@ceai-front/arco-material';
import { useHistory } from 'react-router-dom';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import {
  INSTANCE_SYNC_CONFIG_OPTIONS,
  SCENE_QUERY_ALL_VALUE
} from '@/pages/exploreAnalysis/ontologyQuery/constants';
import { SceneQuerySelect } from '@/pages/exploreAnalysis/ontologyQuery/components/SceneQuerySelect';
import { queryObjectTypes } from '@/pages/exploreAnalysis/ontologyQuery/services/objectTypeQuery';
import type {
  ObjectTypeQueryFormValues,
  ObjectTypeQueryRow
} from '@/pages/exploreAnalysis/ontologyQuery/types';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import { QueryFilterToolbar } from './QueryFilterToolbar';
import {
  getOntologyElementsObjectTypeCopyPath,
  getOntologyElementsObjectTypeEditPath,
  getOntologyElementsObjectTypeInstanceSyncPath,
  ONTOLOGY_ELEMENTS_OBJECT_TYPE_CREATE_PATH
} from '../constants';
import { isOntologyElementsLibraryScene } from '../services/elementLibraryModel';
import styles from '@/pages/exploreAnalysis/ontologyQuery/index.module.scss';
import pageStyles from '../index.module.scss';

const Option = Select.Option;

const defaultFormValues: ObjectTypeQueryFormValues = {
  objectTypeId: '',
  objectTypeName: '',
  sceneName: SCENE_QUERY_ALL_VALUE,
  description: '',
  instanceSyncConfig: 'all'
};

export const ObjectTypeListTab: React.FC = () => {
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
  const [hasQueried, setHasQueried] = useState(false);

  const fetchList = useCallback(
    async (page = pageNo, size = pageSize, forceRefresh = false) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const result = await queryObjectTypes({
          ...values,
          pageNo: page,
          pageSize: size,
          forceRefresh
        });
        setData(result.items);
        setTotal(result.total);
        setPageNo(result.pageNo);
        setPageSize(result.pageSize);
      } catch (error) {
        console.error('加载对象类型列表失败:', error);
        Message.error('加载对象类型列表失败');
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [form, pageNo, pageSize]
  );

  useEffect(() => {
    form.setFieldsValue(defaultFormValues);

    return () => {
      removeStaleArcoOverlays();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setHasQueried(true);
    setPageNo(1);
    fetchList(1, pageSize, true);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultFormValues);
    setHasQueried(false);
    setPageNo(1);
    setData([]);
    setTotal(0);
  };

  const handleCreate = () => {
    history.push(ONTOLOGY_ELEMENTS_OBJECT_TYPE_CREATE_PATH);
  };

  const handleViewObjectType = (record: ObjectTypeQueryRow) => {
    setSelectedObjectType(record);
    setDetailVisible(true);
  };

  const handleViewScene = (record: ObjectTypeQueryRow) => {
    history.push(`/tenant/compute/onto/ontologyScene/detail/${record.sceneId}`);
  };

  const handleEdit = (record: ObjectTypeQueryRow) => {
    if (!record.id) {
      Message.warning('对象类型 ID 无效');
      return;
    }

    if (isOntologyElementsLibraryScene(record.sceneId, record.sceneName)) {
      history.push(getOntologyElementsObjectTypeEditPath(record.id));
      return;
    }

    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${record.sceneId}/objectType/edit/${record.id}`
    );
  };

  const handleInstanceSync = (record: ObjectTypeQueryRow) => {
    if (!record.id) {
      Message.warning('对象类型 ID 无效');
      return;
    }

    history.push(getOntologyElementsObjectTypeInstanceSyncPath(record.id));
  };

  const handleCopy = (record: ObjectTypeQueryRow) => {
    if (!record.id) {
      Message.warning('对象类型 ID 无效');
      return;
    }

    history.push(getOntologyElementsObjectTypeCopyPath(record.id));
  };

  const columns: ColumnProps<ObjectTypeQueryRow>[] = useMemo(
    () => [
      {
        title: '对象类型id',
        dataIndex: 'code',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '对象类型名称',
        dataIndex: 'name',
        width: 200,
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
        render: (value, record) => {
          const isLibrary = isOntologyElementsLibraryScene(
            record.sceneId,
            record.sceneName
          );
          const displayText = isLibrary ? '—' : value || '-';

          return (
            <div
              className={isLibrary ? undefined : 'hover:cursor-pointer'}
              onClick={isLibrary ? undefined : () => handleViewScene(record)}
            >
              <GlobalTooltip.Ellipsis
                text={displayText}
                className={isLibrary ? undefined : styles['link-text']}
              />
            </div>
          );
        }
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
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size={8}>
            <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
              <Button
                type="text"
                size="small"
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
            </PermissionWrapper>
            <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.CREATE}>
              <Button
                type="text"
                size="small"
                onClick={() => handleCopy(record)}
              >
                复制
              </Button>
            </PermissionWrapper>
            <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
              <Tooltip content="同步实例">
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleInstanceSync(record)}
                >
                  实例
                </Button>
              </Tooltip>
            </PermissionWrapper>
          </Space>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className={pageStyles['elements-list-tab']}>
      <SearchTable
        className={`${styles['query-search-table']} ${pageStyles['elements-search-table']}`}
        searchForm={
          <QueryFilterToolbar
            actions={
              <>
                <Button type="text" size="small" onClick={handleSearch}>
                  查询
                </Button>
                <Button type="text" size="small" onClick={handleReset}>
                  重置
                </Button>
                <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.CREATE}>
                  <Button type="text" size="small" onClick={handleCreate}>
                    新建
                  </Button>
                </PermissionWrapper>
              </>
            }
          >
            <Form
              form={form}
              layout="inline"
              className={`${styles['query-form']} ${pageStyles['elements-query-form']}`}
              initialValues={defaultFormValues}
            >
              <Form.Item
                field="objectTypeId"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="对象类型 ID" />
              </Form.Item>
              <Form.Item
                field="objectTypeName"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="对象类型名称" />
              </Form.Item>
              <Form.Item
                field="sceneName"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']} ${pageStyles['elements-query-form-field-scene']}`}
              >
                <SceneQuerySelect loading={loading} />
              </Form.Item>
              <Form.Item
                field="description"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="描述说明" />
              </Form.Item>
              <Form.Item
                field="instanceSyncConfig"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']} ${pageStyles['elements-query-form-field-sync']}`}
              >
                <Select placeholder="实例同步配置">
                  {INSTANCE_SYNC_CONFIG_OPTIONS.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </QueryFilterToolbar>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: (record) => `${record.sceneId}-${record.id}`,
          border: false,
          pagination: false,
          scroll: { x: 1120 }
        }}
      />

      {hasQueried && total > 0 && (
        <div
          className={`${styles['query-pagination']} ${pageStyles['elements-pagination']}`}
        >
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
    </div>
  );
};
