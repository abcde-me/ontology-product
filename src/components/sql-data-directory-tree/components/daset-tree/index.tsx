import EllipsisPopover from '@/components/ellipsis-popover-com';
import { DatasetListItem } from '@/types/datasetManagement';
import { formatFileSize } from '@/utils/format';
import { Button, Empty, Input, Spin, Tree } from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconCaretDown,
  IconCaretRight
} from '@arco-design/web-react/icon';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useDatasetTree } from '../../hooks/useDatasetTree';
import styles from './index.module.scss';

interface DataSetTreeProps {
  isEditorFocused?: boolean;
  onBack?: () => void;
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onInsertDataset?: (dataset: DatasetListItem) => void;
  onInsertContent?: (dataset: DatasetListItem) => void;
}

const DataSetTree: React.FC<DataSetTreeProps> = ({
  isEditorFocused = false,
  onBack,
  onViewDatasetDetail,
  onInsertDataset
}) => {
  // 使用合并后的 hook
  const {
    treeData,
    expandedKeys,
    setExpandedKeys,
    handleSearch,
    searchKeyword,
    treeDataLoading
  } = useDatasetTree();

  // 处理返回
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // 处理详情按钮点击
  const handleDetailClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      if (nodeData?.type === 'dataset' && nodeData?.data) {
        onViewDatasetDetail?.(nodeData.data);
      }
    },
    [onViewDatasetDetail]
  );

  // 处理插入按钮点击
  const handleInsertClick = useCallback((e: any, nodeData: any) => {
    e.stopPropagation();
    // 这里可以添加插入逻辑
    onInsertDataset?.(nodeData);
  }, []);

  // 高亮显示搜索关键词
  const highlightSearchKeyword = useCallback(
    (text: string, keyword: string) => {
      if (!keyword) return text;

      const index = text.toLowerCase().indexOf(keyword.toLowerCase());

      if (index === -1) return text;

      const prefix = text.substr(0, index);
      const suffix = text.substr(index + keyword.length);
      return (
        <span>
          {prefix}
          <span style={{ color: '#007DFA' }}>
            {text.substr(index, keyword.length)}
          </span>
          {suffix}
        </span>
      );
    },
    []
  );

  return (
    <div className={styles['sql-dataset-tree']}>
      {/* 第一部分：标题导航 */}
      <div className={styles['sql-dataset-tree__header']}>
        <div className={styles['sql-dataset-tree__header-left']}>
          <IconArrowLeft
            className={styles['sql-dataset-tree__back-icon']}
            onClick={handleBack}
          />
          <span className={styles['sql-dataset-tree__title']}>数据集市</span>
        </div>
      </div>

      {/* 第二部分：搜索框 */}
      <div className={styles['sql-dataset-tree__search']}>
        <Input.Search
          placeholder={'搜索当前文件夹'}
          onSearch={(value) => {
            handleSearch(value);
          }}
          onClear={() => {
            handleSearch('');
          }}
          allowClear
          className={styles['sql-dataset-tree__search-input']}
        />
      </div>

      {/* 第三部分：列表 */}
      <div
        className={classNames(styles['sql-dataset-tree__content'], {
          [styles['sql-dataset-tree__content--loading']]: treeDataLoading
        })}
      >
        {treeDataLoading ? (
          <div className="mt-[110px] flex flex-col items-center">
            <Spin size={26} />
            <div className="text-[rgba(15, 23, 42, 1)] text-[14px]">加载中</div>
          </div>
        ) : treeData.length === 0 ? (
          <Empty />
        ) : (
          <Tree
            showLine
            blockNode
            treeData={treeData}
            expandedKeys={expandedKeys}
            className={styles['sql-dataset-tree__content-tree']}
            onExpand={setExpandedKeys}
            icons={(props) => ({
              switcherIcon:
                props.dataRef?.type === 'dataset' ? <IconCaretDown /> : null,
              dragIcon: <IconCaretRight />
            })}
            renderTitle={(props) => {
              const nodeData = props.dataRef;
              const isDataset = nodeData?.type === 'dataset';

              return (
                <div className={styles['sql-dataset-tree__node']}>
                  <div className={styles['sql-dataset-tree__node-info']}>
                    <div
                      className={`${styles['sql-dataset-tree__node-title']} ${styles[`sql-dataset-tree__node-title-${nodeData?.type}`]}`}
                    >
                      <EllipsisPopover
                        value={highlightSearchKeyword(
                          String(nodeData?.title ?? ''),
                          searchKeyword
                        )}
                      />
                    </div>
                    {isDataset && (
                      <div className={styles['sql-dataset-tree__node-size']}>
                        {formatFileSize(Number(nodeData?.latest_size ?? 0))}
                      </div>
                    )}
                  </div>
                  <div className={styles['sql-dataset-tree__node-actions']}>
                    {isDataset && (
                      <Button
                        style={{
                          fontWeight: 600,
                          margin: '0 8px 0 2px',
                          padding: 0
                        }}
                        type="text"
                        className={styles['sql-dataset-tree__detail-btn']}
                        onClick={(e) => handleDetailClick(e, nodeData)}
                      >
                        详情
                      </Button>
                    )}
                    <Button
                      type="outline"
                      className={styles['sql-dataset-tree__insert-btn']}
                      onClick={(e) => handleInsertClick(e, nodeData)}
                      onMouseDown={(e) => {
                        // 阻止按钮获得焦点，保持编辑器焦点
                        e.preventDefault();
                      }}
                    >
                      {isEditorFocused ? '插入' : '复制'}
                    </Button>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DataSetTree;
