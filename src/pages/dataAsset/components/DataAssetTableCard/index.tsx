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
import { getTagList } from '@/api/dataAsset';
import { editDataAssetDataBatch } from '@/api/dataAsset';
import classNames from 'classnames';
import styles from './index.module.scss';

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
  const [selectVisible, setSelectVisible] = useState<Record<string, boolean>>(
    {}
  );
  const { Option } = Select;

  const tagRender = (props) => {
    const { label, value } = props;

    return (
      <Tag className={classNames(styles['tag'])} key={value}>
        {label}
      </Tag>
    );
  };

  // 获取标签列表
  useEffect(() => {
    getTagList()
      .then((res) => {
        if (res.code === 0) {
          const options = (res.data || []).map((tag) => ({
            label: tag.value,
            value: tag.id
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
    <div
      className={classNames(
        'flex w-full flex-col',
        styles['data-asset-table-card']
      )}
    >
      <div className="mb-6 grid grid-cols-4 gap-x-[12px] gap-y-6">
        {paginatedList.map((record) => {
          const recordTags =
            tagValues[record.id] || (record.tags as string[]) || [];

          return (
            <div
              key={record.id}
              className={classNames(
                'flex flex-col rounded-lg border border-[#F2F3F5] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
                styles['data-asset-table-card-item']
              )}
            >
              {/* 标题 */}
              <div className="truncate text-base font-semibold leading-6 text-[#1f2937]">
                {(record.name as string) || '未命名资产'}
              </div>

              {/* 标签区域 */}
              <div className="relative ml-[-4px] flex h-[36px] items-center">
                <Select
                  placeholder=""
                  mode="multiple"
                  value={recordTags}
                  className={classNames('w-full', styles['tag-wrapper'])}
                  dropdownMenuClassName="data-asset-dropdown-select"
                  allowCreate
                  renderTag={tagRender}
                  popupVisible={selectVisible[record.id] || false}
                  onVisibleChange={(visible) => {
                    setSelectVisible((prev) => ({
                      ...prev,
                      [record.id]: visible
                    }));
                    if (visible) {
                      setEditingTagRecordId(record.id);
                    }
                  }}
                  maxTagCount={{
                    count: 2,
                    render: (invisibleTagCount) => {
                      const remainingTags = recordTags.slice(2);
                      return (
                        <Tooltip
                          content={
                            <div className="ml-[-4px] flex max-w-[300px] flex-wrap gap-1">
                              {remainingTags.map((item, i) => (
                                <Tag
                                  key={i}
                                  className={classNames(styles['tag'])}
                                >
                                  {item}
                                </Tag>
                              ))}
                            </div>
                          }
                        >
                          +{invisibleTagCount}
                        </Tooltip>
                      );
                    }
                  }}
                  onChange={(values) => handleTagChange(record.id, values)}
                >
                  {tagList.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
                {recordTags.length === 0 && (
                  <div
                    className="pointer-events-none absolute left-0 top-0 ml-[-4px] flex h-full w-full items-center"
                    style={{ paddingLeft: '12px' }}
                  >
                    <span className="text-[#86909c]">
                      暂无标签，
                      <span
                        className="pointer-events-auto cursor-pointer text-[#007DFA]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTagRecordId(record.id);
                          setSelectVisible((prev) => ({
                            ...prev,
                            [record.id]: true
                          }));
                        }}
                      >
                        点击添加
                      </span>
                    </span>
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
