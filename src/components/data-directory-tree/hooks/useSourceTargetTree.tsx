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

  useEffect(() => {
    getCatalogList(
      dataType === 'source' ? CatalogRootType.Source : CatalogRootType.Target
    );
  }, [dataType]);

  return {
    targetCatalogList,
    sourceCatalogList,
    getCatalogList,
    sourceCatalogFileList,
    targetCatalogFileList,
    currentPage,
    getCatalogFileList,
    getNodeHierarchyInfo,
    findFullPathById: (targetId: number) =>
      findFullPathById(targetCatalogList, targetId)
  };
};
