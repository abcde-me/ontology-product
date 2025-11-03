import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Pagination,
  Message,
  Space,
  Spin
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
import { getTagList } from '@/api/datasetManagement';
import {
  listDataAssetSource,
  findDataAssetMapping,
  listDataAssetData,
  findDataAssetFieldsDisplay
} from '@/api/dataAsset';
import {
  ColumnField as ApiColumnField,
  ListDataAssetDataRes
} from '@/types/dataAssetApi';
import { ColumnField } from '../../components/ColumnSettingModal';
import ColumnSettingModal from '../../components/ColumnSettingModal';

export default function DataAssetList() {
  const [dataAssetList, setDataAssetList] = useState<
    ListDataAssetDataRes['records']
  >([]);
  const [viewType, setViewType] = useState<ViewType>(ViewType.CARD);
  const [searchFields, setSearchFields] = useState<SearchField[]>([]);
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
  const history = useHistory();

  // 获取列表数据
  const loadListData = async (page: number, size: number) => {
    setLoading(true);
    try {
      const listRes = await listDataAssetData({
        ...searchParams,
        page,
        pageSize: size
      });

      if (listRes.code === 0 || listRes.code === undefined) {
        const {
          fields,
          records,
          total: totalCount
        } = listRes.data || {
          fields: [],
          records: [],
          total: 0
        };
        setDataAssetList(records || []);
        setTotal(totalCount || 0);

        // 根据 fields 动态生成表格列
        const dynamicColumns = [
          {
            title: '序号',
            dataIndex: 'index',
            width: 80,
            key: 'index',
            render: (_: any, __: any, idx: number) =>
              (page - 1) * size + idx + 1
          },
          // 根据 fields 生成列，保证每一列和表头一一对应
          ...(fields || [])
            .filter((field: ApiColumnField) => field.isDisplay !== false)
            .map((field: ApiColumnField) => ({
              title: field.nameZh,
              dataIndex: field.nameEn,
              key: field.nameEn,
              width: 150,
              ellipsis: true
            })),
          {
            title: '操作',
            dataIndex: 'actions',
            width: 200,
            key: 'actions',
            fixed: 'right' as const,
            render: (
              _: any,
              record: any,
              idx: number,
              { onEditAsset, onEditTags, onDelete }: any
            ) => (
              <Space>
                <Button
                  type="text"
                  style={{ marginRight: 6 }}
                  onClick={() => onEditAsset?.(record)}
                >
                  修改资产
                </Button>
                <Button
                  type="text"
                  style={{ marginRight: 6 }}
                  onClick={() => onEditTags?.(record)}
                >
                  修改标签
                </Button>
                <Button type="text" onClick={() => onDelete?.(record)}>
                  删除
                </Button>
              </Space>
            )
          }
        ];
        setTableColumns(dynamicColumns);
      }
    } catch (err) {
      console.error('获取数据资产列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化：检查是否有mapping数据
  useEffect(() => {
    findDataAssetMapping()
      .then((res) => {
        if (res.code === 0 || res.code === undefined) {
          const mappingData = res.data || [];
          // 检查mapping数组长度，判断是否有数据
          // 如果返回数组长度为0，说明没有任何映射配置，显示无数据页面
          // 如果返回数组长度不为0，说明有映射配置，显示列表页
          const hasData = mappingData.length > 0;
          setHasMapping(hasData);

          // 如果有mapping数据，并行请求列设置和列表数据
          if (hasData) {
            // 获取列设置
            findDataAssetFieldsDisplay({})
              .then((displayRes) => {
                // 处理列设置数据
                if (displayRes.code === 0 || displayRes.code === undefined) {
                  const { fields: displayFields } = displayRes.data || {
                    fields: []
                  };
                  // 将 API 返回的 ColumnField 格式转换为组件需要的格式
                  const convertedFields: ColumnField[] = (
                    displayFields || []
                  ).map((field: ApiColumnField, index: number) => ({
                    id: field.nameEn || String(index),
                    name: field.nameZh,
                    type: field.type,
                    enumChecked: field.isEnum || false,
                    enumLoading: false,
                    enumCount: 0
                  }));
                  setColumnSettingsFields(convertedFields);
                }
              })
              .catch((err) => {
                console.error('获取列设置失败:', err);
              });

            // 加载列表数据
            loadListData(1, 12);
          }
        } else {
          // 接口失败时默认显示列表页
          setHasMapping(true);
        }
      })
      .catch((err) => {
        console.error('获取数据资产映射失败:', err);
        // 接口失败时默认显示列表页
        setHasMapping(true);
      });
  }, []);

  // 初始化搜索字段配置
  useEffect(() => {
    // 获取标签列表
    getTagList()
      .then((res) => {
        if (res.code === 0 || res.code === undefined) {
          const options = (res.data || []).map((tag: any) => ({
            label: tag.name || tag.label,
            value: tag.name || tag.value || tag.id
          }));
          setAssetTags(options);
        }
      })
      .catch((err) => {
        console.error('获取标签列表失败:', err);
      });

    // 获取资产来源列表
    listDataAssetSource()
      .then((res) => {
        if (res.code === 0 || res.code === undefined) {
          const options = (res.data || []).map((source: any) => ({
            label: source.type || source.name || source.label,
            value: source.type || source.name || source.value || source.id
          }));
          setAssetSources(options);
        }
      })
      .catch((err) => {
        console.error('获取资产来源列表失败:', err);
      });
  }, []);

  // 更新搜索字段配置（当标签和来源数据加载完成后）
  useEffect(() => {
    const fields: SearchField[] = [
      {
        key: 'name',
        label: '数据资产名称',
        type: 'input',
        paramKey: 'name'
      },
      {
        key: 'tag',
        label: '资产标签',
        type: 'select',
        options: assetTags,
        paramKey: 'tag'
      },
      {
        key: 'source',
        label: '资产来源',
        type: 'select',
        options: assetSources,
        paramKey: 'source'
      },
      {
        key: 'updateTime',
        label: '更新时间',
        type: 'daterange',
        paramKey: 'updateTime'
      }
    ];
    setSearchFields(fields);
  }, [assetTags, assetSources]);

  const handleCreateDataAsset = () => {
    // TODO: 实现创建数据资产的逻辑
    console.log('创建数据资产');
    history.push('/tenant/compute/modaforge/dataAsset/create');
  };

  // 处理主搜索
  const handleMainSearch = (value: string) => {
    console.log('主搜索:', value);
    // TODO: 调用搜索API
    // getDataAssetList({ keyword: value }).then(...)
  };

  // 处理字段搜索
  const handleFieldSearch = (fieldValues: Record<string, any>) => {
    console.log('字段搜索:', fieldValues);
    // TODO: 调用搜索API
    // getDataAssetList(fieldValues).then(...)
  };

  // 处理重置
  const handleReset = () => {
    console.log('重置搜索条件');
    // TODO: 重新获取列表数据
  };

  // 切换视图类型
  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type);
    // 切换视图时，重置分页并重新加载数据
    const newPageSize = type === ViewType.LIST ? 10 : 12;
    setPageSize(newPageSize);
    setCurrentPage(1);
    loadListData(1, newPageSize);
  };

  // 处理分页变化
  const handlePageChange = (page: number, newPageSize?: number) => {
    const targetPage = newPageSize ? 1 : page;
    const targetPageSize = newPageSize || pageSize;
    setCurrentPage(targetPage);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
    loadListData(targetPage, targetPageSize);
  };

  // 列设置弹窗回调
  const handleModalOk = (selectedFields: any) => {
    // TODO: 处理列设置确定逻辑
    setColumnModalOpen(false);
    // Message.success('列设置已保存');
  };
  const handleModalCancel = () => setColumnModalOpen(false);
  const handleColumnChange = (list: ColumnField[]) => {
    console.log('列设置变化:', list);
    // TODO: 处理列设置变化逻辑
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
    <div className="min-h-full w-full py-5 pr-5">
      <div className="box-border h-full w-full rounded-2xl bg-white pb-[20px] pl-[24px] pr-6 pt-[20px]">
        {/* {dataAssetList.length !== 0 && (
          <div className="mb-4 h-[30px] w-full leading-[30px]">
            <p className="text-xl font-bold">
              数据资产（{dataAssetList.length}）
            </p>
          </div>
        )} */}

        {/* 搜索区域 */}
        <SearchArea
          fields={searchFields}
          onMainSearch={handleMainSearch}
          onFieldSearch={handleFieldSearch}
          onReset={handleReset}
        />

        {/* 标题和视图切换区域 */}
        <div className="mb-4 flex h-[30px] w-full items-center justify-between leading-[32px]">
          <p className="text-xl font-bold">数据资产（{total}）</p>
          <div className="flex items-center">
            {viewType === ViewType.LIST && (
              <>
                <Button
                  icon={<IconDelete />}
                  className="mr-[20px]"
                  onClick={() => setColumnModalOpen(true)}
                >
                  批量删除
                </Button>
                <Button
                  icon={<IconEdit />}
                  className="mr-[20px]"
                  onClick={() => setColumnModalOpen(true)}
                >
                  批量修改
                </Button>
                <Button
                  icon={<IconSettings />}
                  className="mr-[20px]"
                  onClick={() => setColumnModalOpen(true)}
                >
                  资产设置
                </Button>
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

        {/* {dataAssetList.length === 0 ? (
          <div className="flex h-[calc(100%-70px)] items-center justify-center">
            {noDataElement({
              description: '暂无数据资产',
              btnText: '创建数据资产',
              handleBtn: handleCreateDataAsset
            })}
          </div>
        ) : ( */}
        <div>
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
              onEditAsset={(record) => {
                /* TODO: 跳转到资产编辑 */
              }}
              onEditTags={(record) => {
                /* TODO: 弹出标签编辑 */
              }}
              onDelete={(record) => {
                /* TODO: 触发删除逻辑 */
              }}
            />
          ) : (
            <DataAssetTableCard
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
    </div>
  );
}
