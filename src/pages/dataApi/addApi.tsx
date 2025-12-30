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
import TestModal from './compontent/testModal';
import {
  openDataCreateApi,
  openDataGetApiDetail,
  openDataListDatabase,
  openDataListFields,
  openDataParseSql,
  openDataSearchTable,
  openDataUpdateDataAPI
} from '@/api/dataApi';
import { useUserInfo } from '@/store/userInfoStore';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import { useParams } from '@/utils/url';
import { validateApiName, validateApiPath } from './compontent/validate';

enum MetadataType {
  Iceberg = 'iceberg',
  Doris = 'doris',
  Kafka = 'kafka',
  MinIO = 'minio',
  Milvus = 'milvus'
}

export default function AddApi() {
  const Step = Steps.Step;
  const TextArea = Input.TextArea;
  const CollapseItem = Collapse.Item;
  const TabPane = Tabs.TabPane;

  const type = useParams('type');
  const id = useParams('id');

  // 编辑器实例引用
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const collapseRef = useRef<HTMLDivElement>(null);
  const resizeBoxRef = useRef<HTMLDivElement>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);

  const history = useHistory();
  const [form] = Form.useForm();
  const [inputParamsForm] = Form.useForm();
  const [outputParamsForm] = Form.useForm();

  const userInfo = useUserInfo();
  const [current, setCurrent] = useState(1);
  const [apiId, setApiId] = useState<number | null>(null);
  const [apiScenePath, setApiScenePath] = useState('');
  const [apiBaseInfo, setApiBaseInfo] = useState<Record<string, any> | null>(
    null
  );
  const [value, setValue] = useState('');
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false); // 当前面板是否展开
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const [testModalVisible, setTestModalVisible] = useState<boolean>(false);
  const [testModalDataSource, setTestModalDataSource] = useState<string[]>([]);
  const [resultArray, setResultArray] = useState<string[]>([]);
  const [apiCacheMethod, setApiCacheMethod] = useState(0);
  const [isCanTest, setIsCanTest] = useState<boolean>(false);
  const [canComplete, setCanComplete] = useState<boolean>(false);

  const [resizeSize, setResizeSize] = useState<string>('');
  const [paneContainersSize, setPaneContainersSize] = useState<string>('220px');
  const [treeData, setTreeData] = React.useState<TreeDataType[]>([]);

  const columns: TableColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => index + 1
    },
    {
      title: '参数位置',
      dataIndex: 'location',
      width: 120
    },
    {
      title: '参数英文名称',
      dataIndex: 'name',
      width: 150
    },
    {
      title: (
        <div>
          <span className="mr-2 text-[#EF4444]">*</span>
          参数中文名称
        </div>
      ),
      dataIndex: 'nameCn',
      width: 200,
      render: (value, record) => (
        <Form.Item
          field={`nameCn_${record.name}`}
          rules={[{ required: true, message: '请输入参数中文名称' }]}
          initialValue={value}
        >
          <Input
            placeholder="请输入参数中文名称"
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    },
    {
      title: '参数类型',
      dataIndex: 'paramType',
      width: 180,
      render: (value, record) => (
        <Form.Item field={`paramType_${record.name}`} initialValue={value}>
          <Select
            placeholder="请选择参数类型"
            options={[
              { label: 'STRING', value: 'STRING' },
              { label: 'INT', value: 'INT' },
              { label: 'LONG', value: 'LONG' },
              { label: 'FLOAT', value: 'FLOAT' },
              { label: 'DOUBLE', value: 'DOUBLE' },
              { label: 'BOOLEAN', value: 'BOOLEAN' }
            ]}
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    },
    {
      title: '数组',
      dataIndex: 'isArray',
      width: 80,
      render: (value, record) => (
        <Form.Item field={`isArray_${record.name}`} initialValue={value}>
          <Checkbox
            defaultChecked={value}
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 150,
      render: (value, record) => (
        <Form.Item field={`defaultValue_${record.name}`} initialValue={value}>
          <Input
            placeholder="请输入默认值"
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 150,
      render: (value, record) => (
        <Form.Item field={`description_${record.name}`} initialValue={value}>
          <Input
            placeholder="请输入描述"
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    }
  ];

  // 输出参数列
  const outparamsColumns: TableColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => index + 1
    },
    {
      title: '参数英文名称',
      dataIndex: 'name',
      width: 150
    },
    {
      title: (
        <div>
          <span className="mr-2 text-[#EF4444]">*</span>
          参数中文名称
        </div>
      ),
      dataIndex: 'nameCn',
      width: 200,
      render: (value, record) => (
        <Form.Item
          field={`nameCn_${record.name}`}
          rules={[{ required: true, message: '请输入参数中文名称' }]}
          initialValue={value}
        >
          <Input
            placeholder="请输入参数中文名称"
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    },
    {
      title: '参数类型',
      dataIndex: 'paramType',
      width: 180,
      render: (value, record) => (
        <Form.Item field={`paramType_${record.name}`} initialValue={value}>
          <Select
            placeholder="请选择参数类型"
            options={[
              { label: 'STRING', value: 'STRING' },
              { label: 'INT', value: 'INT' },
              { label: 'LONG', value: 'LONG' },
              { label: 'FLOAT', value: 'FLOAT' },
              { label: 'DOUBLE', value: 'DOUBLE' },
              { label: 'BOOLEAN', value: 'BOOLEAN' }
            ]}
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 150,
      render: (value, record) => (
        <Form.Item field={`description_${record.name}`} initialValue={value}>
          <Input
            placeholder="请输入描述"
            onChange={() => setCanComplete(false)}
          />
        </Form.Item>
      )
    }
  ];

  // 输入参数配置
  const [paramData, setParamData] = useState([]);
  // 输出参数配置
  const [resultData, setResultData] = useState([]);

  // 是否为编辑
  useEffect(() => {
    if (type === 'edit') {
      getEditApiDetail();
    }
  }, [type, id]);

  // 兼容小屏样式
  useEffect(() => {
    const tabHeight = rightBoxRef.current?.offsetHeight
      ? rightBoxRef.current?.offsetHeight - 90
      : 590;
    setResizeSize(`${tabHeight}px`);
  }, [current]);

  // 初始化数据源列表
  useEffect(() => {
    if (current === 2) {
      getOpenDataListData();
    }
  }, [current]);

  useEffect(() => {
    if (
      testModalDataSource.length > 0 &&
      resultArray.length > 0 &&
      apiBaseInfo
    ) {
      saveAndTestApi();
    }
  }, [testModalDataSource && resultArray]);

  const getEditApiDetail = async () => {
    const res = await openDataGetApiDetail({ id: Number(id) });
    if (res.code === '' && res.status === 200) {
      form.setFieldsValue(res.data || {});
      setValue(res.data.sql || '');
      setParamData(res.data?.paramConfig || []);
      setResultData(res.data?.resultConfig || []);
      setActiveKey(['inputOutputParams']);
      setResizeSize('190px');
      setIsOpen(true);
      setIsCanTest(true);
    } else {
      Message.error(res.message || '查看文档失败');
    }
  };

  const saveAndTestApi = async () => {
    const params = {
      ...apiBaseInfo,
      limitTime: 60,
      limitCount: Number(form.getFieldValue('limitCount')) || 100,
      cacheTime: Number(form.getFieldValue('cacheTime')) || 60,
      databaseType: Number(form.getFieldValue('databaseType')) || 1,
      sql: value,
      paramConfig: testModalDataSource,
      resultConfig: resultArray,
      creatorId: userInfo?.id,
      creatorName: userInfo?.name
    };
    const res =
      type === 'add'
        ? await openDataCreateApi(params)
        : await openDataUpdateDataAPI({ ...params, id: Number(id) });
    if (res.code === '' && res.status === 200) {
      if (type === 'add') {
        if (res.data?.id) {
          setApiId(Number(res.data?.id));
          setTestModalVisible(true);
        } else {
          Message.error(res.message || '测试失败');
        }
      } else if (type === 'edit') {
        setApiId(Number(id));
        setTestModalVisible(true);
      }
    } else {
      Message.error(res.message || '测试失败');
    }
  };

  const getOpenDataListData = async () => {
    const res = await openDataListDatabase({
      databaseType: Number(form.getFieldValue('databaseType'))
    });
    if (res.code === '' && res.status === 200) {
      if (res.data) {
        const newTreeData = res.data.map((item) => ({
          title: getMenuName(item.databaseType),
          key: item.databaseType,
          children: item.database.map((db) => ({
            title: db.databaseName,
            key: `${db.databaseName}_${db.id}`,
            children: []
          }))
        }));
        setTreeData(newTreeData);
      }
    } else {
      Message.error(res.message || '获取数据源列表失败');
    }
  };

  const getMenuName = (type: string) => {
    switch (type) {
      case MetadataType.Iceberg:
        return '数据湖';
      case MetadataType.Doris:
        return '在线分析库';
      case MetadataType.Kafka:
        return 'Kafka';
      case MetadataType.MinIO:
        return '对象存储';
      case MetadataType.Milvus:
        return '向量数据库';
      default:
        return type;
    }
  };

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
    const metadataTypeArr = ['iceberg', 'doris', 'kafka', 'minio', 'milvus'];
    if (metadataTypeArr.includes(treeNode.props.parentKey)) {
      const params = {
        databaseType: treeNode.props.parentKey === 'iceberg' ? 1 : 2,
        tableId: Number(treeNode.props.dataRef.key.split('_').pop())
      };
      return openDataSearchTable(params).then((res) => {
        if (res.code === '' && res.status === 200) {
          if (res.data) {
            treeNode.props.dataRef.children = res.data.map((item) => ({
              title: item.tableName,
              key: `${item.tableName}_${item.id}`,
              children: []
            }));
            setTreeData([...treeData]);
          }
        } else {
          Message.error(res.message || '获取字段列表失败');
        }
      });
    } else {
      const params = {
        databaseType: treeNode.props.pathParentKeys[0],
        tableId: Number(treeNode.props.dataRef.key.split('_').pop())
      };
      return openDataListFields(params).then((res) => {
        if (res.code === '' && res.status === 200) {
          if (res.data) {
            treeNode.props.dataRef.children = res.data.map((item) => ({
              title: item.fieldName,
              key: `${item.fieldName}_${item.id}`,
              isLeaf: true
            }));
            setTreeData([...treeData]);
          }
        } else {
          Message.error(res.message || '获取字段列表失败');
        }
      });
    }
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

  const handleInsertClick = (nodeContent: string) => {
    const isEditorFocusedNow = isEditorFocused ?? false;

    if (!nodeContent) {
      Message.warning('内容为空');
      return;
    }

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

  // 搜索表
  const handleSearchTable = async (value: string) => {
    const params = {
      tableName: value,
      databaseType: Number(form.getFieldValue('databaseType'))
    };
    const res = await openDataSearchTable(params);
    if (res.code === '' && res.status === 200) {
      if (res.data) {
        const groupMap = new Map();

        res.data.forEach((item) => {
          const { databaseType } = item;
          if (!databaseType) return;

          if (!groupMap.has(databaseType)) {
            groupMap.set(databaseType, {
              title: getMenuName(databaseType),
              key: databaseType,
              children: []
            });
          }

          const childNode = {
            title: highlightKeyword(item.tableName, value),
            key: `${databaseType}_${item.id}`,
            children: []
          };
          groupMap.get(databaseType).children.push(childNode);
        });
        setTreeData(Array.from(groupMap.values()));
      }
    } else {
      Message.error(res.message || '搜索表失败');
    }
  };

  // 高亮关键字
  const highlightKeyword = (str, keyword) => {
    // 正则匹配关键字（不区分大小写，如需严格匹配则去掉 i）
    const reg = new RegExp(`(${keyword})`, 'gi');
    // 分割字符串并替换关键字为带样式的span
    return str.split(reg).map((part, index) => {
      if (part.toLowerCase() === keyword) {
        return (
          <span key={index} style={{ color: '#087dfa', fontWeight: 'bold' }}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // 转换函数
  const mergeConfigWithArray = (flatConfig, array) => {
    return array.map((item) => {
      const enName = item.name;
      // 构建要补充的属性（支持扩展更多属性）
      const supplementProperties = {
        nameCn: flatConfig[`nameCn_${enName}`],
        paramType: flatConfig[`paramType_${enName}`],
        defaultValue: flatConfig[`defaultValue_${enName}`],
        // 可选属性：存在则添加，不存在则忽略
        ...(flatConfig[`isArray_${enName}`] !== undefined && {
          isArray: flatConfig[`isArray_${enName}`]
        }),
        ...(flatConfig[`required_${enName}`] !== undefined && {
          required: flatConfig[`required_${enName}`]
        }),
        ...(flatConfig[`description_${enName}`] !== undefined && {
          description: flatConfig[`description_${enName}`]
        })
      };
      // 合并原始属性和补充属性
      return { ...item, ...supplementProperties };
    });
  };

  const handleSubmit = () => {
    form.validate().then((values) => {
      setApiBaseInfo(values);
      setCurrent(current + 1);
    });
  };

  // 解析参数
  const parseParameters = async () => {
    const params = {
      sql: value,
      databaseType: Number(form.getFieldValue('databaseType'))
    };
    const res = await openDataParseSql(params);
    if (res.code === '' && res.status === 200) {
      if (res.data) {
        setParamData(res.data.paramConfig || []);
        setResultData(res.data.resultConfig || []);

        setActiveKey(['inputOutputParams']);
        setResizeSize('190px');
        setIsOpen(true);
        setIsCanTest(true);
      }
    } else {
      Message.error(res.message || '解析参数失败');
    }
  };

  const handleInputParams = () => {
    inputParamsForm.validate().then((values) => {
      // 合并配置数组
      const mergedArray = mergeConfigWithArray(values, paramData);
      setTestModalDataSource(mergedArray);
      outputParamsForm.validate().then((values) => {
        // 合并配置数组
        const resultArray = mergeConfigWithArray(values, resultData);
        setResultArray(resultArray);
      });
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
      onChange={(value) => {
        setValue(value);
        setCanComplete(false);
      }}
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
      activeKey={activeKey}
      onChange={(_key, keys) => {
        const isOpenNow = keys.length > 0;
        const tabHeight = rightBoxRef.current?.offsetHeight
          ? rightBoxRef.current?.offsetHeight - 90
          : 590;
        setActiveKey(keys);
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
            onClick={parseParameters}
            disabled={!value}
            icon={<ParseParametersIcon />}
          >
            <span className="text-sm text-[#1E293B]">解析参数</span>
          </Button>
        }
        name="inputOutputParams"
      >
        <Tabs defaultActiveTab="inputParams" lazyload={false}>
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
              onSubmit={handleInputParams}
            >
              <Table
                columns={columns}
                data={paramData}
                pagination={false}
                className="min-w-[1000px]"
                rowKey="name"
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
            <Form form={outputParamsForm} layout="vertical">
              <Table
                columns={outparamsColumns}
                data={resultData}
                pagination={false}
                className="min-w-[1000px]"
                rowKey="name"
              />
            </Form>
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
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 11 }}
              className="mt-6"
              onSubmit={handleSubmit}
            >
              <Form.Item
                label="API英文名称"
                field="name"
                required
                rules={[
                  { required: true, message: '请输入API英文名称' },
                  { validator: validateApiName }
                ]}
              >
                <Input placeholder="请输入API英文名称" />
              </Form.Item>
              <Form.Item
                label="API描述"
                field="nameCn"
                required
                rules={[{ required: true, message: '请输入API描述' }]}
              >
                <Input placeholder="输入API描述" />
              </Form.Item>
              <Form.Item
                label="API路径"
                field="path"
                required
                rules={[
                  { required: true, message: '请输入API路径' },
                  { validator: validateApiPath }
                ]}
              >
                <Input
                  className={styles.apiPath}
                  placeholder="请输入端路径，以“/”开始"
                  // addBefore={
                  //   <Input
                  //     placeholder="请输入环境路径"
                  //     value={apiScenePath}
                  //     onChange={(value) => setApiScenePath(value)}
                  //   />
                  // }
                />
              </Form.Item>
              <Form.Item
                label="请求方式"
                field="requestMethod"
                required
                initialValue={'POST'}
                rules={[{ required: true, message: '请选择API请求方式' }]}
              >
                <Select
                  options={[{ label: 'POST', value: 'POST' }]}
                  placeholder="请选择请求方式"
                />
              </Form.Item>
              <Form.Item
                label="请求格式"
                field="requestFormat"
                required
                rules={[{ required: true, message: '请选择API请求格式' }]}
                initialValue={'json'}
              >
                <Select
                  options={[{ label: 'json', value: 'json' }]}
                  placeholder="请选择请求格式"
                />
              </Form.Item>
              <Form.Item
                label="最大速率"
                field="limitCount"
                initialValue={
                  form.getFieldValue('limitCount')
                    ? form.getFieldValue('limitCount')
                    : 100
                }
                className={styles.inputNumber}
              >
                <InputNumber
                  mode="button"
                  style={{ width: 160 }}
                  defaultValue={
                    form.getFieldValue('limitCount')
                      ? form.getFieldValue('limitCount')
                      : 100
                  }
                  min={0}
                  onChange={(value) => form.setFieldValue('limitCount', value)}
                />
                次/分钟
              </Form.Item>
              <Form.Item label="缓存方法" field="cacheMethod" initialValue={0}>
                <Select
                  options={[
                    { label: '开启缓存', value: 1 },
                    { label: '关闭缓存', value: 0 }
                  ]}
                  defaultValue={0}
                  placeholder="请选择缓存方法"
                  onChange={(value) => setApiCacheMethod(value)}
                />
              </Form.Item>
              {apiCacheMethod === 1 && (
                <Form.Item
                  label="缓存过期时长"
                  field="cacheTime"
                  initialValue={
                    form.getFieldValue('cacheTime')
                      ? form.getFieldValue('cacheTime')
                      : 0
                  }
                  className={styles.inputNumber}
                >
                  <InputNumber
                    mode="button"
                    style={{ width: 160 }}
                    defaultValue={
                      form.getFieldValue('cacheTime')
                        ? form.getFieldValue('cacheTime')
                        : 1
                    }
                    min={1}
                    onChange={(value) => form.setFieldValue('cacheTime', value)}
                  />
                  秒
                </Form.Item>
              )}
              <Form.Item
                label="数据来源"
                field="databaseType"
                initialValue={1}
                rules={[{ required: true, message: '请选择数据来源' }]}
              >
                <Select
                  options={[
                    { label: '数据湖', value: 1 },
                    { label: '在线分析库', value: 2 }
                  ]}
                  defaultValue={1}
                  placeholder="数据来源"
                />
              </Form.Item>
              <Form.Item label="API描述" field="description">
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
                    className="ml-2 w-[160px]"
                    onSearch={handleSearchTable}
                    allowClear
                    onClear={getOpenDataListData}
                  />
                </div>
                <Tree
                  className={styles.treeNode}
                  loadMore={loadMore}
                  treeData={treeData}
                  actionOnClick={['expand', 'select']}
                  renderTitle={(props) => {
                    const nodeData = props.dataRef;
                    const nodeContent = nodeData?.isLeaf;
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
                            onClick={() =>
                              handleInsertClick(nodeData?.title as string)
                            }
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
                    disabled={!isCanTest}
                    onClick={() => {
                      outputParamsForm.submit();
                      inputParamsForm.submit();
                    }}
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
              disabled={current >= 2 && !canComplete}
              onClick={() => {
                if (current === 1) {
                  form.submit();
                } else {
                  history.goBack();
                }
              }}
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

      <TestModal
        visible={testModalVisible}
        dataSource={testModalDataSource}
        getStatusCode={(statusCode) => {
          if (statusCode === 0) {
            setCanComplete(true);
          } else {
            setCanComplete(false);
          }
        }}
        apiId={apiId}
        onCancel={() => setTestModalVisible(false)}
      />
    </div>
  );
}
