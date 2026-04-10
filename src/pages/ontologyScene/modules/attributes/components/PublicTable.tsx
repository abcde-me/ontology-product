import React, {
  useState,
  useEffect,
  useImperativeHandle,
  useCallback
} from 'react';
import {
  Button,
  Form,
  Input,
  Space,
  TableColumnProps,
  Pagination,
  Message,
  Modal,
  Popover
} from '@arco-design/web-react';
import { IconPlus, IconSearch } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import { EllipsisPopover } from '@/pages/ontologyScene/components';

import useUrlState from '@ahooksjs/use-url-state';
import { useWorkflowTable } from '../../../hooks/useTable';
import styles from '../list.module.scss';
import PublicAttributeModal, {
  PublicAttributeFormData
} from './PublicAttributeModal';
import {
  listOntologyPublicProperties,
  createOntologyPublicProperties,
  updateOntologyPublicProperties,
  deleteOntologyPublicProperties
} from '@/api/ontologySceneLibrary/attributes';
import { PublicProperty } from '@/types/attributes';
import { ListOntologyPublicPropertiesReq } from '@/types/attributes';
import { ObjectTypeTagList } from '@/pages/ontologyScene/components';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import dayjs from 'dayjs';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';

// 公共属性数据接口（保留用于兼容性）
export interface PublicAttributeItem {
  id: string;
  name: string;
  description: string;
  objectTypes: Array<{
    name: string;
    color: string;
    icon?: string;
  }>;
  fieldType: string;
  referenceCount: number;
  lastModifiedTime: string;
}

export interface PublicTableProps {
  /** total 变化时的回调函数 */
  onTotalChange?: (total: number) => void;
  /** 创建成功时的回调函数 */
  onCreateSuccess?: () => void;
}

export interface PublicTableRef {
  /** 打开创建公共属性的弹窗 */
  openCreateModal: () => void;
}

