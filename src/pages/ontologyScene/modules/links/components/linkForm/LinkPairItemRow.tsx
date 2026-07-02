import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Popover,
  Select,
  Tag
} from '@arco-design/web-react';
import { IconDelete, IconQuestionCircle } from '@arco-design/web-react/icon';
import type { FormInstance } from '@arco-design/web-react';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { ObjectTypeSelect } from '../../../../components';
import { LinkDirection } from '../../../../types/link';
import LinkPairConnector from './LinkPairConnector';
import { useLinkPairAutoId } from './hooks/useLinkPairAutoId';
import { PrimaryAttribute } from './types';
import { mapLinkDirectionToFormLinkType } from './linkPairUtils';
import {
  getSourcePanelBackground,
  getTargetPanelBackground
} from './utils/objectTypeIconColor';

const FormItem = Form.Item;

interface LinkPairItemRowProps {
  form: FormInstance;
  fieldPrefix: string;
  index: number;
  ontologyModelID?: number;
  styles: Record<string, string>;
  canRemove: boolean;
  onRemove: () => void;
}

export default function LinkPairItemRow({
  form,
  fieldPrefix,
  index,
  ontologyModelID,
  styles,
  canRemove,
  onRemove
}: LinkPairItemRowProps) {
  const sourceObjectType = Form.useWatch(
    `${fieldPrefix}.sourceObjectType`,
    form
  );
  const targetObjectType = Form.useWatch(
    `${fieldPrefix}.targetObjectType`,
    form
  );
  const linkDirection =
    Form.useWatch(`${fieldPrefix}.linkDirection`, form) ??
    LinkDirection.UNIDIRECTIONAL;

  const [sourcePrimaryAttribute, setSourcePrimaryAttribute] =
    useState<PrimaryAttribute | null>(null);
  const [targetPrimaryAttributeName, setTargetPrimaryAttributeName] = useState<
    string | null
  >(null);
  const [targetObjectAttributeOptions, setTargetObjectAttributeOptions] =
    useState<string[]>([]);
  const [targetPrimaryAttributeLoading, setTargetPrimaryAttributeLoading] =
    useState(false);
  const [objectTypeIconMap, setObjectTypeIconMap] = useState<
    Record<number, string>
  >({});
  const prevTargetObjectTypeRef = useRef<number | undefined>();

  useLinkPairAutoId({ form, index, ontologyModelID });

  useEffect(() => {
    if (!ontologyModelID) {
      setObjectTypeIconMap({});
      return;
    }

    listOntologyObjectType({
      ontologyModelID,
      pageNo: -1,
      pageSize: -1
    })
      .then((response) => {
        if (response.status === 200 && response.data?.result) {
          const nextMap: Record<number, string> = {};
          response.data.result.forEach((item) => {
            if (item.id != null) {
              nextMap[item.id] = item.icon || '';
            }
          });
          setObjectTypeIconMap(nextMap);
        }
      })
      .catch(() => {
        setObjectTypeIconMap({});
      });
  }, [ontologyModelID]);

  const sourceIcon = sourceObjectType
    ? objectTypeIconMap[sourceObjectType]
    : undefined;
  const targetIcon = targetObjectType
    ? objectTypeIconMap[targetObjectType]
    : undefined;
  const sourcePanelBackground = getSourcePanelBackground(sourceIcon);
  const targetPanelBackground = getTargetPanelBackground(targetIcon);

  useEffect(() => {
    if (!sourceObjectType || !ontologyModelID) {
      setSourcePrimaryAttribute(null);
      return;
    }

    const fetchSourcePrimaryAttribute = async () => {
      try {
        const response = await listOntologyPhysicalProperties({
          objectTypeIdList: [sourceObjectType],
          ontologyModelID,
          isPrimary: 1,
          pageNo: 1,
          isUse: 1,
          pageSize: 1
        });
        if (
          response.status === 200 &&
          response.data?.result &&
          response.data.result.length > 0
        ) {
          const firstPrimary = response.data.result[0];
          setSourcePrimaryAttribute({
            name: firstPrimary.name || firstPrimary.tableField || '',
            id: firstPrimary.id || 0
          });
        } else {
          setSourcePrimaryAttribute(null);
        }
      } catch (error) {
        console.error('获取源对象类型主键属性失败:', error);
        setSourcePrimaryAttribute(null);
      }
    };

    fetchSourcePrimaryAttribute();
  }, [sourceObjectType, ontologyModelID]);

  useEffect(() => {
    if (!targetObjectType || !ontologyModelID) {
      setTargetPrimaryAttributeName(null);
      setTargetObjectAttributeOptions([]);
      return;
    }

    if (
      prevTargetObjectTypeRef.current !== undefined &&
      prevTargetObjectTypeRef.current !== targetObjectType
    ) {
      form.setFieldValue(`${fieldPrefix}.targetObjectAttribute`, undefined);
    }
    prevTargetObjectTypeRef.current = targetObjectType;

    const fetchTargetPrimaryAttribute = async () => {
      setTargetPrimaryAttributeLoading(true);
      try {
        const response = await listOntologyPhysicalProperties({
          objectTypeIdList: [targetObjectType],
          ontologyModelID,
          pageNo: -1,
          pageSize: -1,
          isUse: 1
        });
        if (
          response.status === 200 &&
          response.data?.result &&
          response.data.result.length > 0
        ) {
          const targetAttributeNames = response.data.result
            .map((item) => item.name || item.tableField || '')
            .filter(Boolean);
          setTargetObjectAttributeOptions(targetAttributeNames);

          const primaryProperty =
            response.data.result.find((item) => item.isPrimary === 1) ||
            response.data.result[0];
          const primaryName = primaryProperty?.name;
          setTargetPrimaryAttributeName(primaryName || null);

          const currentValue = form.getFieldValue(
            `${fieldPrefix}.targetObjectAttribute`
          );
          if (!currentValue && primaryName) {
            form.setFieldValue(
              `${fieldPrefix}.targetObjectAttribute`,
              primaryName
            );
          }
        } else {
          setTargetPrimaryAttributeName(null);
          setTargetObjectAttributeOptions([]);
        }
      } catch (error) {
        console.error('获取目标对象类型主键属性失败:', error);
        setTargetPrimaryAttributeName(null);
        setTargetObjectAttributeOptions([]);
      } finally {
        setTargetPrimaryAttributeLoading(false);
      }
    };

    fetchTargetPrimaryAttribute();
  }, [fieldPrefix, form, targetObjectType, ontologyModelID]);

  const handleDirectionChange = (direction: LinkDirection) => {
    form.setFieldsValue({
      [`${fieldPrefix}.linkDirection`]: direction,
      [`${fieldPrefix}.linkType`]: mapLinkDirectionToFormLinkType(direction)
    });
  };

  return (
    <div className="mb-[16px] rounded-[4px] border border-[#EBEEF5] bg-white p-[16px] shadow-[0_1px_4px_rgba(15,19,31,0.06)]">
      <div className="mb-[12px] flex items-center justify-between">
        <span className="text-[14px] font-[500] text-[var(--color-text-1)]">
          链接对 {index + 1}
        </span>
        {canRemove ? (
          <Button
            type="text"
            size="mini"
            icon={<IconDelete />}
            className="!text-[var(--color-text-3)] hover:!text-[#F53F3F]"
            onClick={onRemove}
          >
            删除
          </Button>
        ) : null}
      </div>

      <FormItem field={`${fieldPrefix}.linkDirection`} hidden>
        <input type="hidden" />
      </FormItem>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(300px,360px)_minmax(0,1fr)] items-stretch gap-[4px]">
        <div
          className="flex flex-col rounded-[4px] p-[12px]"
          style={{ backgroundColor: sourcePanelBackground }}
        >
          <div className="flex flex-col">
            <FormItem
              field={`${fieldPrefix}.sourceObjectType`}
              label="源对象类型"
              requiredSymbol={false}
              rules={[{ required: true, message: '请选择源对象类型' }]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              className="!mb-0"
            >
              <ObjectTypeSelect
                ontologyModelID={ontologyModelID}
                placeholder="请选择对象类型"
                allowClear
                label=""
                className="mb-0"
              />
            </FormItem>
            {sourcePrimaryAttribute ? (
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
            ) : null}
          </div>
        </div>

        <LinkPairConnector
          fieldPrefix={fieldPrefix}
          linkDirection={linkDirection}
          sourceIcon={sourceIcon}
          targetIcon={targetIcon}
          onChange={handleDirectionChange}
        />

        <div
          className="flex flex-col rounded-[4px] p-[12px]"
          style={{ backgroundColor: targetPanelBackground }}
        >
          <div className="mb-[8px] flex shrink-0 items-center gap-[4px] text-[14px] text-[var(--color-text-2)]">
            <span>
              目标对象类型和属性
              <Popover content="选择目标对象类型后，会自动关联目标对象类型的主键属性">
                <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
              </Popover>
            </span>
          </div>
          <div className="flex flex-col">
            <Input.Group
              compact
              className={`${styles['table-select-group']} w-full [&_.arco-form-item]:!mb-0`}
            >
              <div className="min-w-0 flex-1">
                <FormItem
                  field={`${fieldPrefix}.targetObjectType`}
                  requiredSymbol={false}
                  rules={[{ required: true, message: '请选择目标对象类型' }]}
                  noStyle
                >
                  <ObjectTypeSelect
                    ontologyModelID={ontologyModelID}
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
                </FormItem>
              </div>
              <FormItem
                field={`${fieldPrefix}.targetObjectAttribute`}
                requiredSymbol={false}
                rules={[{ required: true, message: '请选择目标属性' }]}
                noStyle
              >
                <Select
                  className={styles['table-select-wrapper']}
                  placeholder={
                    targetObjectType
                      ? targetPrimaryAttributeLoading
                        ? '加载中...'
                        : '请选择属性'
                      : '请先选择对象类型'
                  }
                  disabled={!targetObjectType || targetPrimaryAttributeLoading}
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
            {targetPrimaryAttributeName ? (
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
