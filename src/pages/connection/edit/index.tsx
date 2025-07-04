import { Button, Form, Input, Modal, Radio } from '@arco-design/web-react';
import React, { useEffect } from 'react';
// 表单
const FormItem = Form.Item;
// 单选
const RadioGroup = Radio.Group;
const Edit = (props: any) => {
  // 获取表单实例
  const form = props.inEditForm;
  // 判断是s3还是hdfs
  const [storageType, setStorageType] = React.useState(props.editObj.type);
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
              endpoint: props.editObj.config.endpoint,
              access_key: props.editObj.config.access_key,
              secret_key: props.editObj.config.secret_key,
              region: props.editObj.config.region,
              path: props.editObj.config.path
            }
          : {
              host: props.editObj.config.host,
              port: props.editObj.config.port,
              user: props.editObj.config.user,
              path: props.editObj.config.path
            })
      });
    }
  }, [props.editObj]);
  return (
    <div>
      <div className="modal-overlay">
        <Form
          style={{ width: 650 }}
          autoComplete="off"
          form={form}
          disabled={props.editDisabled}
        >
          <FormItem
            label="连接器名称："
            required
            field="name"
            rules={[{ required: true, message: '请输入连接器名称' }]}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            labelAlign="right"
            initialValue={props.editObj.name}
            disabled
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
            initialValue={props.editObj.type}
            disabled
          >
            <RadioGroup
              defaultValue={setStorageType}
              onChange={(value) => {
                setStorageType(value);
              }}
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
                initialValue={props.editObj.config.endpoint}
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
                initialValue={props.editObj.config.access_key}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="AccessKey Secret :"
                field="secret_key"
                rules={[{ required: true, message: '请输入AccessKey Secret' }]}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
                initialValue={props.editObj.config.secret_key}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="区域："
                field="region"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
                initialValue={props.editObj.config.region}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="文件路径："
                field="path"
                rules={[{ required: true, message: '请输入文件路径' }]}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
                initialValue={props.editObj.config.path}
              >
                <Input placeholder="请输入" />
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
                initialValue={props.editObj.config.host}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="Port："
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
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
                initialValue={props.editObj.config.port}
              >
                <Input placeholder="请输入" />
              </FormItem>
              <FormItem
                label="用户名："
                rules={[{ required: true, message: '请输入用户名' }]}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign="right"
                field="user"
                initialValue={props.editObj.config.user}
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
                initialValue={props.editObj.config.path}
              >
                <Input placeholder="请输入" />
              </FormItem>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};
export default Edit;
