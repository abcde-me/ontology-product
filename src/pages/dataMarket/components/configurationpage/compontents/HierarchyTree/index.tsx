import React, { useEffect, useRef, useState } from 'react';
import TextTruncate from '../TextTruncate';
import { Empty, Tooltip, Tree } from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconCaretDown,
  IconCaretRight
} from '@arco-design/web-react/icon';
import './index.less';
import brother from '../brother';
import { apiHierarchicalCatalog } from '@/api/datasetsV2';

interface FileTreeProps {
  documentid?: string;
  datasetid?: string;
  segmentationlistId;
  funcSegmentationTree;
}

const FileTree: React.FC<FileTreeProps> = ({
  documentid,
  datasetid,
  funcSegmentationTree,
  segmentationlistId
}) => {
  const [itemData, setTreeData] = useState<any>({});
  const [newTree, setNewTree] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    brother.on('setSegmentationId', (item) => {
      setSelectedKeys([item.id]);
    });
  }, []);
  useEffect(() => {
    // 处理数据
    if (documentid && datasetid) {
      // 初始请求
      setNewTree([]);
      setTreeData({});
      setSelectedKeys([]);

      initTree();
      // 设置定时器每6秒调用一次 initTree
      const intervalId = setInterval(() => {
        initTree();
      }, 6000);

      // 清理定时器
      return () => {
        clearInterval(intervalId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentid, datasetid]);

  const initTree = async () => {
    const { data: data } = await apiHierarchicalCatalog(
      datasetid || '',
      documentid || ''
    );
    const processedTreeData = processTreeData([data.catalog_content]);
    brother.emit('setSonTreeData', data);
    setTreeData(data.catalog_content);

    setNewTree(processedTreeData);
  };

  const processTreeData = (treeData) => {
    const processNode = (node) => {
      if (node && node.short_texts && node.short_texts.length > 0) {
        // 为每个short文本创建新的子节点
        node.short_texts.forEach((text, index) => {
          const pos: any =
            Object.values(node.short_text_positions)[index] || {};

          const newNode = {
            title: text,
            key: Object.keys(node.short_text_positions)[index],
            id: Object.keys(node.short_text_positions)[index],
            position: JSON.parse(pos),
            level: node.level + 1, // 子节点层级+1
            isShort: true // 标记这是从short字段添加的节点
          };

          // 确保children数组存在
          if (!node.children) {
            node.children = [];
          }

          // 添加到children中
          node.children.unshift(newNode);
        });

        // 处理完后可以删除short字段（可选）
        // delete node.short;
      }

      // 递归处理子节点
      if (node && node.children && node.children.length > 0) {
        node.children.forEach((child) => processNode(child));
      }
      node.id = node.title_id || node.id;
      node.key = node.title_id || node.id;
    };

    // 遍历所有根节点
    treeData.forEach((node) => processNode(node));

    return treeData;
  };

  const oncTitle = () => {
    setSelectedKeys([]);
    funcSegmentationTree({
      id: itemData.id,
      type: itemData.isShort ? 'text' : 'title',
      title: itemData.title,
      position_bbox: itemData.position
    });
  };

  const onSelect = (keys: any, item: any) => {
    const list = item.node.props.dataRef;

    funcSegmentationTree({
      id: list.id,
      type: list.isShort ? 'text' : 'title',
      title: list.title,
      position_bbox: list.position
    });

    setSelectedKeys(keys);
  };

  return (
    <div className="flex h-full w-[240px] flex-col border-l  border-gray-100 p-4">
      <div className=" font-[PingFangSC-Medium] text-base font-medium leading-6 text-[#151b26]">
        目录
      </div>
      {/* <div
        className="mt-[8px] cursor-pointer text-sm font-normal leading-[36px] text-[#1E293B]"
        onClick={oncTitle}
      >
        <TextTruncate
          text={itemData.title}
          clientHeight={1}
          typeTooltip={true}
        ></TextTruncate>
      </div> */}
      <div className=" overflow-y-auto">
        {newTree.length > 0 ? (
          <Tree
            className={'Htree'}
            blockNode //是否节点占据一行
            selectedKeys={selectedKeys}
            // showLine   //连接线
            // icons={{
            //   switcherIcon:<IconCaretDown />,
            // }}
            treeData={newTree} //节点数据
            onSelect={onSelect} // 处理点击选择节点事件
            renderTitle={(nodeProps) => {
              const titleStr = nodeProps.title?.toString() || '';
              const nodeLevel = (nodeProps as any).level || 1;
              // 根据层级动态计算可用宽度
              // 基础宽度调整为更合理的值，确保为操作按钮留出足够空间
              const baseWidth = 240;
              const indentPerLevel = 20;
              const operationButtonSpace = 70; // 减少操作按钮预留空间，确保按钮能正常显示
              const dynamicMaxWidth = Math.max(
                baseWidth -
                  (nodeLevel - 1) * indentPerLevel -
                  operationButtonSpace,
                80 // 增加最小宽度
              );
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '22px',
                    fontSize: '12px'
                  }}
                >
                  {/* <Tooltip content={titleStr} position="top"> */}
                  <span
                    style={{
                      maxWidth: `${dynamicMaxWidth - 20}px`,
                      minWidth: '80px',
                      lineHeight: '22px',
                      display: 'inline-block',
                      height: '22px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '12px'
                    }}
                  >
                    {titleStr}
                  </span>
                  {/* </Tooltip> */}
                </div>
              );
            }}
          ></Tree>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};
export default FileTree;
