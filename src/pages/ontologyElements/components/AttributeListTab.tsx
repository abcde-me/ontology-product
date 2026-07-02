import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Pagination,
  Popover,
  Space
} from '@arco-design/web-react';

import type { ColumnProps } from '@arco-design/web-react/es/Table';

import { GlobalTooltip, SearchTable } from '@ceai-front/arco-material';

import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';

import { ObjectTypeTagList } from '@/pages/ontologyScene/components';

import PublicAttributeModal, {
  PublicAttributeFormData
} from '@/pages/ontologyScene/modules/attributes/components/PublicAttributeModal';

import {
  createOntologyPublicProperties,
  deleteOntologyPublicProperties,
  updateOntologyPublicProperties
} from '@/api/ontologySceneLibrary/attributes';

import { isOntologyApiSuccess } from '@/utils/apiResponse';

import { PermissionWrapper } from '@/components/PermissionGuard';

import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';

import type { AttributeQueryFormValues } from '@/pages/exploreAnalysis/ontologyQuery/types';

import type { PublicProperty } from '@/types/attributes';

import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';

import {
  invalidatePublicAttributeQueryCache,
  queryPublicAttributes
} from '../services/publicAttributeQuery';

import { QueryFilterToolbar } from './QueryFilterToolbar';

import styles from '@/pages/exploreAnalysis/ontologyQuery/index.module.scss';

import pageStyles from '../index.module.scss';

const defaultFormValues: AttributeQueryFormValues = {
  attributeId: '',

  attributeName: '',

  attributeType: '',

  objectTypeName: ''
};

