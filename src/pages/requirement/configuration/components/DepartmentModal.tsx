import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Tree,
  Input,
  Empty,
  Tooltip
} from '@arco-design/web-react';
import { getDepartmentTreeList } from '@/api/individualAndDepartment';
import './DepartmentModal.scss';

// 树节点处理工具函数
const processTreeNode = (node: any): any => {
  return {
    ...node,
    actionOnClick: 'check',
    // 递归处理子节点，将childList转换为children
    children: node.childList?.map((child: any) => processTreeNode(child))
  };
};

// 处理树数据的工具函数
const processTreeData = (data: any[]): any[] => {
  return data?.map((item) => processTreeNode(item)) || [];
};

// 只保留有权限数据的节点
const filterTreeDataByPerms = (data: any[]): any[] => {
  if (!data?.length) return [];

  return data.reduce((result: any[], item) => {
    // 递归过滤子节点
    const filteredChildren = item.children?.length
      ? filterTreeDataByPerms(item.children)
      : undefined;

    // 如果当前节点有权限，保留该节点（即使子节点被过滤为空也要保留）
    if (item.isPermission) {
      result.push({
        ...item,
        children: filteredChildren
      });
    } else if (filteredChildren?.length) {
      // 如果当前节点没有权限但有过滤后的子节点，提升子节点层级
      result.push(...filteredChildren);
    }
    // 既没有权限也没有有效子节点的节点被忽略

    return result;
  }, []);
};

interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  getChildTreeSelectData: (data: any) => void;
  type: any;
  onConfirm?: (selectedIds: string[]) => void; // 新增：确认回调
  initialSelected?: string[]; // 新增：初始选中的部门ID列表
}
const InputSearch = Input.Search;
const DepartmentModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '数据源',
  getChildTreeSelectData,
  type,
  onConfirm,
  initialSelected = []
}) => {
  const [activeTab] = useState('src');
  const [treeData, setTreeData] = useState<any>([]);
  const [originalTreeData, setOriginalTreeData] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  // 处理初始选中的数据 - 当弹窗打开或初始选中数据变化时同步
  useEffect(() => {
    if (visible) {
      setCheckedKeys(initialSelected || []);
    }
  }, [visible, initialSelected]);
  const getTreeData = () => {
    try {
      getDepartmentTreeList()
        .then((res) => {
          const newTreeData = processTreeData(res?.data || []);
          setTreeData(filterTreeDataByPerms(newTreeData));
          setOriginalTreeData(filterTreeDataByPerms(newTreeData));
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.log(err, 'err');
    }
  };
  useEffect(() => {
    if (visible) {
      getTreeData();
    }
  }, [activeTab, visible]);

  const searchData = (searchValue, originalTreeData) => {
    const loop = (data) => {
      const result: any = [];
      data.forEach((item) => {
        const isMatch =
          item.title?.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        const childrenResult = item.children ? loop(item.children) : [];
        if (isMatch || childrenResult.length > 0) {
          result.push({
            ...item,
            children: childrenResult.length > 0 ? childrenResult : undefined
          });
        }
      });
      return result;
    };
    return loop(originalTreeData);
  };

  useEffect(() => {
    if (!searchValue) {
      setTreeData(originalTreeData);
    } else {
      const result = searchData(searchValue, originalTreeData);
      setTreeData(result);
    }
  }, [searchValue]);

  const findParentIds = (treeNodes, targetIds) => {
    const allIds = [...targetIds];
    const targetSet = new Set(targetIds);

    // 递归查找父节点
    const traverse = (nodes, parentIds = []) => {
      for (const node of nodes) {
        const currentParentIds = [...parentIds];

        // 如果当前节点的任何子节点在目标ID列表中，或者当前节点本身在目标ID列表中
        const hasSelectedChild =
          node.children &&
          node.children.some(
            (child) =>
              targetSet.has(child.id) ||
              (child.children &&
                child.children.some((c) => targetSet.has(c.id)))
          );

        if (hasSelectedChild || targetSet.has(node.id)) {
          if (!allIds.includes(node.id)) {
            allIds.push(node.id);
          }
        }

        if (node.children) {
          traverse(node.children, currentParentIds);
        }
      }
    };

    traverse(treeNodes);
    return allIds;
  };
  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={false}
      maskClosable={false}
      className="dataSource-modal"
      style={{ width: '800px', height: '800px' }}
      closeIcon={null}
      footer={
        <Button
          onClick={() => {
            if (onConfirm) {
              onConfirm(checkedKeys);
            }
            onClose();
          }}
          type="primary"
        >
          确定
        </Button>
      }
    >
      <div className="department-modal-content">
        <div className="department-modal-search">
          <InputSearch
            type="text"
            allowClear
            placeholder="请输入名称搜索"
            onClear={() => {
              getTreeData();
            }}
            onChange={(value) => {
              setSearchValue(value);
            }}
          />
        </div>
        {treeData && treeData?.length > 0 ? (
          <Tree
            // selectable={false}
            actionOnClick="check"
            checkable
            checkedStrategy="child"
            autoExpandParent={false}
            checkedKeys={checkedKeys}
            style={{
              width: '300px',
              height: '592px',
              overflowY: 'auto',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            renderTitle={({ title }: any) => {
              return (
                <span>
                  <span style={{ width: '300px', whiteSpace: 'nowrap' }}>
                    <Tooltip content={title}>{title}</Tooltip>
                  </span>
                </span>
              );
            }}
            treeData={treeData}
            onCheck={(key) => {
              setCheckedKeys(key);
              getChildTreeSelectData(key);
            }}
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </div>
    </Modal>
  );
};

export { DepartmentModal };
