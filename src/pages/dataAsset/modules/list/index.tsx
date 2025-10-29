import React, { useState } from 'react';
import { Button, Table, Pagination } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import noDataElement from '@/components/no-data';
import DataAssetTableList from '../../components/DataAssetTableList';
import DataAssetTableCard from '../../components/DataAssetTableCard';

export default function DataAssetList() {
  const [dataAssetList, setDataAssetList] = useState([]);
  const [viewType, setViewType] = useState('list');
  const history = useHistory();

  const handleCreateDataAsset = () => {
    // TODO: 实现创建数据资产的逻辑
    console.log('创建数据资产');
    history.push('/tenant/compute/modaforge/dataAsset/create');
  };

  return (
    <div className="h-full w-full py-5 pr-5">
      <div className="box-border h-full w-full rounded-2xl bg-white pb-[20px] pl-[24px] pr-6 pt-[20px]">
        <div className="mb-4 h-[30px] w-full leading-[30px]">
          <p className="text-xl font-bold">
            数据资产（{dataAssetList.length}）
          </p>
        </div>

        {dataAssetList.length === 0 ? (
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
