import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio
} from '@arco-design/web-react';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import '../index.css';
import { addconnectionList, updataConnectionList } from '@/api/connectionApi';
import { Connection } from '../type';
import { filterValues } from '@/api/filterValues';
import { validateName } from '@/utils/valiate';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const add = forwardRef((props: any, ref) => {
  // 创建的表单实例
  const [form] = Form.useForm();
  // 添加弹框的状态
  const [visible, setVisible] = React.useState(false);

  // 判断是以什么方式存储(s3:对象存储;hdfs:HDFS存储)
  const [storageType, setStorageType] = useState('s3');

  // 确定按钮的状态
  const [loading, setLoading] = useState<boolean>(false);
  // 将方法暴露给父组件
  useImperativeHandle(ref, () => ({
    displayModalView: () => {
      setVisible(true);
      // 添加模式 - 重置表单
      form.resetFields();
      form.setFieldsValue({ type: 's3', name: '' });
      setStorageType('s3');
    }
  }));
  const handleStorageTypeChange = (value: string) => {
    setStorageType(value);
    // 清空与存储类型相关的字段
    if (value === 's3') {
      form.setFieldsValue({
        endpoint: '',
        access_key: '',
        secret_key: '',
        region: '',
        path: '',
        host: undefined, // 清空 hdfs 字段
        port: undefined,
        user: undefined
      });
    } else if (value === 'hdfs') {
      form.setFieldsValue({
        host: '',
        port: '',
        user: 'root', // 默认值
        path: '',
        endpoint: undefined, // 清空 s3 字段
        access_key: undefined,
        secret_key: undefined,
        region: undefined
      });
    }
  };
  // 点击创建的按钮
  const createConnectionHan = async () => {
    try {
      const values = await form.validate();
      const { type, name } = values;
      delete values.name;
      delete values.type;
      // 如果选中有字段，不选的话没有字段的一个函数
      // const filteredValues = filterValues(values);
      const newfrom = {
        name,
        type,
        config: { ...values }
      };
      setLoading(true);
      const res = await addconnectionList(newfrom);
      if (res.message == 'ok') {
        Message.success('测试通过，连接器创建成功');
        setVisible(false);
        // 确保数据更新完成后再调用 getListHan
        props.getListHan();
        resetHan();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.log('验证失败', error);
    } finally {
      setLoading(false);
    }
  };
  const resetHan = () => {
    form.resetFields();
    form.setFieldsValue({ type: 's3' });
    setStorageType('s3');
  };
  // 输入框onchange的正则校验
  const [values, setValues] = useState('');
  return (
    <div>
      <Modal
        style={{ width: '700px' }}
        title={'创建连接器'}
        visible={visible}
        autoFocus={false}
        focusLock={false}
        unmountOnExit={true}
        onCancel={() => {
          // 点击关闭隐藏弹框
          setVisible(false);
          resetHan();
        }}
        footer={
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button
              onClick={() => {
                setVisible(false);
                resetHan();
              }}
              style={{ fontSize: '14px', fontWeight: '400' }}
            >
              取消
            </Button>
            <Button
              loading={loading}
              type="primary"
              onClick={createConnectionHan}
              style={{
                marginLeft: '10px',
                fontSize: '14px',
                fontWeight: '400'
              }}
            >
              {'测试并创建'}
            </Button>
          </div>
        }
      >
        <div className="modal-overlay">
          <Form
            style={{ width: 650 }}
            autoComplete="off"
            form={form}
            disabled={loading}
          >
            <FormItem
              label="连接器名称："
              required
              field="name"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
              labelAlign="right"
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
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem
              label="连接器类型："
              field="type"
              rules={[{ required: true, message: '请选择类型' }]}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
              labelAlign="right"
              initialValue="s3"
            >
              <RadioGroup
                defaultValue="s3"
                onChange={(value) => handleStorageTypeChange(value)}
              >
                <Radio value="s3">对象存储</Radio>
                <Radio value="hdfs">HDFS</Radio>
              </RadioGroup>
            </FormItem>
            <span
              style={{
                margin: '13px 0px 13px 0px',
                fontSize: '17px',
                fontWeight: '500'
              }}
            >
              连接信息
            </span>
            {storageType == 's3' ? (
              <div>
                <FormItem
                  label="Endpoint："
                  field="endpoint"
                  rules={[{ required: true, message: '请输入Endpoint' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="AccessKey lD :"
                  field="access_key"
                  rules={[{ required: true, message: '请输入AccessKey lD' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="AccessKey Secret :"
                  field="secret_key"
                  rules={[
                    { required: true, message: '请输入AccessKey Secret' }
                  ]}
                  labelCol={{ span: 5, style: { whiteSpace: 'nowrap' } }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                {/* <FormItem
                  label="区域："
                  field="region"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                >
                  <Input placeholder="请输入" />
                </FormItem> */}
                <FormItem
                  label="文件路径："
                  field="path"
                  rules={[{ required: true, message: '请输入文件路径' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                >
                  <Input placeholder="<桶名>/<文件夹路径>或<桶名>" />
                </FormItem>
              </div>
            ) : (
              <div>
                <FormItem
                  label="Host："
                  rules={[{ required: true, message: '请输入Host' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                  field="host"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="Port："
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                  field="port"
                  required
                  rules={[
                    {
                      validator: (value, cb) => {
                        if (!value || value.trim() === '') {
                          return cb('请输入Port端口号');
                        }
                        const regex =
                          /^(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]?\d{1,4}|0)$/;
                        if (!regex.test(value)) {
                          return cb('请输入合法的端口号，范围在0-65535之间');
                        }
                        return cb();
                      }
                    }
                  ]}
                >
                  <Input placeholder="请输入HDFS端口号，如8020" />
                </FormItem>
                <FormItem
                  initialValue={'root'}
                  label="用户名："
                  rules={[{ required: true, message: '请输入用户名' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                  field="user"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="目录路径："
                  rules={[{ required: true, message: '请输入目录路径' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  labelAlign="right"
                  field="path"
                >
                  <Input placeholder="请输入HDFS日录路径，如/user/data" />
                </FormItem>
              </div>
            )}
          </Form>
        </div>
      </Modal>
    </div>
  );
});
export default add;
