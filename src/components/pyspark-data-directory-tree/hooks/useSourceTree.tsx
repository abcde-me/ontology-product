import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { IconFolder } from '@arco-design/web-react/icon';
import VolumeFileIcon from '../assets/volumn-file-icon.svg';
import VolumeIcon from '../assets/volumn-icon.svg';
import { NodeInstance } from '@arco-design/web-react/es/Tree/interface';
import { useAsyncEffect } from 'ahooks';

export interface TreeNodeData {
  key: string;
  title: string;
  id?: number;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  loading?: boolean;
  data?: SrcCatalogItem | any;
  type: 'catalog' | 'volume' | 'volume_item' | 'file';
}

export const useSourceTree = () => {
  // 源数据
  const [sourceCatalogList, setSourceCatalogList] = useState<SrcCatalogItem[]>(
    []
  );

  // 树数据
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [treeDataFiltered, setTreeDataFiltered] = useState<TreeNodeData[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  // 获取数据目录列表
  const getCatalogList = async (
    search?: string,
    root_type: CatalogRootType = CatalogRootType.Source,
    dir_type: CatalogItemType = CatalogItemType.Volume
  ) => {
    const res = await getCatalogListApi({ root_type, search, dir_type });

    if (res?.status !== 200) {
      return [];
    }

    return res?.data?.src ?? [];
  };

  // 将数据集列表转换为树节点
  const convertSourceCatalogToTreeNode = useCallback(
    (catalog: SrcCatalogItem): TreeNodeData => {
      const children: TreeNodeData[] = [];

      // 处理 volume 数据卷
      if (catalog.children?.volume && catalog.children.volume.length > 0) {
        // 创建数据卷父节点
        const volumeParent: TreeNodeData = {
          key: `catalog-${catalog.id}-volume`,
          title: '数据卷',
          isLeaf: false,
          type: 'volume',
          data: {
            type: 'volume_parent',
            id: `${catalog.id}-volume`,
            name: '数据卷'
          },
          children: catalog.children.volume.map((volume) => ({
            key: `catalog-${catalog.id}-volume-${volume.id}`,
            id: volume.id,
            title: volume.name ?? '',
            isLeaf: false,
            icon: <VolumeIcon />,
            type: 'volume_item',
            data: {
              ...volume,
              type: 'volume',
              parentCatalog: catalog
            },
            children: []
          }))
        };
        children.push(volumeParent);
      }

      return {
        key: `catalog-${catalog.id}`,
        id: catalog.id,
        title: catalog.name ?? '',
        isLeaf: children.length === 0,
        data: catalog,
        type: 'catalog',
        children: children.length > 0 ? children : undefined
      };
    },
    []
  );

  // 将文件列表转换为树节点
  const convertFileToTreeNode = useCallback(
    (file: GetSourceCatalogFileListItem): TreeNodeData => {
      return {
        key: `file-${file.id}`,
        id: file.id,
        title: file.file_name,
        icon: <VolumeFileIcon />,
        isLeaf: true,
        type: 'file',
        data: {
          ...file,
          type: 'file'
        }
      };
    },
    []
  );

  // 处理加载更多（预留接口）
  const loadMore = useCallback(
    (node: NodeInstance): Promise<void> => {
      return new Promise(async (resolve) => {
        try {
          const nodeData = node.props.dataRef as TreeNodeData;
          console.log(nodeData, 'nodeData');
          if (!nodeData?.id) {
            return resolve();
          }

          const res = await getSourceCatalogFileListApi({
            page: 1,
            page_size: 1000,
            data_path_id: Number(nodeData.id),
            sort: 'desc' as 'asc' | 'desc'
          });

          console.log(res?.data?.items, 'res?.data?.items');

          if (res.data?.items?.length > 0) {
            // 更新已加载的子节点数据
            const children = res.data.items.map((file) =>
              convertFileToTreeNode(file)
            );

            // 更新 treeData 中的对应节点
            setTreeData((prevTreeData) => {
              return prevTreeData.map((catalog) => {
                if (catalog.children) {
                  return {
                    ...catalog,
                    children: catalog.children.map((volumeParent) => {
                      if (volumeParent.children) {
                        return {
                          ...volumeParent,
                          children: volumeParent.children.map((volumeItem) => {
                            if (volumeItem.key === nodeData.key) {
                              return {
                                ...volumeItem,
                                children: children
                              };
                            }
                            return volumeItem;
                          })
                        };
                      }
                      return volumeParent;
                    })
                  };
                }
                return catalog;
              });
            });
          }
        } catch (error) {
          console.error('Failed to load more data:', error);
        } finally {
          resolve();
        }
      });
    },
    [getSourceCatalogFileListApi, convertFileToTreeNode]
  );

  const filterTreeData = useCallback((treeData: TreeNodeData[]) => {
    return treeData.filter((item) => {
      return item.type !== 'volume_item';
    });
  }, []);

  //树组件自带的
  const searchData = (
    inputValue: string,
    treeData: TreeNodeData[]
  ): { filteredData: TreeNodeData[]; expandedKeys: string[] } => {
    const expandedKeys: string[] = [];

    const loop = (data: TreeNodeData[]): TreeNodeData[] => {
      const result: TreeNodeData[] = [];
      data.forEach((item) => {
        if (item.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1) {
          result.push({ ...item });
          // 如果当前节点匹配，需要展开其所有父节点
          expandedKeys.push(item.key);
        } else if (item.children) {
          const filterData = loop(item.children);

          if (filterData.length) {
            result.push({ ...item, children: filterData });
            // 如果子节点有匹配，需要展开当前节点
            expandedKeys.push(item.key);
          }
        }
      });
      return result;
    };

    const filteredData = loop(treeData);
    return { filteredData, expandedKeys };
  };

  useAsyncEffect(async () => {
    const catalogList = await getCatalogList();
    const newTreeData = catalogList.map(convertSourceCatalogToTreeNode);
    setTreeData(newTreeData);
  }, []);

  // 搜索功能：根据输入值过滤树数据
  useEffect(() => {
    if (!searchKeyword) {
      setTreeDataFiltered(treeData);
      // 清空搜索时，保持当前的展开状态
    } else {
      const { filteredData } = searchData(searchKeyword, treeData);
      setTreeDataFiltered(filteredData);
    }
  }, [searchKeyword, treeData]);

  // 单独处理搜索关键词变化时的展开逻辑，避免死循环
  useEffect(() => {
    if (searchKeyword && treeData.length > 0) {
      const { expandedKeys } = searchData(searchKeyword, treeData);
      setExpandedKeys(expandedKeys);
    }
  }, [searchKeyword]);

  return {
    treeDataFiltered,
    setTreeData,
    expandedKeys,
    setExpandedKeys,
    handleSearch,
    loadMore,
    searchKeyword
  };
};
