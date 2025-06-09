import { Form, Modal, Radio, Select, TreeSelect } from '@arco-design/web-react';
import { IconCalendar } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useImperativeHandle, useState, forwardRef } from 'react';
const EditorialPublishing = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    openEditFrom: () => {
      openEditFrom();
    }
  }));
  const Option = Select.Option;
  const [editPublishing, seteditPublishing] = useState(false);

  const [form] = Form.useForm();
  const [initFromValue, setinitFromValue] = useState({
    publishingtype: '',
    applytype: [],
    organizationSelection: []
  });
  const [selectedValues, setSelectedValues] = useState([]);
  const formItemLayout = {
    labelCol: {
      span: 3
    },
    wrapperCol: {
      span: 20
    }
  };
  const RadioOne = [
    {
      value: 'automatic',
      name: '组织发布'
    },
    {
      value: 'custom',
      name: '公开发布'
    }
  ];
  const options = [
    { value: 'Beijing', name: 'Beijing' },
    { value: 'Shenzhen', name: 'Shenzhen' },
    { value: 'Wuhan', name: 'Wuhan' },
    { value: 'Shanghai', name: 'Shanghai' },
    { value: 'Guangzhou', name: 'Guangzhou' }
  ];
  const treeData = [
    {
      key: 'node1',
      icon: <IconCalendar />,
      title: 'Trunk',
      children: [
        {
          key: 'node2',
          title: 'Leaf'
        }
      ]
    },
    {
      key: 'node3',
      title: 'Trunk2',
      icon: <IconCalendar />,
      children: [
        {
          key: 'node4',
          title: 'Leaf'
        },
        {
          key: 'node5',
          title: 'Leaf'
        }
      ]
    }
  ];
  const openEditFrom = () => {
    seteditPublishing(true);
  };
  const submitEditPublishing = () => {
    seteditPublishing(false);
  };
  const clearEditPublishing = () => {
    seteditPublishing(false);
  };
  const onValuesChange = (changeValue, values) => {
    console.log('onValuesChange: ', changeValue, values);
    // setformvalues(values);
  };
  const handleChange = (value) => {
    if (value.length <= 3) {
      setSelectedValues(value);
    }
  };
  const TreeSelecthandleChange = () => {};
  return (
    <Modal
      title="更改发布范围"
      visible={editPublishing}
      onOk={() => submitEditPublishing()}
      onCancel={() => clearEditPublishing()}
      autoFocus={false}
      focusLock={true}
      style={{
        width: 720
      }}
    >
      <Form
        className="fromstyle"
        form={form}
        {...formItemLayout}
        onValuesChange={onValuesChange}
        initialValues={initFromValue}
      >
        <Form.Item
          label="发布方式："
          field="publishingtype"
          rules={[{ required: true, message: '请选择' }]}
        >
          <Radio.Group
            onChange={(e) => {
              // e.target.value 获取当前选中的值
              console.log('选中的值:', e);
            }}
          >
            {RadioOne.map((e, index) => {
              return (
                <Radio value={e.value} key={index}>
                  {e.name}
                </Radio>
              );
            })}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="应用类型："
          field="applytype"
          rules={[{ required: true, message: '请选择一个选项' }]}
        >
          <Select
            mode="multiple"
            maxTagCount={2}
            placeholder="Select cities"
            defaultValue={['Beijing', 'Shenzhen', 'Wuhan']}
            allowClear
            value={selectedValues}
            onChange={handleChange}
          >
            {options.map((option, index) => (
              <Option
                key={index}
                value={option.value}
                disabled={
                  selectedValues.length >= 2 &&
                  !selectedValues.includes(option.value)
                }
              >
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>{' '}
        <Form.Item
          label="组织选择："
          field="organizationSelection"
          rules={[{ required: true, message: '请选择' }]}
        >
          <TreeSelect
            allowClear
            placeholder="请选择"
            multiple
            // showSearch
            maxTagCount={2}
            treeData={treeData}
            value={initFromValue.organizationSelection}
            onChange={TreeSelecthandleChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});
export default observer(EditorialPublishing);
