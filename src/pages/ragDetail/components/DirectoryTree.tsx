/**
 * Directory Tree Component
 * 显示分层级的目录树，最多5层
 */

import React, { useMemo } from 'react';
import { Tree, Tooltip } from '@arco-design/web-react';
import type { TreeProps } from '@arco-design/web-react/es/Tree';
import { DirectoryNode } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';
import styles from './DirectoryTree.module.scss';

interface DirectoryTreeProps {
  nodes: DirectoryNode[];
}

// 自定义树节点标题组件，支持文本溢出省略和tooltip
const TreeNodeTitle: React.FC<{ label: string }> = ({ label }) => {
  return (
    <Tooltip content={label} position="top">
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%'
        }}
      >
        {label}
      </div>
    </Tooltip>
  );
};

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
        title: <TreeNodeTitle label={node.label} />
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
          title: <TreeNodeTitle label={child.label} />
        });
      });
    } else {
      // 正常情况：递归处理子节点
      result.push({
        key: node.id,
        title: <TreeNodeTitle label={node.label} />,
        children: hasChildren
          ? convertToTreeData(node.children!, currentLevel + 1)
          : undefined
      });
    }
  });

  return result;
};

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ nodes }) => {
  const {
    selectedDirectoryNodeId,
    selectDirectoryNode,
    setSelectedSegmentId,
    scrollToSegment,
    selectedSegmentId,
    highlightPdfCoordinates,
    clearPdfHighlight
  } = useRagDetailStore();

  // 转换数据格式
  const treeData = useMemo(() => convertToTreeData(nodes), [nodes]);

  // 默认不选中任何节点，只有当用户点击时才选中
  // 当分段列表被点击时，根据selectedSegmentId来高亮对应的目录树节点
  const selectedKeys = useMemo(() => {
    // 如果有选中的分段ID，查找对应的目录树节点
    if (selectedSegmentId) {
      // 递归查找包含该segmentId的节点
      // 优先匹配子级节点（isShort为true的节点），如果找不到再匹配父级
      const findNodeBySegmentId = (
        nodeList: DirectoryNode[],
        segmentId: string
      ): DirectoryNode | null => {
        let parentMatch: DirectoryNode | null = null;

        for (const node of nodeList) {
          // 先递归查找子节点（优先匹配子级）
          if (node.children && node.children.length > 0) {
            const found = findNodeBySegmentId(node.children, segmentId);
            if (found) return found;
          }

          // 检查当前节点的segmentIds是否包含该segmentId
          if (node.segmentIds && node.segmentIds.includes(segmentId)) {
            // 如果是isShort节点（子级），直接返回
            if (node.isShort) {
              return node;
            }
            // 如果是父级节点，先保存，继续查找是否有子级匹配
            if (!parentMatch) {
              parentMatch = node;
            }
          }
        }

        // 如果没有找到子级匹配，返回父级匹配
        return parentMatch;
      };

      const foundNode = findNodeBySegmentId(nodes, selectedSegmentId);
      if (foundNode) {
        return [foundNode.id];
      }
    }

    // 如果有选中的目录节点ID（用户点击目录树），使用它
    if (selectedDirectoryNodeId) {
      return [selectedDirectoryNodeId];
    }

    // 默认不选中
    return [];
  }, [selectedSegmentId, selectedDirectoryNodeId, nodes]);

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

  // 查找节点
  const findNode = (
    nodeId: string,
    nodeList: DirectoryNode[]
  ): DirectoryNode | null => {
    for (const node of nodeList) {
      if (node.id === nodeId) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findNode(nodeId, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelect = (selectedKeys: string[]) => {
    if (selectedKeys.length > 0) {
      const nodeId = selectedKeys[0];
      selectDirectoryNode(nodeId);

      // 查找节点
      const node = findNode(nodeId, nodes);
      if (!node) return;

      // 如果节点有position，高亮PDF位置
      if (node.position && node.position.length > 0) {
        highlightPdfCoordinates(node.position);
      } else {
        // 清除PDF高亮
        clearPdfHighlight();
      }

      // 如果节点有segmentIds，说明需要滚动到对应的分段
      if (node.segmentIds && node.segmentIds.length > 0) {
        const firstSegmentId = node.segmentIds[0];

        // 如果是short text节点（子级），需要高亮
        if (node.isShort) {
          setSelectedSegmentId(firstSegmentId);
        } else {
          // 如果是父级（有short_texts），只滚动不高亮
          setSelectedSegmentId(null);
        }

        // 滚动到分段
        scrollToSegment(firstSegmentId);
      }
    }
  };

  return (
    <div className="flex h-full w-[240px] flex-col bg-white px-4">
      <div className="flex-shrink-0 pb-3 pt-4">
        <h3 className="text-[16px] font-medium text-gray-900">目录</h3>
      </div>
      <div
        className={`flex-1 px-2 ${styles.directoryTreeContainer}`}
        style={{
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
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