export const AttributeListTab: React.FC = () => {
  const [form] = Form.useForm<AttributeQueryFormValues>();

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<PublicProperty[]>([]);

  const [total, setTotal] = useState(0);

  const [pageNo, setPageNo] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [detailVisible, setDetailVisible] = useState(false);

  const [selectedObjectTypeId, setSelectedObjectTypeId] = useState<
    string | null
  >(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const [editingRecord, setEditingRecord] = useState<PublicProperty | null>(
    null
  );

  const [submitLoading, setSubmitLoading] = useState(false);

  const [hasQueried, setHasQueried] = useState(false);

  const fetchList = useCallback(
    async (page = pageNo, size = pageSize, forceRefresh = false) => {
      setLoading(true);

      try {
        const values = form.getFieldsValue();

        const result = await queryPublicAttributes({
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
        console.error('加载属性列表失败:', error);

        Message.error('加载属性列表失败');

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
    setModalMode('create');

    setEditingRecord(null);

    setModalVisible(true);
  };

  const handleEdit = (record: PublicProperty) => {
    setModalMode('edit');

    setEditingRecord(record);

    setModalVisible(true);
  };

  const handleDelete = (record: PublicProperty) => {
    if (!record.id) {
      Message.warning('属性 ID 无效');

      return;
    }

    Modal.confirm({
      title: '确认删除',

      content: `确定要删除属性「${record.comment || record.name}」吗？`,

      onOk: async () => {
        try {
          const response = await deleteOntologyPublicProperties({
            id: record.id!
          });

          if (isOntologyApiSuccess(response)) {
            Message.success('删除成功');

            invalidatePublicAttributeQueryCache();

            fetchList(pageNo, pageSize, true);

            return;
          }

          Message.error(response.message || '删除失败');
        } catch (error) {
          console.error('删除属性失败:', error);

          Message.error('删除失败');
        }
      }
    });
  };

  const handleViewObjectType = (objectTypeId?: number) => {
    if (!objectTypeId) {
      return;
    }

    setSelectedObjectTypeId(String(objectTypeId));

    setDetailVisible(true);
  };

  const handleModalSubmit = async (formData: PublicAttributeFormData) => {
    setSubmitLoading(true);

    try {
      if (modalMode === 'create') {
        const response = await createOntologyPublicProperties({
          name: formData.name,

          comment: formData.comment,

          columnType: formData.columnType,

          description: formData.description
        });

        if (isOntologyApiSuccess(response)) {
          Message.success('创建成功');

          setModalVisible(false);

          invalidatePublicAttributeQueryCache();

          if (hasQueried) {
            fetchList(pageNo, pageSize, true);
          }

          return;
        }

        Message.error(response.message || '创建失败，请重试');

        return;
      }

      if (!editingRecord?.id) {
        Message.warning('属性 ID 无效');

        return;
      }

      const response = await updateOntologyPublicProperties({
        id: editingRecord.id,

        name: formData.name,

        comment: formData.comment,

        columnType: formData.columnType,

        description: formData.description
      });

      if (isOntologyApiSuccess(response)) {
        Message.success('更新成功');

        setModalVisible(false);

        invalidatePublicAttributeQueryCache();

        fetchList(pageNo, pageSize, true);

        return;
      }

      Message.error(response.message || '更新失败，请重试');
    } catch (error) {
      console.error('保存属性失败:', error);

      Message.error('保存失败，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnProps<PublicProperty>[] = useMemo(
    () => [
      {
        title: '属性ID',

        dataIndex: 'name',

        width: 160,

        ellipsis: true,

        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },

      {
        title: '属性名称',

        dataIndex: 'comment',

        width: 200,

        ellipsis: true,

        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },

      {
        title: '属性类型',

        dataIndex: 'columnType',

        width: 140,

        ellipsis: true,

        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },

      {
        title: '所属对象类型',

        dataIndex: 'ontologyObjectTypeList',

        width: 200,

        ellipsis: true,

        render: (_, record) => {
          const objectTypeList = record.ontologyObjectTypeList || [];

          if (objectTypeList.length === 0) {
            return <GlobalTooltip.Ellipsis text="-" />;
          }

          const tags = objectTypeList.map((item) => ({
            showFullName: true,

            ontologyObjectTypeName: item.name || '',

            ontologyObjectTypeId: item.id,

            ontologyObjectTypeIcon: item.icon,

            onClick: () => handleViewObjectType(item.id),

            hoverClassName: 'hover-text-blue'
          }));

          return <ObjectTypeTagList tags={tags} showAll />;
        }
      },

      {
        title: '本体场景库',

        dataIndex: 'sceneName',

        width: 200,

        ellipsis: true,

        render: () => <GlobalTooltip.Ellipsis text="—" />
      },

      {
        title: '操作',

        dataIndex: 'actions',

        width: 120,

        fixed: 'right',

        render: (_, record) => {
          const disableDelete = (record.ontologyObjectTypeCounts || 0) > 0;

          const deleteButton = (
            <Button
              type="text"
              size="small"
              disabled={disableDelete}
              onClick={() => {
                if (!disableDelete) {
                  handleDelete(record);
                }
              }}
            >
              删除
            </Button>
          );

          return (
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

              <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.DELETE}>
                {disableDelete ? (
                  <Popover content="请先移除对象关联">{deleteButton}</Popover>
                ) : (
                  deleteButton
                )}
              </PermissionWrapper>
            </Space>
          );
        }
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
                field="attributeId"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="属性 ID" />
              </Form.Item>

              <Form.Item
                field="attributeName"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="属性名称" />
              </Form.Item>

              <Form.Item
                field="attributeType"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="属性类型" />
              </Form.Item>

              <Form.Item
                field="objectTypeName"
                className={`${styles['query-form-field']} ${pageStyles['elements-query-form-field']}`}
              >
                <Input allowClear placeholder="所属对象类型" />
              </Form.Item>
            </Form>
          </QueryFilterToolbar>
        }
        tableProps={{
          columns,

          data,

          loading,

          rowKey: (record) => String(record.id ?? record.name),

          border: false,

          pagination: false,

          scroll: { x: 1020 }
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

      <PublicAttributeModal
        visible={modalVisible}
        mode={modalMode}
        initialValues={editingRecord || undefined}
        loading={submitLoading}
        onCancel={() => {
          setModalVisible(false);

          setEditingRecord(null);
        }}
        onSubmit={handleModalSubmit}
      />

      {detailVisible && selectedObjectTypeId && (
        <ObjectTypeDetailDrawer
          visible={detailVisible}
          objectTypeId={selectedObjectTypeId}
          defaultActiveTab="attributes"
          onClose={() => {
            setDetailVisible(false);

            setSelectedObjectTypeId(null);

            removeStaleArcoOverlays();
          }}
        />
      )}
    </div>
  );
};
