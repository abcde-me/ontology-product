import React, { useEffect, useState } from 'react';
import { Button, Popover, Tree, Modal } from '@arco-design/web-react';
import { CatalogCreationModal } from './catalogCreationModal';
import {
  IconPlusCircle,
  IconDelete,
  IconEdit,
  IconInfoCircle
} from '@arco-design/web-react/icon';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  onOk: () => void;
};

export const CatalogSettingModal: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, onOk } = props;
  const [treeData, setTreeData] = useState([])
  const [creationModalShow, setCreationModalShow] = useState(false)

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
  }, [])

  const addBro = (node: any) => {
    setCreationModalShow(true)
  }
  const addChild =  (node: any) => {
    setCreationModalShow(true)
  }
  const editChild =  (node: any) => {
    setCreationModalShow(true)
  }
  const delChild =  (node: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除' + node.title + '节点吗?',
      onOk: () => {
        console.log('delete')
      }
    });
  }

  const refreshTreeData = () => {}

  return (
    <Modal
      title="目录设置"
      visible={visible}
      style={{width: '720px'}}
      onCancel={() => {
        setVisible(false);
      }}
      footer={
        <Button
          type="outline"
          className="primary"
          onClick={() => {
            setVisible(false);
          }}
        >
          关闭
        </Button>
      }
    >
      <div className='max-h-[300px] overflow-auto catalog-modal-tree'>
        <Tree
          treeData={treeData}
          renderExtra={(node) => {
            return (
              <>
                <Popover content={<span>{node.title}--{node._level}</span>}>
                  <IconInfoCircle style={{ marginLeft: '8px', fontSize: 12 }} />
                </Popover>
                <div className='actions ml-[8px] text-[#007DFA]'>
                  <span onClick={() => addBro(node)}><IconPlusCircle className='size-[16px] mr-[4px]'/>平级</span>
                  {node._level === 0 && <span onClick={() => addChild(node)} className='ml-[8px]'><IconPlusCircle className='size-[16px] mr-[4px]'/>子级</span> }
                  <span onClick={() => editChild(node)} className='ml-[8px]'><IconEdit className='size-[16px] mr-[4px]'/>编辑</span>
                  <span onClick={() => delChild(node)} className='ml-[8px]'><IconDelete className='size-[16px] mr-[4px]'/>删除</span>
                </div>
              </>
            );
          }}
        ></Tree>
        { creationModalShow &&
          <CatalogCreationModal
            visible={creationModalShow}
            setVisible={setCreationModalShow}
            onOk={refreshTreeData}
          />
        }
      </div>
    </Modal>
  );
};
