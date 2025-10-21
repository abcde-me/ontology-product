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
interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  getChildTreeSelectData: (data: any) => void;
  getDetailObj: any;
  type: any;
}
const InputSearch = Input.Search;
const DepartmentModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '数据源',
  getChildTreeSelectData,
  getDetailObj,
  type
}) => {
  const [activeTab] = useState('src');
  const [treeData, setTreeData] = useState<any>([]);
  const [originalTreeData, setOriginalTreeData] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [checkedKeysDetail, setCheckedKeysDetail] = useState<string[]>([]);

  useEffect(() => {
    if (getDetailObj && type === 'detail') {
      setCheckedKeysDetail(getDetailObj?.label_operate?.org_id || []);
    }
  }, [getDetailObj]);
  const getTreeData = () => {
    try {
      getDepartmentTreeList({})
        .then((res) => {
          // 每个层级增加一个属性
          const newTreeData = res?.data?.map((item) => {
            if (item.children) {
              item.children.forEach((child) => {
                child.disableCheckbox = type === 'detail' ? true : false;
                child?.children?.forEach((childChild) => {
                  childChild.disableCheckbox = type === 'detail' ? true : false;
                });
              });
            }
            return {
              ...item,
              actionOnClick: 'check',
              disableCheckbox: type === 'detail' ? true : false
            };
          });
          setTreeData(newTreeData || []);
          setOriginalTreeData(newTreeData || []);
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.log(err, 'err');
    }
  };
  useEffect(() => {
    getTreeData();
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
            defaultCheckedKeys={
              type === 'detail' ? checkedKeysDetail : undefined
            }
            autoExpandParent={false}
            defaultExpandedKeys={
              type === 'detail'
                ? findParentIds(treeData, checkedKeysDetail)
                : undefined
            }
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
