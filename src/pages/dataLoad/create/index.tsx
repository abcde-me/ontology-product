import {
  Button,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Tooltip,
  Tag,
  Collapse,
  Popover,
  Tabs,
  Typography,
  Switch,
  Checkbox
} from '@arco-design/web-react';
import { format } from 'sql-formatter';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from 'react';
import SchedulerRun from '../../../components/scheduler-run';
import {
  addLoad,
  getDirectoryList,
  getTableName,
  checkSQL,
  CheckSQLStatus
} from '@/api/loadApi';
import { getConnectionList, getdetailList } from '@/api/connectionApi';
import { useHistory } from 'react-router';
import { validateName } from '@/utils/valiate';
import Uploads from '../list/file-upload';
import ComponentTree from './component-tree';
import '../list/db-tree.scss';
import { isNumber } from 'lodash-es';
import { sql } from '@codemirror/lang-sql';
import { lintGutter } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import createTheme from '@uiw/codemirror-themes';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import styles from './index.module.scss';
import { IconCaretRight, IconDown, IconUp } from '@arco-design/web-react/icon';
import SQLFormatIcon from '@/assets/sql/sql-format-ico.svg';
import classNames from 'classnames';

// 常量定义
const ROUTES = {
  LIST: '/tenant/compute/modaforge/dataLoad/list',
  DETAIL: '/tenant/compute/modaforge/dataLoad/detail'
} as const;

const SOURCE_TYPES = {
  S3: 's3',
  HDFS: 'hdfs',
  DB: 'db',
  LOCAL: 'local'
} as const;

const LOAD_TYPES = {
  ONCE: 'once',
  CRON: 'cron'
} as const;

const SUBMIT_TYPES = {
  KEEP: 'keep',
  RUN: 'run'
} as const;

const DEFAULT_ONCE_CYCLE = {
  minute: '0',
  hour: '0',
  date: '*',
  month: '*',
  week: ''
};

const placeholderValue = `如需多表关联后的表载入到系统中，请在此位置编写关联SQL语句
SELECT filesname,B,C,D,E FROM table2,table3 WHERE t1.a=t2.a`;

// 类型定义
interface ConnectorOption {
  key: number;
  label: string;
}

// 使用与 component-tree.tsx 兼容的类型定义
interface TreeNodeData {
  id: string | number;
  key: string;
  name: string;
  value: string;
  label: string;
  title: string;
  type_name?:
    | 'volume'
    | 'db_item'
    | 'volume_item'
    | 'catalog'
    | 'db'
    | 'db_parent'
    | 'datasource_parent'
    | 'datasource_item'
    | 'metadata_parent'
    | 'metadata';
  type?: number;
  level?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  isLastLeaf?: boolean;
  showInput?: boolean;
  isNew?: boolean;
  parentId?: string | number;
  children?: TreeNodeData[];
  perms?: string[];
}

// 原始数据可能包含对象形式的 children
interface RawTreeNodeData {
  id: string | number;
  name: string;
  type_name?: string;
  children?: RawTreeNodeData[] | Record<string, RawTreeNodeData[]>;
  [key: string]: any;
}

interface FileData {
  name: string;
  [key: string]: any;
}

interface FormValues {
  name: string;
  source_type: string;
  connector_id?: number | string;
  table_name?: string[];
  dest_path?: string[];
  load_type?: string;
  sql_process_enabled?: string;
  sql?: string;
}

interface CycleText {
  minute?: string;
  hour?: string;
  date?: string;
  month?: string;
  week?: string;
}

// 组件实例
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

interface RunningInfoPanelProps {
  checkStatus: CheckSQLStatus;
  checkMessage: string;
}

const RunningInfoPanel = function ({
  checkStatus,
  checkMessage
}: RunningInfoPanelProps) {
  const CollapseItem = Collapse.Item;
  const TabPane = Tabs.TabPane;
  const { Text } = Typography;
  const [isExpanded, setIsExpanded] = useState(false);
  const handlePanelChange = (key: string, keys: string[]) => {
    const newExpanded = keys.length > 0;
    setIsExpanded(newExpanded);
  };

  // 当校验状态变成成功(0)或失败(1)时，自动展开面板
  useEffect(() => {
    if (
      checkStatus === CheckSQLStatus.SUCCESS ||
      checkStatus === CheckSQLStatus.ERROR
    ) {
      setIsExpanded(true);
    }
  }, [checkStatus]);

  // 根据校验状态渲染状态标签
  const renderCheckStatus = () => {
    switch (checkStatus) {
      case CheckSQLStatus.CHECKING:
        return <Tag color="blue">校验中</Tag>;
      case CheckSQLStatus.SUCCESS:
        return <Tag color="green">校验成功</Tag>;
      case CheckSQLStatus.ERROR:
        return <Tag color="red">校验失败</Tag>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`running-info-panel border-t border-solid border-[#E2E8F0] ${styles['sql-running-info-panel']}`}
    >
      <Collapse
        activeKey={isExpanded ? ['1'] : []}
        onChange={handlePanelChange}
        triggerRegion="icon"
        expandIconPosition="left"
        expandIcon={
          isExpanded ? (
            <Popover content="收起" position="top">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(-90deg)'
                }}
              >
                <IconDown />
              </div>
            </Popover>
          ) : (
            <Popover content="展开" position="top">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconUp />
              </div>
            </Popover>
          )
        }
        style={{
          border: 'none'
        }}
      >
        <CollapseItem
          header={
            <div className={styles['panel-header']}>
              <div className="flex flex-1 items-center gap-[12px]">
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                  校验信息
                </Text>
                {renderCheckStatus()}
              </div>
            </div>
          }
          name="1"
        >
          <div className={classNames(styles['panel-content'])}>
            {checkMessage && (
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '14px',
                  lineHeight: '22px'
                }}
              >
                {checkMessage}
              </div>
            )}
          </div>
        </CollapseItem>
      </Collapse>
    </div>
  );
};

