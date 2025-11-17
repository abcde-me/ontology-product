import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';
import {
  Button,
  Message,
  Space,
  Spin,
  Popover,
  Dropdown,
  Menu,
  Modal,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSettings,
  IconDelete,
  IconEdit
} from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import noDataElement from '@/components/no-data';
import DataAssetTableList from '../../components/DataAssetTableList';
import DataAssetTableCard from '../../components/DataAssetTableCard';
import SearchArea, { SearchField } from '../../components/SearchArea';
import ViewToggle, { ViewType } from '../../components/ViewToggle';
import ModifyAssetModal from '../../components/ModifyAssetModal';
import ModifyTagsModal from '../../components/ModifyTagsModal';
import EditSingleAssetModal from '../../components/EditSingleAssetModal';
import {
  findDataAssetMapping,
  listDataAssetData,
  findDataAssetFieldsDisplay,
  deleteDataAssetDataBatch,
  editDataAssetDataBatch,
  getTagList,
  editDataAssetFieldsDisplay,
  editDataAssetDataTagsBatch
} from '@/api/dataAsset';
import {
  ColumnField as ApiColumnField,
  ListDataAssetDataRes,
  ModifyMethod,
  EditDataAssetData,
  BaseTag,
  TagValueItem
} from '@/types/dataAssetApi';
import { ColumnField } from '../../components/ColumnSettingModal';
import ColumnSettingModal from '../../components/ColumnSettingModal';
import styles from './list.module.scss';
import classNames from 'classnames';
import { FieldSearchItem } from '@/types/dataAssetApi';
import dayjs from 'dayjs';
import { isDateType, isTagsField, TAGS_FIELD_EN_NAME } from '../../utils/const';

interface TagValue {
  tagId: string;
  tagValue: string;
}

