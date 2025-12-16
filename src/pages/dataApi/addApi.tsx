import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Message,
  ResizeBox,
  Select,
  Steps,
  Table,
  TableColumnProps,
  Tabs,
  Tree
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import createTheme from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { sql } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import styles from './addApi.module.scss';
import { IconCaretRight, IconUp } from '@arco-design/web-react/icon';
import ParseParametersIcon from '@/assets/metadata/parse-parameters.svg';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import copy from 'copy-to-clipboard';

export default function AddApi() {
  const Step = Steps.Step;
  const TextArea = Input.TextArea;
  const CollapseItem = Collapse.Item;
  const TabPane = Tabs.TabPane;

  // 编辑器实例引用
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const collapseRef = useRef<HTMLDivElement>(null);
  const resizeBoxRef = useRef<HTMLDivElement>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);

  const history = useHistory();
  const [form] = Form.useForm();
  const [inputParamsForm] = Form.useForm();
  const [outputParamsForm] = Form.useForm();

  const [current, setCurrent] = useState(2);
  const [apiScenePath, setApiScenePath] = useState('');
  const [value, setValue] = useState('');
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false); // 当前面板是否展开

  const [resizeSize, setResizeSize] = useState<string>('');
  const [paneContainersSize, setPaneContainersSize] = useState<string>('220px');
  const [treeData, setTreeData] = React.useState([
    {
      title: '数据湖',
      key: '0-0',
      children: [
        {
          title: '数据目录',
          key: '0-0-1',
          children: [
            {
              title: 'Branch 0-0-1-1',
              key: '0-0-1-1'
            }
          ]
        }
      ]
    },
    {
      title: '在线分析库',
      key: '0-1',
      children: [
        {
          title: 'Branch 0-1-1',
          key: '0-1-1'
        }
      ]
    },
    {
      title: '对象存储',
      key: '0-2',
      children: [
        {
          title: 'Branch 0-2-1',
          key: '0-2-1'
        }
      ]
    },
    {
      title: '向量数据库',
      key: '0-3',
      children: [
        {
          title: 'Branch 0-3-1',
          key: '0-3-1'
        }
      ]
    }
  ]);

  const columns: TableColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80
    },
    {
      title: '参数位置',
      dataIndex: 'position',
      width: 120
    },
    {
      title: '参数英文名称',
      dataIndex: 'englishName',
      width: 150
    },
    {
      title: '参数中文名称',
      dataIndex: 'chineseName',
      width: 200,
      render: (_value, record) => (
        <Form.Item field={`chineseName_${record.englishName}`}>
          <Input placeholder="请输入参数中文名称" />
        </Form.Item>
      )
    },
    {
      title: '参数类型',
      dataIndex: 'type',
      width: 180,
      render: (_value, record) => (
        <Form.Item field={`type_${record.englishName}`}>
          <Select
            placeholder="请选择参数类型"
            options={[
              { label: '字符串', value: 'string' },
              { label: '数字', value: 'number' },
              { label: '布尔值', value: 'boolean' }
            ]}
          />
        </Form.Item>
      )
    },
    {
      title: '数组',
      dataIndex: 'isArray',
      width: 80,
      render: (_value, record) => (
        <Form.Item field={`isArray_${record.englishName}`}>
          <Checkbox />
        </Form.Item>
      )
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 150,
      render: (_value, record) => (
        <Form.Item field={`defaultValue_${record.englishName}`}>
          <Input placeholder="请输入默认值" />
        </Form.Item>
      )
    }
  ];
  const data = [
    {
      key: '1',
      index: '1',
      position: 'query',
      englishName: 'name',
      chineseName: '姓名',
      type: 'string',
      isArray: false,
      defaultValue: ''
    },
    {
      key: '2',
      index: '2',
      position: 'query',
      englishName: 'age',
      chineseName: '年龄',
      type: 'number',
      isArray: false,
      defaultValue: ''
    },
    {
      key: '3',
      index: '3',
      position: 'query',
      englishName: 'gender',
      chineseName: '性别',
      type: 'string',
      isArray: false,
      defaultValue: ''
    },
    {
      key: '4',
      index: '4',
      position: 'query',
      englishName: 'email',
      chineseName: '邮箱',
      type: 'string',
      isArray: false,
      defaultValue: ''
    },
    {
      key: '5',
      index: '5',
      position: 'query',
      englishName: 'phone',
      chineseName: '手机号',
      type: 'string',
      isArray: false,
      defaultValue: ''
    },
    {
      key: '6',
      index: '6',
      position: 'query',
      englishName: 'address',
      chineseName: '地址',
      type: 'string',
      isArray: false,
      defaultValue: ''
    }
  ];

  useEffect(() => {
    const tabHeight = rightBoxRef.current?.offsetHeight
      ? rightBoxRef.current?.offsetHeight - 90
      : 590;
    setResizeSize(`${tabHeight}px`);
  }, []);

  // 处理面板移动事件
  const handleMoving = (paneContainers) => {
    const rightBoxHeight = rightBoxRef.current?.offsetHeight;
    const tabHeight = rightBoxHeight
      ? rightBoxHeight - paneContainers[0].offsetHeight - 180
      : 220;
    setPaneContainersSize(`${tabHeight}px`);
  };

  const myTheme = createTheme({
    theme: 'light',
    settings: {
      background: '#ffffff',
      backgroundImage: '',
      foreground: '#75baff',
      caret: '#5d00ff',
      selection: '#036dd626',
      selectionMatch: '#036dd626',
      lineHighlight: '#8a91991a',
      gutterBackground: '#fff',
      gutterForeground: '#8a919966'
    },
    styles: [
      { tag: t.comment, color: '#6a737d', fontStyle: 'italic' },
      { tag: t.keyword, color: '#9a42a7', fontWeight: 'bold' },
      { tag: t.definition(t.typeName), color: '#194a7b' },
      { tag: t.typeName, color: '#194a7b' },
      { tag: t.tagName, color: '#008a02' },
      { tag: t.variableName, color: '#1a00db' },
      { tag: t.string, color: '#047013' },
      { tag: t.number, color: '#29a0aa' },
      { tag: t.bool, color: '#2d2aee' }
    ]
  });

  // 模拟调用接口获取子节点数据
  const loadMore = (treeNode) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        treeNode.props.dataRef.children = [
          {
            title: `leafleafleafleafleafleafleafleafleafleafleafleafleaf`,
            key: `${treeNode.props._key}-1`,
            content: 'leafleafleafleafleafleafleafleafleafleafleafleafleaf',
            isLeaf: true
          }
        ];
        setTreeData([...treeData]);
        resolve();
      }, 1000);
    });
  };

  // 处理编辑器聚焦状态变化
  const handleFocusChange = (focused: boolean) => {
    console.log('编辑器聚焦状态:', focused);
    setIsEditorFocused(focused);
  };

  // 插入内容到光标位置
  const insertContentAtCursor = useCallback((contentToInsert: string) => {
    if (!editorRef.current?.view) return;

    // 检查权限
    // if (!hasUpdatePermission) {
    //   Message.warning('没有编辑权限，无法插入内容');
    //   return;
    // }

    const view = editorRef.current.view;
    const currentPos = view.state.selection.main.head;

    // 在当前位置插入内容
    view.dispatch({
      changes: {
        from: currentPos,
        to: currentPos,
        insert: contentToInsert
      },
      selection: {
        anchor: currentPos + contentToInsert.length
      }
    });
  }, []);

  const handleInsertClick = (nodeContent: string | undefined) => {
    const isEditorFocusedNow = isEditorFocused ?? false;

    if (!nodeContent) {
      Message.warning('内容为空');
      return;
    }
    console.log('数据集插入:', nodeContent);

    if (isEditorFocusedNow) {
      // 编辑器聚焦时插入内容
      insertContentAtCursor(nodeContent ?? '');
    } else {
      const isSuccess = copy(nodeContent ?? '');

      if (isSuccess) {
        Message.success('内容复制成功，请粘贴到编辑器');
      } else {
        Message.error('内容复制失败');
      }
    }
  };

  const handleSubmit = () => {
    form.validate().then((values) => {
      console.log(values, apiScenePath);
      setCurrent(current + 1);
    });
  };

  const handleSave = () => {
    inputParamsForm.validate().then((values) => {
      console.log(values);
    });
  };

  // 代码编辑器
  const getCodeMirrorDom = (
    <CodeMirror
      ref={editorRef}
      className={styles.codeMirror}
      value={value}
      theme={myTheme}
      placeholder="这里是您的SQL开发工作区，请编写SQL创建API，注意符合相关语法规范"
      extensions={[
        sql(),
        EditorView.updateListener.of((update) => {
          if (update.focusChanged) {
            handleFocusChange(update.view.hasFocus);
          }
        })
      ]}
      onChange={(value) => setValue(value)}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: false
      }}
    />
  );

  const getParseParametersDom = (
    <Collapse
      ref={collapseRef}
      className="h-full overflow-auto border-x-0 border-b-0"
      defaultActiveKey={isOpen ? ['inputOutputParams'] : []}
      onChange={(_key, keys) => {
        const isOpenNow = keys.length > 0;
        const tabHeight = rightBoxRef.current?.offsetHeight
          ? rightBoxRef.current?.offsetHeight - 90
          : 590;
        setResizeSize(isOpenNow ? `190px` : `${tabHeight}px`);
        setIsOpen(isOpenNow);
      }}
      expandIcon={<IconUp />}
    >
      <CollapseItem
        header="输入输出参数"
        extra={
          <Button
            className={styles.parseParamsBtn}
            onClick={() => {}}
            icon={<ParseParametersIcon />}
          >
            <span className="text-sm text-[#1E293B]">解析参数</span>
          </Button>
        }
        name="inputOutputParams"
      >
        <Tabs defaultActiveTab="inputParams">
          <TabPane
            key="inputParams"
            title="输入参数"
            style={{
              height: paneContainersSize,
              overflowY: 'auto',
              overflowX: 'auto'
            }}
          >
            <Form
              form={inputParamsForm}
              layout="vertical"
              onSubmit={handleSave}
            >
              <Table
                columns={columns}
                data={data}
                pagination={false}
                className="min-w-[1000px]"
              />
            </Form>
          </TabPane>
          <TabPane
            key="outputParams"
            title="输出参数"
            style={{
              height: paneContainersSize,
              overflowY: 'auto',
              overflowX: 'auto'
            }}
          >
            <Table
              columns={columns}
              data={data}
              pagination={false}
              className="min-w-[1000px]"
            />
          </TabPane>
        </Tabs>
      </CollapseItem>
    </Collapse>
  );

  return (
    <div className={styles.addApi}>
      <h1 className="text-xl font-medium leading-[30px]">创建API</h1>
      <div className={styles.addApiContent}>
        <div style={{ height: '100%' }}>
          <Steps
            current={current}
            style={{
              maxWidth: 400,
              margin: '20px auto 0',
              justifyContent: 'center'
            }}
          >
            <Step title="基础信息" />
            <Step title="参数配置" />
          </Steps>
          {current === 1 && (
            <Form
              form={form}
              layout="horizontal"
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 10 }}
              className="mt-6"
              onSubmit={handleSubmit}
            >
              <Form.Item
                label="API名称"
                field="apiName"
                required
                rules={[{ required: true, message: '请输入API名称' }]}
              >
                <Input placeholder="输入API名称" />
              </Form.Item>
              <Form.Item
                label="API路径"
                field="apiPath"
                required
                rules={[{ required: true, message: '请输入API路径' }]}
              >
                <Input
                  className={styles.apiPath}
                  placeholder="请输入端路径，以“/”开始"
                  addBefore={
                    <Input
                      placeholder="请输入环境路径"
                      value={apiScenePath}
                      onChange={(value) => setApiScenePath(value)}
                    />
                  }
                />
              </Form.Item>
              <Form.Item
                label="请求方式"
                field="apiRequestMethod"
                required
                rules={[{ required: true, message: '请选择API请求方式' }]}
              >
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择请求方式"
                />
              </Form.Item>
              <Form.Item
                label="请求格式"
                field="apiRequestFormat"
                required
                rules={[{ required: true, message: '请选择API请求格式' }]}
              >
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择请求格式"
                />
              </Form.Item>
              <Form.Item
                label="方法名"
                field="apiMethodName"
                required
                rules={[{ required: true, message: '请输入方法名' }]}
              >
                <Input placeholder="请输入方法名" />
              </Form.Item>
              <Form.Item label="缓存方法" field="apiCacheMethod">
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择缓存方法"
                />
              </Form.Item>
              <Form.Item
                label="缓存过期时长"
                field="apiCacheExpire"
                initialValue={60}
              >
                <InputNumber mode="button" style={{ width: 160 }} />
              </Form.Item>
              <Form.Item label="API描述" field="apiDescription">
                <TextArea
                  placeholder="请输入API描述"
                  style={{ minHeight: 80 }}
                />
              </Form.Item>
            </Form>
          )}
          {current === 2 && (
            <div className={styles.addApiParam}>
              <div className={styles.lfetBox}>
                <div className="align-center flex">
                  <div className="text-sm font-semibold leading-[32px]">
                    数据源
                  </div>
                  <Input.Search
                    placeholder="请输入搜索数据源"
                    className="ml-2 w-[165px]"
                  />
                </div>
                <Tree
                  className={styles.treeNode}
                  defaultSelectedKeys={['0-0']}
                  loadMore={loadMore}
                  treeData={treeData}
                  actionOnClick={['expand', 'select']}
                  renderTitle={(props) => {
                    const nodeData = props.dataRef;
                    const nodeContent = props.dataRef?.content;
                    return (
                      <div className="flex items-center">
                        <EllipsisPopoverCom
                          className={styles.treeNodeTitle}
                          preferTypography
                          value={nodeData?.title ?? ''}
                        />
                        {nodeContent && (
                          <Button
                            type="outline"
                            className={styles.insertOrCopyBtn}
                            onClick={() => handleInsertClick(nodeContent)}
                            onMouseDown={(e) => {
                              // 阻止按钮获得焦点，保持编辑器焦点
                              e.preventDefault();
                            }}
                          >
                            {isEditorFocused ? '插入' : '复制'}
                          </Button>
                        )}
                      </div>
                    );
                  }}
                ></Tree>
              </div>
              <div ref={rightBoxRef} className={styles.rightBox}>
                <div className="align-center flex h-12 justify-between border-b border-[#e2e8f0] p-3">
                  <div className="text-sm font-semibold leading-6">
                    SQL编辑器
                  </div>
                  <Button
                    className="h-6"
                    icon={<IconCaretRight />}
                    onClick={() => inputParamsForm.submit()}
                  >
                    测试代码和参数
                  </Button>
                </div>
                <ResizeBox.Split
                  direction="vertical"
                  size={resizeSize}
                  panes={[getCodeMirrorDom, getParseParametersDom]}
                  disabled={!isOpen}
                  onPaneResize={(paneContainers) =>
                    handleMoving(paneContainers)
                  }
                />
              </div>
            </div>
          )}
          <div className={styles.stepFooter}>
            <Button
              disabled={current >= 2}
              onClick={() => form.submit()}
              type="primary"
            >
              {current === 1 ? '下一步' : '完成'}
            </Button>
            {current === 2 && (
              <Button
                type="secondary"
                disabled={current <= 1}
                onClick={() => setCurrent(current - 1)}
              >
                上一步
              </Button>
            )}
            <Button type="secondary" onClick={() => history.goBack()}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
