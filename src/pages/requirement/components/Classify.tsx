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
  getClassIfyData: any;
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
  const { type, getDetailObj, getClassIfyData } = props;
  const [formClassify] = Form.useForm();
  const Option = Select.Option;
  const FormItem = Form.Item;
  // 当前选择类型
  const [currentType, setCurrentType] = useState(1);
  // 文本分类内容
  const [textRelations, setTextRelations] = useState([
    {
      attribute_id: uuid(),
      order_num: 1,
      attribute_group_name: '', //属性组名称
      attribute_group_class: 1, //1单选/2多选/3输入框
      attribute_group_type: 2, //1必选/2非必选
      file_label_attribute: [
        {
          attribute_id: uuid(),
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

  useEffect(() => {
    getClassIfyData(textRelations, formClassify);
  }, [textRelations]);

  return (
    <div className="classify-warp">
      <Form
        form={formClassify}
        disabled={type === 'detail'}
        onValuesChange={(_, val) => {
          setTextRelations({ ...textRelations, ...val });
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
                    field={`attribute_group_name + ${item?.attribute_id}`}
                    rules={[
                      {
                        required: true,
                        validateTrigger: ['onChange', 'onBlur'],
                        validator: (value, callback) => {
                          // 检查内容是否为空或只包含空格
                          if (!value || value.trim() === '') {
                            callback('请输入属性名称');
                          } else {
                            // 排除当前项，检查同组其他项是否有相同的属性名称
                            const trimmedValue = value.trim();
                            const hasDuplicate = textRelations.some(
                              (otherItem, otherIndex) => {
                                return (
                                  otherIndex !== index &&
                                  otherItem.attribute_group_name &&
                                  otherItem.attribute_group_name.trim() ===
                                    trimmedValue
                                );
                              }
                            );

                            if (hasDuplicate) {
                              callback('属性名称不能重复');
                            } else {
                              callback();
                            }
                          }
                        }
                      }
                    ]}
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
                        // 切换到输入框的时候情况选项内容
                        if (value === 3) {
                          setTextRelations(
                            textRelations.map((group, groupIndex) => {
                              if (groupIndex === index) {
                                return {
                                  ...group,
                                  file_label_attribute: []
                                };
                              }
                              return group;
                            })
                          );
                        }
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
                        // 修改逻辑 - 增加的时候在倒数第二个添加
                        setTextRelations(
                          textRelations.map((group, groupIndex) => {
                            if (groupIndex === index) {
                              return {
                                ...group,
                                file_label_attribute: [
                                  // 新属性插入到数组开头
                                  {
                                    attribute_id: uuid(),
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
                    <div className="attribute-header-content">
                      <div className="attribute-title">
                        {currentType === 1
                          ? '单选选项'
                          : currentType === 2
                            ? '多选选项'
                            : ''}
                      </div>
                      <Checkbox
                        disabled={type === 'detail'}
                        style={{ whiteSpace: 'nowrap' }}
                        checked={
                          item.file_label_attribute.some(
                            (item) => item.input_type === 2
                          )
                            ? true
                            : false
                        }
                        onChange={(checked) => {
                          // 选中的时候在数组最后一个增加一项 取消选中删除，再次选择增加
                          if (checked) {
                            const newData = [...textRelations];
                            newData[index].file_label_attribute.push({
                              attribute_id: uuid(),
                              order_num:
                                newData[index].file_label_attribute.length + 1,
                              attribute_name_cn: '标注时的输入内容',
                              attribute_name_en: '其他',
                              input_type: 2
                            });
                            setTextRelations(newData);
                          } else {
                            // 取消选中的时候删除增加的内容
                            if (textRelations?.length > 0) {
                              const newItems = [...textRelations];
                              newItems[index]?.file_label_attribute.pop();
                              setTextRelations(newItems);
                            }
                          }
                        }}
                      >
                        支持手动输入
                      </Checkbox>
                    </div>
                    {item.file_label_attribute?.map((attr, attrIndex) => (
                      <div key={attr.attribute_id} className="attribute-item">
                        <FormItem
                          field={`attribute_name_cn_${attr.attribute_id}`}
                          rules={[
                            {
                              required: true,
                              validateTrigger: ['onChange', 'onBlur'],
                              validator: (value, callback) => {
                                // 检查内容是否为空或只包含空格
                                if (!value || value.trim() === '') {
                                  callback('请输入选项名称');
                                } else {
                                  // 排除当前项，检查同组其他项是否有相同的选项名称
                                  const trimmedValue = value.trim();
                                  const hasDuplicate =
                                    item.file_label_attribute.some(
                                      (otherAttr, otherAttrIndex) => {
                                        return (
                                          otherAttrIndex !== attrIndex &&
                                          otherAttr.attribute_name_cn &&
                                          otherAttr.attribute_name_cn.trim() ===
                                            trimmedValue
                                        );
                                      }
                                    );

                                  if (hasDuplicate) {
                                    callback('选项名称不能重复');
                                  } else {
                                    callback();
                                  }
                                }
                              }
                            }
                          ]}
                          label={`选项 ${attr.order_num}`}
                          disabled={
                            type === 'detail' ||
                            (attrIndex !== 0 &&
                              attrIndex ===
                                item.file_label_attribute?.length - 1 &&
                              item?.file_label_attribute[attrIndex]
                                .input_type === 2)
                              ? true
                              : false
                          }
                        >
                          {console.log(attr.attribute_name_cn)}
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
                              展示名称
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
                          {item?.file_label_attribute?.length > 1 && (
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
                          )}
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
                        attribute_id: uuid(),
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
