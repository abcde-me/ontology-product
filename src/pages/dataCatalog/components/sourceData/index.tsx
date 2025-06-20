import React, { useEffect } from 'react';
import { useState } from 'react';
import { Tabs, Typography, Select, DatePicker, Button, Tooltip } from '@arco-design/web-react';
import './tabs-center.css';
import { Input, Space, Modal, Message } from '@arco-design/web-react';
import { IconPlus, IconDown, IconDragArrow, IconCaretDown, IconCaretRight, IconDelete, IconDriveFile } from '@arco-design/web-react/icon';
import { Tree } from '@arco-design/web-react';
import { on } from 'events';
import { divide } from 'lodash';
const InputSearch = Input.Search;
const TabPane = Tabs.TabPane;

const TreeNode = Tree.Node;
const TreeData = [
  {
    title: 'Trunk 0-0',
    key: '0-0',
    // icons={{
    //   switcherIcon: <IconDriveFile />,
    // }},
    children: [
      {
        title: 'Branch 0-0-19999999999999999',
        key: '0-0-1',
        children: [
          {
            title: 'Leaf 0-0-1-1',
            key: '0-0-1-1',
          },
          {
            title: 'Leaf 0-0-1-2',
            key: '0-0-1-2',
          },
        ],
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
        children: [
          {
            title: 'Leaf 0-1-1-0',
            key: '0-1-1-0',
          },
        ],
      },
      {
        title: 'Branch 0-1-2',
        key: '0-1-2',
        children: [
          {
            title: 'Leaf 0-1-2-0',
            key: '0-1-2-0',
          },
        ],
      },
    ],
  },
];
function searchData(inputValue) {
  const loop = (data) => {
    const result = [];
    data.forEach((item) => {
      if (item.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1) {
        result.push({ ...item });
      } else if (item.children) {
        const filterData = loop(item.children);

        if (filterData.length) {
          result.push({ ...item, children: filterData });
        }
      }
    });
    return result;
  };

  return loop(TreeData);
}
export default function SourceDate(props) {
  const { onChanges } = props
  const [activeTab, setActiveTab] = useState('1');
  const setActiveTabs = (value) => {
    console.log(value);
    setActiveTab(value);
    onChanges(value)
  }
  //搜索树
  const [treeData, setTreeData] = useState(TreeData);
  const [inputValue, setInputValue] = useState('');
  const [hoveredKey, setHoveredKey] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [hoverDeleteKey, setHoverDeleteKey] = useState(null);
  const [isAdding, setIsAdding] = useState({ '1': false, '2': false });
  const [newNodeValue, setNewNodeValue] = useState({ '1': '', '2': '' });
  const [treeData1, setTreeData1] = useState(TreeData);
  const [treeData2, setTreeData2] = useState(TreeData);

  const getTreeData = () => activeTab === '1' ? treeData1 : treeData2;

  const getDisplayTreeData = () => {
    const data = getTreeData();
    if (isAdding[activeTab]) {
      return [
        { title: '', key: '__input__', children: [] },
        ...data,
      ];
    }
    return data;
  };

  useEffect(() => {
    if (!inputValue) {
      setTreeData(TreeData);
    } else {
      const result = searchData(inputValue);
      setTreeData(result);
    }
  }, [inputValue]);
  //删除树节点
  const handDelete = () => {
    try {
      Modal.confirm({
        title: '确认删除文件?',
        content: '删除后，该目录下所有内容将被删除，不可恢复',
        async onOk() {
          // await deleteknowledgeBaseRootTree(node.id, {});
          // treeredirect();
          Message.success('删除成功!');
        }
      });
    } catch (error) {
      Message.error('删除失败，请稍后重试');
    }
  }

  return (
    <div style={{ width: '263px', border: '1px solid #E2E8F0', borderRadius: '4px', marginRight: '8px',overflow:'hidden'}}>
      <div style={{ width: '100%', height: '40px', boxSizing: 'border-box' }}>
        <Tabs activeTab={activeTab} onChange={(e) => setActiveTabs(e)} className="tabs-center" >
          <TabPane key='1' title='源数据' >
            <Typography.Paragraph >
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '-8px', marginBottom: 8 }}>
                <Input.Search
                  style={{

                    width: '130px', height: '32px'
                  }}
                  onChange={setInputValue}
                  placeholder='输入搜索目录'
                />
                <span
                  style={{ color: '#2563EB', fontSize: '12px', cursor: 'pointer' }}
                  onClick={() => setIsAdding({ ...isAdding, ['1']: true })}
                >
                  <IconPlus />&nbsp;&nbsp;新建&nbsp;&nbsp;
                </span>
                {/* <InputSearch allowClear placeholder='输入搜索目录' style={{ width: '120px', height: '32px' }} />
                                <span style={{ color: '#2563EB', fontSize: '12px' }}><IconPlus />&nbsp;&nbsp;新建</span> */}
              </div>
              <div style={{ padding: '0px 12px' }}>

                <Tree
                  showLine
                  icons={{
                    switcherIcon: <IconCaretDown />,
                    dragIcon: <IconCaretRight />,
                  }}
                  treeData={activeTab === '1' ? (isAdding['1'] ? [{ title: '', key: '__input__', children: [] }, ...treeData1] : treeData1) : treeData1}
                  onSelect={(selectedKeys) => {
                    setSelectedKey(selectedKeys[0]);
                  }}

                  renderExtra={(node) => {
                    return (
                      <div
                        onMouseEnter={() => setHoveredKey(node._key)
                        } //移入时修改key值
                        onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                      >
                        {(hoveredKey === node._key || selectedKey === node._key) && (
                          <Tooltip color='white' content='删除'>
                            <IconDelete
                              style={{
                                color: hoverDeleteKey === node._key ? '#2563EB' : '#C0C4CC',
                                cursor: 'pointer',
                                position: 'absolute',
                                right: 8,
                                fontSize: 12,
                                top: 10,
                              }}
                              onClick={() => handDelete()}
                              onMouseEnter={() => setHoverDeleteKey(node._key)}
                              onMouseLeave={() => setHoverDeleteKey(null)}
                            />
                          </Tooltip>
                        )}
                      </div>
                    );
                  }}
                  renderTitle={(props) => {
                    if (props._key === '__input__') {
                      return (
                        <Input
                          autoFocus
                          size="small"
                          style={{ width: '100%', height: '24px',marginRight:'17px'}}
                          value={newNodeValue['1']}
                          onChange={v => setNewNodeValue({ ...newNodeValue, ['1']: v })}
                          onPressEnter={() => {
                            if (newNodeValue['1'].trim()) {
                              setTreeData1([
                                { title: newNodeValue['1'], key: Date.now().toString(), children: [] },
                                ...treeData1,
                              ]);
                            }
                            setIsAdding({ ...isAdding, ['1']: false });
                            setNewNodeValue({ ...newNodeValue, ['1']: '' });
                          }}
                          onBlur={() => {
                            setIsAdding({ ...isAdding, ['1']: false });
                            setNewNodeValue({ ...newNodeValue, ['1']: '' });
                          }}
                          placeholder="请输入新目录名"
                        />
                      );
                    }
                    const key = props._key;
                    const title = props.title;
                    const titleStr = typeof title === 'string' ? title : String(title);
                    if (inputValue && typeof title === 'string') {
                      const index = title.toLowerCase().indexOf(inputValue.toLowerCase());
                      if (index === -1) {
                        return title;
                      }
                      const prefix = title.slice(0, index);
                      const suffix = title.slice(index + inputValue.length);
                      return (
                        <div
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          onMouseEnter={() => setHoveredKey(key)} //移入时修改key值
                        // onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                        >
                          <span
                            style={{
                              flex: 1,
                              maxWidth: '100px',
                              minWidth: '80px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {prefix}
                            <span style={{ color: 'var(--color-primary-light-4)' }}>
                              {title.substr(index, inputValue.length)}
                            </span>
                            {suffix}
                          </span>

                        </div>
                      );
                    }
                    return (
                      <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}

                        onMouseEnter={() => setHoveredKey(key)}
                      // onMouseLeave={() => setHoveredKey(null)}
                      >
                        <span
                          style={{
                            flex: 1,
                            maxWidth: '100px',
                            minWidth: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >{titleStr}</span>

                      </div>
                    );
                  }}
                ></Tree>
              </div>
            </Typography.Paragraph>
          </TabPane>
          {/* 切换后的显示 */}
          <TabPane key='2' title='目标数据' >
            <Typography.Paragraph >
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '-8px', marginBottom: 8 }}>
                <Input.Search
                  style={{

                    width: '130px', height: '32px'
                  }}
                  onChange={setInputValue}
                  placeholder='输入搜索目录'
                />
                <span
                  style={{ color: '#2563EB', fontSize: '12px', cursor: 'pointer' }}
                  onClick={() => setIsAdding({ ...isAdding, ['2']: true })}
                >
                  <IconPlus />&nbsp;&nbsp;新建&nbsp;&nbsp;
                </span>
                {/* <InputSearch allowClear placeholder='输入搜索目录' style={{ width: '120px', height: '32px' }} />
                                <span style={{ color: '#2563EB', fontSize: '12px' }}><IconPlus />&nbsp;&nbsp;新建</span> */}
              </div>
              <div style={{ width: '100%', padding: '0px 12px' }}>
                <Tree
                  showLine
                  icons={{
                    switcherIcon: <IconCaretDown />,
                    dragIcon: <IconCaretRight />,
                  }}
                  treeData={activeTab === '2' ? (isAdding['2'] ? [{ title: '', key: '__input__', children: [] }, ...treeData2] : treeData2) : treeData2}
                  onSelect={(selectedKeys) => {
                    setSelectedKey(selectedKeys[0]);
                  }}

                  renderExtra={(node) => {
                    return (
                      <div
                        onMouseEnter={() => setHoveredKey(node._key)
                        } //移入时修改key值
                        // onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                      >
                        {(hoveredKey === node._key || selectedKey === node._key) && (
                          <Tooltip color='white' content='删除'>
                            <IconDelete
                              style={{
                                color: hoverDeleteKey === node._key ? '#2563EB' : '#C0C4CC',
                                cursor: 'pointer',
                                position: 'absolute',
                                right: 8,
                                fontSize: 12,
                                top: 10,
                              }}
                              onClick={() => handDelete()}
                              onMouseEnter={() => setHoverDeleteKey(node._key)}
                              onMouseLeave={() => setHoverDeleteKey(null)}
                            />
                          </Tooltip>
                        )}
                      </div>
                    );
                  }}
                  renderTitle={(props) => {
                    if (props._key === '__input__') {
                      return (
                        <Input
                          autoFocus
                          size="small"
                          style={{ width: '100px', height: '24px' }}
                          value={newNodeValue['2']}
                          onChange={v => setNewNodeValue({ ...newNodeValue, ['2']: v })}
                          onPressEnter={() => {
                            if (newNodeValue['2'].trim()) {
                              setTreeData2([
                                { title: newNodeValue['2'], key: Date.now().toString(), children: [] },
                                ...treeData2,
                              ]);
                            }
                            setIsAdding({ ...isAdding, ['2']: false });
                            setNewNodeValue({ ...newNodeValue, ['2']: '' });
                          }}
                          onBlur={() => {
                            setIsAdding({ ...isAdding, ['2']: false });
                            setNewNodeValue({ ...newNodeValue, ['2']: '' });
                          }}
                          placeholder="请输入新目录名"
                        />
                      );
                    }
                    const key = props._key;
                    const title = props.title;
                    const titleStr = typeof title === 'string' ? title : String(title);
                    if (inputValue && typeof title === 'string') {
                      const index = title.toLowerCase().indexOf(inputValue.toLowerCase());
                      if (index === -1) {
                        return title;
                      }
                      const prefix = title.slice(0, index);
                      const suffix = title.slice(index + inputValue.length);
                      return (
                        <div
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          onMouseEnter={() => setHoveredKey(key)} //移入时修改key值
                        // onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                        >
                          <span
                            style={{
                              flex: 1,
                              maxWidth: '100px',
                              minWidth: '80px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {prefix}
                            <span style={{ color: 'var(--color-primary-light-4)' }}>
                              {title.substr(index, inputValue.length)}
                            </span>
                            {suffix}
                          </span>

                        </div>
                      );
                    }
                    return (
                      <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}

                        onMouseEnter={() => setHoveredKey(key)}
                        onMouseLeave={() => setHoveredKey(null)}
                      >
                        <span
                          style={{
                            flex: 1,
                            maxWidth: '100px',
                            minWidth: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >{titleStr}</span>

                      </div>
                    );
                  }}
                ></Tree>
              </div>
            </Typography.Paragraph>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}