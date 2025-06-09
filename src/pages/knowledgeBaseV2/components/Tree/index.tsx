import {
  deleteknowledgeBaseRootTree,
  getknowledgeBaseRootTreeChild,
  postknowledgeBaseRootTree,
  putknowledgeBaseRootTree
} from '@/api/datasetsV2';
import './index.css';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Popover,
  Tree
} from '@arco-design/web-react';
import { IconMore, IconPlus, IconStar } from '@arco-design/web-react/icon';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';

function Catalog(props, ref) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false); // 控制 Popover 显示与隐藏
  const { funcTreeHangdle, treedata, treeredirect } = props;
  useImperativeHandle(ref, () => ({}));
  const TreeData = treedata || [];

  const handleMouseEnter = useCallback((key: string) => {
    setPopoverVisible(false);
    setHoveredNode(key);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!popoverVisible) {
      setHoveredNode(null);
    }
  }, [popoverVisible]);

  //tree
  const [form] = Form.useForm();
  const [addChildVisible, setaddChildVisible] = useState(false);
  const [initFromValue, setinitFromValue] = useState({
    name: '',
    parent_id: '',
    type: ''
  });
  // 添加子群组
  const addTreeChild = (node) => {
    const newValues = {
      name: '',
      parent_id: node.id,
      type: 'add'
    };
    setinitFromValue(newValues);
    form.setFieldsValue(newValues); // 更新表单字段的值
    setaddChildVisible(true);
  };

  // 编辑子群组
  const editTree = (node) => {
    const newValues = {
      parent_id: node.id,
      type: 'edit',
      name: node.title
    };

    setinitFromValue(newValues);
    form.setFieldsValue(newValues); // 更新表单字段的值
    setaddChildVisible(true);
  };
  //确认
  const submitaddChild = async () => {
    try {
      const values = await form.validate();
      if (!values) return;

      const params: any = {
        name: values.name,
        parent_id: initFromValue.parent_id
      };

      const successMessage =
        initFromValue.type === 'add' ? '新增成功!' : '编辑成功!';

      const requestFunction =
        initFromValue.type === 'add'
          ? postknowledgeBaseRootTree('', params)
          : putknowledgeBaseRootTree(initFromValue.parent_id, {
              name: values.name
            });

      await requestFunction;
      Message.success(successMessage);
      treeredirect();
      setaddChildVisible(false);
    } catch (error) {
      // 错误处理
      Message.error('操作失败，请重试！');
      console.error('Error during submitaddChild:', error); // 可选：记录错误日志
    }
  };
  //取消
  const clearaddChild = () => {
    form.resetFields();
    setaddChildVisible(false);
  };
  //复制
  const funccopytreechild = async (node) => {
    try {
      const params: any = {
        name: node.title,
        parent_id: node.parent_id
      };
      await postknowledgeBaseRootTree('', params);
      Message.success('复制成功');
      treeredirect();
    } catch {}
  };
  //删除
  const deleteTree = async (node) => {
    try {
      if (node.value == 0)
        Modal.confirm({
          title: '确认删除智能体吗?',
          content: '删除群组将无法撤销',
          async onOk() {
            await deleteknowledgeBaseRootTree(node.id, {});
            treeredirect();
            Message.success('删除成功!');
          }
        });
    } catch (error) {
      // Message.error('删除失败');
    }
  };
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    if (TreeData.length > 0 && selectedKeys.length === 0) {
      setSelectedKeys([TreeData[0].key]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TreeData]); // 监听 TreeData 变化
  const onSelect = (keys, node) => {
    setSelectedKeys(keys);
    funcTreeHangdle(node);
  };
  return (
    <div className="treecss">
      {TreeData.length > 0 ? (
        <Tree
          selectedKeys={selectedKeys}
          treeData={TreeData}
          onSelect={onSelect} // 处理点击选择节点事件
          // loadMore={(treeNode) => loadMore(treeNode)}
          renderExtra={(node: any) => {
            const children = node.dataRef?.children || [];
            return (
              <div
                onMouseEnter={() => handleMouseEnter(node.id)}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: 'absolute', // 使用 relative 让元素相对节点进行定位
                  fontSize: 12,
                  color: '#7F8C9F',
                  fontWeight: 400,
                  right: 8,
                  padding: '5px' // 添加适当的间距
                }}
              >
                {/* && children.length > 0 */}
                {hoveredNode === node.id ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Popover content={<span>添加子群组</span>}>
                      <Button
                        onClick={() => addTreeChild(node)}
                        size="mini"
                        type="outline"
                        icon={<IconPlus />}
                      />
                    </Popover>
                    <Popover
                      position="right"
                      content={
                        <div className="Popoverbutton">
                          <div
                            className="Popoverbutton-box"
                            onClick={() => editTree(node)}
                          >
                            编辑
                          </div>
                          {node.level == 1 ? (
                            <Popover
                              content="仅支持复制子目录下群组"
                              position="right"
                            >
                              <div
                                style={{
                                  color: 'grey'
                                }}
                                className="Popoverbutton-box"
                              >
                                复制
                              </div>
                            </Popover>
                          ) : (
                            <div
                              className="Popoverbutton-box"
                              onClick={() => funccopytreechild(node)}
                            >
                              复制
                            </div>
                          )}

                          {node.value !== 0 ? (
                            <Popover
                              content="仅支持删除空文件夹"
                              position="right"
                            >
                              <div
                                style={{
                                  color: 'grey'
                                }}
                                className="Popoverbutton-box"
                                onClick={() => deleteTree(node)}
                              >
                                删除
                              </div>
                            </Popover>
                          ) : (
                            <div
                              className="Popoverbutton-box"
                              onClick={() => deleteTree(node)}
                            >
                              删除
                            </div>
                          )}
                        </div>
                      }
                      onVisibleChange={(visible) => {
                        setPopoverVisible(visible);
                      }}
                    >
                      <Button
                        size="mini"
                        style={{ marginLeft: '4px' }}
                        type="outline"
                        icon={<IconMore />}
                      />
                    </Popover>
                  </div>
                ) : (
                  <div>{node.value}</div>
                )}
              </div>
            );
          }}
        />
      ) : null}

      <Modal
        title={initFromValue.type == 'add' ? '添加子群组' : '编辑群组'}
        visible={addChildVisible}
        onOk={() => submitaddChild()}
        onCancel={() => clearaddChild()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 520
        }}
      >
        <Form form={form} initialValues={initFromValue}>
          <Form.Item
            label="群组名称："
            field="name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input
              placeholder="请输入"
              showWordLimit
              maxLength={{ length: 50, errorOnly: true }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default forwardRef(Catalog);
