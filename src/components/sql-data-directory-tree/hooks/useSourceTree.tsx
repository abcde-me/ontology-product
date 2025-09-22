import {
  CatalogItemType,
  CatalogRootType,
  getCatalogList as getCatalogListApi,
  getDbItemDetail,
  getDbItemList as getDbItemListApi,
  SrcCatalogItem
} from '@/api/dataCatalog';
import { NodeInstance } from '@arco-design/web-react/es/Tree/interface';
import { useAsyncEffect } from 'ahooks';
import React, { useCallback, useEffect, useState } from 'react';
import { default as DbIcon } from '../assets/db-icon.svg';
import { default as DbItemIcon } from '../assets/db-db_item-icon.svg';
import { default as DbTableIcon } from '../assets/db-table-icon.svg';
import { default as DbColumnIcon } from '../assets/db-column-icon.svg';

export interface TreeNodeData {
  key: string;
  title: string;
  file_size?: number;
  id?: number;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  loading?: boolean;
  data?: SrcCatalogItem | any;
  type: 'catalog' | 'db_group' | 'db' | 'db_item' | 'table' | 'column';
}

export const useSourceTree = () => {
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
    dir_type: CatalogItemType = CatalogItemType.Database
  ) => {
    const res = await getCatalogListApi({ root_type, search, dir_type });

    if (res?.status !== 200) {
      return [];
    }

    return res?.data?.src ?? [];
  };

  // 将数据库列表转换为树节点
  const convertSourceCatalogToTreeNode = useCallback(
    (catalog: SrcCatalogItem): TreeNodeData => {
      const children: TreeNodeData[] = [];

      // 处理 db 数据库
      if (catalog.children?.db && catalog.children.db.length > 0) {
        // 创建数据库父节点
        const dbParent: TreeNodeData = {
          key: `catalog-${catalog.id}-db`,
          title: '数据库',
          isLeaf: false,
          type: 'db_group',
          data: {
            type: 'db_parent',
            id: `${catalog.id}-db`,
            name: '数据库'
          },
          children: catalog.children.db.map((dbGroup, groupIndex) => ({
            key: `catalog-${catalog.id}-db-${dbGroup.id}`,
            id: dbGroup.id,
            title: dbGroup.name ?? '',
            isLeaf: false,
            icon: <DbIcon />,
            type: 'db',
            data: {
              ...dbGroup,
              type: 'db',
              parentCatalog: catalog
            },
            children: (dbGroup?.children?.db_item || []).map(
              (dbItem, dbItemIndex) => ({
                key: `catalog-${catalog.id}-db_item-${dbItem.id}-${groupIndex}-${dbItemIndex}`,
                id: dbItem.id,
                title: dbItem.name ?? '',
                isLeaf: false,
                icon: <DbItemIcon />,
                type: 'db_item',
                data: {
                  ...dbItem,
                  type: 'db_item',
                  parentDB: dbGroup,
                  parentCatalog: catalog
                },
                children: []
              })
            )
          }))
        };
        children.push(dbParent);
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
  const convertTableToTreeNode = useCallback(
    (table, parentDBItem): TreeNodeData => {
      return {
        key: `table-${table.table_id}`,
        id: table.table_id,
        title: table.table_name,
        icon: <DbTableIcon />,
        isLeaf: false,
        type: 'table',
        data: {
          ...table,
          type: 'table',
          parentDBItem
        }
      };
    },
    []
  );

  // 处理加载更多（预留接口）
  const loadMore = useCallback(
    async (node: NodeInstance): Promise<void> => {
      const nodeData = node.props.dataRef as TreeNodeData;

      if (nodeData.type === 'db_item') {
        try {
          const res = await getDbItemListApi({
            page: 1,
            limit: 1000,
            database: nodeData?.data?.name,
            path_id: nodeData?.data?.parentDB?.id,
            search: ''
          });

          const tables = res?.data?.list || [];
          if (tables.length > 0) {
            const children = tables.map((table) =>
              convertTableToTreeNode(table, nodeData.data)
            );
            setTreeData((prevTreeData) => {
              // 递归查找并插入children
              const updateNode = (nodes: TreeNodeData[]): TreeNodeData[] =>
                nodes.map((n) => {
                  if (n.key === nodeData.key) {
                    return { ...n, children };
                  }
                  if (n.children) {
                    return { ...n, children: updateNode(n.children) };
                  }
                  return n;
                });
              return updateNode(prevTreeData);
            });
          } else {
            // 没有表时也要设置children为空数组，避免重复请求
            setTreeData((prevTreeData) => {
              const updateNode = (nodes: TreeNodeData[]): TreeNodeData[] =>
                nodes.map((n) => {
                  if (n.key === nodeData.key) {
                    return { ...n, children: [] };
                  }
                  if (n.children) {
                    return { ...n, children: updateNode(n.children) };
                  }
                  return n;
                });
              return updateNode(prevTreeData);
            });
          }
        } catch (e) {
          console.log('数据表加载失败...');
        }
        return;
      }

      if (nodeData.type === 'table') {
        try {
          const res = await getDbItemDetail({
            detail_type: 'sample',
            database: nodeData.data.parentDBItem.name,
            path_id: nodeData.data.parentDBItem.parentDB.id,
            table: nodeData.data.table_name,
            table_id: nodeData.data.table_id
          });

          const columns = res?.data?.sample?.columns || [];
          const data = res?.data?.sample?.data || [];

          if (columns.length > 0) {
            // 构建字段节点
            const fieldNodes: TreeNodeData[] = columns.map((col) => ({
              key: `table-${nodeData.data.table_id}-column-${col}`,
              title: col,
              isLeaf: true,
              icon: <DbColumnIcon />,
              type: 'column',
              data: {
                type: 'column',
                name: col,
                sample: data.length > 0 ? data[0][col] : undefined,
                parentTable: nodeData.data
              }
            }));

            setTreeData((prevTreeData) => {
              const updateNode = (nodes: TreeNodeData[]): TreeNodeData[] =>
                nodes.map((n) => {
                  if (n.key === nodeData.key) {
                    return { ...n, children: fieldNodes };
                  }
                  if (n.children) {
                    return { ...n, children: updateNode(n.children) };
                  }
                  return n;
                });
              return updateNode(prevTreeData);
            });
          } else {
            // 没有字段时也要设置children为空数组，避免重复请求
            setTreeData((prevTreeData) => {
              const updateNode = (nodes: TreeNodeData[]): TreeNodeData[] =>
                nodes.map((n) => {
                  if (n.key === nodeData.key) {
                    return { ...n, children: [] };
                  }
                  if (n.children) {
                    return { ...n, children: updateNode(n.children) };
                  }
                  return n;
                });
              return updateNode(prevTreeData);
            });
          }
        } catch (e) {
          console.log('数据列加载失败...');
        }
        return;
      }
    },
    [getDbItemListApi, convertTableToTreeNode]
  );

  const filterTreeData = useCallback((treeData: TreeNodeData[]) => {
    return treeData.filter((item) => {
      return item.type !== 'db_item';
    });
  }, []);

  // 树组件搜索功能：递归过滤树形数据并返回匹配的节点和需要展开的节点
  const searchData = useCallback(
    (
      inputValue: string,
      treeData: TreeNodeData[]
    ): { filteredData: TreeNodeData[]; expandedKeys: string[] } => {
      const expandedKeys: string[] = [];

      const loop = (data: TreeNodeData[]): TreeNodeData[] => {
        const result: TreeNodeData[] = [];
        data.forEach((item) => {
          const isMatch =
            item.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;

          if (isMatch) {
            // 当前节点匹配，完整保留该节点（包括所有子节点）
            result.push({ ...item });
            // 如果当前节点匹配，需要展开其父节点路径，但异步加载的节点类型（db_item, table）不需要自动展开
            if (!['db_item', 'table'].includes(item.type)) {
              expandedKeys.push(item.key);
            }
          } else if (item.children && item.children.length > 0) {
            // 当前节点不匹配，但可能有子节点匹配，递归检查子节点
            const filterData = loop(item.children);

            if (filterData.length > 0) {
              // 有匹配的子节点，保留当前节点并更新其子节点
              result.push({ ...item, children: filterData });
              // 如果子节点有匹配，需要展开当前节点
              expandedKeys.push(item.key);
            }
          }
        });
        return result;
      };

      const filteredData = inputValue.trim() ? loop(treeData) : treeData;
      return { filteredData, expandedKeys };
    },
    []
  );

  useAsyncEffect(async () => {
    const catalogList = await getCatalogList();
    const newTreeData = catalogList.map(convertSourceCatalogToTreeNode);
    console.log(newTreeData, 'newTreeData');
    setTreeData(newTreeData);
  }, []);

  // 搜索功能：根据输入值过滤树数据
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setTreeDataFiltered(treeData);
      // 清空搜索时，保持当前的展开状态
    } else {
      const { filteredData, expandedKeys } = searchData(
        searchKeyword,
        treeData
      );
      setTreeDataFiltered(filteredData);
      // 搜索时自动展开匹配的节点路径
      setExpandedKeys((prevKeys) => {
        // 合并之前的展开状态和搜索匹配的展开状态
        const newKeys = [...new Set([...prevKeys, ...expandedKeys])];
        return newKeys;
      });
    }
  }, [searchKeyword, treeData, searchData]);
  console.log(treeDataFiltered, 'treeDataFiltered');
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
