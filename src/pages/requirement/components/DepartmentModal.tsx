import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Button,
  Tree,
  Form,
  Input,
  Empty
} from '@arco-design/web-react';
import { getDepartmentTreeList } from '@/api/individualAndDepartment';
import './DepartmentModal.scss';
interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  getChildTreeSelectData: (data: any) => void;
  initialSelectedData?: any[]; // 添加初始选中数据参数
}

const DepartmentModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '数据源',
  getChildTreeSelectData
}) => {
  const FormItem = Form.Item;
  const [activeTab, setActiveTab] = useState('src');
  const [treeData, setTreeData] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  // 取树的内容 格式化
  const transformData = (originalSrc) => {
    // 递归处理单条数据（支持目录/数据卷）
    const transformItem = (item) => {
      const transformed = { ...item };
      // 替换type_name（如果是数据卷）
      if (transformed.type_name === 'volume') {
        transformed.type_name = '数据卷';
      }
      // 处理children中的"volume"键为"数据卷"
      if (transformed.children && transformed.children.volume) {
        // 递归处理子数据卷
        transformed.children['数据卷'] = transformed.children.volume.map(
          (vol) => transformItem(vol)
        );
        // 删除原始volume键
        delete transformed.children.volume;
      }
      return transformed;
    };

    // 处理整个src数组（目录列表）
    return originalSrc.map((catalog) => transformItem(catalog));
  };

  useEffect(() => {
    // let newTreeData: TreeNodeType[] = [];
    try {
      getDepartmentTreeList({})
        .then((res) => {
          console.log(res?.data, 'res');
          setTreeData(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.log(err, 'err');
    }
  }, [activeTab, visible]);

  const searchData = (searchValue, treeData) => {
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
    return loop(treeData);
  };

  /**
   * 递归查找节点，根据节点层级返回所有最深层id
   * @param {Array} array - 要搜索的数组
   * @param {*} targetId - 要查找的id值
   * @returns {Array|null} - 找到的所有最深层id数组或null
   */
  const findAllLeafNodeIds = (array, targetId) => {
    // 遍历当前层级的每个元素
    for (const item of array) {
      // 如果当前元素的id匹配目标id
      if (item.id === targetId) {
        // 收集该节点下所有叶子节点的ID
        return collectAllLeafIds([item]);
      }

      // 如果当前元素有children，递归查找
      if (
        item.children &&
        Array.isArray(item.children) &&
        item.children.length > 0
      ) {
        const result = findAllLeafNodeIds(item.children, targetId);
        if (result !== null) {
          return result;
        }
      }
    }

    // 未找到对应id
    return null;
  };

  /**
   * 辅助函数：查找所有最深层的id
   * @param {Array} array - 要搜索的数组
   * @returns {Array} - 所有最深层的id数组
   */
  const collectAllLeafIds = (nodes) => {
    const leafIds: string[] = [];

    for (const node of nodes) {
      // 检查是否有有效的子节点
      const hasChildren =
        node.children &&
        Array.isArray(node.children) &&
        node.children.length > 0;

      if (hasChildren) {
        // 有子节点，递归处理子节点
        leafIds.push(...collectAllLeafIds(node.children));
      } else {
        // 没有子节点，是叶子节点，收集ID
        leafIds.push(node.id);
      }
    }

    return leafIds;
  };

  useEffect(() => {
    if (!searchValue) {
      console.log(1, treeData);
      setTreeData(treeData);
    } else {
      const result = searchData(searchValue, treeData);
      console.log(2, result);
      setTreeData(result);
    }
  }, [searchValue]);

  const getTableSelectContent = () => {
    getChildTreeSelectData(checkedKeys);
    onClose();
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
      style={{ width: '90vw', height: '80vh' }}
      footer={
        <>
          <Button
            onClick={() => {
              onClose();
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            onClick={() => {
              getTableSelectContent();
            }}
          >
            确定
          </Button>
        </>
      }
    >
      <div className="dataSource-modal-content">
        <div>
          <Input
            type="text"
            allowClear
            placeholder="请输入名称搜索"
            onClear={() => {
              setTreeData(treeData);
            }}
            onChange={(value) => {
              setSearchValue(value);
            }}
          />
        </div>
        {treeData && treeData?.length > 0 ? (
          <Tree
            checkable
            autoExpandParent={false}
            style={{
              height: '60vh',
              overflowY: 'auto'
            }}
            renderTitle={({ title }: any) => {
              return (
                <span>
                  <span style={{ width: '300px', whiteSpace: 'nowrap' }}>
                    {title}
                  </span>
                </span>
              );
            }}
            treeData={treeData}
            onCheck={(key, val) => {
              // console.log(key, '=====top', findAllLeafNodeIds(treeData, key[0]), key[0]);
              setCheckedKeys(findAllLeafNodeIds(treeData, key[0]));
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
