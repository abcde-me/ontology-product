import React, { useState, useEffect } from 'react';
import './index.less';
import { PublishedAppListParams } from '../../api/appStoreV2';
import ListCard from './listCard';
import TopListCard from './topListCard';
import {
  AppFilterNav,
  type FilterParams,
  TypeItemsKey,
  TabItemsKey
} from './app-filter-nav';

export default function AppStorePage() {
  const [listCardParams, setLisCardParams] = useState({
    page: 1,
    isDemo: false,
    favorite: false,
    organized: false,
    appTypes: Object.values(TypeItemsKey)
      .filter((item) => item !== TypeItemsKey.ALL)
      .map((item) => Number(item)),
    name: ''
  });

  const handleFilterChange = (params: FilterParams) => {
    const { type, tab, search } = params;
    const appTypes =
      type === TypeItemsKey.ALL
        ? Object.values(TypeItemsKey)
            .filter((item) => item !== TypeItemsKey.ALL)
            .map((item) => Number(item))
        : [Number(type)];
    const isDemo = tab === TabItemsKey.ALL || tab === TabItemsKey.TEMPLATE;
    const favorite = tab === TabItemsKey.ALL || tab === TabItemsKey.FAVORITE;
    const organized = tab === TabItemsKey.ALL || tab === TabItemsKey.ORG;

    setLisCardParams({
      ...listCardParams,
      ...params,
      appTypes,
      isDemo,
      favorite,
      organized
    });
  };

  const handleParamsChange = (params) => {
    setLisCardParams({
      ...listCardParams,
      ...params
    });
  };

  return (
    <div className="app-store">
      <div className="app-store-content">
        <header className="app-header"></header>
        <TopListCard></TopListCard>
        <AppFilterNav onFilterChange={handleFilterChange}></AppFilterNav>
        <ListCard params={listCardParams} onParamsChange={handleParamsChange} />
      </div>
    </div>
  );
}
