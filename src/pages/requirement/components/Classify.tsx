import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Tooltip,
  ColorPicker,
  Select,
  Checkbox
} from '@arco-design/web-react';
import {
  IconDelete,
  IconPlus,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import { uuid } from '@/models/utils';
import './Classify.scss';

interface ClassifyComponentProps {
  type: any;
  getDetailObj: any;
}
// 选项配置 1 单选 2 多选 3 输入框
const optionConfig = [
  {
    label: '单选',
    value: 1
  },
  {
    label: '多选',
    value: 2
  },
  {
    label: '输入框',
    value: 3
  }
];
const Classify = (props: ClassifyComponentProps) => {
  const { type, getDetailObj } = props;
  const [form] = Form.useForm();
  const Option = Select.Option;
  const FormItem = Form.Item;
  // 当前选择类型
  const [currentType, setCurrentType] = useState(1);
  // 文本分类内容
  const [textRelations, setTextRelations] = useState([
    {
      id: uuid(),
      order_num: 1,
      attribute_group_name: '', //属性组名称
      attribute_group_class: 1, //1单选/2多选/3输入框
      attribute_group_type: 2, //1必选/2非必选
      file_label_attribute: [
        {
          id: uuid(),
          order_num: 1, //排序
          attribute_name_cn: '', //属性中文名称(展示名称)
          attribute_name_en: '', //属性英文名称(存储名称)
          input_type: 1 //输入类型：1选项，2输入框
        }
      ]
    }
  ]);
  // 处理基本字段变更
  const handleFieldChange = (index, field, value) => {
    const newData = [...textRelations];
    newData[index][field] = value;
    setTextRelations(newData);
  };
  // 删除数组项
  const removeArrayItem = (itemIndex) => {
    const newTextRelations = textRelations.filter(
      (_, index) => index !== itemIndex
    );
    setTextRelations(newTextRelations);
  };

  const addAttribute = (groupIndex) => {
    const newData = [...textRelations];
    const newAttribute = {
      id: uuid(),
      order_num: newData[groupIndex].file_label_attribute.length + 1,
      attribute_name_cn: '',
      attribute_name_en: '',
      input_type: 1
    };
    newData[groupIndex].file_label_attribute.push(newAttribute);
    setTextRelations(newData);
  };

  const removeAttribute = (groupIndex, attrIndex) => {
    const newData = [...textRelations];
    newData[groupIndex].file_label_attribute.splice(attrIndex, 1);
    // 重新计算排序号
    newData[groupIndex].file_label_attribute.forEach((item, idx) => {
      item.order_num = idx + 1;
    });
    setTextRelations(newData);
  };
  useEffect(() => {
    if (type === 'detail') {
      setTextRelations(getDetailObj?.file_labels);
    }
  }, [getDetailObj]);
  return (
    <div className="classify-warp">
      <Form
        form={form}
        disabled={type === 'detail'}
        onValuesChange={(_, val) => {
          // setPublishData({ ...publishData, val })
        }}
        layout="inline"
        labelAlign="right"
        labelCol={{ flex: 'none' }}
        wrapperCol={{ flex: 1 }}
      >
        {textRelations &&
          textRelations.map((item, index) => {
            return (
              <div className="classify-item" key={index}>
                <div className="classify-relation-item">
                  <FormItem
                    style={{ paddingLeft: 16 }}
                    label="属性名称"
                    rules={[{ required: true, message: '请输入属性名称' }]}
                  >
                    <Input
                      placeholder="请输入属性名称"
                      style={{ width: 260 }}
                      value={item.attribute_group_name}
                      onChange={(value) => {
                        handleFieldChange(index, 'attribute_group_name', value);
                      }}
                    />
                  </FormItem>
                  <FormItem label={null} style={{ padding: 0 }}>
                    <Select
                      allowClear
                      placeholder="请选择输入类型"
                      style={{ width: 154 }}
                      // value={item.attribute_group_class}
                      onChange={(value) => {
                        setCurrentType(value);
                        handleFieldChange(
                          index,
                          'attribute_group_class',
                          value
                        );
                      }}
                    >
                      {optionConfig?.map((item) => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                  <FormItem label={null}>
                    <Checkbox
                      style={{ whiteSpace: 'nowrap' }}
                      checked={item?.attribute_group_type === 1}
                      onChange={(checked) => {
                        handleFieldChange(
                          index,
                          'attribute_group_type',
                          checked ? 1 : 2
                        );
                      }}
                    >
                      必须标注
                    </Checkbox>
                  </FormItem>
                  <FormItem label={null}>
                    {/* 添加选项 */}
                    <IconPlus
                      className={`${type === 'detail' ? 'disabled-icon' : ''}`}
                      fontSize={18}
                      onClick={() => {
                        // 添加属性逻辑补充 - 在按钮位置(数组开头)添加新属性
                        setTextRelations(
                          textRelations.map((group, groupIndex) => {
                            if (groupIndex === index) {
                              return {
                                ...group,
                                file_label_attribute: [
                                  // 新属性插入到数组开头
                                  {
                                    id: uuid(),
                                    // 保持排序值从1开始
                                    order_num: 1,
                                    attribute_name_cn: '',
                                    attribute_name_en: '',
                                    input_type: 1
                                  },
                                  // 原有属性排序值+1
                                  ...(group.file_label_attribute || []).map(
                                    (attr) => ({
                                      ...attr,
                                      order_num: attr.order_num + 1
                                    })
                                  )
                                ]
                              };
                            }
                            return group;
                          })
                        );
                      }}
                    />
                  </FormItem>
                  <FormItem label={null}>
                    {textRelations?.length > 1 && (
                      <IconDelete
                        className={`${type === 'detail' ? 'disabled-icon' : ''}`}
                        fontSize={18}
                        onClick={() => {
                          if (type !== 'detail') {
                            removeArrayItem(index);
                            return;
                          }
                        }}
                      />
                    )}
                  </FormItem>
                </div>
                {item.file_label_attribute?.length > 0 && currentType !== 3 && (
                  <div className="attribute-list">
                    <div className="attribute-title">
                      {currentType === 1
                        ? '单选选项'
                        : currentType === 2
                          ? '多选选项'
                          : ''}
                    </div>
                    {item.file_label_attribute?.map((attr, attrIndex) => (
                      <div key={attr.id} className="attribute-item">
                        <FormItem
                          rules={[
                            { required: true, message: '请输入选项名称' }
                          ]}
                          label={`选项 ${attr.order_num}`}
                        >
                          <Input
                            placeholder="用于存储标注结果"
                            value={attr.attribute_name_cn}
                            onChange={(value) => {
                              const newData = [...textRelations];
                              newData[index].file_label_attribute[
                                attrIndex
                              ].attribute_name_cn = value;
                              setTextRelations(newData);
                            }}
                          />
                        </FormItem>
                        <FormItem
                          label={
                            <div>
                              展示名称{' '}
                              <Tooltip content="展示在标注页面的名称">
                                <IconQuestionCircle />
                              </Tooltip>
                            </div>
                          }
                        >
                          <Input
                            placeholder="展示在标注页面的名称"
                            value={attr.attribute_name_en}
                            onChange={(value) => {
                              const newData = [...textRelations];
                              newData[index].file_label_attribute[
                                attrIndex
                              ].attribute_name_en = value;
                              setTextRelations(newData);
                            }}
                          />
                        </FormItem>
                        <FormItem label={null}>
                          <Checkbox
                            style={{ whiteSpace: 'nowrap' }}
                            checked={
                              item?.file_label_attribute[attrIndex]
                                .input_type === 1
                            }
                            onChange={(checked) => {
                              handleFieldChange(
                                index,
                                'input_type',
                                checked ? 1 : 2
                              );
                            }}
                          >
                            可输入文本
                          </Checkbox>
                        </FormItem>
                        <FormItem label={null}>
                          <IconDelete
                            className={`${type === 'detail' ? 'disabled-icon' : ''}`}
                            fontSize={18}
                            onClick={() => {
                              if (type !== 'detail') {
                                removeAttribute(index, attrIndex);
                                return;
                              }
                            }}
                          />
                        </FormItem>
                      </div>
                    ))}
                  </div>
                )}
                <div className="add-btn">
                  <Button
                    disabled={type === 'detail'}
                    onClick={() => {
                      // 在按钮的位置添加新数据，不在最后一行添加
                      // 修复：在当前位置插入新数据而非添加到数组末尾
                      const newItem = {
                        id: uuid(),
                        order_num: 1,
                        attribute_group_name: '', //属性组名称
                        attribute_group_class: 1, //1单选/2多选/3输入框
                        attribute_group_type: 2, //1必选/2非必选
                        file_label_attribute: []
                      };
                      // 创建新数组并在指定位置插入（假设按钮位置对应索引index）
                      const newTextRelations = [...textRelations];
                      newTextRelations.splice(index, 0, newItem);
                      // 更新排序值
                      newTextRelations.forEach((item, i) => {
                        item.order_num = i + 1;
                      });
                      setTextRelations(newTextRelations);
                    }}
                  >
                    <IconPlus
                      className={`${type === 'detail' ? 'disabled-icon' : ''}`}
                    />
                    添加属性
                  </Button>
                </div>
              </div>
            );
          })}
      </Form>
    </div>
  );
};
export { Classify };
