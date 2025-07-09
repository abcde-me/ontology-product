import {
  Button,
  Cascader,
  Form,
  Input,
  Message,
  Radio,
  Select
} from '@arco-design/web-react';
import React, { useEffect, useRef, useState } from 'react';
import Styles from './index.module.css';
import SchedulerRun from '../../../components/scheduler-run';
import { directoryData } from '../data/constants';
import { editLoad } from '@/api/loadApi';
import './index.css';
import { validateName } from '@/utils/valiate';
// 单选框实例
const RadioGroup = Radio.Group;

const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;
const Edit = (props) => {
  const SchedulerRunRef = useRef<HTMLFormElement>(null);
  const form = props.editForm;
  // 载入类型的默认值
  const [loadVal, setLoadVal] = useState(props.detailData.load_type);
  // 按钮以及表单的禁用状态
  const [loading, setLoading] = useState(false);
  // 默认表达式的状态
  const [obj, setObj] = useState({}) as any;
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
  const treeData = [
    {
      title: '酒店数据目录',
      value: 'hotel',
      children: [
        { title: '北京市豪华酒店', value: '北京市豪华酒店' },
        { title: '上海市豪华酒店', value: '上海市豪华酒店' }
      ]
    },
    {
      title: '餐厅数据',
      value: 'restaurant',
      children: [
        { title: '广州餐厅', value: '广州餐厅' },
        { title: '深圳餐厅', value: '深圳餐厅' }
      ]
    }
  ];
  // 点击取消按钮的逻辑
  const cancelHan = () => {
    // 点击取消隐藏弹框并且重置表单数据
    props.hideEditModalHan();
  };
  // 点击确定
  const okHan = async () => {
    // const valid = await SchedulerRunRef.current?.validate();
    // if (!valid) return
    try {
      setLoading(true);
      const formValues = await form.validate();
      const { time, day, cycle, ...rest } = formValues;
      const pathId = rest.dest_path.at(-1);
      if (props.detailData.load_type !== 'once') {
        const formData = {
          task_id: Number(props.loadId),
          task_name: rest.name,
          run_cycle: {
            type: 1,
            cycle_text: obj
          },
          dest_path_id: pathId
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
          dest_path_id: pathId
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
          dest_path: props.detailData.data_path_name || []
        }}
      >
        <FormItem
          label="任务名称："
          required
          initialValue={props.detailData.name}
          field="name"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
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
          initialValue={props.detailData.source_type}
        >
          <RadioGroup disabled={true}>
            <Radio value="s3">对象存储</Radio>
            <Radio value="hdfs">HDFS</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="绑定连接器："
          field="connector_name"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请输入任务名称' }]}
          initialValue={props.detailData.connector_name}
        >
          <Select
            placeholder="请选择连接器"
            disabled={true}
            showSearch
          ></Select>
        </FormItem>
        <FormItem
          label="载入形式："
          initialValue={props.detailData.load_type}
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
