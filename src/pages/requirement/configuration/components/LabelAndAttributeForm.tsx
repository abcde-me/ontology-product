import {
  Button,
  Checkbox,
  ColorPicker,
  Dropdown,
  Form,
  Image,
  Input,
  Menu,
  Select,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import {
  IconDelete,
  IconDown,
  IconPlus,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import React from 'react';
import { shapeOptions } from '../../common';
import { LabelData, LabelInfoAttributeGroupType } from '../../type';
import TemplateAttributeForm from './TemplateAttributeForm';

const FormItem = Form.Item;
const Option = Select.Option;

interface LabelAndAttributeFormProps {
  // 数据
  labelDataList: LabelData[];
  templateData: any[];
  // 表单
  labelToolForm: any;
  // 状态
  type: string | null;
  model_id: string | undefined;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  setTemplateData: React.Dispatch<React.SetStateAction<any[]>>;
  // 操作函数 (来自 useLabelOperations)
  updateNestedValue: (
    path: (string | number)[],
    value: any,
    isTemp?: boolean
  ) => void;
  deleteLabel: (labelIndex: number) => void;
  deleteAttributeGroup: (labelIndex: number, groupIndex: number) => void;
  deleteAttribute: (
    labelIndex: number,
    groupIndex: number,
    attrIndex: number
  ) => void;
  addNewLabel: () => void;
  addAttributeGroup: (labelIndex: number) => void;
  addAttribute: (
    labelIndex: number,
    groupIndex?: number,
    type?: number
  ) => void;
  handleTemplateClick: (attributeGroupName: any, labelIndex: number) => void;
  // 判断函数 (来自 editModeHelpers)
  isLabelFromDetail: (labelId: string) => boolean;
  isAttributeGroupFromDetail: (labelId: string, attributeId: string) => boolean;
  isAttributeFromDetail: (
    labelId: string,
    attributeGroupId: string,
    attributeId: string
  ) => boolean;
  // 模型相关
  curModelLabelList: (labelShape: number) => any[];
}

const LabelAndAttributeForm: React.FC<LabelAndAttributeFormProps> = ({
  labelDataList,
  templateData,
  labelToolForm,
  type,
  model_id,
  activeTab,
  setActiveTab,
  setTemplateData,
  updateNestedValue,
  deleteLabel,
  deleteAttributeGroup,
  deleteAttribute,
  addNewLabel,
  addAttributeGroup,
  addAttribute,
  handleTemplateClick,
  isLabelFromDetail,
  isAttributeGroupFromDetail,
  isAttributeFromDetail,
  curModelLabelList
}) => {
  return (
    <div className="labe-and-attribute-warp">
      <div className="attribute-header">
        <div
          className={[
            'attribute-header-text attribute-content-label',
            activeTab === 1 ? 'active' : ''
          ].join(' ')}
          onClick={() => {
            setActiveTab(1);
          }}
        >
          <div className={[activeTab === 1 ? 'active' : ''].join(' ')}>
            标签
          </div>
        </div>
        <div
          className={[
            'attribute-header-text',
            activeTab === 2 ? 'active' : ''
          ].join(' ')}
          onClick={() => {
            setActiveTab(2);
          }}
        >
          标签模版属性
        </div>
      </div>
      {/* 原有的标签部分内容 */}
      {activeTab === LabelInfoAttributeGroupType.LABEL && (
        <div className="attribute-content">
          {labelDataList &&
            labelDataList?.map((item: any, labelIndex) => (
              <div className="sortable-item" key={item?.label_id}>
                <div className="sortable-item-content">
                  <FormItem
                    label="标签名称:"
                    field={`label_name_en_${item?.label_id}`}
                    rules={[
                      {
                        required: true,
                        validateTrigger: ['onChange', 'onBlur'],
                        validator: (value, callback) => {
                          const isDuplicate = labelDataList.some(
                            (otherItem, otherIndex) =>
                              otherIndex !== labelIndex &&
                              otherItem.label_name_en === value &&
                              value.trim() !== ''
                          );
                          if (!value) {
                            callback('请输入标签名称');
                          } else if (isDuplicate) {
                            callback('标签名称不能重复');
                          } else {
                            callback();
                          }
                        }
                      }
                    ]}
                    style={{ padding: 0 }}
                  >
                    <Input
                      disabled={
                        type === 'edit' && isLabelFromDetail(item?.label_id)
                      }
                      style={{
                        minWidth: !!model_id ? 165 : 260
                      }}
                      onChange={(val: any) => {
                        updateNestedValue([labelIndex, 'label_name_en'], val);
                      }}
                      className="sortable-item-input"
                      placeholder="储存标注结果"
                      value={item.label_name_en}
                    />
                  </FormItem>
                  <FormItem
                    field={`label_name_cn_${item?.label_id}`}
                    label={
                      <div>
                        <span style={{ marginRight: 2 }}>展示名称</span>
                        <Tooltip
                          content={
                            <div style={{ fontSize: 14 }}>
                              展示在标注页面的名称
                            </div>
                          }
                        >
                          <IconQuestionCircle style={{ color: '#6E7B8D' }} />
                        </Tooltip>
                        :
                      </div>
                    }
                    style={{ padding: 0 }}
                    rules={[
                      {
                        validateTrigger: ['onChange', 'onBlur'],
                        validator: (value, callback) => {
                          if (!value) {
                            callback('请输入展示名称');
                            return;
                          }
                          const isDuplicate = labelDataList.some(
                            (otherItem, otherIndex) =>
                              otherIndex !== labelIndex &&
                              otherItem.label_name_cn === value &&
                              value.trim() !== ''
                          );
                          if (isDuplicate) {
                            callback('展示名称不能重复');
                          } else {
                            callback();
                          }
                        }
                      }
                    ]}
                  >
                    <Input
                      disabled={
                        type === 'edit' && isLabelFromDetail(item?.label_id)
                      }
                      style={{
                        minWidth: !!model_id ? 155 : 260
                      }}
                      onChange={(val: any) => {
                        updateNestedValue([labelIndex, 'label_name_cn'], val);
                      }}
                      onFocus={(e: any) => {
                        const currentItem = labelDataList[labelIndex];
                        if (
                          !currentItem.label_name_cn?.trim() &&
                          currentItem.label_name_en?.trim()
                        ) {
                          const fieldName = `label_name_cn_${item?.label_id}`;
                          updateNestedValue(
                            [labelIndex, 'label_name_cn'],
                            currentItem.label_name_en
                          );
                          labelToolForm.setFieldValue(
                            fieldName,
                            currentItem.label_name_en
                          );
                          setTimeout(() => {
                            e.target.select();
                          }, 0);
                        } else {
                          e.target.select();
                        }
                      }}
                      className="sortable-item-input"
                      placeholder="展示在标注页的名称"
                      value={item.label_name_cn}
                    />
                  </FormItem>
                  {!!model_id && (
                    <FormItem
                      label="模型映射:"
                      field={`label_mappings_${item?.label_id}`}
                      style={{ padding: 0 }}
                    >
                      <Select
                        disabled={
                          type === 'edit' && isLabelFromDetail(item?.label_id)
                        }
                        className="label-mapping-select"
                        mode="multiple"
                        maxTagCount={{
                          count: 1,
                          render: (invisibleNumber) => {
                            const currentValue = item.label_mappings || [];
                            const selectedValues = Array.isArray(currentValue)
                              ? currentValue
                              : [currentValue];
                            const hiddenTags = selectedValues.slice(1);
                            const hiddenOptions = hiddenTags
                              .map((val) => {
                                const option = curModelLabelList(
                                  item.label_shape ?? 3
                                )?.find((opt) => opt.value === val);
                                return option;
                              })
                              .filter(Boolean);

                            const handleRemoveTag = (valueToRemove: any) => {
                              const currentValue = item.label_mappings || [];
                              const selectedValues = Array.isArray(currentValue)
                                ? currentValue
                                : [currentValue];
                              const newValues = selectedValues.filter(
                                (val) => val !== valueToRemove
                              );
                              updateNestedValue(
                                [labelIndex, 'label_mappings'],
                                newValues
                              );
                              const fieldName = `label_mappings_${item?.label_id}`;
                              labelToolForm.setFieldValue(fieldName, newValues);
                            };

                            return (
                              <Tooltip
                                content={
                                  <div className="flex flex-wrap gap-1">
                                    {hiddenOptions.map((option, i) => (
                                      <Tag
                                        key={i}
                                        closable
                                        onClose={() => {
                                          handleRemoveTag(option.value);
                                        }}
                                        style={{
                                          height: '24px',
                                          background: '#E7ECF0',
                                          color: '#0F172A',
                                          borderRadius: '2px',
                                          fontSize: '12px',
                                          alignItems: 'center',
                                          margin: '0 2px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        {option.label}
                                      </Tag>
                                    ))}
                                  </div>
                                }
                              >
                                <span>+{invisibleNumber}</span>
                              </Tooltip>
                            );
                          }
                        }}
                        placeholder="请选择"
                        style={{ width: 150 }}
                        allowClear
                        onChange={(val: any) => {
                          updateNestedValue(
                            [labelIndex, 'label_mappings'],
                            val
                          );
                        }}
                      >
                        {curModelLabelList(item.label_shape ?? 3)?.map(
                          (option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          )
                        )}
                      </Select>
                    </FormItem>
                  )}
                  <FormItem
                    field={`label_shape_${item?.label_id}`}
                    initialValue={item.label_shape ?? 3}
                  >
                    <Select
                      disabled={
                        type === 'edit' && isLabelFromDetail(item?.label_id)
                      }
                      placeholder="请选择形状"
                      value={item.label_shape ?? 3}
                      onChange={(val: any) => {
                        updateNestedValue(
                          [labelIndex, 'label_shape'],
                          parseInt(val)
                        );
                        updateNestedValue([labelIndex, 'label_mappings'], []);
                        if (model_id) {
                          const mappingFieldName = `label_mappings_${item?.label_id}`;
                          labelToolForm.setFieldValue(
                            mappingFieldName,
                            undefined
                          );
                        }
                      }}
                      style={{ width: 64, height: 32 }}
                      triggerProps={{
                        autoAlignPopupWidth: false,
                        autoAlignPopupMinWidth: true,
                        position: 'bl'
                      }}
                      renderFormat={(option, value) => {
                        return (
                          <Tooltip
                            content={
                              shapeOptions.find((opt) => opt.value === value)
                                ?.label
                            }
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: '100%'
                              }}
                            >
                              <Image
                                width={20}
                                style={{
                                  pointerEvents: 'none',
                                  verticalAlign: 'middle'
                                }}
                                src={
                                  shapeOptions.find(
                                    (opt) => opt.value === value
                                  )?.icon
                                }
                              />
                            </span>
                          </Tooltip>
                        );
                      }}
                    >
                      {shapeOptions?.map((option) => (
                        <Option key={option.value} value={option.value}>
                          <div className="label-shape-options">
                            <Image
                              width={20}
                              src={option?.icon}
                              style={{
                                pointerEvents: 'none',
                                marginRight: 4
                              }}
                            />
                            <span>{option.label}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </FormItem>
                  <FormItem field={`label_colour_${item?.label_id}`}>
                    <div className="color-content">
                      <ColorPicker
                        disabled={
                          type === 'edit' && isLabelFromDetail(item?.label_id)
                        }
                        defaultValue={item?.label_colour}
                        onChange={(val: any) => {
                          updateNestedValue([labelIndex, 'label_colour'], val);
                        }}
                        showPreset
                      />
                      <IconDown
                        className="color-icon"
                        onClick={(e) => {
                          if (
                            type === 'edit' &&
                            isLabelFromDetail(item?.label_id)
                          )
                            return;
                          e.stopPropagation();
                          const trigger =
                            e.currentTarget.parentElement?.querySelector(
                              '.arco-color-picker-preview'
                            ) as HTMLElement;
                          trigger?.click();
                        }}
                        style={{
                          cursor:
                            type === 'edit' && isLabelFromDetail(item?.label_id)
                              ? 'not-allowed'
                              : 'pointer'
                        }}
                      />
                    </div>
                  </FormItem>
                  <FormItem>
                    {labelDataList.length > 1 && (
                      <Tooltip content="删除">
                        <IconDelete
                          className={`icon-wrapper ${
                            type === 'edit' && isLabelFromDetail(item?.label_id)
                              ? 'is-disabled'
                              : ''
                          }`}
                          fontSize={16}
                          onClick={() => {
                            if (
                              type === 'edit' &&
                              isLabelFromDetail(item?.label_id)
                            )
                              return;
                            deleteLabel(labelIndex);
                          }}
                          style={{
                            cursor:
                              type === 'edit' &&
                              isLabelFromDetail(item?.label_id)
                                ? 'not-allowed'
                                : 'pointer',
                            opacity:
                              type === 'edit' &&
                              isLabelFromDetail(item?.label_id)
                                ? 0.5
                                : 1
                          }}
                        />
                      </Tooltip>
                    )}
                  </FormItem>
                </div>
                {item?.label_info_attribute_groups?.length > 0 &&
                  item?.label_info_attribute_groups?.map(
                    (attrGroup, groupIndex) => {
                      return (
                        <div
                          key={`${item?.label_id}_${groupIndex}`}
                          className="attribute-group-item"
                        >
                          <div className="attribute-group-content-item">
                            <FormItem
                              field={`label_info_attribute_groups_${attrGroup?.attribute_id}_attribute_group_name`}
                              disabled={attrGroup?.isTemp === true}
                              className="attribute-group-name-label"
                              label="属性名称:"
                              rules={[
                                {
                                  required: true,
                                  validateTrigger: ['onChange', 'onBlur'],
                                  validator: (value, callback) => {
                                    if (value) {
                                      const hasDuplicate =
                                        item?.label_info_attribute_groups?.some(
                                          (
                                            otherGroup: any,
                                            otherIndex: number
                                          ) => {
                                            return (
                                              otherIndex !== groupIndex &&
                                              otherGroup.attribute_group_name ===
                                                value
                                            );
                                          }
                                        );
                                      if (hasDuplicate) {
                                        callback('属性名称不能重复');
                                      } else {
                                        callback();
                                      }
                                    } else if (!value) {
                                      callback('请输入属性组名称');
                                    } else {
                                      callback();
                                    }
                                  }
                                }
                              ]}
                            >
                              <Input
                                disabled={
                                  (type === 'edit' &&
                                    isAttributeGroupFromDetail(
                                      item?.label_id,
                                      attrGroup?.attribute_id
                                    )) ||
                                  attrGroup?.isTemp === true
                                }
                                style={{
                                  width: 522,
                                  backgroundColor:
                                    (type === 'edit' &&
                                      isAttributeGroupFromDetail(
                                        item?.label_id,
                                        attrGroup?.attribute_id
                                      )) ||
                                    attrGroup?.isTemp
                                      ? '#e2e8f0'
                                      : '#fff'
                                }}
                                value={attrGroup.attribute_group_name}
                                onChange={(val: any) => {
                                  updateNestedValue(
                                    [
                                      labelIndex,
                                      'label_info_attribute_groups',
                                      groupIndex,
                                      'attribute_group_name'
                                    ],
                                    val
                                  );
                                }}
                                placeholder="请输入名称"
                              />
                            </FormItem>
                            <FormItem label={null} style={{ marginRight: 0 }}>
                              <Select
                                disabled={
                                  (type === 'edit' &&
                                    isAttributeGroupFromDetail(
                                      item?.label_id,
                                      attrGroup?.attribute_id
                                    )) ||
                                  attrGroup?.isTemp === true
                                }
                                className="mr-2"
                                style={{
                                  width: 100,
                                  height: 32
                                }}
                                value={attrGroup.attribute_group_class}
                                onChange={(value) => {
                                  updateNestedValue(
                                    [
                                      labelIndex,
                                      'label_info_attribute_groups',
                                      groupIndex,
                                      'attribute_group_class'
                                    ],
                                    parseInt(value)
                                  );
                                  if (value === 3) {
                                    updateNestedValue(
                                      [
                                        labelIndex,
                                        'label_info_attribute_groups',
                                        groupIndex,
                                        'label_info_attribute'
                                      ],
                                      []
                                    );
                                    updateNestedValue(
                                      [
                                        labelIndex,
                                        'label_info_attribute_groups',
                                        groupIndex,
                                        'attribute_group_class'
                                      ],
                                      parseInt(value)
                                    );
                                  }
                                }}
                              >
                                <Option key={1} value={1}>
                                  单选
                                </Option>
                                <Option key={2} value={2}>
                                  多选
                                </Option>
                                <Option key={3} value={3}>
                                  输入框
                                </Option>
                              </Select>
                            </FormItem>
                            <FormItem label={null} style={{ marginRight: 0 }}>
                              <Checkbox
                                disabled={attrGroup?.isTemp === true}
                                style={{
                                  whiteSpace: 'nowrap',
                                  fontSize: 14
                                }}
                                checked={attrGroup.attribute_group_type === 1}
                                onChange={(checked) => {
                                  updateNestedValue(
                                    [
                                      labelIndex,
                                      'label_info_attribute_groups',
                                      groupIndex,
                                      'attribute_group_type'
                                    ],
                                    checked ? 1 : 2
                                  );
                                }}
                              >
                                必须标注
                              </Checkbox>
                            </FormItem>
                            <FormItem label={null} style={{ marginRight: 0 }}>
                              {attrGroup.attribute_group_class !== 3 && (
                                <Tooltip
                                  content={
                                    attrGroup?.isTemp === true ? '' : '添加选项'
                                  }
                                >
                                  <IconPlus
                                    style={{
                                      marginLeft: 12,
                                      fontSize: 16,
                                      cursor:
                                        attrGroup?.isTemp === true
                                          ? 'not-allowed'
                                          : 'pointer',
                                      opacity:
                                        attrGroup?.isTemp === true ? 0.5 : 1
                                    }}
                                    className={`${
                                      attrGroup?.isTemp === true
                                        ? 'is-disabled'
                                        : 'icon-wrapper'
                                    }`}
                                    onClick={() => {
                                      if (attrGroup?.isTemp === true) {
                                        return;
                                      }
                                      addAttribute(
                                        labelIndex,
                                        groupIndex,
                                        attrGroup.label_info_attribute?.[
                                          attrGroup.label_info_attribute
                                            ?.length - 1
                                        ]?.input_type
                                      );
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </FormItem>
                            <FormItem label={null} style={{ marginRight: 0 }}>
                              <Tooltip content="删除">
                                <IconDelete
                                  className={`icon-wrapper ${
                                    type === 'edit' &&
                                    isAttributeGroupFromDetail(
                                      item?.label_id,
                                      attrGroup?.attribute_id
                                    )
                                      ? 'is-disabled'
                                      : ''
                                  }`}
                                  style={{
                                    marginLeft: 12,
                                    cursor:
                                      type === 'edit' &&
                                      isAttributeGroupFromDetail(
                                        item?.label_id,
                                        attrGroup?.attribute_id
                                      )
                                        ? 'not-allowed'
                                        : 'pointer',
                                    opacity:
                                      type === 'edit' &&
                                      isAttributeGroupFromDetail(
                                        item?.label_id,
                                        attrGroup?.attribute_id
                                      )
                                        ? 0.5
                                        : 1
                                  }}
                                  fontSize={16}
                                  onClick={() => {
                                    if (
                                      type === 'edit' &&
                                      isAttributeGroupFromDetail(
                                        item?.label_id,
                                        attrGroup?.attribute_id
                                      )
                                    )
                                      return;
                                    deleteAttributeGroup(
                                      labelIndex,
                                      groupIndex
                                    );
                                  }}
                                />
                              </Tooltip>
                            </FormItem>
                          </div>
                          {attrGroup?.label_info_attribute?.map(
                            (attr, attrIndex) => (
                              <div
                                key={attr.label_info_id}
                                className="attribute-group-info-item"
                              >
                                {(1 === attrGroup.attribute_group_class ||
                                  2 === attrGroup.attribute_group_class) && (
                                  <div className="attribute-info-item">
                                    <FormItem
                                      label={
                                        <div style={{ color: '#6E7B8D' }}>
                                          选项{attrIndex + 1}：
                                        </div>
                                      }
                                      field={`label_info_attribute_groups_${attr?.label_info_id}_attribute_name_en`}
                                      rules={[
                                        {
                                          required: true,
                                          validateTrigger: [
                                            'onChange',
                                            'onBlur'
                                          ],
                                          validator: (value, callback) => {
                                            const hasDuplicate =
                                              attrGroup?.label_info_attribute?.some(
                                                (
                                                  otherAttr: any,
                                                  otherIndex: number
                                                ) => {
                                                  return (
                                                    otherIndex !== attrIndex &&
                                                    otherAttr.attribute_name_en ===
                                                      value
                                                  );
                                                }
                                              );
                                            if (!value) {
                                              callback('请输入选项名称');
                                            } else if (hasDuplicate) {
                                              callback('选项名称不能重复');
                                            } else {
                                              callback();
                                            }
                                          }
                                        }
                                      ]}
                                      disabled={
                                        (type === 'edit' &&
                                          isAttributeFromDetail(
                                            item?.label_id,
                                            attrGroup?.attribute_id,
                                            attr?.label_info_id
                                          )) ||
                                        attrGroup?.isTemp === true ||
                                        attrGroup?.label_info_attribute[
                                          attrIndex
                                        ].input_type === 2
                                          ? true
                                          : false
                                      }
                                    >
                                      <Input
                                        disabled={
                                          (type === 'edit' &&
                                            isAttributeFromDetail(
                                              item?.label_id,
                                              attrGroup?.attribute_id,
                                              attr?.label_info_id
                                            )) ||
                                          attrGroup?.isTemp === true ||
                                          attrGroup?.label_info_attribute[
                                            attrIndex
                                          ].input_type === 2
                                            ? true
                                            : false
                                        }
                                        type="text"
                                        placeholder="用于储存标注结果"
                                        value={attr.attribute_name_en}
                                        style={{
                                          width: 340,
                                          backgroundColor:
                                            (type === 'edit' &&
                                              isAttributeFromDetail(
                                                item?.label_id,
                                                attrGroup?.attribute_id,
                                                attr?.label_info_id
                                              )) ||
                                            attrGroup?.isTemp ||
                                            attrGroup?.label_info_attribute[
                                              attrIndex
                                            ].input_type === 2
                                              ? '#e2e8f0'
                                              : '#fff'
                                        }}
                                        onChange={(val) => {
                                          updateNestedValue(
                                            [
                                              labelIndex,
                                              'label_info_attribute_groups',
                                              groupIndex,
                                              'label_info_attribute',
                                              attrIndex,
                                              'attribute_name_en'
                                            ],
                                            val
                                          );
                                        }}
                                      />
                                    </FormItem>
                                    <FormItem
                                      label={
                                        <div
                                          style={{
                                            marginRight: 3,
                                            color: '#6E7B8D'
                                          }}
                                        >
                                          <span style={{ marginRight: 2 }}>
                                            展示名称
                                          </span>
                                          <Tooltip
                                            content={
                                              <div style={{ fontSize: 14 }}>
                                                展示在标注页面的名称
                                              </div>
                                            }
                                          >
                                            <IconQuestionCircle
                                              style={{
                                                color: '#6E7B8D',
                                                marginRight: 2
                                              }}
                                            />
                                          </Tooltip>
                                          :
                                        </div>
                                      }
                                      rules={[
                                        {
                                          validateTrigger: [
                                            'onChange',
                                            'onBlur'
                                          ],
                                          validator: (value, callback) => {
                                            const hasDuplicate =
                                              attrGroup?.label_info_attribute?.some(
                                                (
                                                  otherAttr: any,
                                                  otherIndex: number
                                                ) => {
                                                  return (
                                                    otherIndex !== attrIndex &&
                                                    otherAttr.attribute_name_cn?.trim() ===
                                                      value?.trim() &&
                                                    value.trim() !== ''
                                                  );
                                                }
                                              );
                                            if (!value) {
                                              callback('请输入展示名称');
                                            } else if (hasDuplicate) {
                                              callback('展示名称不能重复');
                                            } else {
                                              callback();
                                            }
                                          }
                                        }
                                      ]}
                                      field={`label_info_attribute_groups_${attr?.label_info_id}_attribute_name_cn`}
                                    >
                                      <Input
                                        style={{
                                          width: 318,
                                          backgroundColor:
                                            (type === 'edit' &&
                                              isAttributeFromDetail(
                                                item?.label_id,
                                                attrGroup?.attribute_id,
                                                attr?.label_info_id
                                              )) ||
                                            attrGroup?.isTemp
                                              ? '#e2e8f0'
                                              : '#fff'
                                        }}
                                        placeholder="展示在标注页面的名称"
                                        type="text"
                                        value={attr.attribute_name_cn}
                                        disabled={
                                          (type === 'edit' &&
                                            isAttributeFromDetail(
                                              item?.label_id,
                                              attrGroup?.attribute_id,
                                              attr?.label_info_id
                                            )) ||
                                          attrGroup?.isTemp === true
                                        }
                                        onChange={(val) =>
                                          updateNestedValue(
                                            [
                                              labelIndex,
                                              'label_info_attribute_groups',
                                              groupIndex,
                                              'label_info_attribute',
                                              attrIndex,
                                              'attribute_name_cn'
                                            ],
                                            val
                                          )
                                        }
                                      />
                                    </FormItem>
                                    {attrGroup.label_info_attribute.length >
                                      1 && (
                                      <FormItem>
                                        <Tooltip content="删除">
                                          <IconDelete
                                            className={`icon-wrapper ${
                                              (type === 'edit' &&
                                                isAttributeFromDetail(
                                                  item?.label_id,
                                                  attrGroup?.attribute_id,
                                                  attr?.label_info_id
                                                )) ||
                                              attrGroup?.isTemp === true
                                                ? 'is-disabled'
                                                : ''
                                            }`}
                                            fontSize={16}
                                            style={{
                                              cursor:
                                                (type === 'edit' &&
                                                  isAttributeFromDetail(
                                                    item?.label_id,
                                                    attrGroup?.attribute_id,
                                                    attr?.label_info_id
                                                  )) ||
                                                attrGroup?.isTemp === true
                                                  ? 'not-allowed'
                                                  : 'pointer',
                                              opacity:
                                                (type === 'edit' &&
                                                  isAttributeFromDetail(
                                                    item?.label_id,
                                                    attrGroup?.attribute_id,
                                                    attr?.label_info_id
                                                  )) ||
                                                attrGroup?.isTemp === true
                                                  ? 0.5
                                                  : 1
                                            }}
                                            onClick={() => {
                                              if (
                                                (type === 'edit' &&
                                                  isAttributeFromDetail(
                                                    item?.label_id,
                                                    attrGroup?.attribute_id,
                                                    attr?.label_info_id
                                                  )) ||
                                                attrGroup?.isTemp === true
                                              ) {
                                                return;
                                              }
                                              deleteAttribute(
                                                labelIndex,
                                                groupIndex,
                                                attrIndex
                                              );
                                            }}
                                          />
                                        </Tooltip>
                                      </FormItem>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      );
                    }
                  )}
                <div className="btn-content-items">
                  {labelIndex === labelDataList?.length - 1 && (
                    <Button
                      className="btn-add"
                      style={{ marginRight: 16 }}
                      onClick={() => {
                        addNewLabel();
                      }}
                    >
                      <IconPlus />
                      添加标签
                    </Button>
                  )}
                  <Button
                    className="btn-add-default btn-add"
                    style={{ marginRight: 16 }}
                    onClick={() => {
                      addAttributeGroup(labelIndex);
                    }}
                  >
                    <IconPlus />
                    添加属性
                  </Button>
                  <div className="btn-option-content">
                    <Dropdown
                      position={'bottom'}
                      droplist={
                        <Menu style={{ width: '100%' }}>
                          {templateData?.length > 0 &&
                            templateData?.map((TempItem, index) => {
                              const isDis = labelDataList[
                                labelIndex
                              ]?.label_info_attribute_groups?.find(
                                (item) =>
                                  item?.attribute_group_name ===
                                  TempItem?.attribute_group_name
                              );
                              if (!TempItem?.attribute_group_name) {
                                return null;
                              }
                              return (
                                <Tooltip
                                  style={{ fontSize: 14 }}
                                  content={
                                    isDis ? '一个标签下不能重复选择属性组' : ''
                                  }
                                  key={String(index)}
                                >
                                  <Menu.Item
                                    className={[
                                      'menu-item-content',
                                      labelDataList[
                                        labelIndex
                                      ]?.label_info_attribute_groups?.find(
                                        (item) =>
                                          item?.attribute_group_name ===
                                          TempItem?.attribute_group_name
                                      )
                                        ? ''
                                        : 'menu-item-content-active'
                                    ].join(' ')}
                                    disabled={
                                      labelDataList[
                                        labelIndex
                                      ]?.label_info_attribute_groups?.find(
                                        (item) =>
                                          item?.attribute_group_name ===
                                          TempItem?.attribute_group_name
                                      )
                                        ? true
                                        : false
                                    }
                                    onClick={() => {
                                      handleTemplateClick(
                                        TempItem?.attribute_group_name,
                                        labelIndex
                                      );
                                    }}
                                    key={String(index)}
                                  >
                                    {TempItem.attribute_group_name}
                                  </Menu.Item>
                                </Tooltip>
                              );
                            })}
                          <Menu.Item
                            onClick={() => {
                              setActiveTab(2);
                            }}
                            key="2"
                            className="menu-item-create"
                          >
                            <IconPlus className="menu-item-create-icon" />
                            <span className="menu-item-create-text">
                              创建模板属性
                            </span>
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button className="btn-add-template-attribute btn-add-default btn-add">
                        <IconPlus />
                        添加模版属性
                      </Button>
                    </Dropdown>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      {activeTab === LabelInfoAttributeGroupType.TEMPLATE_ATTRIBUTE && (
        <TemplateAttributeForm
          templateData={templateData}
          setTemplateData={setTemplateData}
          updateNestedValue={updateNestedValue}
        />
      )}
    </div>
  );
};

export default LabelAndAttributeForm;
