import {
  Button,
  Cascader,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Tooltip,
  Tag,
  Divider,
  TreeSelect,
  Tree
} from '@arco-design/web-react';
import { IconClose, IconPlus } from '@arco-design/web-react/icon';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Styles from './index.module.css';
import SchedulerRun from '../../../components/scheduler-run';
import { dataLodaAddForm } from '../type';
import { addLoad, getDirectoryList } from '@/api/loadApi';
import { getConnectionList } from '@/api/connectionApi';
import { useHistory } from 'react-router';
import { validateName } from '@/utils/valiate';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import Uploads from './file-upload';
import './db-tree.css';
import {
  NodeProps,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
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

const options = [
  'Beijing',
  'Shanghai',
  'Guangzhou',
  'Shenzhen',
  'Chengdu',
  'Wuhan'
];
const TreeNode = Tree.Node;
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
  // 动态计算最大标签数量
  const [maxTagCounts, setMaxTagCount] = useState(3);
  // 提交表单时的校验逻辑
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formValues = await form.validate();
      const { time, day, cycle, ...rest } = formValues;
      const pathId = rest.dest_path.at(-1);
      if (loadVal !== 'once') {
        const valid = await SchedulerRunRef.current?.validate();
        if (!valid) return;
        const formData = {
          task_name: rest.name,
          connector_id: rest.connector_id,
          source_type: rest.source_type,
          run_cycle: {
            type: loadVal == 'once' ? 0 : 1,
            cycle_text: expression
          },
          dest_path_id: pathId
        };
        const res = await addLoad(formData);
        if (res.code == '' && res.status == 200) {
          cancelHan();
          history.push(
            `/tenant/compute/modaforge/dataLoad/detail?task_id=${res.data}`
          );
        } else {
          Message.error(res.message);
        }
      } else {
        const formData = {
          task_name: rest.name,
          connector_id: rest.connector_id,
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
          dest_path_id: pathId
        };
        const res = await addLoad(formData);
        if (res.code === '' && res.status === 200) {
          Message.success('新建任务成功');
          cancelHan();
          history.push(
            `/tenant/compute/modaforge/dataLoad/detail?task_id=${res.data}`
          );
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
  const [typeValue, setTypeValue] = useState('s3');
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
      form.setFieldsValue({ cron_expr: undefined }); // 如果有需要，可以重置其他字段
    }
    setLoadVal(val);
  };

  // 获取连接器名称
  const getConnector_name_type = async () => {
    try {
      const res = await getConnectionList({
        type: 's3'
      });
      const newres = res.data.items.map((item) => {
        return {
          key: item.id,
          label: item.name
        };
      });
      setConnectName(newres);
    } catch (error) {
      console.error('获取连接器名称失败:', error);
    }
  };
  const filterOption = (input: string, option) => {
    return (
      option.props.children &&
      option.props.children.toLowerCase().includes(input.toLowerCase())
    );
  };
  const loadTypeChange = async (e) => {
    const res = await getConnectionList({
      type: e.target.value
    });
    const newres = res.data.items.map((item) => {
      return {
        key: item.id,
        label: item.name
      };
    });
    setConnectName(newres);
  };
  const [directoryData, setDirectoryData] = useState([]);

  async function getdirectoryDataList() {
    try {
      const res = await getDirectoryList({
        root_type: 1
      });

      if (res.status !== 200) {
        return;
      }
      console.log(res.data.src);
      if (sourceType == 's3' || sourceType == 'hdfs') {
        const newdirectoryData = res.data.src.map((item) => {
          return item.children
            ? {
                value: item.id,
                label: item.name,
                children: item.children.volume.map((items) => {
                  return {
                    value: items.id,
                    label: items.name
                  };
                })
              }
            : { value: item.id, label: item.name };
        });
        setDirectoryData(newdirectoryData);
      } else {
        console.log(sourceType, '打印sourceType8888888888888888888888');

        const processTreeData = (data) => {
          return data.map((item) => {
            const processedItem = {
              id: item.id,
              name: item.name,
              value: item.id,
              label: item.name,
              ...item
            };
            // 处理children数据
            if (item.children) {
              if (Array.isArray(item.children)) {
                // 如果children是数组，直接递归处理
                processedItem.children = processTreeData(item.children);
              } else if (
                item.children.volume &&
                Array.isArray(item.children.volume)
              ) {
                // 如果children是对象且包含volume数组，处理volume
                processedItem.children = processTreeData(item.children.volume);
              } else if (typeof item.children === 'object') {
                // 如果children是对象，尝试转换为数组
                const childrenArray = Object.values(item.children).filter(
                  Array.isArray
                )[0];
                if (childrenArray) {
                  processedItem.children = processTreeData(childrenArray);
                }
              }
            }
            return processedItem;
          });
        };
        const processedData = processTreeData(res.data.src);
        setDirectoryData(processedData);
      }
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    console.log(directoryData, '打印目录数据');
  }, []);
  // 计算响应式标签数量的函数
  const calculateMaxTagCount = useCallback(() => {
    try {
      if (selectRef.current && selectRef.current.dom) {
        const selectElement = selectRef.current.dom;
        const width = selectElement.offsetWidth || selectElement.clientWidth;
        if (width > 0) {
          // 根据宽度计算可显示的标签数量
          const tagWidth = 80;
          const inputSpace = 120;
          const availableWidth = width - inputSpace;
          const calculatedCount = Math.max(
            1,
            Math.floor(availableWidth / tagWidth)
          );
          setMaxTagCount(calculatedCount);
        }
      }
    } catch (error) {
      console.warn('计算标签数量时出错:', error);
      // 使用默认值
      setMaxTagCount(3);
    }
  }, []);
  //选中全部标签
  const handAllTagChange = (value) => {
    if (value.includes('all')) {
      // 如果选择了"全部"，只保留"全部"选项
      form.setFieldsValue({
        table_id: ['all']
      });
    } else {
      // 如果没有选择"全部"，移除"全部"选项（如果存在）
      const filteredValue = value.filter((item) => item !== 'all');

      // 检查是否选择了所有其他选项，如果是则自动设置为"全部"
      const allOtherOptions = options.filter((option) => option !== 'all');
      const hasAllOtherOptions = allOtherOptions.every((option) =>
        filteredValue.includes(option)
      );

      if (
        hasAllOtherOptions &&
        filteredValue.length === allOtherOptions.length
      ) {
        form.setFieldsValue({
          table_id: ['all']
        });
      } else {
        form.setFieldsValue({
          table_id: filteredValue
        });
      }
    }
  };
  useEffect(() => {
    getdirectoryDataList();
    getConnector_name_type();
    // 添加窗口大小变化监听
    const handleResize = () => {
      calculateMaxTagCount();
    };
    window.addEventListener('resize', handleResize);
    // 延迟计算以确保DOM已渲染
    setTimeout(calculateMaxTagCount, 100);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateMaxTagCount, sourceType]);

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
  // 自定义选择树组件
  const generatorTreeNodes = useCallback((treeData: TreeDataType[]) => {
    console.log('正在渲染树节点:', treeData);
    if (!Array.isArray(treeData)) {
      console.warn('treeData不是数组:', treeData);
      return null;
    }
    return treeData
      ?.map?.((item) => {
        if (!item || !item.id) {
          console.warn('无效的树节点数据:', item);
          return null;
        }
        const { children, id, ...rest } = item;
        const hasChildren =
          children && Array.isArray(children) && children.length > 0;
        console.log(
          `节点 ${item.name} (id: ${id}) 有子节点:`,
          hasChildren,
          children
        );
        return (
          <TreeNode key={id} {...rest} dataRef={item} title={item.name}>
            {hasChildren ? generatorTreeNodes(children) : null}
          </TreeNode>
        );
      })
      .filter(Boolean); // 过滤掉null值
  }, []);

  //自定义树组件新增
  const AddTree = ({ onClick }: { onClick: () => void }) => {
    return (
      <>
        <div
          style={{
            padding: '8px 12px 12px 0',
            cursor: 'pointer',
            color: '#1890ff',
            transition: 'background-color 0.2s',
            borderRadius: '0 0 6px 6px', // 底部圆角
            backgroundColor: '#fff'
          }}
          onClick={onClick}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              justifyContent: 'flex-start',
              margin: 0
            }}
          >
            <IconPlus style={{ marginRight: '4px' }} />
            新建目录
          </div>
        </div>
      </>
    );
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
          initialValue={typeValue}
          onChange={(value) => {
            setSourceType((value as any).target.value);
            loadTypeChange(value);
            form.setFieldsValue({
              connector_id: undefined
            });
          }}
        >
          <RadioGroup>
            <Radio value="s3">对象存储</Radio>
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
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Select
                placeholder="请选择连接器"
                showSearch
                filterOption={filterOption}
              >
                {connectName.map((option, index) => (
                  <Option key={option.key} value={option.key}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
            {sourceType === 'db' && (
              <FormItem
                label="选择抽取的表："
                field="table_id"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
                rules={[{ required: true, message: '请选择抽取的表' }]}
              >
                <Select
                  onChange={(value) => {
                    handAllTagChange(value);
                  }}
                  ref={selectRef}
                  mode="multiple"
                  maxTagCount={{
                    count: maxTagCounts,
                    // showPopover: true,
                    render: (invisibleTagCount) => {
                      //联调时修改的地方
                      const allTags = form.getFieldValue('table_id') || [];
                      const remainingTags = allTags.slice(maxTagCounts);
                      return (
                        <Tooltip
                          content={remainingTags.map((item, i) => {
                            return (
                              <Tag
                                key={i}
                                style={{
                                  height: '24px',
                                  background: '#E7ECF0',
                                  color: '#0F172A',
                                  borderRadius: '2px',
                                  fontSize: '14px',
                                  // height: '18px',
                                  alignItems: 'center',
                                  margin: '0 2px'
                                }}
                              >
                                {item}
                                <IconClose
                                  style={{
                                    marginLeft: '2px',
                                    fontSize: '12px'
                                  }}
                                  onClick={() => {
                                    const filteredValue = allTags.filter(
                                      (tag) => tag !== item
                                    );
                                    form.setFieldsValue({
                                      table_id: filteredValue
                                    });
                                  }}
                                />
                              </Tag>
                            );
                          })}
                        >
                          <span>+{invisibleTagCount}</span>
                        </Tooltip>
                      );
                    }
                  }}
                  placeholder="请选择抽取的表"
                  style={{ width: '100%', minWidth: 0 }}
                  // defaultValue={['Beijing', 'Shenzhen', 'Wuhan']}
                  allowClear
                  allowCreate
                  onVisibleChange={calculateMaxTagCount}
                >
                  <Option value="all">全部</Option>
                  {options.map((option) => (
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
            // rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Uploads />
          </FormItem>
        )}

        <FormItem
          label="载入形式："
          initialValue="once"
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
              options={{}}
              onOptionsChange={(val) => {
                setExpression(val);
              }}
            ></SchedulerRun>
          </div>
        ) : null}
        {sourceType === 's3' || sourceType === 'hdfs' ? (
          <FormItem
            label="载入位置："
            field="dest_path"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            labelAlign="right"
            rules={[{ required: true, message: '请选择载入位置' }]}
          >
            <Cascader
              expandTrigger="hover"
              placeholder="请输入载入位置"
              style={{ width: '100%' }}
              options={directoryData}
              renderOption={(item) => {
                return <EllipsisPopoverCom value={item.label} />;
              }}
              showSearch={{ retainInputValueWhileSelect: false }}
              dropdownMenuClassName="cascader-dropdown"
            />
          </FormItem>
        ) : (
          <FormItem
            label="载入位置："
            field="dest_path"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            labelAlign="right"
            rules={[{ required: true, message: '请选择载入位置' }]}
          >
            <TreeSelect
              className="db-tree-select"
              placeholder="Please select ..."
              allowClear
              dropdownMenuStyle={{
                maxHeight: 300,
                padding: 0,
                overflow: 'hidden' // 防止外层出现滚动条
              }}
              dropdownRender={(originNode) => (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    maxHeight: 300,
                    position: 'relative',
                    padding: '12px 12px 0 12px'
                  }}
                >
                  {/* 保留原有的树结构 */}
                  <div
                    style={{
                      flex: 1,
                      overflow: 'auto',
                      minHeight: 0,
                      padding: '4px 0'
                    }}
                  >
                    <Tree showLine>{generatorTreeNodes(directoryData)}</Tree>
                  </div>
                  {/* 固定在底部的新建目录 */}
                  <div
                    style={{
                      backgroundColor: '#fff',
                      flexShrink: 0
                    }}
                  >
                    <AddTree
                      onClick={() => {
                        console.log('点击新建目录');
                        // 处理新建目录的逻辑
                      }}
                    />
                  </div>
                </div>
              )}
            >
              {generatorTreeNodes(directoryData)}
            </TreeSelect>
          </FormItem>
        )}
      </Form>
      <div className={Styles.footerBbtnBox}>
        <Button onClick={cancelHan} style={{ marginRight: '12px' }}>
          取消
        </Button>
        <Button onClick={handleSubmit} type="primary" disabled={loading}>
          确认
        </Button>
      </div>
    </div>
  );
};
export default LoadAddModal;
