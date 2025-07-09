import {
  Button,
  Cascader,
  Form,
  Input,
  Message,
  Radio,
  Select
} from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import Styles from './index.module.css';
import SchedulerRun from '../../../components/scheduler-run';
import { dataLodaAddForm } from '../type';
import { addLoad } from '@/api/loadApi';
import { getConnectionList } from '@/api/connectionApi';
import { directoryData } from '../data/constants';
import { useHistory } from 'react-router';
import { validateName } from '@/utils/valiate';
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
  const history = useHistory();
  // 存放连接器名称表单的数据
  const [connectName, setConnectName] = useState<connecort_nameType[]>([]);
  // 按钮以及输入框的状态
  const [loading, setLoading] = useState(false);
  // 整体表单实例
  const [form] = Form.useForm();
  // 获取表达式的状态
  const [expression, setExpression] = useState({});
  // 提交表单时的校验逻辑
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formValues = await form.validate();
      const { time, day, cycle, ...rest } = formValues;
      const pathId = rest.dest_path.at(-1);
      if (loadVal !== 'once') {
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
        if (res.code == '' && res.status == 200) {
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
  useEffect(() => {
    getConnector_name_type();
  }, []);
  // 自定义下拉框搜索的逻辑

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
            <div style={{ color: '#666', fontSize: 14 }}>
              <div>支持中文，英文，数字，下划线</div>
              <div>名称建议:北京市各区GDP数据_2024</div>
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
            loadTypeChange(value);
          }}
        >
          <RadioGroup>
            <Radio value="s3">对象存储</Radio>
            <Radio value="hdfs">HDFS</Radio>
          </RadioGroup>
        </FormItem>
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
              options={{}}
              onOptionsChange={(val) => {
                setExpression(val);
              }}
            ></SchedulerRun>
          </div>
        ) : null}
        <FormItem
          label="载入位置："
          field="dest_path"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择载入位置' }]}
        >
          <Cascader
            placeholder="请输入载入位置"
            style={{ width: '100%' }}
            options={directoryData}
            showSearch={{ retainInputValueWhileSelect: false }}
            dropdownMenuClassName="cascader-dropdown"
          />
        </FormItem>
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
