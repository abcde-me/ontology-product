import React from 'react';
import { Tree } from '@arco-design/web-react';
import { IconCaretDown, IconPlus } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import SearchInput from '../search-input';
import { useEditableTree } from './useEditableTree';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import './index.css';

export default function EditableTree() {
  const dataCatalog = useDataCatalog();
  const { catalogTreeStore } = dataCatalog;
  const { treeData, expandedKeys, selectedKey, searchValue } =
    catalogTreeStore.useGetState([
      'treeData',
      'expandedKeys',
      'selectedKey',
      'inputValue'
    ]);

  const {
    generatorTreeNodes,
    handleExpand,
    handleSelect,
    addCatalog,
    renderExtra,
    renderTitle
  } = useEditableTree({ catalogTreeStore });

  return (
    <div className={classNames('pl-3 pr-3 pt-2')}>
      <div className="mb-2 mt-[-8px] flex items-center justify-between">
        <SearchInput
          value={searchValue}
          onChange={catalogTreeStore.setSearchValue}
          placeholder="输入搜索目录"
          style={{ height: '32px', width: '130px' }}
        />
        <div
          className="flex w-16 cursor-pointer items-center justify-center text-xs text-[#2563EB]"
          onClick={addCatalog}
        >
          <IconPlus className="mr-2" />
          新建
        </div>
      </div>
      {treeData && treeData.length ? (
        <Tree
          showLine
          blockNode
          selectable
          expandedKeys={expandedKeys}
          selectedKeys={[selectedKey]}
          icons={(node) => ({
            switcherIcon: !node.dataRef?.isLastLeaf ? <IconCaretDown /> : null
          })}
          onExpand={handleExpand}
          onSelect={handleSelect}
          renderExtra={renderExtra}
          renderTitle={renderTitle}
          className="tree-container"
        >
          {generatorTreeNodes(treeData)}
        </Tree>
      ) : (
        <p className="mt-4 text-center">暂无数据</p>
      )}
    </div>
  );
}
