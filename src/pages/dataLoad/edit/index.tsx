import {
  Button,
  Form,
  Input,
  Message,
  Radio,
  Select,
  TreeSelect,
  Collapse,
  Popover,
  Tag,
  Typography,
  Switch
} from '@arco-design/web-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Styles from './index.module.css';
import SchedulerRun from '../../../components/scheduler-run';
import {
  editLoad,
  getDirectoryList,
  checkSQL,
  CheckSQLStatus,
  getLoad
} from '@/api/loadApi';
import { getdetailList } from '@/api/connectionApi';
import './index.css';
import { validateName } from '@/utils/valiate';
import ComponentTree from '../create/component-tree';
import { isNumber } from 'lodash-es';
import { sql } from '@codemirror/lang-sql';
import { lintGutter } from '@codemirror/lint';
import { tags as t } from '@lezer/highlight';
import createTheme from '@uiw/codemirror-themes';
import CodeMirror from '@uiw/react-codemirror';
import { IconCaretRight, IconDown, IconUp } from '@arco-design/web-react/icon';
import SQLFormatIcon from '@/assets/sql/sql-format-ico.svg';
import classNames from 'classnames';
import styles from '../create/index.module.scss';
import { useHistory, useParams as useRouteParams } from 'react-router';

// 定义目录数据类型
interface DirectoryItem {
  value: string | number;
  label: string;
  children?: DirectoryItem[];
}
// 添加根据ID构建级联路径的函数
function findPathById(
  data: DirectoryItem[],
  targetId: string | number
): string[] | null {
  function findPath(
    items: DirectoryItem[],
    target: string | number,
    currentPath: string[] = []
  ): string[] | null {
    for (const item of items) {
      const newPath = [...currentPath, String(item.value)];
      if (item.value === target) {
        return newPath;
      }
      if (item.children) {
        const result = findPath(item.children, target, newPath);
        if (result) return result;
      }
    }
    return null;
  }
  return findPath(data, targetId);
}

// 添加根据ID构建TreeSelect路径的函数
function findTreeSelectPathById(
  data: any[],
  targetId: string | number
): string | null {
  function findInTree(items: any[], target: string | number): any | null {
    for (const item of items) {
      // 直接匹配节点ID
      if (String(item.id) === String(target)) {
        return item;
      }

      // 在子节点中查找
      if (item.children && Array.isArray(item.children)) {
        const result = findInTree(item.children, target);
        if (result) return result;
      }

      // 对于数据库类型，还需要检查children.db数组
      if (
        item.children &&
        typeof item.children === 'object' &&
        item.children.db
      ) {
        const result = findInTree(item.children.db, target);
        if (result) return result;
      }

      if (
        item.children &&
        typeof item.children === 'object' &&
        item.children.metadata
      ) {
        const result = findInTree(item.children.metadata, target);
        if (result) return result;
      }

      // 对于本地文件类型，还需要检查children.volume数组
      if (
        item.children &&
        typeof item.children === 'object' &&
        item.children.volume
      ) {
        const result = findInTree(item.children.volume, target);
        if (result) return result;
      }
    }
    return null;
  }

  const foundNode = findInTree(data, targetId);
  return foundNode ? String(foundNode.id) : null;
}

// 构建TreeSelect显示路径的函数
function buildTreeSelectDisplayPath(
  data: any[],
  targetId: string | number
): string {
  function buildPath(
    items: any[],
    target: string | number,
    currentPath: string[] = []
  ): string[] | null {
    for (const item of items) {
      const newPath = [...currentPath, item.name || item.label];

      // 如果找到目标节点，返回路径
      if (String(item.id) === String(target)) {
        return newPath;
      }

      // 在子节点中查找
      if (item.children && Array.isArray(item.children)) {
        const result = buildPath(item.children, target, newPath);
        if (result) return result;
      }

      // 对于数据库类型，还需要检查children.db数组
      if (
        item.children &&
        typeof item.children === 'object' &&
        item.children.db
      ) {
        const result = buildPath(item.children.db, target, newPath);
        if (result) return result;
      }

      if (
        item.children &&
        typeof item.children === 'object' &&
        item.children.metadata
      ) {
        const result = buildPath(item.children.metadata, target, newPath);
        if (result) return result;
      }

      // 对于本地文件类型，还需要检查children.volume数组
      if (
        item.children &&
        typeof item.children === 'object' &&
        item.children.volume
      ) {
        const result = buildPath(item.children.volume, target, newPath);
        if (result) return result;
      }
    }
    return null;
  }

  const pathArray = buildPath(data, targetId);
  return pathArray ? pathArray.join('/') : '';
}

