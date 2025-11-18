import React, { useEffect, useState } from 'react';
import { Tree, Input } from '@arco-design/web-react';
import { IconCaretDown, IconPlus } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { useEditableTree } from './useEditableTree';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import { DATA_CATALOG_PERMISSIONS } from '@/config/permissions';
import { PermissionWrapper } from '@/components/PermissionGuard';
import styles from './index.module.scss';

const InputSearch = Input.Search;

export default function EditableTree() {
  const dataCatalog = useDataCatalog();
  const { catalogTreeStore } = dataCatalog;
  const { treeData, expandedKeys, selectedTreeKey, searchValue } =
    catalogTreeStore.useGetState([
      'treeData',
      'expandedKeys',
      'selectedTreeKey',
      'inputValue'
    ]);
  const {
    generatorTreeNodes,
    onSearchChange,
    handleExpand,
    handleSelect,
    onCatalogAdd,
    renderExtra,
    renderTitle
  } = useEditableTree({ catalogTreeStore });
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const parent_id = params.get('parent_id');
  const catalog_type = params.get('catalog_type');
  const [defaultTreeKey, setDefaultTreeKey] = useState<string[]>([]);

  useEffect(() => {
    setDefaultTreeKey([`src-${parent_id}-${catalog_type}-${id}`]);
  }, [id, parent_id, catalog_type]);
  // const catalog_type: any = params.get('catalog_type');
  return (
    <div className={classNames('pl-3 pr-3 pt-2')}>
      <div className="mb-2 mt-[-8px] flex items-center justify-between">
        <InputSearch
          placeholder="输入名称搜索"
          value={searchValue}
          onChange={onSearchChange}
          maxLength={255}
          allowClear
          style={{ height: '32px', width: '180px' }}
        />
        <PermissionWrapper
          permission={DATA_CATALOG_PERMISSIONS.CAN_CREATE_CATALOG}
        >
          <div
            className="flex w-16 cursor-pointer items-center justify-center text-xs text-[#2563EB]"
            onClick={onCatalogAdd}
          >
            <IconPlus className="mr-2" />
            新建
          </div>
        </PermissionWrapper>
      </div>
      {treeData && treeData.length ? (
        <Tree
          showLine
          blockNode
          selectable
          expandedKeys={expandedKeys}
          defaultSelectedKeys={defaultTreeKey}
          selectedKeys={[selectedTreeKey]}
          icons={(node) => ({
            switcherIcon: !node.dataRef?.isLastLeaf ? <IconCaretDown /> : null
          })}
          onExpand={handleExpand}
          onSelect={handleSelect}
          renderExtra={renderExtra}
          renderTitle={renderTitle}
          className={styles['treeContainer']}
        >
          {generatorTreeNodes(treeData)}
        </Tree>
      ) : (
        <p className="mt-4 text-center">暂无数据</p>
      )}
    </div>
  );
}
