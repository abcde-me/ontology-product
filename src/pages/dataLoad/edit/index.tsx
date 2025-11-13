import {
  Button,
  Form,
  Input,
  Message,
  Radio,
  Select,
  TreeSelect
} from '@arco-design/web-react';
import React, { useEffect, useRef, useState } from 'react';
import Styles from './index.module.css';
import SchedulerRun from '../../../components/scheduler-run';
import { editLoad, getDirectoryList } from '@/api/loadApi';
import { getdetailList } from '@/api/connectionApi';
import './index.css';
import { validateName } from '@/utils/valiate';
import ComponentTree from '../list/component-tree';
import { isNumber } from 'lodash-es';

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

// 单选框实例
const RadioGroup = Radio.Group;

const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;
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
  // TreeSelect显示的值（路径）
  const [treeSelectDisplayValue, setTreeSelectDisplayValue] =
    useState<string>('');
  //获取连接器下面的表格
  const [talbleList, setTableList] = useState([]);
  // TreeSelect 下拉框显示状态
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const getTableList = async (connector_id: string) => {
    try {
      const res = await getdetailList(connector_id);
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
        root_type: 1,
        dir_type: props.detailData.source_type === 'db' ? 3 : undefined
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
          console.log('设置TreeSelect初始值:', nodeId);
          setSelectedTreeKeys([nodeId]);
          // 构建显示路径
          let displayPath = buildTreeSelectDisplayPath(
            directoryData,
            props.detailData?.data_path_id
          );
          props.detailData?.source_type === 'db'
            ? (displayPath = displayPath + '/' + props.detailData?.db_name)
            : null;
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
      if (props.detailData?.load_type !== 'once') {
        const valid = await SchedulerRunRef.current?.validate();
        if (!valid) return;
        const formData = {
          task_id: Number(props.loadId),
          task_name: rest.name,
          run_cycle: {
            type: 1,
            cycle_text: obj
          },
          dest_path_id: pathId,
          db_name: props.detailData?.db_name
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
          task_id: Number(props.loadId),
          task_name: rest.name,
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
          db_name: props.detailData?.db_name
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Form
        style={{ width: '100%' }}
        autoComplete="off"
        form={form}
        initialValues={{
          dest_path: initialPath
        }}
      >
        <FormItem
          label="任务名称："
          required
          initialValue={props.detailData?.name}
          field="name"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          extra={
            <div style={{ color: '#6E7B8D', fontSize: '12px' }}>
              <div>支持中文，英文，数字，下划线</div>
              <div>名称建议: 连接器connector_1</div>
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
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
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
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请输入任务名称' }]}
          initialValue={props.detailData?.connector_name}
        >
          <Select
            placeholder="请选择连接器"
            disabled={true}
            showSearch
          ></Select>
        </FormItem>
        {props.detailData?.source_type === 'db' && (
          <FormItem
            label="选择抽取的表："
            field="table_id"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            labelAlign="right"
            rules={[{ required: true, message: '请选择抽取的表' }]}
            initialValue={props.detailData?.table_names}
          >
            <Select
              mode="multiple"
              placeholder="请选择抽取的表"
              maxTagCount={2}
              style={{ width: '100%', minWidth: 0 }}
              allowClear
              allowCreate
              disabled={true}
            >
              <Option value="all">全部</Option>
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
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
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
          <div className={Styles.cycleLoadingBox}>
            <SchedulerRun
              // @ts-expect-error
              ref={SchedulerRunRef}
              options={props.cron}
              onOptionsChange={(val) => {
                setObj(val);
              }}
            ></SchedulerRun>
          </div>
        ) : null}

        <FormItem
          label="载入位置："
          field="dest_path_display"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
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
                onPathChange={(path, nodeId) => {
                  console.log('路径变化:', path, '节点ID:', nodeId);
                  // 更新选中的keys
                  setSelectedTreeKeys([String(nodeId)]);
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
      </Form>
      <div className={Styles.footerBbtnBox}>
        <Button onClick={cancelHan} style={{ marginRight: '20px' }}>
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
export default Edit;