const placeholderValue = `如需多表关联后的表载入到系统中，请在此位置编写关联SQL语句
SELECT filesname,B,C,D,E FROM table2,table3 WHERE t1.a=t2.a`;

// 单选框实例
const RadioGroup = Radio.Group;

const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;

interface RunningInfoPanelProps {
  checkStatus: CheckSQLStatus;
  checkMessage: string;
}

interface TreeNodeData {
  id: string | number;
  name?: string;
  label?: string;
  type_name?: string;
  children?: TreeNodeData[] | Record<string, TreeNodeData[]>;
  [key: string]: any;
}

// function findNodeById(
//   nodes: (TreeNodeData | undefined)[] | undefined,
//   targetId: string | number | null
// ): TreeNodeData | null {
//   if (!nodes || targetId === null || targetId === undefined) {
//     return null;
//   }

//   for (const node of nodes) {
//     if (!node) continue;
//     if (String(node.id) === String(targetId)) {
//       return node;
//     }
//     const children = node.children as any;
//     if (Array.isArray(children)) {
//       const found = findNodeById(children, targetId);
//       if (found) {
//         return found;
//       }
//     } else if (children && typeof children === 'object') {
//       for (const childGroup of Object.values(children)) {
//         if (Array.isArray(childGroup)) {
//           const found = findNodeById(childGroup as any, targetId);
//           if (found) {
//             return found;
//           }
//         }
//       }
//     }
//   }

//   return null;
// }

const RunningInfoPanel = function ({
  checkStatus,
  checkMessage
}: RunningInfoPanelProps) {
  const CollapseItem = Collapse.Item;
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
          <div className={styles['panel-content']}>
            {checkMessage && (
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {checkMessage}
              </div>
            )}
          </div>
        </CollapseItem>
      </Collapse>
    </div>
  );
};

