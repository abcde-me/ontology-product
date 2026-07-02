import React from 'react';
import { Form, Input, Popover, Select, Tag } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { ObjectTypeSelect } from '../../../../../components';
import OneWayArrowIcon from '../../../../../assets/one-way-arrow.svg';
import TwoWayArrowIcon from '../../../../../assets/double-headed-arrow.svg';
import { LinkDirection, LinkType } from '../../../../../types/link';
import LinkTypeSelector from '../LinkTypeSelector';
import { LinkFormData, PrimaryAttribute } from '../types';
import {
  ONTOLOGY_IDENTIFIER_EXTRA,
  ontologyIdentifierValidatorRule
} from '@/utils/ontologyIdentifier';

const FormItem = Form.Item;

interface BasicInfoSectionProps {
  form: any;
  styles: Record<string, string>;
  initialValues?: Partial<LinkFormData>;
  linkType: LinkType;
  linkDirection: LinkDirection;
  ontologyModelID?: number;
  sourceObjectType?: number;
  targetObjectType?: number;
  sourcePrimaryAttribute: PrimaryAttribute | null;
  setSourcePrimaryAttribute: React.Dispatch<
    React.SetStateAction<PrimaryAttribute | null>
  >;
  targetPrimaryAttributeName: string | null;
  targetObjectAttributeOptions: string[];
  targetPrimaryAttributeLoading: boolean;
  onLinkTypeChange: (type: LinkType) => void;
  onLinkDirectionChange: (direction: LinkDirection) => void;
  /** 编辑页 N:N 仅允许改名称：锁定链接类型与对象类型 */
  nnNameOnlyEdit?: boolean;
}

