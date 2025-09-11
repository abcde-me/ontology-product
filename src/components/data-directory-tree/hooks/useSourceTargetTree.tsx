import {
  CatalogItemType,
  CatalogRootType,
  DstCatalogItem,
  getCatalogList as getCatalogListApi,
  getDbItemList as getDbItemListApi,
  SrcCatalogItem,
  getSourceCatalogFileList as getSourceCatalogFileListApi,
  getTargetCatalogFileList as getTargetCatalogFileListApi,
  GetTargetCatalogFileListParams,
  GetSourceCatalogFileListParams,
  GetSourceCatalogFileListItem,
  GetTargetCatalogFileListItem,
  DbTableListParamss,
  getDbItemDetail,
  GetDbItemDetailParams,
  GetDbItemDetailRes
} from '@/api/dataCatalog';
import { useEffect, useState } from 'react';
import { searchTreeNodes, SEARCH_CONFIGS } from '../utils/treeSearchUtils';

// 扩展的目录项类型，包含full_path
interface DstCatalogItemWithPath {
  base_dir?: string;
  children?: {
    volume?: Array<{
      base_dir: string;
      id: number;
      name: string;
      parent_id: number;
      type: number;
      type_name: string;
      full_path?: string;
    }>;
  };
  id?: number;
  name?: string;
  parent_id?: number;
  perms?: string[];
  type?: number;
  type_name?: string;
  full_path?: string;
}

// 扩展的源目录项类型，包含full_path
interface SrcCatalogItemWithPath extends SrcCatalogItem {
  full_path?: string;
}

/**
 * 为目标目录项生成full_path
 * @param items 目标目录项数组
 * @param rootType 根类型 ('dst' 或 'src')
 * @returns 带有full_path的目录项数组
 */
export const generateDstFullPath = (
  items: DstCatalogItem[],
  rootType: 'dst' | 'src' = 'dst'
): DstCatalogItemWithPath[] => {
  return items.map((item) => {
    const itemWithPath: DstCatalogItemWithPath = {
      ...item,
      full_path: `/${rootType}/${item.name}`
    };

    // 如果有子项，递归处理
    if (item.children?.volume) {
      itemWithPath.children = {
        volume: item.children.volume.map((volume) => ({
          ...volume,
          full_path: `/${rootType}/${item.name}/volume/${volume.name}`
        }))
      };
    }

    return itemWithPath;
  });
};

/**
 * 为源目录项生成full_path
 * @param items 源目录项数组
 * @param rootType 根类型 ('dst' 或 'src')
 * @returns 带有full_path的目录项数组
 */
export const generateSrcFullPath = (
  items: SrcCatalogItem[],
  rootType: 'dst' | 'src' = 'src'
): SrcCatalogItemWithPath[] => {
  return items.map((item) => {
    const itemWithPath: SrcCatalogItemWithPath = {
      ...item,
      full_path: `/${rootType}/${item.name}`
    };

    // 如果有子项，递归处理
    if (item.children?.volume) {
      itemWithPath.children = {
        ...item.children,
        volume: item.children.volume.map((volume) => ({
          ...volume,
          full_path: `/${rootType}/${item.name}/volume/${volume.name}`
        }))
      };
    }

    return itemWithPath;
  });
};

/**
 * 根据ID查找项目的full_path
 * @param items 目录项数组
 * @param targetId 目标ID
 * @returns 找到的项目的full_path，如果未找到返回null
 */
const findFullPathById = (
  items: DstCatalogItemWithPath[],
  targetId: number
): string | null => {
  for (const item of items) {
    // 检查当前项
    if (item.id === targetId) {
      return item.full_path || null;
    }

    // 检查子项
    if (item.children?.volume) {
      for (const volume of item.children.volume) {
        if (volume.id === targetId) {
          return volume.full_path || null;
        }
      }
    }
  }
  return null;
};

// 树节点类型定义（用于Tree组件）
interface TreeNodeType {
  title: string;
  key: string;
  children?: TreeNodeType[];
  isLeaf?: boolean;
  rawData?: any; // 保存原始数据引用
}

