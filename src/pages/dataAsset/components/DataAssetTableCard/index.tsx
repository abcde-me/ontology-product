import React, { useState, useEffect, useMemo } from 'react';
import { TreeSelect, Tooltip, Tag, Pagination } from '@arco-design/web-react';
import {
  ListDataAssetDataRes,
  EditDataAssetData,
  ModifyMethod,
  BaseTag
} from '@/types/dataAssetApi';
import { getTagList } from '@/api/dataAsset';
import { editDataAssetDataBatch } from '@/api/dataAsset';
import classNames from 'classnames';
import styles from './index.module.scss';
import noDataElement from '@/components/no-data';

interface TagValue {
  tagId: string;
  tagValue: string;
}

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
  const [tagList, setTagList] = useState<BaseTag[]>([]);
  const [editingTagRecordId, setEditingTagRecordId] = useState<string | null>(
    null
  );
  const [tagValues, setTagValues] = useState<Record<string, TagValue[]>>({});
  const [selectVisible, setSelectVisible] = useState<Record<string, boolean>>(
    {}
  );
  const tagTreeData = useMemo(
    () =>
      tagList.map((tag) => ({
        key: tag.id,
        value: tag.id,
        title: tag.name,
        selectable: false,
        checkable: false,
        disableCheckbox: true,
        children: (tag.valueList || []).map((item) => ({
          key: item.id,
          value: item.id,
          title: item.tagValue,
          parentId: tag.id
        }))
      })),
    [tagList]
  );

  const tagRender = (props) => {
    const { value } = props;
    const tagLabel =
      typeof value === 'object' && value !== null ? value.label : value;
    const tagKey =
      typeof value === 'object' && value !== null ? value.value : value;

    return (
      <Tag className={classNames(styles['tag'])} key={tagKey}>
        {tagLabel}
      </Tag>
    );
  };

  // 获取标签列表
  useEffect(() => {
    getTagList()
      .then((res) => {
        if (res.code === 0) {
          setTagList(res.data ?? []);
        } else {
          console.error('获取标签列表失败:', res.message);
        }
      })
      .catch((err) => {
        console.error('获取标签列表失败:', err);
      });
  }, []);

  // 初始化标签值
  useEffect(() => {
    const initialTagValues: Record<string, TagValue[]> = {};

    dataAssetList.forEach((record) => {
      const tags = (record?.tags as TagValue[]) || [];
      initialTagValues[record?.id] = tags;
    });

    setTagValues(initialTagValues);
  }, [dataAssetList]);

  // 直接使用传入的数据，不再进行客户端分页
  const paginatedList = dataAssetList;

  // 处理标签变化
  const handleTagChange = (recordId: string, values: TagValue[]) => {
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
      <div className="flex min-h-[200px] items-center justify-center">
        {noDataElement({
          description: '暂无数据资产'
        })}
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
          const recordTags = tagValues[record?.id] || record?.tags || [];

          return (
            <div
              key={record?.id}
              className={classNames(
                'flex flex-col rounded-lg border border-[#F2F3F5] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
                styles['data-asset-table-card-item']
              )}
            >
              {/* 标题 */}
              <div className="truncate text-base font-semibold leading-6 text-[#1f2937]">
                {(record?.data_asset_name as string) || '未命名资产'}
              </div>

              {/* 标签区域 */}
              <div className="relative ml-[-4px] flex h-[36px] items-center">
                <TreeSelect
                  placeholder=""
                  value={recordTags.map((item) => {
                    return {
                      label: item.tagValue,
                      value: item.tagId
                    };
                  })}
                  multiple
                  treeCheckable
                  treeCheckStrictly
                  labelInValue
                  treeData={tagTreeData}
                  className={classNames('w-full', styles['tag-wrapper'])}
                  renderTag={tagRender}
                  popupVisible={selectVisible[record?.id] || false}
                  onVisibleChange={(visible) => {
                    setSelectVisible((prev) => ({
                      ...prev,
                      [record?.id]: visible
                    }));
                    if (visible) {
                      setEditingTagRecordId(record?.id);
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
                                  key={item?.tagId}
                                  className={classNames(styles['tag'])}
                                >
                                  {item?.tagValue}
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
                  onChange={(values) => {
                    const nextValues = (
                      Array.isArray(values) ? values : values ? [values] : []
                    ).map((item) => ({
                      tagId: item.value,
                      tagValue: String(item.label ?? '')
                    }));
                    handleTagChange(record?.id, nextValues);
                  }}
                />
                {recordTags?.length === 0 && (
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
                          setEditingTagRecordId(record?.id);
                          setSelectVisible((prev) => ({
                            ...prev,
                            [record?.id]: true
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
                {formatSource(record?.data_source as string)}
              </div>

              {/* 更新时间 */}
              <div className="text-xs leading-6 text-[#6b7280]">
                {formatUpdateTime(record?.data_update_time as string)}
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