export default function DataLoadCreate() {
  const SchedulerRunRef = useRef<HTMLFormElement>(null);
  const selectRef = useRef<any>(null);
  const history = useHistory();
  const form = Form.useForm()[0];
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

  // 状态管理
  const [connectName, setConnectName] = useState<ConnectorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [expression, setExpression] = useState<CycleText>({});
  const [sourceType, setSourceType] = useState<string>(SOURCE_TYPES.S3);
  const [tableNames, setTableNames] = useState<string>('');
  const [loadVal, setLoadVal] = useState<string>(LOAD_TYPES.ONCE);
  const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(
    null
  );
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [directoryData, setDirectoryData] = useState<TreeNodeData[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [tableList, setTableList] = useState<string[]>([]);
  const [sqlContent, setSqlContent] = useState<string>('');
  const [checkStatus, setCheckStatus] = useState<CheckSQLStatus>(
    CheckSQLStatus.NONE
  );
  const [checkMessage, setCheckMessage] = useState<string>('');
  const [selectedNodeType, setSelectedNodeType] =
    useState<TreeNodeData['type_name']>();

  // 处理树形数据的通用函数
  const processTreeData = useCallback(
    (
      data: RawTreeNodeData[],
      parentNode: TreeNodeData | null = null
    ): TreeNodeData[] => {
      if (!Array.isArray(data)) {
        console.warn('processTreeData 接收到非数组数据:', data);
        return [];
      }

      const result: TreeNodeData[] = [];
      for (const item of data) {
        if (!item || typeof item !== 'object' || !item.id) {
          console.warn('跳过无效项目:', item);
          continue;
        }

        const processedItem: TreeNodeData = {
          id: item.id,
          key: String(item.id),
          name: item.name,
          value: String(item.id),
          label: item.name || `未命名_${item.id}`,
          title: item.name || `未命名_${item.id}`,
          type_name: item.type_name as any,
          level: parentNode ? (parentNode.level || 0) + 1 : 0,
          isExpanded: false,
          hasChildren: false
        };

        if (parentNode) {
          processedItem.parentId = parentNode.id;
        }

        // 处理children数据
        if (item.children) {
          if (Array.isArray(item.children)) {
            processedItem.children = processTreeData(
              item.children,
              processedItem
            );
            processedItem.hasChildren = processedItem.children.length > 0;
          } else if (typeof item.children === 'object') {
            // 对象形式的 children 保留原始结构，由 ComponentTree 组件处理
            // 需要将对象形式的 children 赋值给 processedItem.children，以便 ComponentTree 可以访问
            processedItem.children = item.children as any;
            processedItem.hasChildren = Object.values(item.children).some(
              (value: any) => Array.isArray(value) && value.length > 0
            );
          }
        }

        result.push(processedItem);
      }

      return result;
    },
    []
  );

  // 获取目录列表
  const getdirectoryDataList = useCallback(async (): Promise<
    TreeNodeData[]
  > => {
    try {
      const res = await getDirectoryList({});

      if (!res || res.status !== 200) {
        console.error('获取目录列表失败:', res);
        setDirectoryData([]);
        return [];
      }

      if (!res.data?.src || !Array.isArray(res.data.src)) {
        console.error('目录数据结构错误:', res.data);
        setDirectoryData([]);
        return [];
      }

      const processedData = processTreeData(res.data.src);
      setDirectoryData(processedData);
      return processedData;
    } catch (err: any) {
      console.error('获取目录列表异常:', err);
      setDirectoryData([]);
      const errorMessage = err.message?.includes('timeout')
        ? '网络请求超时，请检查网络连接后重试'
        : '获取目录列表失败，请重试';
      Message.error(errorMessage);
      return [];
    }
  }, [processTreeData]);

  // 数据刷新回调
  const handleDataRefresh = useCallback(async () => {
    console.log('ComponentTree 请求数据刷新');
    return await getdirectoryDataList();
  }, [getdirectoryDataList]);

  // 获取连接器详情和表格列表
  const getConnectorDetailList = useCallback(
    async (connectorId: string) => {
      if (!connectorId) {
        console.log('connector_id为空，跳过获取表格数据');
        return;
      }

      try {
        const res = await getdetailList({ id: connectorId });

        // 移除这里的 setTableNames('')，因为 useEffect 中已经处理了重置逻辑
        // 如果在这里重置，可能会在 getTableName 返回结果后覆盖它

        setTableList(res?.data?.table_name || []);
      } catch (error) {
        console.error('获取连接器表格数据失败:', error);
        Message.error('获取连接器表格数据失败');
      }
    },
    [sourceType]
  );

  // 计算选中状态：'all' | 'indeterminate' | 'none'
  const getSelectAllStatus = useCallback(
    (selectedValues: string[]): 'all' | 'indeterminate' | 'none' => {
      if (!Array.isArray(selectedValues) || tableList.length === 0) {
        return 'none';
      }
      const filteredValues = selectedValues.filter((item) => item !== 'all');
      const selectedCount = filteredValues.length;
      if (selectedCount === 0) {
        return 'none';
      }
      if (selectedCount === tableList.length) {
        return 'all';
      }
      return 'indeterminate';
    },
    [tableList]
  );

  // 处理"全部"选项的点击事件
  const handleAllClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentValue = form.getFieldValue('table_name') || [];
      const filteredValue = currentValue.filter(
        (item: string) => item !== 'all'
      );

      // 判断是否全选
      const isAllSelected =
        filteredValue.length === tableList.length &&
        tableList.length > 0 &&
        tableList.every((option) => filteredValue.includes(option));

      if (isAllSelected) {
        // 当前全选，取消所有选择
        form.setFieldsValue({ table_name: [] });
      } else {
        // 当前未全选或未选择，选中所有选项
        if (tableList.length > 0) {
          form.setFieldsValue({ table_name: [...tableList] });
        }
      }
    },
    [form, tableList]
  );

  // 处理表格名称选择（全部标签逻辑）
  const handleAllTagChange = useCallback(
    (value: string[]) => {
      const currentValue = value || [];
      const previousValue = form.getFieldValue('table_name') || [];

      // 检查是否点击了"全部"选项（通过比较前后值的变化）
      const previousHasAll = previousValue.includes('all');
      const currentHasAll = currentValue.includes('all');
      const clickedAll = previousHasAll !== currentHasAll;

      if (clickedAll && currentHasAll) {
        // 如果点击了"全部"选项（当前值包含 'all'），切换全选状态
        const filteredPrevious = previousValue.filter(
          (item: string) => item !== 'all'
        );
        const isAllSelected =
          filteredPrevious.length === tableList.length &&
          tableList.length > 0 &&
          tableList.every((option) => filteredPrevious.includes(option));

        if (isAllSelected) {
          // 当前全选，取消所有选择
          form.setFieldsValue({ table_name: [] });
        } else {
          // 当前未全选或未选择，选中所有选项
          // 包括：未选择任何数据、部分选择、或完全未选择的情况
          if (tableList.length > 0) {
            form.setFieldsValue({ table_name: [...tableList] });
          }
        }
      } else {
        // 正常选择，过滤掉 'all' 值
        const filteredValue = currentValue.filter((item) => item !== 'all');
        form.setFieldsValue({ table_name: filteredValue });
      }
    },
    [form, tableList]
  );

  // 处理文件变化
  const handleFileChange = useCallback(
    (fileData: FileData | FileData[]) => {
      if (Array.isArray(fileData)) {
        if (fileData.length === 0) {
          setUploadedFiles([]);
          if (sourceType === SOURCE_TYPES.LOCAL) {
            form.setFieldsValue({ connector_id: undefined });
          }
          return;
        }
        setUploadedFiles(fileData);
        if (sourceType === SOURCE_TYPES.LOCAL) {
          form.setFieldsValue({ connector_id: 'local_files_uploaded' });
        }
        return;
      }

      if (!fileData) return;

      setUploadedFiles((prev) => {
        const isFileExists = prev.some((file) => file.name === fileData.name);
        if (isFileExists) {
          return prev;
        }
        return [...prev, fileData];
      });

      if (sourceType === SOURCE_TYPES.LOCAL) {
        form.setFieldsValue({ connector_id: 'local_files_uploaded' });
      }
    },
    [form, sourceType]
  );

  // 处理文件删除
  const handleFileDelete = useCallback(
    (fileName: string) => {
      setUploadedFiles((prev) => {
        const updatedFiles = prev.filter((file) => file.name !== fileName);
        if (updatedFiles.length === 0 && sourceType === SOURCE_TYPES.LOCAL) {
          form.setFieldsValue({ connector_id: undefined });
        }
        return updatedFiles;
      });
    },
    [form, sourceType]
  );

  // 切换载入类型
  const handleLoadTypeChange = useCallback(
    (val: string) => {
      if (val === LOAD_TYPES.ONCE) {
        form.setFieldsValue({
          time: undefined,
          day: undefined,
          weekly: undefined,
          cycle: undefined
        });
      } else {
        form.setFieldsValue({ cron_expr: undefined });
      }
      setLoadVal(val);
    },
    [form]
  );

  // 切换数据源类型
  const handleSourceTypeChange = useCallback(
    (value: string) => {
      console.log('切换数据源类型到:', value);
      setDirectoryData([]);
      setTableList([]);
      setConnectName([]);
      setSourceType(value);
      // 清空绑定连接器
      form.setFieldsValue({ connector_id: undefined });
      // 清空相关状态
      setTableNames('');
      setSqlContent('');
      setCheckStatus(CheckSQLStatus.NONE);
      setCheckMessage('');
      setSelectedNodeType(undefined);
      form.setFieldsValue({
        table_name: undefined,
        sql_process_enabled: 'disable'
      });
    },
    [form]
  );

  // 构建表单数据
  const buildFormData = useCallback(
    (formValues: FormValues, pathId: string | number, submitType: string) => {
      const tableNameValues = formValues.table_name || [];
      const isAllSelected =
        Array.isArray(tableNameValues) &&
        tableNameValues.length === tableList.length &&
        tableList.every((option) => tableNameValues.includes(option));
      const processedTableNames = isAllSelected
        ? tableList
        : formValues.table_name || uploadedFiles;

      return {
        task_name: formValues.name,
        connector_id:
          sourceType === SOURCE_TYPES.LOCAL ? null : formValues.connector_id,
        source_type: formValues.source_type,
        run_cycle: {
          type: loadVal === LOAD_TYPES.ONCE ? 0 : 1,
          cycle_text:
            loadVal === LOAD_TYPES.ONCE ? DEFAULT_ONCE_CYCLE : expression
        },
        dest_path_id: pathId,
        submit_type: submitType === SUBMIT_TYPES.KEEP ? 1 : 2,
        table_names: Array.isArray(processedTableNames)
          ? processedTableNames
          : [processedTableNames],
        db_name: sourceType === SOURCE_TYPES.DB ? tableNames : null,
        sql: formValues.sql_process_enabled === 'enable' ? formValues.sql : '',
        path_type: selectedNodeType
      };
    },
    [sourceType, loadVal, expression, tableList, uploadedFiles, tableNames]
  );

  // 验证表单数据
  const validateFormData = useCallback(
    (formValues: FormValues, pathId: string | number | null): string | null => {
      if (!pathId) {
        return '请选择载入位置';
      }

      if (
        sourceType === SOURCE_TYPES.DB &&
        formValues.sql_process_enabled === 'disable'
      ) {
        const tableNameValues = formValues.table_name || [];
        const isAllSelected =
          Array.isArray(tableNameValues) &&
          tableNameValues.length === tableList.length &&
          tableList.every((option) => tableNameValues.includes(option));
        const processedTableNames = isAllSelected
          ? tableList
          : formValues.table_name;

        if (!processedTableNames || processedTableNames.length === 0) {
          return '请选择要抽取的表';
        }
      }

      if (
        sourceType === SOURCE_TYPES.DB &&
        formValues.sql_process_enabled === 'enable'
      ) {
        if (!formValues.sql) {
          return '请输入SQL语句';
        }
      }

      return null;
    },
    [sourceType, tableList]
  );

  // 处理表单提交
  const handleSubmit = useCallback(
    async (submitType: string) => {
      try {
        const formValues = (await form.validate()) as FormValues;
        setLoading(true);

        // 验证路径ID
        const pathId = selectedNodeId || formValues.dest_path?.at?.(-1) || null;
        const validationError = validateFormData(formValues, pathId);

        if (validationError) {
          Message.error(validationError);
          return;
        }

        // 如果是周期载入，验证调度器
        if (loadVal !== LOAD_TYPES.ONCE) {
          const valid = await SchedulerRunRef.current?.validate();
          if (!valid) {
            return;
          }
        }

        // SQL 处理开启时，确保 SQL 已通过校验
        if (
          sourceType === SOURCE_TYPES.DB &&
          formValues.sql_process_enabled === 'enable'
        ) {
          const sqlToCheck = (formValues.sql || '').trim();
          const currentConnectorId =
            formValues.connector_id || form.getFieldValue('connector_id');

          if (!currentConnectorId) {
            Message.error('请先选择数据源连接器');
            return;
          }

          if (!sqlToCheck) {
            Message.error('请输入SQL语句');
            return;
          }

          if (checkStatus !== CheckSQLStatus.SUCCESS) {
            setCheckStatus(CheckSQLStatus.CHECKING);
            setCheckMessage('');

            try {
              const checkRes = await checkSQL({
                sql: sqlToCheck,
                connectorId: Number(currentConnectorId)
              });

              if (
                checkRes?.status === 200 &&
                checkRes.data?.status === CheckSQLStatus.SUCCESS
              ) {
                setCheckStatus(CheckSQLStatus.SUCCESS);
                setCheckMessage(checkRes.data?.msg || '');
              } else {
                const failedStatus =
                  checkRes?.data?.status ?? CheckSQLStatus.ERROR;
                const failedMessage =
                  checkRes?.data?.msg || checkRes?.message || 'SQL校验失败';
                setCheckStatus(failedStatus);
                setCheckMessage(failedMessage);
                Message.error(failedMessage);
                return;
              }
            } catch (err: any) {
              const errorMessage = err?.message || 'SQL校验异常，请稍后重试';
              setCheckStatus(CheckSQLStatus.ERROR);
              setCheckMessage(errorMessage);
              Message.error(errorMessage);
              return;
            }
          }
        }

        // 构建并提交表单数据
        if (!pathId) {
          Message.error('请选择载入位置');
          return;
        }
        console.log('formValues', formValues);
        const formData = buildFormData(formValues, pathId, submitType);
        const res = await addLoad(formData);

        if (res.code === '' && res.status === 200) {
          if (submitType === SUBMIT_TYPES.RUN) {
            if (loadVal === LOAD_TYPES.ONCE) {
              Message.success(
                '大量数据载入会影响数据源库，尽力避免业务作业期间操作'
              );
            }
            history.push(`${ROUTES.DETAIL}?task_id=${res.data}`);
          } else {
            Message.success('新建任务成功');
            history.push(ROUTES.LIST);
          }
        } else {
          Message.error(res.message || '提交失败');
        }
      } catch (error) {
        console.error('表单处理失败:', error);
        // Message.error('表单处理失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      selectedNodeId,
      loadVal,
      validateFormData,
      buildFormData,
      history,
      sourceType,
      checkStatus
    ]
  );

  // 取消操作
  const handleCancel = useCallback(() => {
    history.push(ROUTES.LIST);
  }, [history]);

  // 处理树选择
  const handleTreeSelect = useCallback((selectedKeys: string[]) => {
    console.log('handleSelect called', selectedKeys);
    setSelectedTreeKeys(selectedKeys);
  }, []);

  // 处理路径变化
  const handlePathChange = useCallback(
    (path: string, nodeId?: string | number, nodeData?: TreeNodeData) => {
      console.log('路径变化:', path, '节点ID:', nodeId, '节点数据:', nodeData);
      setSelectedNodeId(nodeId || null);
      setSelectedPath(path);
      form.setFieldsValue({ dest_path: path ? [path] : undefined });

      setSelectedNodeType(nodeData?.type_name);

      if (sourceType === SOURCE_TYPES.DB) {
        // 当载入位置变化时，重置选择抽取的表
        form.setFieldsValue({ table_name: undefined });
        form.setFieldsValue({ db_name: nodeData?.name });

        const currentConnectorId = form.getFieldValue('connector_id');
        const typeName = nodeData?.type_name;

        // if (!currentConnectorId) {
        //   setTableNames('');
        // } else if (typeName === 'db' || typeName === 'metadata') {
        //   const generateType = typeName === 'metadata' ? 'metadata' : 'db';

        //   void (async () => {
        //     try {
        //       const tableNameRes = await getTableName({
        //         connector_id: currentConnectorId,
        //         generate_type: generateType
        //       });
        //       setTableNames(tableNameRes?.data || '');
        //     } catch (error) {
        //       console.error('生成数据库名称失败:', error);
        //       setTableNames('');
        //       Message.error('生成数据库名称失败，请重试');
        //     }
        //   })();
        // } else {
        //   setTableNames('');
        // }
      }
    },
    [form, sourceType]
  );

  // 下拉框过滤选项
  const filterOption = useCallback((input: string, option: any) => {
    return option.props.children?.toLowerCase().includes(input.toLowerCase());
  }, []);

  // 处理SQL内容变化
  const handleSqlContentChange = useCallback((value: string) => {
    setSqlContent(value);
    // 当SQL内容变化时，重置校验状态
    setCheckStatus((prevStatus) => {
      if (prevStatus !== CheckSQLStatus.NONE) {
        setCheckMessage('');
        return CheckSQLStatus.NONE;
      }
      return prevStatus;
    });
    form.setFieldsValue({
      sql: value
    });
  }, []);

  const handleSqlProcessChange = useCallback(
    (value: boolean) => {
      form.setFieldsValue({
        sql_process_enabled: value ? 'enable' : 'disable'
      });
    },
    [form]
  );

  // 处理校验按钮点击
  const handleCheckSQL = useCallback(async () => {
    const currentConnectorId = form.getFieldValue('connector_id');

    if (!currentConnectorId) {
      Message.error('请先绑定连接器');
      return;
    }

    if (!sqlContent || sqlContent.trim() === '') {
      Message.error('请输入SQL语句');
      return;
    }

    // 设置校验中状态
    setCheckStatus(CheckSQLStatus.CHECKING);
    setCheckMessage('');

    try {
      const res = await checkSQL({
        sql: sqlContent.trim(),
        connectorId: Number(currentConnectorId)
      });

      if (res?.status === 200 && res.data) {
        // 根据返回的status更新校验状态
        setCheckStatus(res.data.status);
        setCheckMessage(res.data.msg || '');
      } else {
        setCheckStatus(CheckSQLStatus.ERROR);
        setCheckMessage(res?.message || '校验失败');
      }
    } catch (error: any) {
      setCheckStatus(CheckSQLStatus.ERROR);
      setCheckMessage(error?.message || '校验异常，请稍后重试');
    }
  }, [sqlContent, form]);

  const handleFormatCode = useCallback(() => {
    if (checkStatus === CheckSQLStatus.CHECKING) {
      Message.warning('SQL校验中，暂不支持格式化');
      return;
    }

    if (sqlContent) {
      try {
        const formattedCode = format(sqlContent, { language: 'sql' });
        setSqlContent(formattedCode);
        Message.success('格式化成功');
      } catch (e) {
        console.error(e);
        Message.error('格式化失败');
      }
    }
  }, [sqlContent, checkStatus]);

  // 监听连接器ID变化
  const connectorId = Form.useWatch('connector_id', form);
  useEffect(() => {
    if (connectorId) {
      getConnectorDetailList(connectorId);
      if (sourceType === SOURCE_TYPES.DB) {
        form.setFieldsValue({ table_name: undefined });
        setTableNames('');

        // 如果载入位置已经有值，主动请求 getTableName
        if (selectedPath && selectedNodeType) {
          const typeName = selectedNodeType;
          if (typeName === 'db' || typeName === 'metadata') {
            const generateType = typeName === 'metadata' ? 'metadata' : 'db';

            void (async () => {
              try {
                const tableNameRes = await getTableName({
                  connector_id: connectorId,
                  generate_type: generateType
                });
                if (tableNameRes?.status === 200) {
                  setTableNames(tableNameRes?.data || '');
                } else {
                  setTableNames('');
                  Message.error(
                    tableNameRes?.message ?? '生成数据库名称失败，请重试'
                  );
                }
              } catch (error) {
                console.error('生成数据库名称失败:', error);
                setTableNames('');
                Message.error('生成数据库名称失败，请重试');
              }
            })();
          }
        }
      } else {
        setTableNames('');
      }
    } else {
      setTableNames('');
    }
  }, [
    connectorId,
    sourceType,
    form,
    getConnectorDetailList,
    selectedPath,
    selectedNodeType
  ]);

  // 监听载入位置变化，用于控制SQL处理选项的显示
  const destPath = Form.useWatch('dest_path', form);

  // 监听SQL处理开关状态
  const sqlProcessEnabled = Form.useWatch('sql_process_enabled', form);

  // 监听表选择状态
  const tableName = Form.useWatch('table_name', form);

  // 计算是否禁用"关闭"选项：当选择了多个表时禁用
  const isDisableOptionDisabled = useMemo(() => {
    const currentTableName = form.getFieldValue('table_name') || [];
    const filteredValues = Array.isArray(currentTableName)
      ? currentTableName.filter((item: string) => item !== 'all')
      : [];
    return filteredValues.length > 1;
  }, [tableName, form]);

  // 计算"全部"选项的选中状态
  const selectAllStatus = useMemo(() => {
    const currentTableName = form.getFieldValue('table_name') || [];
    return getSelectAllStatus(
      Array.isArray(currentTableName) ? currentTableName : []
    );
  }, [tableName, form, getSelectAllStatus]);

  // 初始化SQL处理默认值为"关闭"
  useEffect(() => {
    const currentSqlProcess = form.getFieldValue('sql_process_enabled');
    if (!currentSqlProcess) {
      form.setFieldsValue({ sql_process_enabled: 'disable' });
    }
  }, [form]);

  // 监听数据源类型变化
  useEffect(() => {
    let cancelled = false;

    form.setFieldsValue({ dest_path: undefined });

    const loadData = async () => {
      try {
        // 获取连接器列表
        if (sourceType) {
          const res = await getConnectionList({
            type: sourceType,
            status: '1'
          });

          if (!cancelled && res.data?.items) {
            const newConnectName = res.data.items.map((item) => ({
              key: item.id,
              label: item.name
            }));
            setConnectName(newConnectName);
          }
        }

        // 获取目录数据
        if (!cancelled) {
          await getdirectoryDataList();
        }
      } catch (error) {
        if (!cancelled) {
          console.error('加载数据失败:', error);
          setDirectoryData([]);
          setConnectName([]);
          Message.error('加载数据失败，请重试');
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType]); // 只监听 sourceType 变化，form 和 getdirectoryDataList 是稳定的引用

  // MutationObserver 清理
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const items = document.querySelectorAll('.arco-cascader-list-item');
      items.forEach((item) => item.removeAttribute('title'));
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // 渲染表格选择标签
  const renderTableTags = useMemo(() => {
    return (invisibleTagCount: number) => {
      if (invisibleTagCount <= 0) {
        return null;
      }

      const allTags = form.getFieldValue('table_name') || [];
      const remainingTags = allTags.slice(2);

      return (
        <Tooltip
          content={
            <div>
              {remainingTags.map((item, i) => (
                <div key={i} style={{ margin: '4px 0' }}>
                  <Tag
                    closable
                    style={{
                      height: '24px',
                      background: '#E7ECF0',
                      color: '#0F172A',
                      borderRadius: '2px',
                      fontSize: '14px',
                      alignItems: 'center',
                      margin: '0 2px'
                    }}
                    onClose={() => {
                      const filteredValue = allTags.filter(
                        (tag) => tag !== item
                      );
                      form.setFieldsValue({
                        table_name: filteredValue
                      });
                    }}
                  >
                    {item}
                  </Tag>
                </div>
              ))}
            </div>
          }
        >
          <span
            style={{
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
          >
            +{invisibleTagCount}
          </span>
        </Tooltip>
      );
    };
  }, [form]);

  return (
    <div className={classNames('h-full px-[20px]')}>
      <div className="mb-[9px] mt-[17px] text-[20px] font-bold leading-[32px]">
        创建数据载入任务
      </div>
      <div
        className={classNames(
          'flex h-[calc(100%-58px-17px)] flex-col items-start justify-start overflow-y-auto rounded-[16px] bg-white',
          styles['data-load-create-container']
        )}
      >
        <Form
          autoComplete="off"
          form={form}
          disabled={loading}
          className={styles['data-load-form']}
        >
          <FormItem
            label="任务名称："
            field="name"
            labelAlign="right"
            required
            extra={
              <div className="text-prompt">
                <div>支持中文，英文，数字，下划线</div>
              </div>
            }
            rules={[
              {
                validator: (value, cb) => {
                  if (!value || value.trim() === '') {
                    return cb('请输入任务名称');
                  }
                  const validation = validateName(value);
                  if (!validation.isValid) {
                    return cb(validation.errorMessage);
                  }
                  return cb();
                }
              }
            ]}
          >
            <Input placeholder="请输入任务名称" />
          </FormItem>

          <FormItem
            label="数据源类型："
            field="source_type"
            labelAlign="right"
            rules={[{ required: true, message: '请选择数据源类型' }]}
            initialValue={SOURCE_TYPES.S3}
          >
            <RadioGroup onChange={handleSourceTypeChange}>
              <Radio value={SOURCE_TYPES.S3}>对象存储(S3)</Radio>
              <Radio value={SOURCE_TYPES.HDFS}>HDFS</Radio>
              <Radio value={SOURCE_TYPES.DB}>数据库</Radio>
              <Radio value={SOURCE_TYPES.LOCAL}>本地文件</Radio>
            </RadioGroup>
          </FormItem>

          {sourceType !== SOURCE_TYPES.LOCAL ? (
            <FormItem
              label="绑定连接器："
              field="connector_id"
              labelAlign="right"
              rules={[{ required: true, message: '请选择连接器' }]}
            >
              <Select
                placeholder="请选择连接器"
                showSearch
                filterOption={filterOption}
              >
                {connectName.map((option) => (
                  <Option key={option.key} value={option.key}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          ) : (
            <FormItem
              label="选择文件："
              field="connector_id"
              labelAlign="right"
              rules={[
                {
                  required: true,
                  validator: (value, cb) => {
                    if (uploadedFiles.length === 0) {
                      return cb('请选择文件');
                    }
                    return cb();
                  }
                }
              ]}
            >
              <Uploads
                onFileChange={handleFileChange}
                onFileDelete={handleFileDelete}
                onUploadingChange={setIsFileUploading}
              />
            </FormItem>
          )}

          <FormItem
            label="载入位置："
            field="dest_path"
            labelAlign="right"
            rules={[{ required: true, message: '请选择载入位置' }]}
            extra={
              sourceType === SOURCE_TYPES.DB ? (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6E7B8D',
                    marginTop: '4px'
                  }}
                >
                  {`注意保存后数据库名称为${tableNames || 'xxx-aaa'}`}
                </p>
              ) : null
            }
          >
            <ComponentTree
              className="db-tree-select"
              placeholder="请选择载入位置"
              allowClear
              value={selectedPath}
              onChange={(val) => {
                setSelectedPath(val as string);
                if (!val) {
                  form.setFieldsValue({ dest_path: undefined });
                  setSelectedNodeId(null);
                  setSelectedTreeKeys([]);
                }
              }}
              directoryData={directoryData}
              onDirectoryDataChange={setDirectoryData}
              onSelect={handleTreeSelect}
              selectedKeys={selectedTreeKeys}
              onPathChange={handlePathChange}
              showAddTree={true}
              enableRootAdd={true}
              activeTab="src"
              onDataRefresh={handleDataRefresh}
              dataSourceType={sourceType}
              tableNameNames={tableNames}
            />
          </FormItem>

          {sourceType === SOURCE_TYPES.DB &&
            selectedNodeType === 'metadata' && (
              <>
                <FormItem
                  label="SQL处理："
                  field="sql_process_enabled"
                  labelAlign="right"
                  rules={[{ required: true, message: '请选择SQL处理状态' }]}
                  initialValue="enable"
                >
                  <Switch
                    checkedText="开"
                    uncheckedText="关"
                    checked={sqlProcessEnabled === 'enable'}
                    onChange={handleSqlProcessChange}
                  />
                </FormItem>

                {sqlProcessEnabled === 'enable' && (
                  <FormItem
                    className={styles['sql-editor-form-item']}
                    label=" "
                    field="sql"
                    labelAlign="right"
                    rules={[{ required: true, message: '请输入SQL语句' }]}
                  >
                    <div
                      className={classNames(
                        styles['sql-editor-container'],
                        'rounded-[4px] border border-solid border-[#E2E8F0]'
                      )}
                    >
                      <div className="flex items-center border-b border-solid border-[#E2E8F0] p-[12px] pb-[12px]">
                        <Button
                          type="secondary"
                          disabled={!sqlContent || sqlContent.trim() === ''}
                          icon={<IconCaretRight />}
                          className="h-[26px]"
                          onClick={handleCheckSQL}
                          loading={checkStatus === CheckSQLStatus.CHECKING}
                        >
                          校验
                        </Button>

                        <Button
                          type="text"
                          icon={<SQLFormatIcon />}
                          onClick={handleFormatCode}
                          className="h-[26px]"
                        >
                          格式化
                        </Button>
                      </div>
                      <CodeMirror
                        value={sqlContent}
                        onChange={handleSqlContentChange}
                        placeholder={placeholderValue}
                        // readOnly={
                        //     !hasUpdatePermission || runStatus === RunningStatus.RUNNING
                        // }
                        theme={myTheme}
                        extensions={[
                          sql({ upperCaseKeywords: true }),
                          lintGutter()
                        ]}
                        basicSetup={{
                          lineNumbers: true,
                          highlightActiveLineGutter: false
                        }}
                        className={styles['code-editor']}
                      />
                      {checkStatus !== CheckSQLStatus.NONE && (
                        <RunningInfoPanel
                          checkStatus={checkStatus}
                          checkMessage={checkMessage}
                        />
                      )}
                    </div>
                  </FormItem>
                )}
              </>
            )}

          {sourceType === SOURCE_TYPES.DB && sqlProcessEnabled !== 'enable' && (
            <FormItem
              label="选择抽取的表："
              field="table_name"
              labelAlign="right"
              rules={[{ required: true, message: '请选择抽取的表' }]}
              extra="只能载入public schema的表"
            >
              <Select
                className="select-tag-style"
                onChange={handleAllTagChange}
                ref={selectRef}
                mode={selectedNodeType === 'metadata' ? undefined : 'multiple'}
                maxTagCount={{
                  count: 2,
                  render: renderTableTags
                }}
                placeholder="请选择抽取的表"
                style={{ width: '100%', minWidth: 0 }}
                allowClear
              >
                {tableList.length > 0 && selectedNodeType !== 'metadata' && (
                  <div
                    onClick={handleAllClick}
                    className="flex cursor-pointer items-center pl-[7px]"
                  >
                    <Checkbox
                      checked={selectAllStatus === 'all'}
                      indeterminate={selectAllStatus === 'indeterminate'}
                    />
                    <span className="ml-[8px] text-[14px]">全部</span>
                  </div>
                )}
                {tableList.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </FormItem>
          )}

          <FormItem
            label="载入形式："
            initialValue={LOAD_TYPES.ONCE}
            field="load_type"
            labelAlign="right"
            rules={[{ required: true, message: '请选择载入形式' }]}
          >
            <RadioGroup onChange={handleLoadTypeChange}>
              <Radio value={LOAD_TYPES.ONCE}>单次载入</Radio>
              {sourceType !== SOURCE_TYPES.LOCAL && (
                <Radio value={LOAD_TYPES.CRON}>周期载入</Radio>
              )}
            </RadioGroup>
          </FormItem>

          <FormItem label="">
            {loadVal === LOAD_TYPES.CRON && (
              // <div className={Styles.cycleLoadingBox}>
              <SchedulerRun
                // @ts-expect-error
                ref={SchedulerRunRef}
                options={{}}
                onOptionsChange={setExpression}
              />
              // </div>
            )}
          </FormItem>
        </Form>

        <div className={styles['footer-btn-box']}>
          <Button
            onClick={() => handleSubmit(SUBMIT_TYPES.RUN)}
            type="primary"
            disabled={loading || isFileUploading}
            className="mr-[8px]"
          >
            保存并执行
          </Button>
          {sourceType !== SOURCE_TYPES.LOCAL && (
            <Button
              onClick={() => handleSubmit(SUBMIT_TYPES.KEEP)}
              disabled={loading}
              className="mr-[8px]"
            >
              仅保存
            </Button>
          )}
          <Button onClick={handleCancel}>取消</Button>
        </div>
      </div>
    </div>
  );
}
