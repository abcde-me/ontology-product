import React, { useState, useEffect } from 'react';
import {
  Select,
  Tooltip,
  Tag,
  Pagination,
  Message
} from '@arco-design/web-react';
import {
  ListDataAssetDataRes,
  EditDataAssetData,
  ModifyMethod
} from '@/types/dataAssetApi';
import { getTagList } from '@/api/datasetManagement';
import { editDataAssetDataBatch } from '@/api/dataAsset';

interface DataAssetTableCardProps {
  dataAssetList: ListDataAssetDataRes['records'];
  loading?: boolean;
  currentPage?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, newPageSize?: number) => void;
}

export default function DataAssetTableCard({
  dataAssetList,
  loading = false,
  currentPage = 1,
  pageSize = 12,
  total = 0,
  onPageChange
}: DataAssetTableCardProps) {
  const [tagList, setTagList] = useState<Array<{ label: string; value: any }>>(
    []
  );
  const [editingTagRecordId, setEditingTagRecordId] = useState<string | null>(
    null
  );
  const [tagValues, setTagValues] = useState<Record<string, string[]>>({});

  // 获取标签列表
  useEffect(() => {
    getTagList()
      .then((res) => {
        if (res.code === 0 || res.code === undefined) {
          const options = (res.data || []).map((tag: any) => ({
            label: tag.name || tag.label,
            value: tag.name || tag.value || tag.id
          }));
          setTagList(options);
        }
      })
      .catch((err) => {
        console.error('获取标签列表失败:', err);
      });
  }, []);

  // 初始化标签值
  useEffect(() => {
    const initialTagValues: Record<string, string[]> = {};
    dataAssetList.forEach((record) => {
      const tags = (record.tags as string[]) || [];
      initialTagValues[record.id] = tags;
    });
    setTagValues(initialTagValues);
  }, [dataAssetList]);

  // 直接使用传入的数据，不再进行客户端分页
  const paginatedList = dataAssetList;

  // 处理标签变化
  const handleTagChange = (recordId: string, values: string[]) => {
    setTagValues((prev) => ({
      ...prev,
      [recordId]: values
    }));
  };

  // 处理标签保存
  const handleTagBlur = async (recordId: string) => {
    if (editingTagRecordId !== recordId) return;

    const currentTags = tagValues[recordId] || [];
    const record = dataAssetList.find((item) => item.id === recordId);
    const originalTags = ((record?.tags as string[]) || []).join(',');
    const newTags = currentTags.join(',');

    // 如果标签没有变化，直接退出编辑状态
    if (originalTags === newTags) {
      setEditingTagRecordId(null);
      return;
    }

    try {
      const editData: EditDataAssetData = {
        modifyMethod: ModifyMethod.COVER,
        modifyIds: [recordId],
        modifyContext: [
          {
            fieldEnName: 'tags',
            fieldValue: newTags
          }
        ]
      };

      await editDataAssetDataBatch(editData);
      Message.success('标签更新成功');
      setEditingTagRecordId(null);
      // TODO: 刷新列表数据
    } catch (error) {
      console.error('更新标签失败:', error);
      Message.error('标签更新失败');
      // 恢复原始标签值
      setTagValues((prev) => ({
        ...prev,
        [recordId]: (record?.tags as string[]) || []
      }));
    }
  };

  // 格式化更新时间
  const formatUpdateTime = (time: string | undefined) => {
    if (!time) return '';
    try {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes} 更新`;
    } catch {
      return time;
    }
  };

  // 格式化来源信息
  const formatSource = (source: string | undefined) => {
    if (!source) return '';
    return `来源:${source}`;
  };

  // 处理分页变化
  const handlePageChange = (page: number, newPageSize?: number) => {
    onPageChange?.(page, newPageSize);
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#6b7280]">
        加载中...
      </div>
    );
  }

  if (dataAssetList.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#6b7280]">
        暂无数据资产
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 grid grid-cols-4 gap-x-[12px] gap-y-6">
        {paginatedList.map((record) => {
          const recordTags =
            tagValues[record.id] || (record.tags as string[]) || [];
          const isEditing = editingTagRecordId === record.id;
          const hasTags = recordTags.length > 0;

          return (
            <div
              key={record.id}
              className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {/* 标题 */}
              <div className="truncate text-base font-semibold leading-6 text-[#1f2937]">
                {(record.name as string) || '未命名资产'}
              </div>

              {/* 标签区域 */}
              <div className="flex min-h-8 items-start">
                {isEditing || hasTags ? (
                  <Select
                    placeholder="请输入或选择标签"
                    mode="multiple"
                    options={tagList}
                    value={recordTags}
                    className="data-asset-tag-select w-full"
                    dropdownMenuClassName="data-asset-dropdown-select"
                    allowCreate
                    maxTagCount={{
                      count: 2,
                      render: (invisibleTagCount) => {
                        const remainingTags = recordTags.slice(2);
                        return (
                          <Tooltip
                            content={
                              <div className="flex max-w-[300px] flex-wrap gap-1">
                                {remainingTags.map((item, i) => (
                                  <Tag
                                    key={i}
                                    style={{
                                      height: '24px',
                                      background: '#E7ECF0',
                                      color: '#0F172A',
                                      borderRadius: '2px',
                                      fontSize: '12px',
                                      alignItems: 'center',
                                      margin: '0 2px'
                                    }}
                                  >
                                    {item}
                                  </Tag>
                                ))}
                              </div>
                            }
                          >
                            <span className="inline-block h-6 cursor-pointer rounded border border-[#d1d5db] bg-[#e7ecf0] px-2 text-xs leading-6 text-[#0f172a]">
                              +{invisibleTagCount}
                            </span>
                          </Tooltip>
                        );
                      }
                    }}
                    onVisibleChange={(visible) => {
                      if (visible) {
                        setEditingTagRecordId(record.id);
                      } else {
                        // 延迟处理，等待 onBlur 触发
                        setTimeout(() => {
                          if (editingTagRecordId === record.id) {
                            handleTagBlur(record.id);
                          }
                        }, 100);
                      }
                    }}
                    onBlur={() => handleTagBlur(record.id)}
                    onChange={(values) => handleTagChange(record.id, values)}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div
                    className="flex min-h-8 w-full cursor-pointer items-center justify-center rounded border border-dashed border-[#d1d5db] transition-all duration-200 hover:border-[#007dfa] hover:bg-[#f5f5f5]"
                    onClick={() => setEditingTagRecordId(record.id)}
                  >
                    <span className="text-sm text-[#9ca3af]">请添加标签</span>
                  </div>
                )}
              </div>

              {/* 来源信息 */}
              <div className="text-xs leading-6 text-[#6b7280]">
                {formatSource(record.source as string)}
              </div>

              {/* 更新时间 */}
              <div className="text-xs leading-6 text-[#6b7280]">
                {formatUpdateTime(record.updateTime as string)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 分页组件 */}
      {total > 0 && (
        <div className="mt-[16px] flex items-center justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showTotal
            showJumper
            sizeOptions={[12, 24, 48, 96]}
            sizeCanChange
            onChange={handlePageChange}
            onPageSizeChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