export default function DataAssetList() {
  const [dataAssetList, setDataAssetList] = useState<
    ListDataAssetDataRes['records']
  >([]);
  const [viewType, setViewType] = useState<ViewType>(ViewType.CARD);
  const [searchFields, setSearchFields] = useState<ColumnField[]>([]);
  const [assetTags, setAssetTags] = useState<
    Array<{ label: string; value: any }>
  >([]);
  const [assetSources, setAssetSources] = useState<
    Array<{ label: string; value: any }>
  >([]);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [hasMapping, setHasMapping] = useState<boolean | null>(null); // null表示加载中
  const [tableColumns, setTableColumns] = useState<any[]>([]); // 表格列配置
  const [columnSettingsFields, setColumnSettingsFields] = useState<
    ColumnField[]
  >([]); // 列设置字段
  const [loading, setLoading] = useState(false);
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 默认卡片视图，每页12个
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState({
    commonSearch: '',
    fieldSearch: [] as any[]
  });
  // 选中行状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 弹窗状态
  const [modifyAssetModalVisible, setModifyAssetModalVisible] = useState(false);
  const [modifyTagsModalVisible, setModifyTagsModalVisible] = useState(false);
  const [editSingleAssetModalVisible, setEditSingleAssetModalVisible] =
    useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null); // 当前编辑的单条记录
  const [fieldsForModify, setFieldsForModify] = useState<
    Array<{ nameZh: string; nameEn: string; type: string }>
  >([]); // 用于修改资产的字段列表
  const [columnFields, setColumnFields] = useState<ApiColumnField[]>([]); // 列字段列表（用于单条编辑）
  const [rawDisplayFields, setRawDisplayFields] = useState<ApiColumnField[]>(
    []
  );
  const history = useHistory();
  // 吸顶状态
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [tagList, setTagList] = useState<BaseTag[]>([]);

  const aggregatedSelectedTags = useMemo<TagValueItem[]>(() => {
    if (selectedRowKeys.length === 0) {
      return [];
    }

    const tagMap = new Map<string, TagValueItem>();

    selectedRowKeys.forEach((key) => {
      const targetRecord = dataAssetList.find((item) => item.id === key);
      const targetTags = (targetRecord?.tags as TagValueItem[]) || [];

      targetTags.forEach((tag) => {
        if (tag?.id && !tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });

    return Array.from(tagMap.values());
  }, [selectedRowKeys, dataAssetList]);

  // 获取列表数据
  const loadListData = async (page: number, size: number) => {
    setLoading(true);
    try {
      const listRes = await listDataAssetData({
        ...searchParams,
        page,
        pageSize: size
      });

      if (listRes.status !== 200 || !listRes.data) {
        Message.error(listRes.message || '获取数据资产列表失败');
        return;
      }

      const { fields, records, total: totalCount } = listRes.data;
      setDataAssetList(records || []);
      setTotal(totalCount || 0);

      // 保存字段列表用于修改资产弹窗
      const fieldsForModifyList = (fields || [])
        .filter((field: ApiColumnField) => !!field?.allowModify)
        .map((field: ApiColumnField) => ({
          nameZh: field?.nameZh,
          nameEn: field?.nameEn,
          type: field?.type
        }));

      setFieldsForModify(fieldsForModifyList);

      // 保存列字段列表用于单条编辑弹窗
      setColumnFields(fields || []);

      // 根据 fields 动态生成表格列
      const dynamicColumns = [
        {
          title: '序号',
          dataIndex: 'index',
          fixed: 'left' as const,
          width: 80,
          key: 'index',
          render: (_: any, __: any, idx: number) => (page - 1) * size + idx + 1
        },
        // 根据 fields 生成列，保证每一列和表头一一对应
        ...(fields || [])
          .filter((field: ApiColumnField) => field.displaySort > 0)
          .sort(
            (a: ApiColumnField, b: ApiColumnField) =>
              a.displaySort - b.displaySort
          )
          .map((field: ApiColumnField) => {
            // 如果是 tags 字段，使用 Tag 组件显示
            if (isTagsField(field.nameEn)) {
              return {
                title: field.nameZh,
                dataIndex: field.nameEn,
                key: field.nameEn,
                width: 150,
                render: (tagNames: TagValue[]) => {
                  // 处理字符串或数组格式
                  const tags = tagNames;

                  if (!tags || tags.length === 0) return '-';

                  return (
                    <Space size="mini">
                      {tags[0] && (
                        <Tag>
                          {tags[0].tagValue.length > 5 ? (
                            <Tooltip content={tags[0].tagValue}>
                              {tags[0].tagValue.substring(0, 5)}...
                            </Tooltip>
                          ) : (
                            tags[0].tagValue || '-'
                          )}
                        </Tag>
                      )}
                      {tags.length > 1 && (
                        <Tooltip
                          content={tags
                            .slice(1)
                            .map((item: TagValue, index: number) => (
                              <Tag
                                key={item.tagId}
                                style={{ margin: '2px 2px' }}
                              >
                                {item.tagValue}
                              </Tag>
                            ))}
                        >
                          <Tag>+{tags.length - 1}</Tag>
                        </Tooltip>
                      )}
                    </Space>
                  );
                }
              };
            }

            // 其他字段使用默认渲染
            return {
              title: field.nameZh,
              dataIndex: field.nameEn,
              key: field.nameEn,
              width: 150,
              ellipsis: true,
              render: (value: any) => {
                if (field.type.includes('date')) {
                  return value
                    ? dayjs(value).format('YYYY-MM-DD HH:mm:ss')
                    : '-';
                }
                return value ?? '-';
              }
            };
          }),
        {
          title: '操作',
          dataIndex: 'actions',
          width: 204,
          key: 'actions',
          fixed: 'right' as const,
          render: (
            val: any,
            record: any,
            idx: number,
            { onEditAsset, onEditTags, onDelete }: any
          ) => (
            <div className="flex items-center gap-[16px]">
              <Button
                type="text"
                onClick={() => onEditAsset?.(record)}
                className="px-[0px]"
              >
                修改资产
              </Button>
              <Button
                type="text"
                onClick={() => onEditTags?.(record)}
                className="px-[0px]"
              >
                修改标签
              </Button>
              <Button
                type="text"
                className="px-[0px]"
                onClick={() => onDelete?.(record)}
              >
                删除
              </Button>
            </div>
          )
        }
      ];
      setTableColumns(dynamicColumns);
    } catch (err) {
      console.error('获取数据资产列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadColumnSettings = async () => {
    const dataAssetFieldsDisplayRes = await findDataAssetFieldsDisplay({});
    if (
      dataAssetFieldsDisplayRes.status !== 200 ||
      !dataAssetFieldsDisplayRes.data?.length
    ) {
      return;
    }

    setRawDisplayFields(dataAssetFieldsDisplayRes.data || []);
  };

  // 初始化：检查是否有mapping数据
  useEffect(() => {
    const init = async () => {
      try {
        const findDataAssetMappingRes = await findDataAssetMapping();
        if (findDataAssetMappingRes.status !== 200) {
          setHasMapping(false);
          return;
        }

        // 获取数据资产映射数据
        const dataAssetMapping = findDataAssetMappingRes.data || [];

        setHasMapping(dataAssetMapping.length > 0);

        if (dataAssetMapping.length > 0) {
          Promise.all([loadColumnSettings(), loadListData(1, pageSize)]);
        }
      } catch {
        setHasMapping(false);
      }
    };

    init();
  }, []);

  const convertFields = useCallback(
    (fields: ApiColumnField[]): ColumnField[] =>
      fields.map((field: ApiColumnField, index: number) => {
        // 时间类型or标签类型不能勾选为枚举类型
        const isEnumAbleForColumn =
          isDateType(field.type) || isTagsField(field.nameEn) ? false : true;
        let isEnumAble = field.isEnumAble;

        // 搜索时传给服务端的值，要求标签类型是true, 时间类型是false
        if (isTagsField(field.nameEn)) {
          isEnumAble = true;
        } else if (isDateType(field.type)) {
          isEnumAble = false;
        }

        return {
          id: field.nameEn || String(index),
          nameEn: field.nameEn || String(index),
          nameZh: field.nameZh,
          type: field.type,
          // 列设置弹窗中是否可勾选为枚举类型
          isEnumAbleForColumn,
          isEnumAble,
          enumLoading: false,
          distinctCount: field.distinctCount || 0,
          displaySort: field.displaySort || 0,
          values: isTagsField(field.nameEn) ? tagList : field.values || []
        };
      }),
    [tagList]
  );

  useEffect(() => {
    if (!rawDisplayFields.length) {
      return;
    }
    const convertedFields = convertFields(rawDisplayFields);
    setColumnSettingsFields(convertedFields);
    setSearchFields(convertedFields.filter((field) => field.displaySort > 0));
  }, [rawDisplayFields, convertFields]);

  // 获取标签列表
  useEffect(() => {
    getTagList()
      .then((res) => {
        if (res.status === 200) {
          setTagList(res.data ?? []);
        } else {
          console.error('获取标签列表失败:', res.message);
        }
      })
      .catch((err) => {
        console.error('获取标签列表失败:', err);
      });
  }, []);

  // 更新搜索字段配置（当标签和来源数据加载完成后）
  useEffect(() => {
    loadListData(1, pageSize);
  }, [searchParams]);

  // 检测吸顶状态
  useEffect(() => {
    // 只有当 hasMapping 为 true 时，sentinel 元素才会渲染
    if (hasMapping !== true) return;

    let observer: IntersectionObserver | null = null;

    // 使用 requestAnimationFrame 确保 DOM 已经渲染
    const rafId = requestAnimationFrame(() => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // 当占位元素离开视口时，说明标题栏已经吸顶
            setIsSticky(!entry.isIntersecting);
          });
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0
        }
      );

      observer.observe(sentinel);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [hasMapping]);

  const handleCreateDataAsset = () => {
    history.push('/tenant/compute/modaforge/dataAsset/create');
  };

  // 处理主搜索
  const handleMainSearch = (value: string) => {
    setSearchParams({ ...searchParams, commonSearch: value });
  };

  // 处理字段搜索
  const handleFieldSearch = (
    fieldValues: FieldSearchItem[],
    commonSearch: string
  ) => {
    setSearchParams({
      ...searchParams,
      fieldSearch: fieldValues,
      commonSearch
    });
  };

  // 处理重置
  const handleReset = () => {
    setSearchParams({ ...searchParams, fieldSearch: [] });
    setCurrentPage(1);
  };

  // 切换视图类型
  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type);
    // 切换视图时，重置分页并重新加载数据，清空选中状态
    const newPageSize = type === ViewType.LIST ? 10 : 12;
    setPageSize(newPageSize);
    setCurrentPage(1);
    setSelectedRowKeys([]);
    loadListData(1, newPageSize);
  };

  // 处理分页变化
  const handlePageChange = (page: number, nextPageSize?: number) => {
    const isSizeChange = nextPageSize && nextPageSize !== pageSize;
    const targetPageSize = isSizeChange ? nextPageSize : pageSize;
    const targetPage = isSizeChange ? 1 : page;

    setCurrentPage(targetPage);
    if (isSizeChange && nextPageSize) {
      setPageSize(nextPageSize);
    }
    setSelectedRowKeys([]); // 分页变化时清空选中状态
    loadListData(targetPage, targetPageSize);
  };

  // 列设置弹窗回调
  const handleModalOk = (
    selectedIds: string[],
    displayFields: ColumnField[]
  ) => {
    const selectedFields = selectedIds
      .map((nameEn) =>
        displayFields.find(
          (field) => field.nameEn === nameEn || field.id === nameEn
        )
      )
      .filter(Boolean) as ColumnField[];
    const selectedIdSet = new Set(selectedIds);

    editDataAssetFieldsDisplay({
      fields: [
        ...selectedFields.map((field, index) => ({
          ...field,
          displaySort: index + 1
        })),
        ...displayFields
          .filter(
            ({ nameEn, id }) =>
              !selectedIdSet.has(nameEn) && !selectedIdSet.has(id)
          )
          .map((field) => ({ ...field, displaySort: 0 }))
      ] as unknown as ApiColumnField[]
    }).then((res) => {
      if (res.status !== 200 || res.code !== '') {
        Message.error(res.message ?? '列设置失败');
        return;
      }
      Message.success('列设置成功');
      setColumnModalOpen(false);

      loadListData(1, pageSize);
      loadColumnSettings();
    });
  };

  const handleModalCancel = () => setColumnModalOpen(false);
  const handleColumnChange = (list: ColumnField[]) => {
    console.log('列设置变化:', list);
    // TODO: 处理列设置变化逻辑
  };

  // 处理行选择变化
  const handleSelectChange = (keys: string[]) => {
    setSelectedRowKeys(keys);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '确定删除资产吗?',
      content: '删除后，不可恢复',
      onOk: async () => {
        try {
          const res = await deleteDataAssetDataBatch({ ids: selectedRowKeys });
          if (res.status === 200 && res.code === '') {
            Message.success('删除成功');
            setSelectedRowKeys([]);
            // 重新加载数据
            loadListData(currentPage, pageSize);
          } else {
            Message.error(res.message ?? '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          Message.error('删除失败');
        }
      }
    });
  };

  // 处理单个删除
  const handleSingleDelete = (record: any) => {
    Modal.confirm({
      title: '确定删除资产吗?',
      content: '删除后，不可恢复',
      onOk: async () => {
        try {
          const res = await deleteDataAssetDataBatch({ ids: [record.id] });
          if (res.status === 200 && res.code === '') {
            Message.success('删除成功');
            setSelectedRowKeys([]);
            // 重新加载数据
            loadListData(currentPage, pageSize);
          } else {
            Message.error(res.message ?? '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          Message.error('删除失败');
        }
      }
    });
  };

  // 处理批量修改资产
  const handleBatchModifyAsset = () => {
    if (selectedRowKeys.length === 0) return;
    setModifyAssetModalVisible(true);
  };

  // 确认修改资产
  const handleModifyAssetConfirm = async (data: {
    modifyMethod: ModifyMethod;
    fieldEnName: string;
    separator: string;
    fieldValue: string;
  }) => {
    try {
      const editData: EditDataAssetData = {
        modifyMethod: data.modifyMethod,
        modifyIds: selectedRowKeys,
        modifyContext: [
          {
            fieldEnName: data.fieldEnName,
            fieldValue: data.fieldValue
          }
        ]
      };
      const res = await editDataAssetDataBatch(editData);
      if (res.code === '' && res.status === 200) {
        Message.success('修改成功');
        setModifyAssetModalVisible(false);
        setSelectedRowKeys([]);
        // 重新加载数据
        loadListData(currentPage, pageSize);
      } else {
        Message.error(res.message ?? '修改失败');
      }
    } catch (error) {
      console.error('修改失败:', error);
      Message.error('修改失败');
    }
  };

  // 处理批量修改标签
  const handleBatchModifyTags = () => {
    if (selectedRowKeys.length === 0) return;
    setModifyTagsModalVisible(true);
  };

  // 确认修改标签
  const handleModifyTagsConfirm = async (
    tags: { label: string; value: string }[],
    selectedRowKeys: string[]
  ) => {
    try {
      const res = await editDataAssetDataTagsBatch({
        Ids: selectedRowKeys,
        tags: tags.map((tag) => ({ id: tag.value, value: tag.label }))
      });
      if (res.code === '' && res.status === 200) {
        Message.success('标签修改成功');
        setModifyTagsModalVisible(false);
        setSelectedRowKeys([]);
        // 重新加载数据
        loadListData(currentPage, pageSize);
      } else {
        Message.error(res.message ?? '标签修改失败');
      }
    } catch (error) {
      console.error('标签修改失败:', error);
      Message.error('标签修改失败');
    }
  };

  // 处理单个修改资产
  const handleSingleEditAsset = (record: any) => {
    setEditingRecord(record);
    setEditSingleAssetModalVisible(true);
  };

  // 确认单条编辑资产
  const handleSingleEditAssetConfirm = async (data: Record<string, any>) => {
    if (!editingRecord) return;

    try {
      // 构建修改数据，只包含有变化的字段
      const modifyContext: { fieldEnName: string; fieldValue: string }[] = [];
      Object.keys(data).forEach((fieldEnName) => {
        const newValue = data[fieldEnName];
        const oldValue = editingRecord[fieldEnName];
        // 如果值有变化，添加到修改列表
        if (newValue !== oldValue) {
          modifyContext.push({
            fieldEnName,
            fieldValue: Array.isArray(newValue)
              ? newValue.join(',')
              : String(newValue || '')
          });
        }
      });

      if (modifyContext.length === 0) {
        Message.warning('没有需要修改的字段');
        setEditSingleAssetModalVisible(false);
        return;
      }

      const editData: EditDataAssetData = {
        modifyMethod: ModifyMethod.COVER,
        modifyIds: [editingRecord.id],
        modifyContext
      };
      const res = await editDataAssetDataBatch(editData);
      if (res?.code === '' && res?.status === 200) {
        Message.success('修改成功');
        setEditSingleAssetModalVisible(false);
        setEditingRecord(null);
        // 重新加载数据
        loadListData(currentPage, pageSize);
      } else {
        Message.error(res?.message ?? '修改失败');
      }
    } catch (error) {
      console.error('修改失败:', error);
      Message.error('修改失败');
    }
  };

  // 处理单个修改标签
  const handleSingleEditTags = (record: any) => {
    setSelectedRowKeys([record.id]);
    setModifyTagsModalVisible(true);
  };

  // 处理资产设置跳转
  const handleAssetSettings = () => {
    history.push(`/tenant/compute/modaforge/dataAsset/edit`);
  };

  // 如果还在加载中，显示空内容（或可以显示loading）
  if (hasMapping === null) {
    return (
      <div className="h-full w-full py-5 pr-5">
        <div className="box-border h-full w-full rounded-2xl bg-white pb-[20px] pl-[24px] pr-6 pt-[20px]">
          {/* 可以在这里添加loading状态 */}
        </div>
      </div>
    );
  }

  // 如果没有mapping数据，显示无数据页面
  if (hasMapping === false) {
    return (
      <div className="h-full w-full py-5 pr-5">
        <div className="box-border h-full w-full rounded-2xl bg-white pb-[20px] pl-[24px] pr-6 pt-[20px]">
          <div className="flex h-full items-center justify-center">
            {noDataElement({
              description: '暂无数据资产',
              btnText: '创建数据资产',
              handleBtn: handleCreateDataAsset
            })}
          </div>
        </div>
      </div>
    );
  }

  // 如果有mapping数据，显示带搜索区域的列表页
  return (
    <div className={classNames('min-h-full w-full', styles['data-asset-list'])}>
      <div
        className={classNames(
          'box-border h-full w-full py-[24px]',
          styles['data-asset-list-content']
        )}
      >
        {/* 搜索区域 */}
        <SearchArea
          fields={searchFields}
          onMainSearch={handleMainSearch}
          onFieldSearch={handleFieldSearch}
          onReset={handleReset}
          className="px-[24px]"
        />

        {/* 占位元素，用于检测吸顶状态 */}
        <div ref={sentinelRef} style={{ height: '1px', marginTop: '-1px' }} />

        {/* 标题和视图切换区域 */}
        <div
          ref={headerRef}
          className={classNames(
            'sticky top-0 z-10 flex w-full items-center justify-between px-[24px] pb-[16px] pt-[24px] leading-[30px]',
            isSticky && 'bg-[var(--color-bg-4)]'
          )}
        >
          <p className="text-xl font-bold">数据资产（{total}）</p>
          <div className="flex items-center">
            {viewType === ViewType.LIST && (
              <>
                {/* 批量删除按钮 */}
                <Popover
                  content="请先选择资产"
                  disabled={selectedRowKeys.length > 0}
                  position="top"
                >
                  <Button
                    icon={<IconDelete />}
                    className="mr-[20px]"
                    disabled={selectedRowKeys.length === 0}
                    onClick={handleBatchDelete}
                  >
                    批量删除
                  </Button>
                </Popover>

                {/* 批量修改按钮 */}
                {selectedRowKeys.length === 0 ? (
                  <Popover content="请先选择资产" position="top">
                    <Button
                      icon={<IconEdit />}
                      className="mr-[20px]"
                      disabled={true}
                    >
                      批量修改
                    </Button>
                  </Popover>
                ) : (
                  <Dropdown
                    droplist={
                      <Menu style={{ width: '110px' }}>
                        <Menu.Item
                          key="modifyAsset"
                          onClick={handleBatchModifyAsset}
                        >
                          修改资产
                        </Menu.Item>
                        <Menu.Item
                          key="modifyTags"
                          onClick={handleBatchModifyTags}
                        >
                          修改标签
                        </Menu.Item>
                      </Menu>
                    }
                    trigger="click"
                    position="bl"
                  >
                    <Button
                      icon={<IconEdit />}
                      className="mr-[20px]"
                      disabled={false}
                    >
                      批量修改
                    </Button>
                  </Dropdown>
                )}

                {/* <Popover
                  content="请先选择一个资产"
                  disabled={selectedRowKeys.length === 1}
                  position="top"
                > */}
                <Button
                  icon={<IconSettings />}
                  className="mr-[20px]"
                  // disabled={selectedRowKeys.length !== 1}
                  onClick={handleAssetSettings}
                >
                  资产设置
                </Button>
                {/* </Popover> */}
                <Button
                  icon={<IconSettings />}
                  className="mr-[20px]"
                  onClick={() => setColumnModalOpen(true)}
                >
                  列设置
                </Button>
              </>
            )}
            <ViewToggle value={viewType} onChange={handleViewTypeChange} />
          </div>
        </div>

        <div className="px-[24px]">
          {loading ? (
            <div className="flex h-[calc(100%-70px)] items-center justify-center">
              <Spin />
            </div>
          ) : viewType === ViewType.LIST ? (
            <DataAssetTableList
              data={dataAssetList}
              columns={tableColumns.length > 0 ? tableColumns : undefined}
              currentPage={currentPage}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={handleSelectChange}
              onEditAsset={handleSingleEditAsset}
              onEditTags={handleSingleEditTags}
              onDelete={handleSingleDelete}
            />
          ) : (
            <DataAssetTableCard
              tagList={tagList}
              dataAssetList={dataAssetList}
              loading={loading}
              currentPage={currentPage}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
            />
          )}
        </div>
        {/* )} */}
      </div>
      {/* 列设置弹窗 */}
      <ColumnSettingModal
        visible={columnModalOpen}
        fields={
          columnSettingsFields.length > 0 ? columnSettingsFields : undefined
        }
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        onChange={handleColumnChange}
      />
      {/* 修改资产弹窗 */}
      {modifyAssetModalVisible && (
        <ModifyAssetModal
          visible={modifyAssetModalVisible}
          fields={
            fieldsForModify?.filter((field) => !isTagsField(field.nameEn)) ?? []
          }
          onCancel={() => setModifyAssetModalVisible(false)}
          onConfirm={handleModifyAssetConfirm}
        />
      )}
      {/* 修改标签弹窗 */}
      {modifyTagsModalVisible && (
        <ModifyTagsModal
          visible={modifyTagsModalVisible}
          tagOptions={tagList}
          selectedRowKeys={selectedRowKeys}
          initialTags={aggregatedSelectedTags}
          onCancel={() => setModifyTagsModalVisible(false)}
          onConfirm={handleModifyTagsConfirm}
        />
      )}
      {/* 单条编辑资产弹窗 */}
      {editSingleAssetModalVisible && (
        <EditSingleAssetModal
          key={editingRecord?.id}
          visible={editSingleAssetModalVisible}
          record={editingRecord}
          fields={columnFields.filter((field) => !isTagsField(field.nameEn))}
          onCancel={() => {
            setEditSingleAssetModalVisible(false);
            setEditingRecord(null);
          }}
          onConfirm={handleSingleEditAssetConfirm}
        />
      )}
    </div>
  );
}
