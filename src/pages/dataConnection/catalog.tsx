import { Button, Popover, Tree } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import {
  IconPlus,
  IconSettings,
  IconInfoCircle
} from '@arco-design/web-react/icon';
import { CatalogCreationModal } from './catalogCreationModal';
import { CatalogSettingModal } from './catalogSettingModal';

function Catalog(props: { selectItem: (item: any) => void}) {
  const { selectItem } = props
  const [creationModalShow, setCreationModalShow] = useState(false)
  const [settingModalShow, setSettingModalShow] = useState(false)
  const [treeData, setTreeData] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    const data = [
      {
        title: 'Trunk 0-0',
        key: '0-0',
        children: [
          {
            title: 'Branch 0-0-2',
            key: '0-0-2',
            selectable: false,
          },
        ],
      },
      {
        title: 'Trunk 0-1',
        key: '0-1',
        children: [
          {
            title: 'Branch 0-1-1',
            key: '0-1-1',
          },
        ],
      },
      {
        title: 'Trunk 0-2',
        key: '0-2',
      },
      {
        title: 'Trunk 0-3',
        key: '0-3',
      },
      {
        title: 'Trunk 0-4',
        key: '0-4',
      },
      {
        title: 'Trunk 0-5',
        key: '0-5',
      },
      {
        title: 'Trunk 0-6',
        key: '0-6',
        children: [
          {
            title: 'Branch 0-6-1',
            key: '0-6-1',
          },
          {
            title: 'Branch 0-6-2',
            key: '0-6-2',
          },
          {
            title: 'Branch 0-6-3',
            key: '0-6-3',
          },
          {
            title: 'Branch 0-6-4',
            key: '0-6-4',
          },
        ],
      },
      {
        title: 'Trunk 0-7',
        key: '0-7',
        children: [
          {
            title: 'Branch 0-7-1',
            key: '0-7-1',
          },
          {
            title: 'Branch 0-7-2',
            key: '0-7-2',
          },
          {
            title: 'Branch 0-7-3',
            key: '0-7-3',
          },
          {
            title: 'Branch 0-7-4',
            key: '0-7-4',
          },
        ],
      },
      {
        title: 'Trunk 0-8',
        key: '0-8',
        children: [
          {
            title: 'Branch 0-8-1',
            key: '0-8-1',
          },
          {
            title: 'Branch 0-8-2',
            key: '0-8-2',
          },
          {
            title: 'Branch 0-8-3',
            key: '0-8-3',
          },
          {
            title: 'Branch 0-8-4',
            key: '0-8-4',
          },
        ],
      },
    ]
    setTreeData(data)
    if (data.length) {
      selectItem(data[0])
      setSelectedKeys([data[0].key])
    } else {
      selectItem({
        key: 'default',
        title: '默认类目'
      })
    }
  }, [])

  const onExpand = (keys: string[]) => {
    setExpandedKeys(keys)
  }
  const onSelect = (keys: string[], extra: any) => {
    setSelectedKeys(keys)
    selectItem(extra.selectedNodes?.[0]?.props?.dataRef ?? {})
  }

  const refreshTreeData = () => {
    setTreeData(oldData => [...oldData, { title: 'Random', key: Math.random }])
  }

  return (
    <div className="catalog-part">
      <div className='catalog-header'>
        <span className='txt'>类目管理</span>
        <span className='actions'>
          <IconPlus className='size-[16px] mr-[8px] text-[var(--text-3)]' onClick={() => setCreationModalShow(true)}/>
          <IconSettings className='size-[16px] text-[var(--text-3)]' onClick={() => setSettingModalShow(true)}/>
        </span>
      </div>
      <div className="catalog-tree">
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          onExpand={onExpand}
          onSelect={onSelect}
          renderExtra={(node) => {
            return (
              <Popover content={<span>{node.title}--{node._level}</span>}>
                <IconInfoCircle style={{ marginLeft: '8px', fontSize: 12 }} />
              </Popover>
            );
          }}
        ></Tree>
      </div>
      <div className='default-catalog'>默认类目</div>
      { creationModalShow &&
        <CatalogCreationModal
          visible={creationModalShow}
          setVisible={setCreationModalShow}
          onOk={refreshTreeData}
        />
      }
      { settingModalShow &&
        <CatalogSettingModal
          visible={settingModalShow}
          setVisible={setSettingModalShow}
          onOk={refreshTreeData}
        />
      }
    </div>
  )
}

export default Catalog;
