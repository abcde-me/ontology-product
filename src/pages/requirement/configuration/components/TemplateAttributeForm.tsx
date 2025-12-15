import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Tooltip
} from '@arco-design/web-react';
import {
  IconDelete,
  IconPlus,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import React from 'react';
import { v4 as uuidV4 } from 'uuid';

const FormItem = Form.Item;
const Option = Select.Option;

interface TemplateAttributeFormProps {
  templateData: any[];
  setTemplateData: React.Dispatch<React.SetStateAction<any[]>>;
  updateNestedValue: (
    path: (string | number)[],
    value: any,
    isTemp?: boolean
  ) => void;
}

const TemplateAttributeForm: React.FC<TemplateAttributeFormProps> = ({
  templateData,
  setTemplateData,
  updateNestedValue
}) => {
  return (
    <div className="attribute-content">
      {templateData?.map((attrGroup, labelIndex) => (
        <div
          style={{ paddingBottom: 16 }}
          className="sortable-item"
          key={labelIndex}
        >
          <div className="attribute-group-name">
            <FormItem
              style={{ marginRight: 0, marginBottom: 0 }}
              field={`attribute_group_name_${attrGroup?.attribute_id}`}
              label="属性名称:"
              rules={[
                {
                  required: true,
                  validateTrigger: ['onChange', 'onBlur'],
                  validator: (value, callback) => {
                    const hasDuplicateInGroup = templateData.some(
                      (otherGroup, otherIndex) => {
                        return (
                          otherIndex !== labelIndex &&
                          otherGroup.attribute_group_name &&
                          otherGroup.attribute_group_name.trim() ===
                            value?.trim()
                        );
                      }
                    );

                    if (!value) {
                      return callback('请输入属性名称');
                    } else if (hasDuplicateInGroup) {
                      return callback('属性名称不能重复');
                    }
                    callback();
                  }
                }
              ]}
            >
              <Input
                style={{ width: 546, height: 32 }}
                value={attrGroup.attribute_group_name}
                onChange={(val: any) => {
                  updateNestedValue(
                    [labelIndex, 'attribute_group_name'],
                    val,
                    true
                  );
                }}
                placeholder="请输入名称"
              />
            </FormItem>
            <FormItem style={{ marginRight: 0, marginBottom: 0 }} label={null}>
              <Select
                className="ml-2 mr-2"
                style={{ width: 100, height: 32 }}
                value={attrGroup.attribute_group_class}
                onChange={(value) => {
                  if (parseInt(value) === 3) {
                    updateNestedValue(
                      [labelIndex, 'label_info_attribute'],
                      [],
                      true
                    );
                  }
                  updateNestedValue(
                    [labelIndex, 'attribute_group_class'],
                    parseInt(value),
                    true
                  );
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
            <FormItem style={{ marginRight: 0 }} label={null}>
              <Checkbox
                style={{ whiteSpace: 'nowrap' }}
                checked={attrGroup.attribute_group_type === 1}
                onChange={(checked) => {
                  updateNestedValue(
                    [labelIndex, 'attribute_group_type'],
                    checked ? 1 : 2,
                    true
                  );
                }}
              >
                必须标注
              </Checkbox>
            </FormItem>
            {attrGroup.attribute_group_class !== 3 && (
              <FormItem
                style={{ marginRight: 0, marginBottom: 0 }}
                label={null}
              >
                <IconPlus
                  className="icon-wrapper ml-2"
                  fontSize={16}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setTemplateData(
                      templateData?.map((g) => {
                        if (g.attribute_id === attrGroup.attribute_id) {
                          return {
                            ...g,
                            label_info_attribute: [
                              ...g.label_info_attribute,
                              {
                                label_info_id: uuidV4(),
                                attribute_group_class:
                                  attrGroup.attribute_group_class,
                                attribute_group_type:
                                  attrGroup.attribute_group_type
                              }
                            ]
                          };
                        }
                        return g;
                      })
                    );
                  }}
                />
              </FormItem>
            )}
            <FormItem style={{ marginRight: 0, marginBottom: 0 }} label={null}>
              <Tooltip content="删除">
                <IconDelete
                  className="icon-wrapper ml-2"
                  fontSize={16}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setTemplateData(
                      templateData.filter(
                        (g) => g.attribute_id !== attrGroup.attribute_id
                      )
                    );
                  }}
                />
              </Tooltip>
            </FormItem>
          </div>
          {(1 === attrGroup.attribute_group_class ||
            2 === attrGroup.attribute_group_class) && (
            <div key={labelIndex} className="attribute-group-item-template">
              <div className="attribute-group-info-title-temp">
                {1 === attrGroup.attribute_group_class
                  ? '单选选项'
                  : 2 === attrGroup.attribute_group_class
                    ? '多选选项'
                    : ''}
              </div>
              {attrGroup.label_info_attribute?.map((attr, attrIndex) => (
                <div
                  key={attr.label_info_id}
                  className="attribute-group-info-item"
                >
                  <div className="attribute-info-item">
                    <FormItem
                      field={`attribute_name_en${attr?.label_info_id}`}
                      label={`选项${attrIndex + 1}:`}
                      style={{ color: 'red' }}
                      rules={[
                        {
                          required: true,
                          validateTrigger: ['onChange', 'onBlur'],
                          validator: (value, callback) => {
                            if (!value) {
                              return callback('请输入选项名称');
                            }
                            const duplicateFound =
                              attrGroup.label_info_attribute.some(
                                (otherAttr, otherIndex) => {
                                  return (
                                    otherIndex !== attrIndex &&
                                    otherAttr.attribute_name_en &&
                                    otherAttr.attribute_name_en.trim() ===
                                      value.trim()
                                  );
                                }
                              );
                            if (duplicateFound) {
                              return callback('选项名称不能重复');
                            }
                            callback();
                          }
                        }
                      ]}
                    >
                      <Input
                        type="text"
                        placeholder="用于存储标注结果"
                        value={attr.attribute_name_en}
                        style={{
                          width: 340,
                          height: 32,
                          backgroundColor: '#fff'
                        }}
                        onChange={(val) =>
                          updateNestedValue(
                            [
                              labelIndex,
                              'label_info_attribute',
                              attrIndex,
                              'attribute_name_en'
                            ],
                            val,
                            true
                          )
                        }
                      />
                    </FormItem>
                    <FormItem
                      field={`attribute_name_cn${attr?.label_info_id}`}
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
                      rules={[
                        {
                          validateTrigger: ['onChange', 'onBlur'],
                          validator: (value, callback) => {
                            if (!value) {
                              return callback('请输入展示名称');
                            }
                            const duplicateFound =
                              attrGroup.label_info_attribute.some(
                                (otherAttr, otherIndex) => {
                                  return (
                                    otherIndex !== attrIndex &&
                                    otherAttr.attribute_name_cn &&
                                    otherAttr.attribute_name_cn.trim() ===
                                      value.trim()
                                  );
                                }
                              );
                            if (duplicateFound) {
                              return callback('展示名称不能重复');
                            }
                            callback();
                          }
                        }
                      ]}
                    >
                      <Input
                        placeholder="展示在标注页面的名称"
                        type="text"
                        style={{
                          width: 340,
                          height: 32,
                          backgroundColor: '#fff'
                        }}
                        value={attr.attribute_name_cn}
                        onChange={(val: any) => {
                          updateNestedValue(
                            [
                              labelIndex,
                              'label_info_attribute',
                              attrIndex,
                              'attribute_name_cn'
                            ],
                            val,
                            true
                          );
                        }}
                      />
                    </FormItem>
                    <FormItem label={null} style={{ margin: 0 }}>
                      {attrGroup.label_info_attribute?.length > 1 && (
                        <Tooltip content="删除">
                          <IconDelete
                            className="icon-wrapper"
                            fontSize={16}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setTemplateData(
                                templateData?.map((label) =>
                                  label.attribute_id === attrGroup.attribute_id
                                    ? {
                                        ...label,
                                        label_info_attribute:
                                          label.label_info_attribute.filter(
                                            (g) =>
                                              g.label_info_id !==
                                              attr.label_info_id
                                          )
                                      }
                                    : label
                                )
                              );
                            }}
                          />
                        </Tooltip>
                      )}
                    </FormItem>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <Button
        className="btn-add-default btn-add"
        style={{ marginLeft: 16, marginBottom: 16 }}
        onClick={() => {
          setTemplateData([
            ...templateData,
            {
              attribute_id: uuidV4(),
              attribute_group_name: '',
              attribute_group_class: 1,
              attribute_group_type: 1,
              isTemp: true,
              label_info_attribute: [
                {
                  label_info_id: uuidV4(),
                  attribute_name_cn: '',
                  attribute_name_en: '',
                  input_type: 1
                }
              ]
            }
          ]);
        }}
      >
        <IconPlus />
        添加属性
      </Button>
    </div>
  );
};

export default TemplateAttributeForm;
