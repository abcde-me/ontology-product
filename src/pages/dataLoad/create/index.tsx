import {
  Button,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Tooltip,
  Tag,
  TreeSelect,
  Collapse,
  Popover,
  Tabs,
  Typography
} from '@arco-design/web-react';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from 'react';
import Styles from '../list/index.module.scss';
import SchedulerRun from '../../../components/scheduler-run';
import { addLoad, getDirectoryList, getTableName } from '@/api/loadApi';
import { getConnectionList, getdetailList } from '@/api/connectionApi';
import { useHistory } from 'react-router';
import { validateName } from '@/utils/valiate';
import Uploads from '../list/file-upload';
import ComponentTree from '../list/component-tree';
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
    | 'datasource_item';
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

const RunningInfoPanel = function () {
  const CollapseItem = Collapse.Item;
  const TabPane = Tabs.TabPane;
  const { Text } = Typography;
  const [isExpanded, setIsExpanded] = useState(false);
  const handlePanelChange = (key: string, keys: string[]) => {
    const newExpanded = keys.length > 0;
    setIsExpanded(newExpanded);
  };

  return (
    <div className={`running-info-panel ${styles['sql-running-info-panel']}`}>
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
                {/* {renderRunStatus(runStatus)} */}
              </div>
            </div>
          }
          name="1"
        >
          <div className={styles['panel-content']}></div>
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
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [directoryData, setDirectoryData] = useState<TreeNodeData[]>([]);
  const [tableList, setTableList] = useState<string[]>([]);

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
            // 这里暂时不处理，让 ComponentTree 组件自己处理
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
      const res = await getDirectoryList({ root_type: 1 });

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

        if (sourceType === SOURCE_TYPES.DB) {
          const tableNameRes = await getTableName({
            connector_id: connectorId
          });
          setTableNames(tableNameRes?.data || '');
        }

        setTableList(res?.data?.table_name || []);
      } catch (error) {
        console.error('获取连接器表格数据失败:', error);
        Message.error('获取连接器表格数据失败');
      }
    },
    [sourceType]
  );

  // 处理表格名称选择（全部标签逻辑）
  const handleAllTagChange = useCallback(
    (value: string[]) => {
      if (value.includes('all')) {
        form.setFieldsValue({ table_name: ['all'] });
      } else {
        const filteredValue = value.filter((item) => item !== 'all');
        const hasAllOtherOptions =
          tableList.length > 0 &&
          tableList.every((option) => filteredValue.includes(option)) &&
          filteredValue.length === tableList.length;

        form.setFieldsValue({
          table_name: hasAllOtherOptions ? ['all'] : filteredValue
        });
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
  const handleSourceTypeChange = useCallback((e: any) => {
    const newSourceType = e.target.value;
    console.log('切换数据源类型到:', newSourceType);
    setDirectoryData([]);
    setTableList([]);
    setConnectName([]);
    setSourceType(newSourceType);
  }, []);

  // 构建表单数据
  const buildFormData = useCallback(
    (formValues: FormValues, pathId: string | number, submitType: string) => {
      const processedTableNames = formValues.table_name?.includes('all')
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
        table_names: processedTableNames,
        db_name: sourceType === SOURCE_TYPES.DB ? tableNames : null
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

      if (sourceType === SOURCE_TYPES.DB) {
        const processedTableNames = formValues.table_name?.includes('all')
          ? tableList
          : formValues.table_name;

        if (!processedTableNames || processedTableNames.length === 0) {
          return '请选择要抽取的表';
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

        // 构建并提交表单数据
        if (!pathId) {
          Message.error('请选择载入位置');
          return;
        }
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
        Message.error('表单处理失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [form, selectedNodeId, loadVal, validateFormData, buildFormData, history]
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
    (path: string, nodeId?: string | number) => {
      console.log('路径变化:', path, '节点ID:', nodeId);
      setSelectedNodeId(nodeId || null);
      form.setFieldsValue({ dest_path: path ? [path] : undefined });

      if (nodeId !== undefined && isNumber(nodeId)) {
        setDropdownVisible(false);
      }
    },
    [form]
  );

  // 下拉框过滤选项
  const filterOption = useCallback((input: string, option: any) => {
    return option.props.children?.toLowerCase().includes(input.toLowerCase());
  }, []);

  // 监听连接器ID变化
  const connectorId = Form.useWatch('connector_id', form);
  useEffect(() => {
    if (connectorId) {
      getConnectorDetailList(connectorId);
      if (sourceType === SOURCE_TYPES.DB) {
        form.setFieldsValue({ table_name: undefined });
      }
    }
  }, [connectorId, sourceType, form, getConnectorDetailList]);

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
  }, [sourceType, form, getdirectoryDataList]);

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
              color: '#1890ff',
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
    <div className="h-full px-[20px]">
      <div className="mb-[9px] mt-[17px] text-[20px] font-bold leading-[32px]">
        创建数据载入任务
      </div>
      <div className="flex h-[calc(100%-58px-17px)] flex-col items-start justify-start overflow-y-auto rounded-[16px] bg-white p-[24px]">
        <Form
          autoComplete="off"
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          disabled={loading}
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
            onChange={handleSourceTypeChange}
          >
            <RadioGroup>
              <Radio value={SOURCE_TYPES.S3}>对象存储(S3)</Radio>
              <Radio value={SOURCE_TYPES.HDFS}>HDFS</Radio>
              <Radio value={SOURCE_TYPES.DB}>数据库</Radio>
              <Radio value={SOURCE_TYPES.LOCAL}>本地文件</Radio>
            </RadioGroup>
          </FormItem>

          {sourceType !== SOURCE_TYPES.LOCAL ? (
            <>
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

              {sourceType === SOURCE_TYPES.DB && (
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
                    mode="multiple"
                    maxTagCount={{
                      count: 2,
                      render: renderTableTags
                    }}
                    placeholder="请选择抽取的表"
                    style={{ width: '100%', minWidth: 0 }}
                    allowClear
                  >
                    {tableList.length > 0 && <Option value="all">全部</Option>}
                    {tableList.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              )}
            </>
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

          {loadVal === LOAD_TYPES.CRON && (
            <div className={Styles.cycleLoadingBox}>
              <SchedulerRun
                // @ts-expect-error
                ref={SchedulerRunRef}
                options={{}}
                onOptionsChange={setExpression}
              />
            </div>
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
            <TreeSelect
              className="db-tree-select"
              placeholder="请选择载入位置"
              allowClear
              popupVisible={dropdownVisible}
              onVisibleChange={setDropdownVisible}
              dropdownMenuStyle={{
                maxHeight: 300,
                padding: 0,
                overflow: 'hidden'
              }}
              dropdownRender={() => (
                <ComponentTree
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
              )}
            />
          </FormItem>

          <FormItem
            label="SQL处理："
            field="sql_process"
            labelAlign="right"
            rules={[{ required: true, message: '请输入SQL处理' }]}
          >
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
                  // onClick={handleRunClick}
                >
                  校验
                </Button>

                <Button
                  type="text"
                  icon={<SQLFormatIcon />}
                  // onClick={handleFormatCode}
                  className="h-[26px]"
                >
                  格式化
                </Button>
              </div>
              <CodeMirror
                value={''}
                // onChange={handleContentChange}
                // placeholder={placeholderValue}
                // readOnly={
                //     !hasUpdatePermission || runStatus === RunningStatus.RUNNING
                // }
                theme={myTheme}
                extensions={[sql({ upperCaseKeywords: true }), lintGutter()]}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: false
                }}
                className={styles['code-editor']}
              />
              <RunningInfoPanel />
            </div>
          </FormItem>
        </Form>

        <div className={Styles.footerBbtnBox}>
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