const Edit = (props) => {
  console.log(props.detailData, '查看点击编辑传递过来的东西');

  const SchedulerRunRef = useRef<HTMLFormElement>(null);
  const form = props.editForm;
  // 载入类型的默认值
  const [loadVal, setLoadVal] = useState(props.detailData?.load_type);
  // 按钮以及表单的禁用状态
  const [loading, setLoading] = useState(false);
  // 默认表达式的状态
  const [obj, setObj] = useState(props.cron);
  // 存储初始路径
  const [initialPath, setInitialPath] = useState<(string | string[])[]>([]);
  const [directoryData, setDirectoryData] = useState([]) as any;
  // TreeSelect选中的keys
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);
  const [selectedNodeType, setSelectedNodeType] =
    useState<TreeNodeData['type_name']>();
  // TreeSelect显示的值（路径）
  const [treeSelectDisplayValue, setTreeSelectDisplayValue] =
    useState<string>('');
  //获取连接器下面的表格
  const [talbleList, setTableList] = useState([]);
  // TreeSelect 下拉框显示状态
  const [dropdownVisible, setDropdownVisible] = useState(false);
  // SQL处理相关状态
  const [sqlContent, setSqlContent] = useState<string>(
    props.detailData?.sql || ''
  );
  const [checkStatus, setCheckStatus] = useState<CheckSQLStatus>(
    CheckSQLStatus.NONE
  );
  const [checkMessage, setCheckMessage] = useState<string>('');

  // CodeMirror主题配置
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
  const getTableList = async (connector_id: string) => {
    try {
      const res = await getdetailList({ id: connector_id });
      setTableList(res?.data?.table_name || []);
    } catch (error) {
      console.error('获取连接器表格数据失败:', error);
    }
  };
  useEffect(() => {
    if (props.detailData?.connector_id) {
      getTableList(props.detailData.connector_id);
    }
    getdirectoryDataList();
  }, []);
  async function getdirectoryDataList() {
    try {
      const res = await getDirectoryList({
        root_type: 1
        // dir_type: props.detailData.source_type === 'db' ? 3 : undefined
      });
      if (!res || res.status !== 200) {
        console.error('获取目录列表失败:', res);
        setDirectoryData([]);
        return [];
      }
      if (!res.data || !res.data.src) {
        console.error('目录数据结构错误 - 缺少src字段:', res.data);
        setDirectoryData([]);
        return [];
      }

      if (!Array.isArray(res.data.src)) {
        console.error(
          '目录数据src不是数组:',
          typeof res.data.src,
          res.data.src
        );
        setDirectoryData([]);
        return [];
      }

      if (
        props.detailData.source_type === 's3' ||
        props.detailData.source_type === 'hdfs'
      ) {
        const processTreeData = (
          data: any[],
          parentNode: any = null
        ): any[] => {
          if (!Array.isArray(data)) {
            console.warn('processTreeData 接收到非数组数据:', data);
            return [];
          }

          const result: any[] = [];
          for (const item of data) {
            if (!item || typeof item !== 'object' || !item.id) {
              console.warn('跳过无效项目:', item);
              continue;
            }

            const processedItem: any = {
              id: item.id,
              name: item.name,
              value: item.id,
              label: item.name || `未命名_${item.id}`,
              type_name: item.type_name,
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
                // 如果children是数组，递归处理
                processedItem.children = processTreeData(
                  item.children,
                  processedItem
                );
                processedItem.hasChildren = processedItem.children.length > 0;
              } else if (typeof item.children === 'object') {
                // 如果children是对象（如{db: [...], volume: [...]}），保留原始结构
                processedItem.children = item.children;
                // 检查是否有子数据
                const hasChildren = Object.values(item.children).some(
                  (value: any) => Array.isArray(value) && value.length > 0
                );
                processedItem.hasChildren = hasChildren;
              }
            }

            result.push(processedItem);
          }

          return result;
        };

        const processedData = processTreeData(res.data.src);
        console.log('处理后的对象存储数据:', processedData);
        setDirectoryData(processedData);
        return processedData;
      } else {
        console.log('处理数据库/本地文件类型数据');

        const processTreeData = (
          data: any[],
          parentNode: any = null
        ): any[] => {
          if (!Array.isArray(data)) {
            console.warn('processTreeData 接收到非数组数据:', data);
            return [];
          }

          const result: any[] = [];
          for (const item of data) {
            if (!item || typeof item !== 'object' || !item.id) {
              console.warn('跳过无效项目:', item);
              continue;
            }

            const processedItem: any = {
              id: item.id,
              name: item.name,
              value: item.id,
              label: item.name || `未命名_${item.id}`,
              type_name: item.type_name,
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
                // 如果children是数组，递归处理
                processedItem.children = processTreeData(
                  item.children,
                  processedItem
                );
                processedItem.hasChildren = processedItem.children.length > 0;
              } else if (typeof item.children === 'object') {
                // 如果children是对象保留原始结构
                processedItem.children = item.children;
                // 检查是否有子数据
                const hasChildren = Object.values(item.children).some(
                  (value: any) => Array.isArray(value) && value.length > 0
                );
                processedItem.hasChildren = hasChildren;
              }
            }

            result.push(processedItem);
          }

          return result;
        };

        const processedData = processTreeData(res.data.src);
        console.log('处理后的树形数据:', processedData);
        setDirectoryData(processedData);
        return processedData;
      }
    } catch (err: any) {
      console.error('获取目录列表异常:', err);
      setDirectoryData([]);
      if (err.message && err.message.includes('timeout')) {
        Message.error('网络请求超时，请检查网络连接后重试');
      } else {
        Message.error('获取目录列表失败，请重试');
      }
      return [];
    } finally {
    }
  }
  // 根据data_path_id构建路径
  useEffect(() => {
    if (props.detailData?.data_path_id && directoryData.length > 0) {
      if (
        props.detailData?.source_type === 'db' ||
        props.detailData?.source_type === 'local' ||
        props.detailData?.source_type === 'hdfs' ||
        props.detailData?.source_type === 's3'
      ) {
        // 数据库、本地文件、HDFS、S3类型都使用TreeSelect，需要找到对应的节点ID
        const nodeId = findTreeSelectPathById(
          directoryData,
          props.detailData?.data_path_id
        );
        if (nodeId) {
          setSelectedTreeKeys([nodeId]);
          // 构建显示路径
          const displayPath = buildTreeSelectDisplayPath(
            directoryData,
            props.detailData?.data_path_id
          );

          setTreeSelectDisplayValue(displayPath);
          form.setFieldsValue({
            dest_path_display: displayPath, // 显示完整路径
            dest_path: nodeId // 隐藏字段保存节点ID
          });
        }
      } else {
        // 其他类型使用Cascader（如果还有的话）
        const path = findPathById(
          directoryData,
          props.detailData?.data_path_id
        );
        if (path) {
          setInitialPath(path as (string | string[])[]);
          form.setFieldsValue({
            dest_path: path
          });
        }
      }
    }
  }, [
    props.detailData?.data_path_id,
    directoryData,
    props.detailData?.source_type
  ]);
  useEffect(() => {
    getdirectoryDataList();
    return () => {
      observer.disconnect();
    };
  }, []);

  // 创建 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver(() => {
    const items = document.querySelectorAll('.arco-cascader-list-item');
    items.forEach((item) => item.removeAttribute('title'));
  });

  // 开始监听整个文档
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  // 切换载入类型的函数
  const handoffLoadFormHan = (val) => {
    if (val === 'once') {
      form.setFieldsValue({
        time: undefined,
        day: undefined,
        weekly: undefined,
        cycle: undefined
      });
    } else {
      form.setFieldsValue({ cron_expr: undefined }); // 如果有需要，可以重置其他字段
    }
    setLoadVal(val);
  };
  // 点击取消按钮的逻辑
  const cancelHan = () => {
    // 点击取消隐藏弹框并且重置表单数据
    props.hideEditModalHan();
  };
  console.log(props.detailData?.load_type);

  // 处理SQL内容变化
  const handleSqlContentChange = useCallback(
    (value: string) => {
      setSqlContent(value);
      form.setFieldsValue({ sql: value });
      // 当SQL内容变化时，重置校验状态
      setCheckStatus((prevStatus) => {
        if (prevStatus !== CheckSQLStatus.NONE) {
          setCheckMessage('');
          return CheckSQLStatus.NONE;
        }
        return prevStatus;
      });
    },
    [form]
  );

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
    const currentConnectorId = props.detailData?.connector_id;

    if (!currentConnectorId) {
      Message.error('请先选择数据源连接器');
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
  }, [sqlContent, props.detailData?.connector_id]);

  // 监听SQL处理开关状态
  const sqlProcessEnabled = Form.useWatch('sql_process_enabled', form);

  // 初始化SQL处理默认值
  useEffect(() => {
    if (props.detailData?.source_type !== 'db') {
      return;
    }
    const currentSqlProcess = form.getFieldValue('sql_process_enabled');
    if (!currentSqlProcess) {
      form.setFieldsValue({ sql_process_enabled: 'disable' });
    }
  }, [form, props.detailData?.source_type]);

  // 点击确定
  const okHan = async () => {
    try {
      setLoading(true);
      const formValues = await form.validate();
      const { ...rest } = formValues;
      // 处理不同数据源类型的路径ID获取
      let pathId;
      if (
        props.detailData?.source_type === 'db' ||
        props.detailData?.source_type === 'local' ||
        props.detailData?.source_type === 'hdfs' ||
        props.detailData?.source_type === 's3'
      ) {
        // 数据库、本地文件、HDFS、S3类型：dest_path直接是节点ID
        pathId = rest.dest_path;
      } else {
        // 其他类型：dest_path是数组，取最后一个元素
        pathId = Array.isArray(rest.dest_path)
          ? rest.dest_path.at(-1)
          : rest.dest_path;
      }

      console.log('最终的pathId (将作为dest_path_id传递):', pathId);

      // 验证pathId
      if (!pathId) {
        Message.error('请选择载入位置');
        return;
      }

      // SQL 处理开启时，确保 SQL 已通过校验
      if (props.detailData?.source_type === 'db') {
        const sqlProcessEnabled =
          rest.sql_process_enabled || form.getFieldValue('sql_process_enabled');

        if (sqlProcessEnabled === 'enable') {
          const sqlToCheck = (
            rest.sql ??
            sqlContent ??
            props.detailData?.sql ??
            ''
          ).trim();
          const currentConnectorId =
            props.detailData?.connector_id ||
            form.getFieldValue('connector_id');

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
      }
      // 构建基础表单数据
      const baseFormData: any = {
        task_id: Number(props.loadId),
        task_name: rest.name,
        dest_path_id: pathId,
        db_name: props.detailData?.db_name
      };

      // 如果是数据库类型且SQL处理为开启，添加SQL处理相关数据
      if (props.detailData?.source_type === 'db') {
        const sqlProcessEnabled =
          rest.sql_process_enabled || form.getFieldValue('sql_process_enabled');
        if (sqlProcessEnabled === 'enable') {
          baseFormData.sql_process_enabled = 'enable';
          baseFormData.sql = rest.sql || sqlContent || '';
        } else {
          baseFormData.sql_process_enabled = 'disable';
          baseFormData.sql = '';
        }
      }

      if (props.detailData?.load_type !== 'once') {
        const valid = await SchedulerRunRef.current?.validate();
        if (!valid) return;
        const formData = {
          ...baseFormData,
          run_cycle: {
            type: 1,
            cycle_text: obj
          }
        };
        console.log(formData);
        const res = await editLoad(formData);
        if (res.code == '' && res.status == 200) {
          Message.success('修改成功');
          props.hideEditModalHan();
        } else {
          Message.error(res.message);
        }
      } else {
        const formData = {
          ...baseFormData,
          run_cycle: {
            type: 0,
            cycle_text: {
              minute: '0',
              hour: '0',
              date: '*',
              month: '*',
              week: ''
            }
          }
        };
        const res = await editLoad(formData);
        if (res.code == '' && res.status == 200) {
          Message.success('修改成功');
          props.hideEditModalHan();
        } else {
          Message.error(res.message);
        }
      }
      props.getDetailList();
    } catch (error) {
      console.error('表单处理失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'start',
        width: '100%'
      }}
    >
      <Form
        style={{ width: '100%' }}
        autoComplete="off"
        form={form}
        initialValues={{
          dest_path: initialPath
        }}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 10 }}
      >
        <FormItem
          label="任务名称："
          required
          initialValue={props.detailData?.name}
          field="name"
          extra={
            <div className="text-prompt">
              <div>支持中文，英文，数字，下划线</div>
            </div>
          }
          rules={[
            {
              validator: (value, cb) => {
                if (!value || value.trim() === '') {
                  return cb('请输入连接器名称');
                }
                if (validateName(value).isValid == false) {
                  return cb(validateName(value).errorMessage);
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
          rules={[{ required: true, message: '请选择数据源类型' }]}
          initialValue={props.detailData?.source_type}
        >
          <RadioGroup disabled={true}>
            <Radio value="s3">对象存储</Radio>
            <Radio value="hdfs">HDFS</Radio>
            <Radio value="db">数据库</Radio>
            <Radio value="local">本地文件</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="绑定连接器："
          field="connector_name"
          rules={[{ required: true, message: '请输入任务名称' }]}
          initialValue={props.detailData?.connector_name}
        >
          <Select
            placeholder="请选择连接器"
            disabled={true}
            showSearch
          ></Select>
        </FormItem>
        <FormItem
          label="载入位置："
          field="dest_path_display"
          rules={[{ required: true, message: '请选择载入位置' }]}
        >
          <TreeSelect
            className="db-tree-select"
            placeholder="Please select ..."
            allowClear
            popupVisible={dropdownVisible}
            onVisibleChange={setDropdownVisible}
            value={treeSelectDisplayValue}
            onChange={(value) => {
              // 处理清除选择的情况
              if (!value) {
                setSelectedTreeKeys([]);
                setTreeSelectDisplayValue('');
                setSelectedNodeType(undefined);
                form.setFieldsValue({
                  dest_path_display: undefined,
                  dest_path: undefined
                });
              }
            }}
            dropdownMenuStyle={{
              maxHeight: 300,
              padding: 0,
              overflow: 'hidden' // 防止外层出现滚动条
            }}
            dropdownRender={() => (
              <ComponentTree
                directoryData={directoryData}
                onDirectoryDataChange={setDirectoryData}
                selectedKeys={selectedTreeKeys}
                // onSelect={handleSelect}
                onPathChange={(path, nodeId, nodeData) => {
                  console.log(
                    '路径变化:',
                    path,
                    '节点ID:',
                    nodeId,
                    '节点数据:',
                    nodeData
                  );
                  // 更新选中的keys
                  const key =
                    nodeId !== undefined && nodeId !== null
                      ? String(nodeId)
                      : undefined;
                  setSelectedTreeKeys(key ? [key] : []);
                  setSelectedNodeType(nodeData?.type_name);
                  // 更新显示值
                  setTreeSelectDisplayValue(path);
                  // 设置两个字段：显示字段和隐藏的节点ID字段
                  form.setFieldsValue({
                    dest_path_display: path, // 显示完整路径
                    dest_path: nodeId // 隐藏字段保存节点ID，用作dest_path_id
                  });
                  console.log(
                    '表单字段已设置 - dest_path_display:',
                    path,
                    'dest_path:',
                    nodeId
                  );
                  // 选择完成后关闭下拉框
                  // 初始节点id是一个字符串， 生成成功后是number类型
                  if (isNumber(nodeId)) {
                    setDropdownVisible(false);
                  }
                }}
                showAddTree={true}
                enableRootAdd={true}
                activeTab="src"
                onDataRefresh={getdirectoryDataList}
                dataSourceType={props.detailData?.source_type}
                tableNameNames={props.detailData?.db_name}
              />
            )}
          >
            {/* {generatorTreeNodes(directoryData)} */}
          </TreeSelect>
        </FormItem>

        {/* 隐藏字段保存节点ID用于后端提交 */}
        <FormItem field="dest_path" style={{ display: 'none' }}>
          <Input />
        </FormItem>
        {/* SQL处理选项 - 仅在数据库类型且目录节点为元数据时显示 */}
        {props.detailData?.source_type === 'db' &&
          selectedNodeType === 'metadata' && (
            <>
              <FormItem
                label="SQL处理："
                field="sql_process_enabled"
                labelAlign="right"
                rules={[{ required: true, message: '请选择SQL处理状态' }]}
                initialValue={
                  props.detailData?.sql_process_enabled || 'disable'
                }
              >
                <Switch
                  checked={sqlProcessEnabled === 'enable'}
                  onChange={handleSqlProcessChange}
                />
              </FormItem>

              {sqlProcessEnabled === 'enable' && (
                <FormItem label=" " field="sql">
                  <div
                    className={classNames(
                      styles['sql-editor-container'],
                      'rounded-[4px] border border-solid border-[#E2E8F0]'
                    )}
                  >
                    <div className="flex items-center gap-[8px] border-b border-solid border-[#E2E8F0] p-[12px] pb-[12px]">
                      <Button
                        type="secondary"
                        icon={<IconCaretRight className="mr-[4px]" />}
                        className="h-[26px]"
                        onClick={handleCheckSQL}
                        loading={checkStatus === CheckSQLStatus.CHECKING}
                      >
                        校验
                      </Button>

                      <Button
                        type="text"
                        icon={<SQLFormatIcon />}
                        className="h-[26px]"
                      >
                        格式化
                      </Button>
                    </div>
                    <CodeMirror
                      value={sqlContent}
                      onChange={handleSqlContentChange}
                      placeholder={placeholderValue}
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

        {props.detailData?.source_type === 'db' &&
          sqlProcessEnabled !== 'enable' && (
            <FormItem
              label="选择抽取的表："
              field="table_id"
              rules={[{ required: true, message: '请选择抽取的表' }]}
              initialValue={props.detailData?.table_names}
            >
              <Select
                mode={
                  selectedNodeType === 'metadata'
                    ? undefined
                    : ('multiple' as const)
                }
                placeholder="请选择抽取的表"
                maxTagCount={2}
                style={{ width: '100%', minWidth: 0 }}
                allowClear
                allowCreate
                disabled={true}
              >
                {talbleList.length > 0 && selectedNodeType !== 'metadata' && (
                  <Option value="all">全部</Option>
                )}
                {talbleList?.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </FormItem>
          )}

        <FormItem
          label="载入形式："
          initialValue={props.detailData?.load_type}
          field="load_type"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <RadioGroup
            onChange={(val) => {
              handoffLoadFormHan(val);
            }}
            disabled={true}
          >
            <Radio value="once">单次载入</Radio>
            <Radio value="cron">周期载入</Radio>
          </RadioGroup>
        </FormItem>
        {loadVal == 'cron' ? (
          // <div className={classNames(Styles.cycleLoadingBox)}>
          <SchedulerRun
            // @ts-expect-error
            ref={SchedulerRunRef}
            options={props.cron}
            onOptionsChange={(val) => {
              setObj(val);
            }}
          ></SchedulerRun>
        ) : // </div>
        null}
      </Form>
      <div className={Styles.footerBbtnBox}>
        <Button
          onClick={props.hideEditModalHan || cancelHan}
          style={{ marginRight: '20px' }}
        >
          取消
        </Button>
        <Button
          disabled={loading}
          type="primary"
          onClick={() => {
            okHan();
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
};

// 页面组件 - 作为路由页面使用
export default function DataLoadEdit() {
  const history = useHistory();
  const { task_id: taskId } = useRouteParams<{ task_id: string }>();
  const [form] = Form.useForm();
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cron, setCron] = useState<string>('');

  // 获取详情数据
  const getDetailData = async () => {
    try {
      setLoading(true);
      const res = await getLoad(taskId);
      if (res.code === '' && res.status === 200) {
        setDetailData(res.data);
        // 解析cron表达式
        if (res.data?.run_config?.cycle_text) {
          setCron(res.data.run_config.cycle_text);
        }
      } else {
        Message.error(res.message || '获取详情数据失败');
        history.goBack();
      }
    } catch (error) {
      console.error('获取详情数据失败:', error);
      Message.error('获取详情数据失败');
      history.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      getDetailData();
    } else {
      Message.error('缺少任务ID');
      history.goBack();
    }
  }, [taskId]);

  // 取消处理
  const handleCancel = () => {
    history.goBack();
  };

  // 编辑成功后的回调
  const handleEditSuccess = () => {
    Message.success('修改成功');
    history.goBack();
  };

  // 获取详情列表的回调（用于刷新数据）
  const handleGetDetailList = () => {
    getDetailData();
  };

  if (loading) {
    return (
      <div className="h-full px-[20px]">
        <div className="mb-[9px] mt-[17px] text-[20px] font-bold leading-[32px]">
          编辑数据载入任务
        </div>
        <div className="flex h-[calc(100%-58px-17px)] flex-col items-center justify-center overflow-y-auto rounded-[16px] bg-white p-[24px]">
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="h-full px-[20px]">
        <div className="mb-[9px] mt-[17px] text-[20px] font-bold leading-[32px]">
          编辑数据载入任务
        </div>
        <div className="flex h-[calc(100%-58px-17px)] flex-col items-center justify-center overflow-y-auto rounded-[16px] bg-white p-[24px]">
          <div>数据加载失败</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-[20px]">
      <div className="mb-[9px] mt-[17px] text-[20px] font-bold leading-[32px]">
        编辑数据载入任务
      </div>
      <div className="flex h-[calc(100%-58px-17px)] flex-col items-start justify-start overflow-y-auto rounded-[16px] bg-white p-[24px]">
        <Edit
          detailData={detailData}
          editForm={form}
          getDetailList={handleGetDetailList}
          loadId={Number(taskId)}
          cron={cron}
          hideEditModalHan={handleEditSuccess}
        />
      </div>
    </div>
  );
}
