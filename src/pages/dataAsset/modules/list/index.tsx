import React, { useState, useEffect } from 'react';
import { Button, Table, Pagination } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import noDataElement from '@/components/no-data';
import DataAssetTableList from '../../components/DataAssetTableList';
import DataAssetTableCard from '../../components/DataAssetTableCard';
import SearchArea, { SearchField } from '../../components/SearchArea';
import ViewToggle, { ViewType } from '../../components/ViewToggle';
import { getTagList } from '@/api/datasetManagement';
import { listDataAssetSource } from '@/api/dataAsset';

export default function DataAssetList() {
  const [dataAssetList, setDataAssetList] = useState([]);
  const [viewType, setViewType] = useState<ViewType>('list');
  const [searchFields, setSearchFields] = useState<SearchField[]>([]);
  const [assetTags, setAssetTags] = useState<
    Array<{ label: string; value: any }>
  >([]);
  const [assetSources, setAssetSources] = useState<
    Array<{ label: string; value: any }>
  >([]);
  const history = useHistory();

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
  };

  return (
    <div className="h-full w-full py-5 pr-5">
      <div className="box-border h-full w-full rounded-2xl bg-white pb-[20px] pl-[24px] pr-6 pt-[20px]">
        {dataAssetList.length !== 0 && (
          <div className="mb-4 h-[30px] w-full leading-[30px]">
            <p className="text-xl font-bold">
              数据资产（{dataAssetList.length}）
            </p>
          </div>
        )}

        {/* 搜索区域 */}
        <SearchArea
          fields={searchFields}
          onMainSearch={handleMainSearch}
          onFieldSearch={handleFieldSearch}
          onReset={handleReset}
        />

        {/* 标题和视图切换区域 */}
        <div className="mb-4 flex h-[30px] w-full items-center justify-between leading-[30px]">
          <p className="text-xl font-bold">
            数据资产（{dataAssetList.length}）
          </p>
          <ViewToggle value={viewType} onChange={handleViewTypeChange} />
        </div>

        {dataAssetList.length !== 0 ? (
          <div className="flex h-[calc(100%-70px)] items-center justify-center">
            {noDataElement({
              description: '暂无数据资产',
              btnText: '创建数据资产',
              handleBtn: handleCreateDataAsset
            })}
          </div>
        ) : (
          <div>
            {viewType === 'list' ? (
              <DataAssetTableList />
            ) : (
              <DataAssetTableCard />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
