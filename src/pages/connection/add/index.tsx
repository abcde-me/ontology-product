import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Select
} from '@arco-design/web-react';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { addconnectionList, updataConnectionList } from '@/api/connectionApi';
import { Connection } from '../type';
import { filterValues } from '@/api/filterValues';
import { validateName } from '@/utils/valiate';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const options = [
  { text: 'MySQL', value: 'MySQL' },
  { text: 'PostgreSQL', value: 'PostgreSQL' },
  { text: 'Doris', value: 'Doris' },
  { text: 'Elasticsearch', value: 'Elasticsearch' }
];
const add = forwardRef((props: any, ref) => {
  // 创建的表单实例
  const [form] = Form.useForm();
  // 添加弹框的状态
  const [visible, setVisible] = React.useState(false);

  // 判断是以什么方式存储(s3:对象存储;hdfs:HDFS存储)
  const [storageType, setStorageType] = useState('s3');

  // 确定按钮的状态
  const [loading, setLoading] = useState<boolean>(false);
  //判断输入框的状态
  const [inputDisabled, setInputDisabled] = useState(false);
  const [fromData, setFromData]: any = useState({});
  // 将方法暴露给父组件
  useImperativeHandle(ref, () => ({
    displayModalView: () => {
      setVisible(true);
      // 添加模式 - 重置表单
      form.resetFields();
      form.setFieldsValue({ type: 's3', name: '', sub_type: 'MySQL' });
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
        user: undefined,
        sub_type: undefined
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
        region: undefined,
        sub_type: undefined
      });
    } else if (value === 'db') {
      form.setFieldsValue({
        region: '',
        host: '',
        port: '',
        database: '',
        user: '',
        password: '',
        sub_type: 'MySQL' // 数据库类型默认MySQL
      });
    } else if (value === 'mq') {
      form.setFieldsValue({
        bootstrapServers: '',
        autoOffsetReset: 'earliest', // 设置偏移重置策略的默认值为earliest
        user: '',
        password: '',
        sub_type: 'Kafka' // 消息队列类型默认Kafka
      });
    }
  };
  // 点击创建的按钮
  // const createConnectionHan = async () => {
  //   try {
  //     const values = await form.validate();
  //     const { type, name, sub_type } = values;
  //     delete values.name;
  //     delete values.type;
  //     // 如果选中有字段，不选的话没有字段的一个函数
  //     // const filteredValues = filterValues(values);
  //     const newfrom = {
  //       name,
  //       type,
  //       sub_type,
  //       config: { ...values }
  //     };
  //     setLoading(true);
  //     setInputDisabled(true);
  //     const res = await addconnectionList(newfrom);
  //     if (res.message == 'ok') {
  //       Message.success('测试通过，连接器创建成功');
  //       setVisible(false);
  //       // 确保数据更新完成后再调用 getListHan
  //       props.getListHan();
  //       resetHan();
  //     } else {
  //       Message.error(res.message);
  //     }
  //   } catch (error) {
  //     console.log('验证失败', error);
  //   } finally {
  //     setLoading(false);
  //     setInputDisabled(false);
  //   }
  // };
  // 去除对象中所有字符串字段的前后空格
  const trimStringValues = <T extends Record<string, unknown>>(obj: T): T => {
    const trimmed = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          (trimmed as Record<string, unknown>)[key] = value.trim();
        } else {
          trimmed[key] = value;
        }
      }
    }
    return trimmed;
  };

  // 点击创建的按钮
  const createConnectionHan = async () => {
    try {
      const values = await form.validate();

      // 去除所有字符串字段的前后空格
      const trimmedValues = trimStringValues(values);
      const { type, name, sub_type, ...configValues } = trimmedValues;

      // 如果选中有字段，不选的话没有字段的一个函数
      // const filteredValues = filterValues(configValues);

      const newfrom = {
        name,
        type,
        sub_type: type === 'db' || type === 'mq' ? sub_type : undefined, // 当类型是db或mq时都包含sub_type
        config: { ...configValues }
      };

      setLoading(true);
      setInputDisabled(true);
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
      setInputDisabled(false);
    }
  };
  const resetHan = () => {
    form.resetFields();
    form.setFieldsValue({ type: 's3' });
    setStorageType('s3');
  };
  // 输入框onchange的正则校验
  return (
    <>
      <Modal
        style={{ width: '760px' }}
        title={
          <div style={{ fontWeight: '500', fontSize: '16px' }}>创建连接器</div>
        }
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
        <>
          <Form
            style={{ width: 700 }}
            autoComplete="off"
            form={form}
            disabled={loading}
            colon={'：'}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            onValuesChange={(values: any) => {
              setFromData(values);
            }}
          >
            <FormItem
              label="连接器名称"
              required
              field="name"
              rules={[
                {
                  validator: (value, cb) => {
                    const trimmedValue = value ? value.trim() : '';
                    if (!trimmedValue) {
                      return cb('请输入连接器名称');
                    }
                    if (validateName(trimmedValue).isValid == false) {
                      return cb(validateName(trimmedValue).errorMessage);
                    }
                    return cb();
                  }
                }
              ]}
            >
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem
              label="连接器类型"
              field="type"
              rules={[{ required: true, message: '请选择类型' }]}
              initialValue="s3"
            >
              <RadioGroup
                defaultValue="s3"
                onChange={(value) => handleStorageTypeChange(value)}
              >
                <Radio value="s3">对象存储(S3)</Radio>
                <Radio value="hdfs">HDFS</Radio>
                <Radio value="db">数据库</Radio>
                <Radio value="mq">消息队列</Radio>
              </RadioGroup>
            </FormItem>
            <span
              style={{
                margin: '13px 0px 13px 0px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              连接信息
            </span>
            {storageType == 's3' ? (
              <div>
                <FormItem label="region" field="region">
                  <Input placeholder="请输入服务端所在地域" />
                </FormItem>
                <FormItem
                  label="Endpoint"
                  field="endpoint"
                  rules={[{ required: true, message: '请输入Endpoint' }]}
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="Access Key"
                  field="access_key"
                  rules={[{ required: true, message: '请输入Access Key' }]}
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="Secret Access Key"
                  field="secret_key"
                  rules={[
                    { required: true, message: '请输入Secret Access Key' }
                  ]}
                >
                  <Input placeholder="请输入" />
                </FormItem>
                {/* <FormItem
                  label="区域"
                  field="region"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  
                >
                  <Input placeholder="请输入" />
                </FormItem> */}
                <FormItem
                  label="文件路径"
                  field="path"
                  rules={[{ required: true, message: '请输入文件路径' }]}
                >
                  <Input placeholder="<桶名>/<文件夹路径>或<桶名>" />
                </FormItem>
              </div>
            ) : storageType == 'hdfs' ? (
              <div>
                <FormItem
                  label="Host"
                  rules={[{ required: true, message: '请输入Host' }]}
                  field="host"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="Port"
                  field="port"
                  required
                  rules={[
                    {
                      validator: (value, cb) => {
                        const trimmedValue = value ? value.trim() : '';
                        if (!trimmedValue) {
                          return cb('请输入Port端口号');
                        }
                        const regex =
                          /^(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]?\d{1,4}|0)$/;
                        if (!regex.test(trimmedValue)) {
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
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                  field="user"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="目录路径"
                  required
                  field="path"
                  rules={[
                    {
                      validator: (value, cb) => {
                        const trimmedValue = value ? value.trim() : '';
                        if (!trimmedValue) {
                          return cb('请输入目录路径');
                        }
                        const regex = /^\/.*/;
                        if (!regex.test(trimmedValue)) {
                          return cb('输入的路径需要以/开头');
                        }
                        return cb();
                      }
                    }
                  ]}
                >
                  <Input placeholder="请输入HDFS日录路径，如/user/data" />
                </FormItem>
              </div>
            ) : storageType == 'mq' ? (
              <div>
                <FormItem
                  label="数据库类型"
                  field="sub_type"
                  rules={[{ required: true, message: '请选择数据库类型' }]}
                  disabled={inputDisabled}
                >
                  <Select placeholder="请选择" defaultValue="Kafka">
                    <Option value="Kafka">Kafka</Option>
                  </Select>
                </FormItem>
                <FormItem
                  label="集群的入口地址列表"
                  rules={[{ required: true, message: '请输入地址列表' }]}
                  field="bootstrapServers"
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="偏移重置策略"
                  rules={[{ required: true, message: '请选择偏移重置策略' }]}
                  field="autoOffsetReset"
                >
                  <Select placeholder="请选择" defaultValue="earliest">
                    <Option value="earliest">earliest</Option>
                    <Option value="latest">latest</Option>
                  </Select>
                </FormItem>
                <FormItem label="用户名" field="user">
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem label="密码" field="password">
                  <Input.Password placeholder="请输入" />
                </FormItem>
              </div>
            ) : (
              <div>
                <FormItem
                  label="所属系统"
                  field="system"
                  disabled={inputDisabled}
                >
                  <Input placeholder="请输入所属系统" />
                </FormItem>
                <FormItem
                  label="数据库类型"
                  field="sub_type"
                  rules={[{ required: true, message: '请选择数据库类型' }]}
                  disabled={inputDisabled}
                >
                  <Select
                    placeholder="请选择"
                    // onChange={(value) =>
                    //   Message.info({
                    //     content: `You select ${value}.`,
                    //     showIcon: true
                    //   })
                    // }
                    defaultValue="MySQL"
                  >
                    {options.map((option, index) => (
                      <Option key={option.value} value={option.value}>
                        {option.text}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem
                  label="主机名"
                  field="host"
                  rules={[{ required: true, message: '请输入主机名' }]}
                  disabled={inputDisabled}
                >
                  <Input placeholder="请输入，如localhost，10.2.2.1" />
                </FormItem>
                <FormItem
                  label="端口"
                  field="port"
                  rules={[{ required: true, message: '请输入端口' }]}
                  disabled={inputDisabled}
                >
                  <Input placeholder="请输入，如3306" />
                </FormItem>
                {form.getFieldValue('sub_type') !== 'Elasticsearch' && (
                  <FormItem
                    label="数据库名"
                    field="database"
                    rules={[{ required: true, message: '请输入数据库名' }]}
                    disabled={inputDisabled}
                  >
                    <Input placeholder="请输入" />
                  </FormItem>
                )}
                <FormItem
                  label="用户名"
                  field="user"
                  required={
                    form.getFieldValue('sub_type') !== 'Elasticsearch' &&
                    form.getFieldValue('sub_type') !== 'Doris'
                  }
                  rules={[
                    {
                      validator: (value, cb) => {
                        // 获取当前表单中的数据库类型
                        const currentSubType = form.getFieldValue('sub_type');
                        // 当数据库类型为ES或Doris时，用户名非必填
                        if (
                          currentSubType === 'Elasticsearch' ||
                          currentSubType === 'Doris'
                        ) {
                          return cb();
                        }
                        // 其他数据库类型时，用户名必填
                        if (!value || value.trim() === '') {
                          return cb('请输入用户名');
                        }
                        return cb();
                      }
                    }
                  ]}
                  disabled={inputDisabled}
                >
                  <Input placeholder="请输入" />
                </FormItem>
                <FormItem
                  label="密码"
                  field="password"
                  required={
                    form.getFieldValue('sub_type') !== 'Elasticsearch' &&
                    form.getFieldValue('sub_type') !== 'Doris'
                  }
                  rules={[
                    {
                      validator: (value, cb) => {
                        // 获取当前表单中的数据库类型
                        const currentSubType = form.getFieldValue('sub_type');
                        // 当数据库类型为Elasticsearch或Doris时，密码非必填
                        if (
                          currentSubType === 'Elasticsearch' ||
                          currentSubType === 'Doris'
                        ) {
                          return cb();
                        }
                        // 其他数据库类型时，密码必填
                        if (!value || value.trim() === '') {
                          return cb('请输入密码');
                        }
                        return cb();
                      }
                    }
                  ]}
                  disabled={inputDisabled}
                >
                  <Input.Password placeholder="请输入" />
                </FormItem>
              </div>
            )}
          </Form>
        </>
      </Modal>
    </>
  );
});
export default add;