const renderTargetTypeAndAttribute = ({
  form,
  styles,
  ontologyModelID,
  targetObjectType,
  targetPrimaryAttributeName,
  targetObjectAttributeOptions,
  targetPrimaryAttributeLoading,
  disabled
}: {
  form: any;
  styles: Record<string, string>;
  ontologyModelID?: number;
  targetObjectType?: number;
  targetPrimaryAttributeName: string | null;
  targetObjectAttributeOptions: string[];
  targetPrimaryAttributeLoading: boolean;
  disabled?: boolean;
}) => (
  <>
    <div className="mb-[8px] flex items-center gap-[4px] text-[14px] text-[var(--color-text-2)]">
      <span>
        目标对象类型和属性
        <Popover content="选择目标对象类型后，会自动关联目标对象类型的主键属性">
          <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
        </Popover>
      </span>
    </div>
    <Input.Group compact className={`${styles['table-select-group']} w-full`}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ObjectTypeSelect
          ontologyModelID={ontologyModelID}
          value={targetObjectType}
          disabled={disabled}
          onChange={(val) => {
            form.setFieldValue('targetObjectType', val);
            form.setFieldValue('targetObjectAttribute', undefined);
          }}
          placeholder="请选择对象类型"
          allowClear
          label=""
          className="mb-0"
          selectProps={{
            dropdownMenuStyle: { width: 400 },
            triggerProps: {
              autoAlignPopupWidth: false,
              position: 'bl',
              style: { width: 400 }
            }
          }}
        />
      </div>
      <FormItem field="targetObjectAttribute" noStyle>
        <Select
          className={styles['table-select-wrapper']}
          placeholder={
            targetObjectType
              ? targetPrimaryAttributeLoading
                ? '加载中...'
                : '请选择属性'
              : '请先选择对象类型'
          }
          disabled={
            disabled || !targetObjectType || targetPrimaryAttributeLoading
          }
          allowClear
          style={{ width: '50%' }}
          dropdownMenuStyle={{ width: 400 }}
          triggerProps={{
            autoAlignPopupWidth: false,
            position: 'bl',
            style: { width: 400 }
          }}
        >
          {targetObjectAttributeOptions.map((name) => (
            <Select.Option key={name} value={name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
    </Input.Group>
    {targetPrimaryAttributeName && (
      <div className="mt-[4px] flex items-center text-[14px] leading-[20px] text-[var(--color-text-1)]">
        {targetPrimaryAttributeName}
        <Tag color="#FBF2FF" className="ml-[4px] text-[#9254DE]" size="small">
          主键
        </Tag>
      </div>
    )}
  </>
);

export default function BasicInfoSection({
  form,
  styles,
  initialValues,
  linkType,
  linkDirection,
  ontologyModelID,
  sourceObjectType,
  targetObjectType,
  sourcePrimaryAttribute,
  setSourcePrimaryAttribute,
  targetPrimaryAttributeName,
  targetObjectAttributeOptions,
  targetPrimaryAttributeLoading,
  onLinkTypeChange,
  onLinkDirectionChange,
  nnNameOnlyEdit = false
}: BasicInfoSectionProps) {
  const linkPairValidator = {
    required: true,
    validator: (_value: unknown, callback: (error?: string) => void) => {
      const sourceType = form.getFieldValue('sourceObjectType');
      const targetType = form.getFieldValue('targetObjectType');
      if (!sourceType || !targetType) {
        callback('请选择源对象类型和目标对象类型');
      } else {
        callback();
      }
    },
    validateTrigger: [] as never[]
  };

  return (
    <>
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        链接类型
      </div>
      <FormItem field="linkType" label="">
        <LinkTypeSelector
          value={linkType}
          onChange={onLinkTypeChange}
          disabled={nnNameOnlyEdit}
        />
      </FormItem>

      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        基本信息
      </div>

      <FormItem
        label="链接名称"
        field="name"
        rules={[
          { required: true, message: '请输入链接名称' },
          { maxLength: 50, message: '名称不能超过50个字符' }
        ]}
      >
        <Input
          className="max-w-[640px]"
          placeholder="请输入链接名称"
          maxLength={50}
          showWordLimit
        />
      </FormItem>

      <FormItem
        label="链接id"
        field="id"
        rules={[
          { required: true, message: '请输入链接id' },
          ontologyIdentifierValidatorRule
        ]}
        extra={
          <div className="text-[12px] text-[var(--color-text-4)]">
            {ONTOLOGY_IDENTIFIER_EXTRA}
          </div>
        }
      >
        <Input
          className="max-w-[640px]"
          showWordLimit
          placeholder="根据名称自动生成，可修改"
          disabled={!!initialValues?.id}
        />
      </FormItem>

      <FormItem label="链接对" field="linkPair" rules={[linkPairValidator]}>
        <div className="flex items-start">
          <div
            className={`flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px] ${linkType === LinkType.MANY_TO_MANY ? 'mr-[120px]' : 'mr-[90px]'}`}
          >
            <div className="relative">
              <ObjectTypeSelect
                ontologyModelID={ontologyModelID}
                label="源对象类型"
                value={sourceObjectType}
                disabled={nnNameOnlyEdit}
                onChange={(val) => {
                  form.setFieldValue('sourceObjectType', val);
                  if (!val) {
                    setSourcePrimaryAttribute(null);
                  }
                }}
                placeholder="请选择对象类型"
                allowClear
              />
              {linkType === LinkType.MANY_TO_MANY ? (
                <TwoWayArrowIcon className="absolute bottom-[3px] right-[calc(-12px-120px)]" />
              ) : (
                <OneWayArrowIcon className="absolute bottom-[9px] right-[calc(-12px-90px)]" />
              )}
            </div>

            {sourcePrimaryAttribute && (
              <div className="mt-[4px] flex items-center text-[14px] leading-[20px] text-[var(--color-text-1)]">
                {sourcePrimaryAttribute.name}
                <Tag
                  color="#FBF2FF"
                  className="ml-[4px] text-[#9254DE]"
                  size="small"
                >
                  主键
                </Tag>
              </div>
            )}
          </div>

          {linkType === LinkType.MANY_TO_MANY ? (
            <div className="flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
              <ObjectTypeSelect
                ontologyModelID={ontologyModelID}
                label="目标对象类型"
                value={targetObjectType}
                disabled={nnNameOnlyEdit}
                onChange={(val) => {
                  form.setFieldValue('targetObjectType', val);
                }}
                placeholder="请选择对象类型"
                allowClear
              />
              {targetPrimaryAttributeName && (
                <div className="mt-[4px] flex items-center text-[14px] leading-[20px] text-[var(--color-text-1)]">
                  {targetPrimaryAttributeName}
                  <Tag
                    color="#FBF2FF"
                    className="ml-[4px] text-[#9254DE]"
                    size="small"
                  >
                    主键
                  </Tag>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
              {renderTargetTypeAndAttribute({
                form,
                styles,
                ontologyModelID,
                targetObjectType,
                targetPrimaryAttributeName,
                targetObjectAttributeOptions,
                targetPrimaryAttributeLoading,
                disabled: nnNameOnlyEdit
              })}
            </div>
          )}
        </div>
      </FormItem>
    </>
  );
}