export const useSourceTargetTree = (dataType) => {
  // 目标目录列表（带full_path）
  const [targetCatalogList, setTargetCatalogList] = useState<
    DstCatalogItemWithPath[]
  >([]);
  // 源目录列表（带full_path）
  const [sourceCatalogList, setSourceCatalogList] = useState<
    SrcCatalogItemWithPath[]
  >([]);
  // 源目录文件列表
  const [sourceCatalogFileList, setSourceCatalogFileList] = useState<
    GetSourceCatalogFileListItem[]
  >([]);
  // 目标目录文件列表
  const [targetCatalogFileList, setTargetCatalogFileList] = useState<
    GetTargetCatalogFileListItem[]
  >([]);
  // 源目录表列表
  const [sourceCatalogTableList, setSourceCatalogTableList] = useState<
    DbTableListParamss[]
  >([]);
  // 表详情列表
  const [sourceCatalogTableDetail, setSourceCatalogTableDetail] =
    useState<GetDbItemDetailRes | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 搜索相关状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredCatalogList, setFilteredCatalogList] = useState<
    DstCatalogItemWithPath[] | SrcCatalogItemWithPath[]
  >([]);
  const [filteredFileList, setFilteredFileList] = useState<
    GetSourceCatalogFileListItem[] | GetTargetCatalogFileListItem[]
  >([]);
  const [filteredTableList, setFilteredTableList] = useState<
    DbTableListParamss[]
  >([]);
  const [filteredTableColumns, setFilteredTableColumns] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

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

    // 为目标目录生成full_path
    const targetListWithPath = generateDstFullPath(res?.data?.dst ?? [], 'dst');

    console.log('targetListWithPath', targetListWithPath);
    setTargetCatalogList(targetListWithPath);

    // 为源目录生成full_path（如果需要的话）
    const sourceListWithPath = generateSrcFullPath(res?.data?.src ?? [], 'src');
    setSourceCatalogList(sourceListWithPath);
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
      console.log(res?.data?.list, 'res?.data?.list');
      setTargetCatalogFileList(res?.data?.list ?? []);
    } else if (root_type === CatalogRootType.Source) {
      const res = await getSourceCatalogFileListApi(
        params as GetSourceCatalogFileListParams
      );

      if (res?.status !== 200) {
        return;
      }

      setCurrentPage(res?.data?.page ?? 1);
      console.log(res?.data?.items, 'res?.data?.items');
      setSourceCatalogFileList(res?.data?.items ?? []);
    }
  };

  /**
   * 根据节点key获取完整的层级路径信息
   *  nodeKey 当前节点的key
   */
  const getNodeHierarchyInfo = (nodeKey: string, treeData: TreeNodeType[]) => {
    if (!nodeKey) return null;
    // 递归查找指定key的节点及其路径
    const findNodePath = (
      nodes: TreeNodeType[],
      targetKey: string,
      path: TreeNodeType[] = []
    ): TreeNodeType[] | null => {
      for (const node of Array.from(nodes)) {
        const currentPath = [...path, node];

        if (node.key === targetKey) {
          return currentPath;
        }

        if (node.children) {
          const found = findNodePath(node.children, targetKey, currentPath);
          if (found) return found;
        }
      }
      return null;
    };

    console.log('treeData', treeData);
    console.log('nodeKey', nodeKey);
    const nodePath = findNodePath(treeData, nodeKey);
    if (!nodePath) return null;

    const result = {
      currentNode: null as any, // 当前节点
      parentNode: null as any, // 父级节点
      grandparentNode: null as any, // 爷爷级节点
      fullPath: '' // 完整路径字符串
    };
    // 根据路径长度提取各级节点信息
    const pathLength = nodePath.length;

    if (pathLength >= 1) {
      result.currentNode = nodePath[pathLength - 1]; // 最后一个是当前节点
    }

    if (pathLength >= 2) {
      result.parentNode = nodePath[pathLength - 2]; // 倒数第二个是父级节点
    }

    if (pathLength >= 3) {
      result.grandparentNode = nodePath[0]; // 第一个是爷爷级节点（catalog）
    }
    // 构建完整路径字符串 例如: /src/catalog1/volume/source-vol1
    const pathNames = nodePath
      .map((node) => {
        const rawData = node.rawData;
        const nodeName = rawData?.name || node.title;
        // 将中文分组名称转换为对应的英文类型名称
        if (rawData?.type === 'volume_parent') {
          return 'volume'; // "数据卷" → "volume"
        } else if (rawData?.type === 'db_parent') {
          return 'db'; // "数据库" → "db"
        } else {
          return nodeName; // 其他节点保持原名称
        }
      })
      .filter((name) => name);
    result.fullPath = '/dst/' + pathNames.join('/');
    return result;
  };

  // 查询源库下的表列表
  const getSourceCatalogTableList = async (params: DbTableListParamss) => {
    const res = await getDbItemListApi(params);

    if (res?.status !== 200) {
      return;
    }

    setSourceCatalogTableList(res?.data?.list ?? []);
  };

  // 查询源库下的表详情
  const getSourceCatalogTableDetail = async (params: GetDbItemDetailParams) => {
    const res = await getDbItemDetail(params);

    if (res?.status !== 200 || !res?.data?.sample) {
      return;
    }

    setSourceCatalogTableDetail(res?.data ?? null);
  };

  // 前端搜索方法 - 用于catalog、category、volume-db、db-item、table-detail层级
  const performFrontendSearch = (
    keyword: string,
    data: any[],
    searchFields: string[]
  ) => {
    return searchTreeNodes(keyword, data, searchFields, SEARCH_CONFIGS.BY_NAME);
  };

  // 搜索catalog层级
  const searchCatalog = (keyword: string) => {
    setSearchKeyword(keyword);
    const currentList =
      dataType === 'source' ? sourceCatalogList : targetCatalogList;
    const filtered = performFrontendSearch(keyword, currentList, ['name']);
    setFilteredCatalogList(filtered);
  };

  // 搜索category层级 - 这里主要是过滤volume和db
  const searchCategory = (keyword: string, catalog: any) => {
    setSearchKeyword(keyword);
    if (!catalog) return;

    const filteredCatalog = { ...catalog };

    if (catalog.children?.volume) {
      filteredCatalog.children = {
        ...catalog.children,
        volume: performFrontendSearch(keyword, catalog.children.volume, [
          'name'
        ])
      };
    }

    if (catalog.children?.db) {
      filteredCatalog.children = {
        ...filteredCatalog.children,
        db: performFrontendSearch(keyword, catalog.children.db, ['name'])
      };
    }

    return filteredCatalog;
  };

  // 搜索files层级 - 调用API
  const searchFiles = async (keyword: string, volumeOrDb: any) => {
    setSearchKeyword(keyword);
    setIsLoading(true);

    try {
      const rootType =
        dataType === 'source' ? CatalogRootType.Source : CatalogRootType.Target;

      const params =
        dataType === 'source'
          ? {
              page: 1,
              page_size: 100,
              data_path_id: Number(volumeOrDb.id),
              file_name: keyword,
              sort: 'desc' as 'asc' | 'desc'
            }
          : {
              page: 1,
              limit: 100,
              full_path: volumeOrDb.full_path || '',
              sort_field: volumeOrDb.sort_field || '',
              sort_order: 'desc' as 'asc' | 'desc',
              path_id: volumeOrDb.id.toString(),
              search_name: keyword
            };

      await getCatalogFileList(rootType, params);
    } catch (error) {
      console.error('搜索文件失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 搜索database-tables层级 - 调用API
  const searchDatabaseTables = async (
    keyword: string,
    dbItem: any,
    db: any
  ) => {
    setSearchKeyword(keyword);
    setIsLoading(true);

    try {
      const params = {
        path_id: Number(db.id),
        search: keyword,
        page: 1,
        limit: 100,
        database: dbItem.name || ''
      };

      await getSourceCatalogTableList(params);
    } catch (error) {
      console.error('搜索数据库表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 搜索table-detail层级 - 前端搜索字段
  const searchTableDetail = (keyword: string, tableDetail: any) => {
    setSearchKeyword(keyword);
    if (!tableDetail?.sample?.columns) return tableDetail;

    // 对于字符串数组，直接过滤
    const filteredColumns = tableDetail.sample.columns.filter(
      (column: string) => column.toLowerCase().includes(keyword.toLowerCase())
    );

    setFilteredTableColumns(filteredColumns);
    return {
      ...tableDetail,
      sample: {
        ...tableDetail.sample,
        columns: filteredColumns
      }
    };
  };

  // 清空搜索
  const clearSearch = () => {
    setSearchKeyword('');
    setFilteredCatalogList([]);
    setFilteredFileList([]);
    setFilteredTableList([]);
    setFilteredTableColumns([]);
  };

  useEffect(() => {
    getCatalogList(
      dataType === 'source' ? CatalogRootType.Source : CatalogRootType.Target
    );
  }, [dataType]);

  return {
    targetCatalogList,
    sourceCatalogList,
    sourceCatalogFileList,
    targetCatalogFileList,
    currentPage,
    sourceCatalogTableList,
    sourceCatalogTableDetail,
    isLoading,
    searchKeyword,
    filteredCatalogList,
    filteredFileList,
    filteredTableList,
    filteredTableColumns,

    getCatalogList,
    getCatalogFileList,
    getSourceCatalogTableList,
    setSourceCatalogTableList,
    getSourceCatalogTableDetail,
    getNodeHierarchyInfo,
    findFullPathById: (targetId: number) =>
      findFullPathById(targetCatalogList, targetId),

    // 搜索相关方法
    searchCatalog,
    searchCategory,
    searchFiles,
    searchDatabaseTables,
    searchTableDetail,
    clearSearch,
    setSearchKeyword
  };
};