const PublicTable = React.forwardRef<PublicTableRef, PublicTableProps>(
  ({ onTotalChange, onCreateSuccess }: PublicTableProps = {}, ref) => {
    const [form] = Form.useForm();
    const [urlState, setUrlState] = useUrlState({ search: '', tab: '' });

    // 弹窗相关状态
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingRecord, setEditingRecord] = useState<PublicProperty | null>(
      null
    );
    const [submitLoading, setSubmitLoading] = useState(false);

    // 详情抽屉相关状态
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedObjectType, setSelectedObjectType] = useState<{
      id: string;
    } | null>(null);
    const [activeTab, setActiveTab] = useState<
      'instances' | 'attributes' | 'links'
    >('attributes');
    // 不随搜索变化的公共属性总数（用于 Tab 上展示）
    const [allTotal, setAllTotal] = useState<number | undefined>(undefined);

    // 使用 useTable hook
    const { data, loading, pagination, refresh, submit, onChange } =
      useWorkflowTable<PublicProperty, ListOntologyPublicPropertiesReq>({
        service: async (params: ListOntologyPublicPropertiesReq) => {
          try {
            const response = await listOntologyPublicProperties({
              filter: params.filter,
              pageNo: params.pageNo || 1,
              pageSize: params.pageSize || 10,
              orderBy: params.orderBy,
              order: params.order
            });

            if (response.status === 200 && response.data) {
              const totalCount = response.data.totalCount || 0;

              // 只有在“无搜索关键词”时，才更新全量总数，
              // 确保 Tab 上展示的是公共属性总数，而不是搜索后的数量。
              if (!params.filter) {
                setAllTotal(totalCount);
              }

              return {
                data: {
                  items: response.data.result || [],
                  total: totalCount,
                  page: params.pageNo || 1,
                  page_size: params.pageSize || 10
                }
              };
            }

            return {
              data: {
                items: [],
                total: 0,
                page: params.pageNo || 1,
                page_size: params.pageSize || 10
              }
            };
          } catch (error) {
            console.error('获取公共属性列表失败:', error);
            Message.error('获取公共属性列表失败');
            return {
              data: {
                items: [],
                total: 0,
                page: params.pageNo || 1,
                page_size: params.pageSize || 10
              }
            };
          }
        },
        formatParams: (formValues, pagination, sorter) => {
          const hasSorterField = sorter && sorter.direction;

          return {
            filter: formValues.keyword,
            pageNo: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
            ...(hasSorterField && {
              orderBy: sorter.field,
              order: sorter && sorter.direction === 'ascend' ? 'asc' : 'desc'
            })
          } as ListOntologyPublicPropertiesReq;
        },
        form,
        defaultPageSize: 10,
        manual: false // 手动控制请求，避免自动请求导致重复
      });

    // 从 URL 的 search 参数同步到表单
    useEffect(() => {
      const currentKeyword = form.getFieldValue('keyword');
      const searchValue = urlState.search || '';
      if (
        searchValue !== '' &&
        searchValue !== currentKeyword &&
        urlState.tab === 'public'
      ) {
        form.setFieldsValue({ keyword: searchValue });
        // 延迟提交，确保表单值已设置
        setTimeout(() => {
          submit();
        }, 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlState.search]);

    // 当 total / 全量 total 变化时，通知父组件
    useEffect(() => {
      if (!onTotalChange) return;
      // Tab 上展示的数量：优先使用“全量总数”，退化为当前分页 total
      const totalForDisplay =
        allTotal !== undefined
          ? allTotal
          : pagination?.total !== undefined
            ? pagination.total
            : 0;
      onTotalChange(totalForDisplay);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allTotal, pagination?.total]);

    // 暴露给父组件的 ref 方法：打开创建弹窗
    useImperativeHandle(ref, () => ({
      openCreateModal: () => {
        setModalMode('create');
        setEditingRecord(null);
        setModalVisible(true);
      }
    }));

    // 打开创建弹窗（内部使用）
    const handleCreate = () => {
      setModalMode('create');
      setEditingRecord(null);
      setModalVisible(true);
    };

    // 打开编辑弹窗
    const handleEdit = (record: PublicProperty) => {
      setModalMode('edit');
      setEditingRecord(record);
      setModalVisible(true);
    };

    // 处理查看对象类型详情：打开对象类型详情抽屉
    const handleViewObjectTypeDetail = (objectTypeId: string | number) => {
      setSelectedObjectType({ id: String(objectTypeId) });
      setActiveTab('attributes');
      setDetailDrawerVisible(true);
    };

    // 处理弹窗提交
    const handleModalSubmit = async (formData: PublicAttributeFormData) => {
      setSubmitLoading(true);
      try {
        if (modalMode === 'create') {
          // 调用创建API
          const response = await createOntologyPublicProperties({
            name: formData.name,
            comment: formData.comment,
            columnType: formData.columnType,
            description: formData.description
          });

          if (response.status === 200 && response.code === '') {
            Message.success('创建成功');
            setModalVisible(false);
            refresh(); // 刷新表格数据
            // 调用创建成功回调
            onCreateSuccess?.();
          } else {
            Message.error(response.message || '创建失败');
          }
        } else {
          // 调用编辑API
          if (!editingRecord?.id) {
            Message.error('编辑失败：缺少ID');
            return;
          }

          const response = await updateOntologyPublicProperties({
            id: editingRecord.id,
            name: formData.name,
            comment: formData.comment,
            columnType: formData.columnType,
            description: formData.description
          });

          if (response.status === 200 && response.code === '') {
            Message.success('编辑成功');
            setModalVisible(false);
            refresh(); // 刷新表格数据
          } else {
            Message.error(response.message || '编辑失败');
          }
        }
      } catch (error) {
        console.error('提交失败:', error);
        Message.error(modalMode === 'create' ? '创建失败' : '编辑失败');
      } finally {
        setSubmitLoading(false);
      }
    };

    // 关闭弹窗
    const handleModalCancel = () => {
      setModalVisible(false);
      setEditingRecord(null);
    };

    // 处理删除
    const handleDelete = (record: PublicProperty) => {
      Modal.confirm({
        title: '确定删除公共属性吗？',
        content: `删除后，不可恢复，所绑定的对象类型也会删除此属性`,
        onOk: async () => {
          try {
            if (!record.id) {
              Message.error('删除失败：缺少ID');
              return;
            }

            const response = await deleteOntologyPublicProperties({
              id: record.id
            });

            if (response.status === 200 && response.code === '') {
              Message.success('删除成功');
              refresh(); // 刷新表格数据
            } else {
              Message.error(response.message || '删除失败');
            }
          } catch (error) {
            console.error('删除失败:', error);
            Message.error('删除失败');
          }
        }
      });
    };

    // 表格列定义
    const columns: TableColumnProps<PublicProperty>[] = [
      {
        title: '公共属性名称',
        dataIndex: 'comment',
        fixed: 'left',
        width: 150,
        render: (value) => (
          <EllipsisPopover
            value={value || '-'}
            className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]"
          ></EllipsisPopover>
        )
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        ellipsis: true,
        tooltip: true,
        width: 200,
        render: (value) => <EllipsisPopover value={value || '-'} />
      },
      {
        title: '绑定对象类型',
        dataIndex: 'ontologyObjectTypeList',
        width: 200,
        render: (value, record) => {
          const objectTypeList = record.ontologyObjectTypeList || [];
          if (objectTypeList.length === 0) {
            return <span>-</span>;
          }

          // 转换为 ObjectTypeTagList 需要的格式
          const tags = objectTypeList.map((item) => ({
            ontologyObjectTypeName: item.name || '',
            ontologyObjectTypeId: item.id,
            ontologyObjectTypeIcon: item.icon, // API 返回的数据中没有 icon，使用默认图标
            onClick: () => {
              if (item.id) {
                handleViewObjectTypeDetail(item.id);
              }
            },
            hoverClassName: 'hover-text-blue'
          }));

          return <ObjectTypeTagList tags={tags} />;
        }
      },
      {
        title: '支持字段类型',
        dataIndex: 'columnType',
        width: 150,
        render: (value) => value || '-'
      },
      {
        title: '公共属性id',
        dataIndex: 'name',
        width: 150,
        render: (value) => (
          <div className="flex items-center gap-[4px]">
            <EllipsisPopover
              value={value || '-'}
              wrapperClassName="min-w-0"
              className="text-[14px] leading-[22px] text-[var(--color-text-2)]"
            ></EllipsisPopover>
            {value && (
              <CopyItemIcon className="hidden flex-shrink-0" value={value} />
            )}
          </div>
        )
      },
      {
        title: '引用计数',
        dataIndex: 'ontologyObjectTypeCounts',
        width: 120,
        sorter: true,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value || 0}
          </div>
        )
      },
      {
        title: '最新修改时间',
        dataIndex: 'updateTime',
        width: 180,
        sorter: true,
        render: (value) => (
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </div>
        )
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, record: PublicProperty) => {
          const disableDelete = (record.ontologyObjectTypeCounts || 0) > 0;

          const deleteButton = (
            <Button
              type="text"
              disabled={disableDelete}
              className={
                disableDelete
                  ? 'cursor-not-allowed p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-[var(--color-text-4)]'
                  : 'p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary'
              }
              style={disableDelete ? { padding: 0 } : undefined}
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
            <Space size={16}>
              <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
                <Button
                  type="text"
                  className="p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary"
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
    ];

    return (
      <div className={styles['public-table-wrapper']}>
        <SearchTable
          className={styles['attributes-table']}
          searchForm={
            <Form form={form}>
              <Form.Item noStyle field="keyword">
                <Input.Search
                  className="w-[240px]"
                  placeholder="请输入公共属性名称或id搜索"
                  allowClear
                  autoComplete="off"
                  onClear={() => {
                    setUrlState({ search: '' });
                    submit();
                  }}
                  onSearch={(value) => {
                    setUrlState({ search: value || '' });
                    submit();
                  }}
                />
              </Form.Item>
            </Form>
          }
          addButton={
            <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
              <ProButton icon={<IconPlus />} onClick={handleCreate}>
                创建公共属性
              </ProButton>
            </PermissionWrapper>
          }
          tableProps={{
            columns,
            data,
            loading,
            rowKey: (record) => record.id?.toString() || record.name || '',
            border: false,
            pagination: false,
            scroll: { x: true },
            onChange: (pagination, sorter, filters) => {
              onChange(pagination, sorter, filters);
            }
          }}
        />
        {Number(pagination?.total) > 0 && (
          <div className="mt-[12px] flex items-center justify-end">
            <Pagination
              {...pagination}
              onChange={(page, pageSize) => {
                onChange(
                  {
                    ...pagination,
                    current: page,
                    pageSize
                  } as any,
                  undefined,
                  undefined
                );
              }}
            />
          </div>
        )}

        {/* 公共属性创建/编辑弹窗 */}
        <PublicAttributeModal
          visible={modalVisible}
          mode={modalMode}
          initialValues={editingRecord || undefined}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          loading={submitLoading}
        />

        {/* 对象类型详情抽屉 */}
        {selectedObjectType && detailDrawerVisible && (
          <ObjectTypeDetailDrawer
            visible={detailDrawerVisible}
            onClose={() => {
              setDetailDrawerVisible(false);
              setSelectedObjectType(null);
            }}
            objectTypeId={selectedObjectType?.id}
          />
        )}
      </div>
    );
  }
);

PublicTable.displayName = 'PublicTable';

export default PublicTable;
