import { validateName } from '@/utils/valiate';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Select,
  FormInstance
} from '@arco-design/web-react';
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { connectorDetailType } from '../type';

// 表单
const FormItem = Form.Item;
const Option = Select.Option;
// const options = ['MySQL', 'PostgreSQL'];
const options = [
  { text: 'MySQL', value: 'MySQL' },
  { text: 'PostgreSQL', value: 'PostgreSQL' }
];
// 单选
const RadioGroup = Radio.Group;

// 定义组件Props接口
interface EditProps {
  inEditForm: FormInstance;
  editObj: connectorDetailType;
  editDisabled: boolean;
}

// 定义ref暴露的方法接口
export interface EditRef {
  getPasswordChanged: () => boolean;
}

const Edit = forwardRef<EditRef, EditProps>((props, ref) => {
  // 获取表单实例
  const form = props.inEditForm;
  // 判断是s3还是hdfs
  const [storageType, setStorageType] = React.useState(props.editObj.type);
  // 跟踪密码是否被修改过
  const [passwordChanged, setPasswordChanged] = React.useState(false);
  // 存储原始密码值用于比较
  const [originalPassword] = React.useState('****');

  // 暴露密码修改状态给父组件
  useImperativeHandle(ref, () => ({
    getPasswordChanged: () => passwordChanged
  }));

  useEffect(() => {
    // 每次 props.editObj 变化时，更新 storageType
    if (props.editObj) {
      setStorageType(props.editObj.type);
      // 重置表单并设置初始值
      form.resetFields();
      form.setFieldsValue({
        ...props.editObj,
        type: props.editObj.type,
        ...(props.editObj.type === 's3'
          ? {
              endpoint: props.editObj.config?.endpoint,
              access_key: props.editObj.config?.access_key,
              secret_key: props.editObj.config?.secret_key,
              region: props.editObj.config?.region,
              path: props.editObj.config?.path
            }
          : props.editObj.type === 'hdfs'
            ? {
                host: props.editObj.config?.host,
                port: props.editObj.config?.port,
                user: props.editObj.config?.user,
                path: props.editObj.config?.path
              }
            : {
                region: props.editObj.config?.region,
                sub_type: props.editObj.sub_type,
                host: props.editObj.config?.host,
                port: props.editObj.config?.port,
                database: props.editObj.config?.database,
                user: props.editObj.config?.user,
                password: '****'
              })
      });
    }
  }, [props.editObj]);
  return (
    <>
      <Form
        style={{ width: 700 }}
        autoComplete="off"
        form={form}
        disabled={props.editDisabled}
        colon={'：'}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
      >
        <FormItem
          label="连接器名称"
          required
          field="name"
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
          initialValue={props.editObj.name}
          disabled
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="连接器类型"
          field="type"
          rules={[{ required: true, message: '请选择类型' }]}
          initialValue={props.editObj.type}
          disabled
        >
          <RadioGroup
            defaultValue={setStorageType}
            onChange={(value) => {
              setStorageType(value);
            }}
          >
            <Radio value="s3">对象存储(S3)</Radio>
            <Radio value="hdfs">HDFS</Radio>
            <Radio value="db">数据库</Radio>
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
            <FormItem
              label="Endpoint"
              field="endpoint"
              rules={[{ required: true, message: '请输入Endpoint' }]}
              initialValue={props.editObj.config?.endpoint}
            >
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem
              label="AccessKey ID"
              field="access_key"
              rules={[{ required: true, message: '请输入AccessKey ID' }]}
              initialValue={props.editObj.config?.access_key}
            >
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem
              label="AccessKey Secret"
              field="secret_key"
              rules={[{ required: true, message: '请输入AccessKey Secret' }]}
              initialValue={props.editObj.config?.secret_key}
            >
              <Input placeholder="请输入" />
            </FormItem>
            {/* <FormItem
                label="区域"
                field="region"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
                initialValue={props.editObj.config.region}
              >
                <Input placeholder="请输入" />
              </FormItem> */}
            <FormItem
              label="文件路径"
              field="path"
              rules={[{ required: true, message: '请输入文件路径' }]}
              initialValue={props.editObj.config?.path}
            >
              <Input placeholder="请输入" />
            </FormItem>
          </div>
        ) : storageType == 'hdfs' ? (
          <div>
            <FormItem
              label="Host"
              field="host"
              rules={[{ required: true, message: '请输入Host' }]}
              initialValue={props.editObj.config?.host}
            >
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem
              label="Port"
              required
              field="port"
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
              initialValue={props.editObj.config?.port}
            >
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
              field="user"
              initialValue={props.editObj.config?.user}
            >
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem
              label="目录路径"
              required
              field="path"
              initialValue={props.editObj.config?.path}
              rules={[
                {
                  validator: (value, cb) => {
                    if (!value || value.trim() === '') {
                      return cb('请输入目录路径');
                    }
                    const regex = /^\/.*/;
                    if (!regex.test(value)) {
                      return cb('输入的路径需要以/开头');
                    }
                    return cb();
                  }
                }
              ]}
            >
              <Input placeholder="请输入" />
            </FormItem>
          </div>
        ) : (
          <>
            <div>
              <FormItem
                label="所属系统"
                field="system"
                initialValue={props.editObj.config?.system}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="数据库类型"
                field="sub_type"
                rules={[{ required: true, message: '请选择数据库类型' }]}
                initialValue={props.editObj.sub_type}
              >
                <Select
                  placeholder="请选择数据库类型"
                  onChange={(value) =>
                    Message.info({
                      content: `You select ${value}.`,
                      showIcon: true
                    })
                  }
                  disabled={true}
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
                initialValue={props.editObj.config?.host}
              >
                <Input placeholder="请输入，如localhost，10.2.2.1" />
              </FormItem>
              <FormItem
                label="端口"
                field="port"
                rules={[{ required: true, message: '请输入端口' }]}
                initialValue={props.editObj.config?.port}
              >
                <Input placeholder="请输入，如3306" />
              </FormItem>
              <FormItem
                label="数据库名"
                field="database"
                rules={[{ required: true, message: '请输入数据库名' }]}
                initialValue={props.editObj.config?.database}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="用户名"
                field="user"
                rules={[{ required: true, message: '请输入用户名' }]}
                initialValue={props.editObj.config?.user}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="密码"
                field="password"
                rules={[{ required: true, message: '请输入密码' }]}
                initialValue="****"
              >
                <Input.Password
                  placeholder="请输入"
                  defaultValue="****"
                  visibilityToggle={false}
                  onChange={(value) => {
                    // 如果输入值与原始密码不同，标记为已修改
                    if (value !== originalPassword) {
                      setPasswordChanged(true);
                    } else {
                      setPasswordChanged(false);
                    }
                  }}
                />
              </FormItem>
            </div>
          </>
        )}
      </Form>
    </>
  );
});
export default Edit;
