import { useEffect, useState } from 'react';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { LinkType } from '../../../../../types/link';
import { PrimaryAttribute } from '../types';

interface UseObjectTypePrimaryAttributesParams {
  form: any;
  sourceObjectType?: number;
  targetObjectType?: number;
  ontologyModelID?: number;
  linkType: LinkType;
}

export function useObjectTypePrimaryAttributes({
  form,
  sourceObjectType,
  targetObjectType,
  ontologyModelID,
  linkType
}: UseObjectTypePrimaryAttributesParams) {
  const [sourcePrimaryAttribute, setSourcePrimaryAttribute] =
    useState<PrimaryAttribute | null>(null);
  const [targetPrimaryAttributeName, setTargetPrimaryAttributeName] = useState<
    string | null
  >(null);
  const [targetObjectAttributeOptions, setTargetObjectAttributeOptions] =
    useState<string[]>([]);
  const [targetPrimaryAttributeLoading, setTargetPrimaryAttributeLoading] =
    useState(false);

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
  }, [sourceObjectType, ontologyModelID, linkType]);

  useEffect(() => {
    if (!targetObjectType || !ontologyModelID) {
      setTargetPrimaryAttributeName(null);
      setTargetObjectAttributeOptions([]);
      return;
    }

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

          const currentValue = form.getFieldValue('targetObjectAttribute');
          if (!currentValue) {
            form.setFieldValue('targetObjectAttribute', primaryName);
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
  }, [targetObjectType, ontologyModelID, linkType, form]);

  return {
    sourcePrimaryAttribute,
    setSourcePrimaryAttribute,
    targetPrimaryAttributeName,
    targetObjectAttributeOptions,
    targetPrimaryAttributeLoading
  };
}
