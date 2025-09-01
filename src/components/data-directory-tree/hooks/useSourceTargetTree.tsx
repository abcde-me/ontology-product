import {
  CatalogItemType,
  CatalogRootType,
  DstCatalogItem,
  getCatalogList as getCatalogListApi,
  SrcCatalogItem,
  getSourceCatalogFileList as getSourceCatalogFileListApi,
  getTargetCatalogFileList as getTargetCatalogFileListApi,
  GetTargetCatalogFileListParams,
  GetSourceCatalogFileListParams,
  GetSourceCatalogFileListItem,
  GetTargetCatalogFileListItem
} from '@/api/dataCatalog';
import { useEffect, useState } from 'react';

export const useSourceTargetTree = () => {
  // 目标目录列表
  const [targetCatalogList, setTargetCatalogList] = useState<DstCatalogItem[]>(
    []
  );
  // 源目录列表
  const [sourceCatalogList, setSourceCatalogList] = useState<SrcCatalogItem[]>(
    []
  );
  // 源目录文件列表
  const [sourceCatalogFileList, setSourceCatalogFileList] = useState<
    GetSourceCatalogFileListItem[]
  >([]);
  // 目标目录文件列表
  const [targetCatalogFileList, setTargetCatalogFileList] = useState<
    GetTargetCatalogFileListItem[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 获取数据目录列表
  const getCatalogList = async (
    root_type: CatalogRootType,
    dir_type?: CatalogItemType,
    search?: string
  ) => {
    const res = await getCatalogListApi({ root_type, search, dir_type });

    if (res?.status !== 200) {
      return;
    }

    setTargetCatalogList(res?.data?.dst ?? []);
    setSourceCatalogList(res?.data?.src ?? []);
  };

  // 获取数据目录文件列表
  const getCatalogFileList = async (
    root_type: CatalogRootType,
    params: GetSourceCatalogFileListParams | GetTargetCatalogFileListParams
  ) => {
    if (root_type === CatalogRootType.Target) {
      const res = await getTargetCatalogFileListApi(
        params as GetTargetCatalogFileListParams
      );

      if (res?.status !== 200) {
        return;
      }

      setCurrentPage(res?.data?.page ?? 1);
      setTargetCatalogFileList(res?.data?.list ?? []);
    } else if (root_type === CatalogRootType.Source) {
      const res = await getSourceCatalogFileListApi(
        params as GetSourceCatalogFileListParams
      );

      if (res?.status !== 200) {
        return;
      }

      setCurrentPage(res?.data?.page ?? 1);
      setSourceCatalogFileList(res?.data?.items ?? []);
    }
  };

  useEffect(() => {
    getCatalogList(CatalogRootType.All);
  }, []);

  return {
    targetCatalogList,
    sourceCatalogList,
    getCatalogList,
    sourceCatalogFileList,
    targetCatalogFileList,
    currentPage,
    getCatalogFileList
  };
};
