import React from 'react';
import { Form, Popover, Select } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import TwoWayArrowIcon from '../../../../../assets/double-headed-arrow.svg';

const FormItem = Form.Item;

interface AttributeOption {
  label: string;
  value: string;
}

interface RelationMappingSectionProps {
  form: any;
  fileUploaded: boolean;
  attributeOptions: AttributeOption[];
}

export default function RelationMappingSection({
  form,
  fileUploaded,
  attributeOptions
}: RelationMappingSectionProps) {
  return (
    <FormItem
      label="关联中间表"
      field="relationAttributes"
      rules={[
        {
          required: true,
          validator: (_value, callback) => {
            const sourceAttributeValue = form.getFieldValue('sourceAttribute');
            const targetAttribute = form.getFieldValue('targetAttribute');
            if (!sourceAttributeValue || !targetAttribute) {
              callback('请选择源对象类型属性和目标对象类型属性');
            } else {
              callback();
            }
          }
        }
      ]}
    >
      <div className="flex items-center">
        <div className="mr-[120px] flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
          <div className="mb-[8px] flex items-center gap-[4px]">
            <span className="text-[14px] text-[var(--color-text-2)]">
              源对象类型属性
            </span>
            <Popover content="选择源对象类型中用于关联的属性">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </div>
          <div className="relative">
            <FormItem
              field="sourceAttribute"
              rules={[
                {
                  required: true,
                  validator: (value, callback) => {
                    if (!fileUploaded) {
                      callback('请先上传中间表');
                    } else if (!value) {
                      callback('请选择源对象类型属性');
                    } else {
                      callback();
                    }
                  }
                }
              ]}
              noStyle
            >
              <Select
                placeholder={fileUploaded ? '请选择属性' : '请先上传中间表'}
                disabled={!fileUploaded}
                allowClear
              >
                {attributeOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
            <TwoWayArrowIcon className="absolute bottom-[3px] right-[calc(-12px-120px)]" />
          </div>
        </div>

        <div className="flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
          <div className="mb-[8px] flex items-center gap-[4px]">
            <span className="text-[14px] text-[var(--color-text-2)]">
              目标对象类型属性
            </span>
            <Popover content="选择目标对象类型中用于关联的属性">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </div>
          <FormItem
            field="targetAttribute"
            rules={[
              {
                required: true,
                validator: (value, callback) => {
                  if (!fileUploaded) {
                    callback('请先上传中间表');
                  } else if (!value) {
                    callback('请选择目标对象类型属性');
                  } else {
                    callback();
                  }
                }
              }
            ]}
            noStyle
          >
            <Select
              placeholder={fileUploaded ? '请选择属性' : '请先上传中间表'}
              disabled={!fileUploaded}
              allowClear
            >
              {attributeOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </FormItem>
        </div>
      </div>
    </FormItem>
  );
}
