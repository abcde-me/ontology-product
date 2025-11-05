/**
 * Directory Tree Component
 * 显示分层级的目录树，最多5层
 */

import React, { useMemo } from 'react';
import { Tree } from '@arco-design/web-react';
import type { TreeProps } from '@arco-design/web-react/es/Tree';
import { DirectoryNode } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';

interface DirectoryTreeProps {
  nodes: DirectoryNode[];
}

// 将DirectoryNode转换为Arco Tree的TreeNodeData格式，并限制最多5层
// 第6层及以下的节点会被打平到第5层同级显示
const convertToTreeData = (
  nodes: DirectoryNode[],
  currentLevel = 1
): TreeProps['treeData'] => {
  const result: TreeProps['treeData'] = [];

  nodes.forEach((node) => {
    const hasChildren = node.children && node.children.length > 0;

    // 如果当前是第5层，将所有子节点（第6层及以下）打平到同级
    if (currentLevel === 5 && hasChildren) {
      // 先添加第5层节点本身
      result.push({
        key: node.id,
        title: node.label
      });

      // 然后将所有子节点（第6层及以下）打平添加到同级
      const flattenedChildren: DirectoryNode[] = [];
      const flatten = (children: DirectoryNode[]) => {
        children.forEach((child) => {
          flattenedChildren.push({ ...child, children: undefined });
          if (child.children && child.children.length > 0) {
            flatten(child.children);
          }
        });
      };
      flatten(node.children!);

      // 将打平的节点添加到结果数组（与第5层节点同级）
      flattenedChildren.forEach((child) => {
        result.push({
          key: child.id,
          title: child.label
        });
      });
    } else {
      // 正常情况：递归处理子节点
      result.push({
        key: node.id,
        title: node.label,
        children: hasChildren
          ? convertToTreeData(node.children!, currentLevel + 1)
          : undefined
      });
    }
  });

  return result;
};

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ nodes }) => {
  const { selectedDirectoryNodeId, selectDirectoryNode } = useRagDetailStore();

  // 转换数据格式
  const treeData = useMemo(() => convertToTreeData(nodes), [nodes]);

  // 选中的节点
  const selectedKeys = useMemo(() => {
    return selectedDirectoryNodeId ? [selectedDirectoryNodeId] : [];
  }, [selectedDirectoryNodeId]);

  // 获取所有节点的key用于默认展开
  const getAllKeys = (nodes: DirectoryNode[]): string[] => {
    const keys: string[] = [];
    const traverse = (nodes: DirectoryNode[]) => {
      nodes.forEach((node) => {
        keys.push(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return keys;
  };

  const defaultExpandedKeys = useMemo(() => getAllKeys(nodes), [nodes]);

  const handleSelect = (selectedKeys: string[]) => {
    if (selectedKeys.length > 0) {
      selectDirectoryNode(selectedKeys[0]);
    }
  };

  return (
    <div className="flex h-full w-[240px] flex-col bg-white px-4">
      <div className="flex-shrink-0 pb-3 pt-4">
        <h3 className="text-[16px] font-medium text-gray-900">目录</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <Tree
          treeData={treeData}
          selectedKeys={selectedKeys}
          defaultExpandedKeys={defaultExpandedKeys}
          onSelect={handleSelect}
          blockNode
          size="small"
        />
      </div>
    </div>
  );
};

export default DirectoryTree;
