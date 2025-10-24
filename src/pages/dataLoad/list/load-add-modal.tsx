import {
  Button,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Tooltip,
  Tag,
  TreeSelect
} from '@arco-design/web-react';
import React, { useEffect, useRef, useState } from 'react';
import Styles from './index.module.css';
import SchedulerRun from '../../../components/scheduler-run';
import { addLoad, getDirectoryList, getTableName } from '@/api/loadApi';
import { getConnectionList, getdetailList } from '@/api/connectionApi';
import { useHistory } from 'react-router';
import { validateName } from '@/utils/valiate';
import Uploads from './file-upload';
import ComponentTree from './component-tree';
import './db-tree.scss';
import { NodeInstance } from '@arco-design/web-react/es/Tree/interface';
import { isNumber } from 'lodash-es';
interface connecort_nameType {
  key: number;
  label: string;
}
// 单选框实例
const RadioGroup = Radio.Group;
// 表单实例
const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;

interface propsType {
  hideModalHan: () => void;
  getList: (visible: boolean) => void;
}
const LoadAddModal = (props: propsType) => {
  const SchedulerRunRef = useRef<HTMLFormElement>(null);
  const selectRef = useRef<any>(null);
  const history = useHistory();
  // 存放连接器名称表单的数据
  const [connectName, setConnectName] = useState<connecort_nameType[]>([]);
  // 按钮以及输入框的状态
  const [loading, setLoading] = useState(false);
  // 整体表单实例
  const [form] = Form.useForm();
  // 获取表达式的状态
  const [expression, setExpression] = useState({});
  //切换数据源类型
  const [sourceType, setSourceType] = useState('s3');
  const [tableNames, setTableNames] = useState('');
  // 提交表单时的校验逻辑
  const handleSubmit = async (type: string) => {
    const formValues = await form.validate();
    try {
      setLoading(true);

      const { ...rest } = formValues;
      let pathId;
      if (
        sourceType === 'db' ||
        sourceType === 'local' ||
        sourceType === 'hdfs' ||
        sourceType === 's3'
      ) {
        pathId = selectedNodeId;
        if (!pathId) {
          Message.error('请选择载入位置');
          return;
        }
      } else {
        pathId = rest.dest_path?.at?.(-1);
        // 验证pathId是否有效
        if (!pathId) {
          Message.error('请选择载入位置');
          return;
        }
      }
      // 处理表格名称数据
      let processedTableNames = rest.table_name;
      if (processedTableNames && processedTableNames.includes('all')) {
        // 如果选择了"全部"，传递所有可用的表名
        processedTableNames = talbleList;
      }

      // 如果是数据库类型，验证table_names是否为空
      if (
        sourceType === 'db' &&
        (!processedTableNames || processedTableNames.length === 0)
      ) {
        Message.error('请选择要抽取的表');
        return;
      }
      if (loadVal !== 'once') {
        const valid = await SchedulerRunRef.current?.validate();
        if (!valid) return;
        const formData = {
          task_name: rest.name,
          connector_id: sourceType === 'local' ? null : rest.connector_id,
          source_type: rest.source_type,
          run_cycle: {
            type: loadVal == 'once' ? 0 : 1,
            cycle_text: expression
          },
          dest_path_id: pathId,
          submit_type: type == 'keep' ? 1 : 2,
          table_names: processedTableNames || uploadedFiles,
          db_name: sourceType === 'db' ? tableNames : null
          // 添加上传的文件数据
          // uploaded_files: sourceType === 'local' ? uploadedFiles : undefined
        };
        const res = await addLoad(formData);
        if (res.code == '' && res.status == 200) {
          if (type == 'run') {
            history.push(
              `/tenant/compute/modaforge/dataLoad/detail?task_id=${res.data}`
            );
          } else {
            Message.success('新建任务成功');
            // 仅保存时刷新列表页面
            props.getList(false);
          }
          cancelHan();
        } else {
          Message.error(res.message);
        }
      } else {
        // 如果是数据库类型且为单次载入，也需要验证table_names
        if (
          sourceType === 'db' &&
          (!processedTableNames || processedTableNames.length === 0)
        ) {
          Message.error('请选择要抽取的表');
          return;
        }

        const formData = {
          task_name: rest.name,
          connector_id: sourceType === 'local' ? null : rest.connector_id,
          source_type: rest.source_type,
          run_cycle: {
            type: 0,
            cycle_text: {
              minute: '0',
              hour: '0',
              date: '*',
              month: '*',
              week: ''
            }
          },
          dest_path_id: pathId,
          submit_type: type == 'keep' ? 1 : 2,
          table_names: processedTableNames || uploadedFiles,
          db_name: sourceType === 'db' ? tableNames : null
          // 添加上传的文件数据
          // uploaded_files: sourceType === 'local' ? uploadedFiles : undefined
        };
        const res = await addLoad(formData);
        if (res.code === '' && res.status === 200) {
          if (type == 'run') {
            Message.success(
              '大量数据载入会影响数据源库，尽力避免业务作业期间操作'
            );
            history.push(
              `/tenant/compute/modaforge/dataLoad/detail?task_id=${res.data}`
            );
          } else {
            Message.success('新建任务成功');
            // 仅保存时刷新列表页面
            props.getList(false);
          }
          cancelHan();
        } else {
          Message.error(res.message);
        }
      }
    } catch (error) {
      console.error('表单处理失败:', error);
    } finally {
      setLoading(false);
    }
  };
  // 点击取消按钮的逻辑
  const cancelHan = () => {
    // 点击取消隐藏弹框并且重置表单数据
    props.hideModalHan();
  };
  // 默认的类型
  const [typeValue] = useState('s3');
  // 载入类型的默认值
  const [loadVal, setLoadVal] = useState('once');
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
      form.setFieldsValue({ cron_expr: undefined });
    }
    setLoadVal(val);
  };

  const filterOption = (input: string, option) => {
    return (
      option.props.children &&
      option.props.children.toLowerCase().includes(input.toLowerCase())
    );
  };
  const loadTypeChange = (e) => {
    try {
      const newSourceType = e.target.value;
      console.log('切换数据源类型到:', newSourceType);
      // 先清理所有状态
      setDirectoryData([]);
      setTableList([]);
      setConnectName([]);
      // 更新sourceType状态 - 使用useEffect来处理异步数据获取
      setSourceType(newSourceType);
    } catch (error) {
      console.error('切换数据源类型失败:', error);
      Message.error('切换数据源类型失败');
      setDirectoryData([]);
    }
  };
  const [directoryData, setDirectoryData] = useState<any[]>([]);

  async function getdirectoryDataList() {
    try {
      const res = await getDirectoryList({
        root_type: 1
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

      if (sourceType === 's3' || sourceType === 'hdfs') {
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
        setDirectoryData(processedData);
        return processedData;
      } else {
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

  // 数据刷新回调函数
  const handleDataRefresh = async () => {
    console.log('ComponentTree 请求数据刷新');
    return await getdirectoryDataList();
  };
  //选中全部标签
  const handAllTagChange = (value) => {
    if (value.includes('all')) {
      // 如果选择了"全部"，只保留"全部"选项
      form.setFieldsValue({
        table_name: ['all']
      });
    } else {
      // 如果没有选择"全部"，移除"全部"选项（如果存在）
      const filteredValue = value.filter((item) => item !== 'all');

      // 检查是否选择了所有其他选项，如果是则自动设置为"全部"
      const hasAllOtherOptions = talbleList.every((option) =>
        filteredValue.includes(option)
      );

      if (
        hasAllOtherOptions &&
        filteredValue.length === talbleList.length &&
        talbleList.length > 0
      ) {
        form.setFieldsValue({
          table_name: ['all']
        });
      } else {
        form.setFieldsValue({
          table_name: filteredValue
        });
      }
    }
  };
  // 处理数据源类型变化
  useEffect(() => {
    let cancelled = false;

    // 数据源变化时， 清空载入位置
    form.setFieldsValue({
      dest_path: undefined
    });

    const loadData = async () => {
      try {
        console.log('useEffect: 数据源类型变化，重新加载数据', sourceType);
        // 获取连接器列表
        if (sourceType) {
          const res = await getConnectionList({
            type: sourceType,
            status: '1'
          });
          if (!cancelled && res.data && res.data.items) {
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
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [sourceType]);

  //获取连接器下面的表格
  const [talbleList, setTableList] = useState([]);
  //拼接路径的表名

  const getConnectorDetailList = async (connector_id: string) => {
    if (!connector_id) {
      console.log('connector_id为空，跳过获取表格数据');
      return;
    }
    try {
      console.log('connector_id', connector_id);
      const res = await getdetailList({ id: connector_id });
      if (sourceType === 'db') {
        const tableNameRes = await getTableName({ connector_id: connector_id });
        console.log(tableNameRes, '获取连接器下面的表格');
        setTableNames(tableNameRes?.data);
      }
      setTableList(res?.data?.table_name || []);
      console.log(res, '获取连接器下面的表格');
    } catch (error) {
      console.error('获取连接器表格数据失败:', error);
    }
  };
  const connectorId = Form.useWatch('connector_id', form);
  useEffect(() => {
    if (connectorId) {
      getConnectorDetailList(connectorId);
      if (sourceType === 'db') {
        form.setFieldsValue({
          table_name: undefined
        });
      }
    }
  }, [connectorId]);
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

  // 存储选中的节点ID，用于表单提交
  const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(
    null
  );

  // 存储树组件选中的keys
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);

  // 存储上传的文件数据
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  // 文件上传中状态
  const [isFileUploading, setIsFileUploading] = useState(false);
  // TreeSelect 下拉框显示状态
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // 保留handleSelect作为ComponentTree的回调
  const handleSelect = (selectedKeys: string[]) => {
    console.log('handleSelect called in load-add-modal', selectedKeys);
    // 更新选中状态
    setSelectedTreeKeys(selectedKeys);
  };
  // 处理文件删除
  const handleFileDelete = (fileName: string) => {
    setUploadedFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.name !== fileName);
      if (updatedFiles.length === 0) {
        form.setFieldsValue({
          connector_id: undefined
        });
      }
      return updatedFiles;
    });
  };

  const handleFileChange = (fileData) => {
    if (Array.isArray(fileData)) {
      if (fileData.length === 0) {
        // 如果是清空操作
        setUploadedFiles([]);
        if (sourceType === 'local') {
          form.setFieldsValue({
            connector_id: undefined
          });
        }
        return;
      }
      console.log(fileData, '这个是多文件上传后的回调');
      setUploadedFiles(fileData);

      if (sourceType === 'local') {
        form.setFieldsValue({
          connector_id: 'local_files_uploaded'
        });
      }
      return;
    }
    console.log(fileData, '这个是单文件上传后的回调');
    if (!fileData) return;
    setUploadedFiles((prev) => {
      // 检查新文件是否已经存在
      const isFileExists = prev.some((file) => file.name === fileData.name);
      if (isFileExists) {
        return prev;
      }
      return [...prev, fileData];
    });

    if (sourceType === 'local') {
      form.setFieldsValue({
        connector_id: 'local_files_uploaded'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Form
        style={{ width: '100%' }}
        autoComplete="off"
        form={form}
        disabled={loading}
      >
        <FormItem
          label="任务名称："
          field="name"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          required
          extra={
            <div className="text-prompt">
              <div>支持中文，英文，数字，下划线</div>
              {/* <div>名称建议: 连接器connector_1</div> */}
            </div>
          }
          rules={[
            {
              validator: (value, cb) => {
                if (!value || value.trim() === '') {
                  return cb('请输入任务名称');
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
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择数据源类型' }]}
          initialValue={typeValue}
          onChange={(value) => {
            loadTypeChange(value);
          }}
        >
          <RadioGroup>
            <Radio value="s3">对象存储(S3)</Radio>
            <Radio value="hdfs">HDFS</Radio>
            <Radio value="db">数据库</Radio>
            <Radio value="local">本地文件</Radio>
          </RadioGroup>
        </FormItem>
        {sourceType !== 'local' ? (
          <>
            <FormItem
              label="绑定连接器："
              field="connector_id"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
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
            {sourceType === 'db' && (
              <FormItem
                label="选择抽取的表："
                field="table_name"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
                rules={[{ required: true, message: '请选择抽取的表' }]}
                extra={'只能载入public schema的表'}
              >
                <Select
                  className="select-tag-style"
                  onChange={(value) => {
                    handAllTagChange(value);
                  }}
                  ref={selectRef}
                  mode="multiple"
                  maxTagCount={{
                    count: 2,
                    render: (invisibleTagCount) => {
                      console.log('maxTagCount render被调用:', {
                        invisibleTagCount,
                        formValues: form.getFieldValue('table_name')
                      });

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
                              // backgroundColor: '#f5f5f5',
                              borderRadius: '2px'
                              // border: '1px dashed #d9d9d9'
                            }}
                          >
                            +{invisibleTagCount}
                          </span>
                        </Tooltip>
                      );
                    }
                  }}
                  placeholder="请选择抽取的表"
                  style={{ width: '100%', minWidth: 0 }}
                  allowClear
                >
                  {(talbleList || []).length > 0 && (
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
          </>
        ) : (
          <FormItem
            label="选择文件："
            field="connector_id"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
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
          initialValue="once"
          field="load_type"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择载入形式' }]}
        >
          <RadioGroup
            onChange={(val) => {
              handoffLoadFormHan(val);
            }}
          >
            <Radio value="once">单次载入</Radio>
            {sourceType !== 'local' && <Radio value="cron">周期载入</Radio>}
          </RadioGroup>
        </FormItem>
        {loadVal == 'cron' ? (
          <div className={Styles.cycleLoadingBox}>
            <SchedulerRun
              // @ts-expect-error
              ref={SchedulerRunRef}
              options={{}}
              onOptionsChange={(val) => {
                setExpression(val);
              }}
            ></SchedulerRun>
          </div>
        ) : null}
        <FormItem
          label="载入到："
          field="dest_path"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择载入位置' }]}
          extra={
            sourceType === 'db' ? (
              <p
                style={{
                  fontSize: '12px',
                  color: '#6E7B8D',
                  marginTop: '4px'
                }}
              >
                {`注意保存后数据库名称为${!!tableNames ? tableNames : 'xxx-aaa'}`}
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
              overflow: 'hidden' // 防止外层出现滚动条
            }}
            dropdownRender={() => (
              <ComponentTree
                directoryData={directoryData}
                onDirectoryDataChange={setDirectoryData}
                onSelect={handleSelect}
                selectedKeys={selectedTreeKeys}
                onPathChange={(path, nodeId) => {
                  console.log('路径变化:', path, '节点ID:', nodeId);
                  // 存储节点ID用于表单提交
                  setSelectedNodeId(nodeId || null);
                  // 设置表单显示值为路径
                  form.setFieldsValue({
                    dest_path: path
                  });
                  // 选择完成后关闭下拉框
                  // 初始节点id是一个字符串， 生成成功后是number类型
                  if (isNumber(nodeId)) {
                    setDropdownVisible(false);
                  }
                }}
                showAddTree={true}
                enableRootAdd={true}
                activeTab="src"
                onDataRefresh={handleDataRefresh}
                dataSourceType={sourceType}
                tableNameNames={tableNames}
              />
            )}
          >
            {/* {generatorTreeNodes(directoryData)} */}
          </TreeSelect>
        </FormItem>
      </Form>
      <div className={Styles.footerBbtnBox}>
        <Button onClick={cancelHan} style={{ marginRight: '8px' }}>
          取消
        </Button>
        {sourceType !== 'local' && (
          <Button
            onClick={() => handleSubmit('keep')}
            disabled={loading}
            style={{ marginRight: '8px' }}
          >
            仅保存
          </Button>
        )}
        <Button
          onClick={() => handleSubmit('run')}
          type="primary"
          disabled={loading || isFileUploading}
        >
          保存并执行
        </Button>
      </div>
    </div>
  );
};
export default LoadAddModal;
