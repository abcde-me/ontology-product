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

  useEffect(() => {
    // let newTreeData: TreeNodeType[] = [];
    try {
      getDepartmentTreeList({})
        .then((res) => {
          setTreeData(res?.data || []);
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
      style={{ width: '800px', height: '800px' }}
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
      <div className="department-modal-content">
        <div className="department-modal-search">
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
            selectable={false}
            checkable
            checkedStrategy="child"
            autoExpandParent={false}
            style={{
              height: '592px',
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
              setCheckedKeys(key);
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
