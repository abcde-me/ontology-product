import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Tooltip,
  ColorPicker,
  Select
} from '@arco-design/web-react';
import {
  IconDelete,
  IconDown,
  IconPlus,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import { uuid } from '@/models/utils';
import { getRandomHexColorStrict } from '../common';
import './TextEntity.scss';
// 实体/实体关系 - 组件
const btnList = [
  {
    key: 1,
    label: '实体标签'
  },
  {
    key: 2,
    label: '关系标签'
  }
];
interface TextSubstanceComponentProps {
  type: any;
  getDetailObj?: any;
  getTextEntityData?: any;
}

// 实体 --  labels
// 实体关系 --  entity_relations
const TextSubstanceComponent = (props: TextSubstanceComponentProps) => {
  const { type, getDetailObj, getTextEntityData } = props;
  const [formText] = Form.useForm();
  const [formLabel] = Form.useForm();
  const Option = Select.Option;
  const FormItem = Form.Item;
  // 实体标签内容
  const [entityRelations, setEntityRelations] = useState([
    {
      label_id: uuid(),
      order_num: 1, // 排序
      label_name_cn: '', //展示名称
      label_name_en: '', //存储名称
      label_colour: getRandomHexColorStrict() //标签颜色（如#FFFFFF）
    }
  ]);
  // 关系标签内容
  const [relationRelations, setRelationRelations]: any = useState([
    // {
    //   relation_id: uuid(),
    //   order_num: 0,
    //   relation_name_cn: '',
    //   relation_name_en: '',
    //   start_entity_labels: [], //标签的醋存储名称
    //   target_entity_labels: [],
    //   colour: getRandomHexColorStrict()
    // }
  ]);
  // 选中的标签类型
  const [selectedSubstanceValue, setSelectedSubstanceValue] = useState(1);
  const [filterArrState, setFilterArrState] = useState<
    Array<{
      label_name_cn: string;
    }>
  >([]);
  // 处理基本字段变更
  const handleFieldChange = (index, field, value) => {
    const filterArr = formText
      .getFieldsValue()
      ?.entityRelations?.filter((item, i) => i !== index);
    setFilterArrState(filterArr);
    const newData = [...entityRelations];
    newData[index][field] = value;
    setEntityRelations(newData);
  };

  // 处理关系标签字段变更
  const handleRelationFieldChange = (index, field, value) => {
    const newData: any = [...relationRelations];
    const currentRelation = newData[index];
    const oldValue = currentRelation[field];
    // 更新当前字段值
    newData[index][field] = value;
    // 如果是起始标签变化，需要检查并清理目标标签中可能存在的相同选项
    if (field === 'start_entity_labels') {
      // 获取目标标签中选中的、同时也在起始标签中选中的选项
      const overlappingValues = currentRelation.target_entity_labels.filter(
        (targetValue) => value.includes(targetValue)
      );
      // 如果有重叠的值，从目标标签中移除这些值
      if (overlappingValues.length > 0) {
        newData[index].target_entity_labels =
          currentRelation.target_entity_labels.filter(
            (targetValue) => !value.includes(targetValue)
          );
      }
    }
    // 如果是目标标签变化，需要检查并清理起始标签中可能存在的相同选项
    if (field === 'target_entity_labels') {
      // 获取起始标签中选中的、同时也在目标标签中选中的选项
      const overlappingValues = currentRelation.start_entity_labels.filter(
        (startValue) => value.includes(startValue)
      );
      // 如果有重叠的值，从起始标签中移除这些值
      if (overlappingValues.length > 0) {
        newData[index].start_entity_labels =
          currentRelation.start_entity_labels.filter(
            (startValue) => !value.includes(startValue)
          );
      }
    }
    setRelationRelations(newData);
  };

  const removeRelationArrayItem = (itemIndex) => {
    const newRelationRelations = relationRelations.filter(
      (_, index) => index !== itemIndex
    );
    setRelationRelations(newRelationRelations);
  };
  // 删除数组项
  const removeArrayItem = (itemIndex) => {
    const newEntityRelations = entityRelations.filter(
      (_, index) => index !== itemIndex
    );
    setEntityRelations(newEntityRelations);
  };

  useEffect(() => {
    if (type === 'detail') {
      setEntityRelations(getDetailObj?.labels);
      setRelationRelations(getDetailObj?.entity_relations);
      // 修复起始标签内容设置
      getDetailObj?.labels?.forEach((item, index) => {
        formText.setFieldValue(
          `label_name_en${item.order_num}`,
          item.label_name_en
        );
        formText.setFieldValue(
          `label_name_cn${item.order_num}`,
          item.label_name_cn
        );
      });
      getDetailObj?.entity_relations?.forEach((item, index) => {
        formLabel.setFieldValue(
          `relation_name_en${item.order_num}`,
          item.relation_name_en
        );
        formLabel.setFieldValue(
          `relation_name_cn${item.order_num}`,
          item.relation_name_cn
        );
        formLabel.setFieldValue(
          `start_entity_labels${item.order_num}`,
          item.start_entity_labels
        );
        formLabel.setFieldValue(
          `target_entity_labels${item.order_num}`,
          item.target_entity_labels
        );
      });
    }
  }, [getDetailObj]);

  useEffect(() => {
    getTextEntityData(entityRelations, relationRelations, formText, formLabel);
  }, [entityRelations, relationRelations]);
  const renderItemVal = (item, index) => {
    formText.setFieldValue(`label_name_cn${index}`, item?.label_name_cn);
  };
  const renderNotFoundContent = () => {
    return (
      <div className="not-found-content">
        <div className="not-found-text">请先创建实体标签</div>
      </div>
    );
  };
  return (
    <div className="text-component-warp">
      <div className="type-header">
        {btnList.map((item) => {
          return (
            <div
              className={[
                'item-base-class',
                selectedSubstanceValue === item.key ? 'active' : ''
              ].join(' ')}
              onClick={() => {
                setSelectedSubstanceValue(item.key);
              }}
              key={item.key}
            >
              {item.label}
            </div>
          );
        })}
      </div>
      <Form
        form={formText}
        disabled={type === 'detail'}
        layout="inline"
        labelAlign="right"
        labelCol={{ flex: 'none' }}
        wrapperCol={{ flex: 1 }}
      >
        {selectedSubstanceValue === 1 &&
          entityRelations &&
          entityRelations.map((item, index) => {
            renderItemVal(item, index);
            return (
              <div className="entity-relation-item" key={item.order_num}>
                <FormItem
                  style={{ paddingLeft: 16, marginRight: 8, marginBottom: 0 }}
                  label="标签名称:"
                  field={`label_name_en${type === 'detail' ? item?.order_num : item?.label_id}`}
                  rules={[
                    {
                      required: true,
                      validateTrigger: ['onChange', 'onBlur'],
                      validator: (value, callback) => {
                        // 1. 判断同组内不能为空
                        if (!value || value.trim() === '') {
                          callback('请输入标签名称');
                        } else {
                          const trimmedValue = value.toString().trim();
                          // 2. 判断同组内不能有重复内容
                          // 获取当前组内所有其他标签（排除当前正在编辑的标签）
                          const otherEntities = entityRelations.filter(
                            (_, i) => i !== index
                          );

                          // 检查是否有重复的标签名称
                          const hasDuplicate = otherEntities.some(
                            (item) => item?.label_name_en === trimmedValue
                          );

                          if (hasDuplicate) {
                            callback('标签名称不能重复');
                          } else {
                            callback();
                          }
                        }
                      }
                    }
                  ]}
                >
                  <Input
                    placeholder="请输入标签名称"
                    style={{ width: 260 }}
                    value={item.label_name_en}
                    onChange={(value) => {
                      handleFieldChange(index, 'label_name_en', value);
                    }}
                  />
                </FormItem>
                <FormItem
                  label={
                    <div>
                      展示名称
                      <Tooltip
                        content={
                          <div style={{ fontSize: 14 }}>
                            展示在标注页面的名称
                          </div>
                        }
                      >
                        <IconQuestionCircle
                          style={{ color: '#6E7B8D', marginLeft: 3 }}
                        />
                        :
                      </Tooltip>
                    </div>
                  }
                  style={{ padding: 0, marginRight: 8, marginBottom: 0 }}
                  field={`label_name_cn${type === 'detail' ? item?.order_num : item?.label_id}`}
                  rules={[
                    {
                      validateTrigger: ['onChange', 'onBlur'],
                      validator: (value, callback) => {
                        // 1. 判断同组内不能为空
                        if (!value || value.trim() === '') {
                          callback('请输入属性名称');
                        } else {
                          const trimmedValue = value.toString().trim();
                          // 2. 判断同组内不能有重复内容
                          // 获取当前组内所有其他标签（排除当前正在编辑的标签）
                          const otherEntities = entityRelations.filter(
                            (_, i) => i !== index
                          );

                          // 检查是否有重复的标签名称
                          const hasDuplicate = otherEntities.some(
                            (item) => item?.label_name_cn === trimmedValue
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
                    placeholder="请输入展示名称"
                    style={{ width: 250 }}
                    value={item.label_name_cn}
                    onChange={(value) => {
                      // 保存当前项的order_num用于精准匹配
                      const currentOrderNum = item.order_num;
                      handleFieldChange(index, 'label_name_cn', value);
                    }}
                    onFocus={(e: any) => {
                      // 从 entityRelations 中获取最新的值
                      const currentItem = entityRelations[index];
                      // 判断展示名称是否为空（包括 undefined、null、空字符串或只有空格）
                      if (
                        !currentItem.label_name_cn?.trim() &&
                        currentItem.label_name_en?.trim()
                      ) {
                        // 使用 item 来生成字段名（与 FormItem 的 field 保持一致）
                        const fieldName = `label_name_cn${type === 'detail' ? item?.order_num : item?.label_id}`;
                        // 更新数据状态
                        handleFieldChange(
                          index,
                          'label_name_cn',
                          currentItem.label_name_en
                        );
                        // 更新表单字段
                        formText.setFieldValue(
                          fieldName,
                          currentItem.label_name_en
                        );
                        // 使用 setTimeout 确保值更新后再选中
                        setTimeout(() => {
                          e.target.select();
                        }, 0);
                      } else {
                        e.target.select();
                      }
                    }}
                  />
                </FormItem>
                <FormItem
                  label={null}
                  style={{ marginRight: 8, marginBottom: 0 }}
                >
                  <div className="color-content">
                    <ColorPicker
                      disabled={type === 'detail'}
                      defaultValue={item.label_colour}
                      showPreset
                      onChange={(value) => {
                        handleFieldChange(index, 'label_colour', value);
                      }}
                    />
                    <IconDown className="color-icon" />
                  </div>
                </FormItem>
                <FormItem
                  label={null}
                  style={{ marginRight: 8, marginBottom: 0 }}
                >
                  {entityRelations?.length > 1 && (
                    <Tooltip content={type === 'detail' ? '' : '删除'}>
                      <IconDelete
                        fontSize={18}
                        className={
                          type === 'detail' ? 'is-disabled' : 'icon-content'
                        }
                        onClick={() => {
                          if (type !== 'detail') {
                            removeArrayItem(index);
                          }
                        }}
                      />
                    </Tooltip>
                  )}
                </FormItem>
              </div>
            );
          })}
      </Form>
      {selectedSubstanceValue === 1 && (
        <div className="add-btn" style={{ marginTop: 16 }}>
          <Button
            disabled={type === 'detail'}
            onClick={() => {
              if (type !== 'detail') {
                setEntityRelations([
                  ...entityRelations,
                  {
                    label_id: uuid(),
                    order_num: entityRelations?.length + 1, // 排序
                    label_name_cn: '', //展示名称
                    label_name_en: '', //存储名称
                    label_colour: getRandomHexColorStrict() //标签颜色（如#FFFFFF）
                  }
                ]);
              }
            }}
          >
            <IconPlus className={`${type === 'detail' ? 'is-disabled' : ''}`} />
            添加标签
          </Button>
        </div>
      )}
      {/* 关系标签内容 */}
      {selectedSubstanceValue === 2 && (
        <div className="relation-content">
          <div className="relation-content-body">
            <Form
              form={formLabel}
              disabled={type === 'detail'}
              onValuesChange={(_, val) => {}}
              layout="inline"
              labelAlign="right"
              labelCol={{ flex: 'none' }}
              wrapperCol={{ flex: 1 }}
            >
              {relationRelations &&
                relationRelations.map((item, index) => {
                  return (
                    <div
                      className="entity-relation-item"
                      key={item.relation_id}
                    >
                      <FormItem
                        style={{ paddingLeft: 16, marginRight: 8 }}
                        field={`relation_name_en${type === 'detail' ? item?.order_num : item?.relation_id}`}
                        label="关系名称:"
                        rules={[
                          {
                            required: true,
                            validateTrigger: ['onChange'],
                            validator: (value, callback) => {
                              // 检查是否与同组内其他关系名称重复
                              const isDuplicate = relationRelations.some(
                                (otherItem, otherIndex) => {
                                  // 排除当前项
                                  return (
                                    otherIndex !== index &&
                                    otherItem.relation_name_en === value &&
                                    value.trim() !== ''
                                  );
                                }
                              );
                              if (!value || !value.trim()) {
                                callback('请输入关系名称');
                                return;
                              } else if (isDuplicate) {
                                callback('关系名称不能重复');
                              } else {
                                callback();
                              }
                            }
                          }
                        ]}
                      >
                        <Input
                          placeholder="用于储存标注结果"
                          style={{ width: 294 }}
                          value={item.relation_name_en}
                          onChange={(value) => {
                            handleRelationFieldChange(
                              index,
                              'relation_name_en',
                              value
                            );
                          }}
                        />
                      </FormItem>
                      <FormItem
                        label={
                          <div>
                            展示名称
                            <Tooltip
                              content={
                                <div style={{ fontSize: 14 }}>
                                  展示在标注页面的名称
                                </div>
                              }
                            >
                              <IconQuestionCircle
                                style={{ color: '#6E7B8D', marginLeft: 3 }}
                              />
                              :
                            </Tooltip>
                          </div>
                        }
                        style={{ padding: 0, marginRight: 8 }}
                        field={`relation_name_cn${type === 'detail' ? item?.order_num : item?.relation_id}`}
                        rules={[
                          {
                            validateTrigger: ['onChange'],
                            validator: (value, callback) => {
                              const isDuplicate = relationRelations.some(
                                (otherItem, otherIndex) => {
                                  return (
                                    otherIndex !== index &&
                                    otherItem.relation_name_cn === value &&
                                    value.trim() !== ''
                                  );
                                }
                              );
                              if (!value || !value.trim()) {
                                callback('请输入展示名称');
                                return;
                              } else if (isDuplicate) {
                                callback('展示名称不能重复');
                              } else {
                                callback();
                              }
                            }
                          }
                        ]}
                      >
                        <Input
                          placeholder="展示在标注页面的名称"
                          style={{ width: 284 }}
                          value={item.relation_name_cn}
                          onChange={(value) => {
                            handleRelationFieldChange(
                              index,
                              'relation_name_cn',
                              value
                            );
                          }}
                        />
                      </FormItem>
                      <FormItem label={null} style={{ marginRight: 8 }}>
                        {relationRelations?.length > 0 && (
                          <Tooltip content={type === 'detail' ? '' : '删除'}>
                            <IconDelete
                              fontSize={18}
                              className={
                                type === 'detail'
                                  ? 'is-disabled'
                                  : 'icon-content'
                              }
                              onClick={() => {
                                if (type !== 'detail') {
                                  removeRelationArrayItem(index);
                                }
                              }}
                            />
                          </Tooltip>
                        )}
                      </FormItem>
                      <div className="relation-tag">
                        <div className="tag-title">标签对</div>
                        <div className="tag-content">
                          <FormItem
                            style={{
                              paddingLeft: 0,
                              marginRight: 8,
                              marginBottom: 0
                            }}
                            field={`start_entity_labels${type === 'detail' ? item?.order_num : item?.relation_id}`}
                            label="起始标签:"
                            rules={[
                              { required: true, message: '请选择起始标签' }
                            ]}
                          >
                            <Select
                              mode="multiple"
                              allowClear
                              placeholder="请选择起始标签"
                              style={{
                                width: 260,
                                backgroundColor:
                                  type === 'detail' ? '#e2e8f0' : '#fff'
                              }}
                              notFoundContent={renderNotFoundContent()}
                              onChange={(value) => {
                                handleRelationFieldChange(
                                  index,
                                  'start_entity_labels',
                                  value
                                );
                              }}
                              value={item?.start_entity_labels}
                            >
                              {entityRelations &&
                                entityRelations?.map((option) => {
                                  if (!option?.label_name_en) {
                                    return null;
                                  }
                                  const isDisabled =
                                    item?.target_entity_labels?.includes(
                                      option.label_name_en
                                    );
                                  return (
                                    <Option
                                      disabled={
                                        !option.label_name_en || isDisabled
                                      }
                                      key={option.label_name_en}
                                      value={option.label_name_en}
                                    >
                                      {option.label_name_en}
                                    </Option>
                                  );
                                })}
                            </Select>
                          </FormItem>
                          <FormItem
                            label="目标标签:"
                            style={{
                              padding: 0,
                              marginRight: 8,
                              marginBottom: 0
                            }}
                            rules={[
                              {
                                validator: (value, callback) => {
                                  if (!value || value.length === 0) {
                                    callback('请选择目标标签');
                                  }
                                  callback();
                                }
                              }
                            ]}
                            field={`target_entity_labels${type === 'detail' ? item?.order_num : item?.relation_id}`}
                          >
                            <Select
                              mode="multiple"
                              allowClear
                              placeholder="请选择目标标签"
                              notFoundContent={renderNotFoundContent()}
                              style={{
                                width: 276,
                                backgroundColor:
                                  type === 'detail' ? '#e2e8f0' : '#fff'
                              }}
                              onChange={(value) => {
                                handleRelationFieldChange(
                                  index,
                                  'target_entity_labels',
                                  value
                                );
                              }}
                              value={item?.target_entity_labels}
                            >
                              {entityRelations &&
                                entityRelations?.length > 0 &&
                                entityRelations?.map((option, index) => {
                                  if (!option?.label_name_en) {
                                    return null;
                                  }
                                  // 检查当前选项是否在起始标签中被选中，如果是则禁用
                                  const isDisabled =
                                    item?.start_entity_labels?.includes(
                                      option.label_name_en
                                    );
                                  return (
                                    <Option
                                      disabled={
                                        !option.label_name_en || isDisabled
                                      }
                                      key={option.label_name_en}
                                      value={option.label_name_en}
                                    >
                                      {option.label_name_en}
                                    </Option>
                                  );
                                })}
                            </Select>
                          </FormItem>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </Form>
          </div>
          <div className="add-btn">
            <Button
              disabled={type === 'detail'}
              onClick={() => {
                setRelationRelations([
                  ...relationRelations,
                  {
                    relation_id: uuid(),
                    order_num: relationRelations.length + 1,
                    relation_name_cn: '',
                    relation_name_en: '',
                    start_entity_labels: [],
                    target_entity_labels: [],
                    colour: getRandomHexColorStrict()
                  }
                ]);
              }}
            >
              <IconPlus />
              添加关系
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TextSubstanceComponent;
