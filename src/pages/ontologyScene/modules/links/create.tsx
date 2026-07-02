import React, { useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button } from '@arco-design/web-react';
import LinkForm, {
  LinkCreateFormData,
  LinkFormData,
  LinkFormRef,
  LinkPairFormItem
} from './components/LinkForm';
import { createOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import { CreateOntologyLinkTypeReq } from '@/types/links';
import {
  mapFormLinkTypeToApi,
  mapLinkDirectionToFormLinkType
} from './components/linkForm/constants';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { IconLeft } from '@arco-design/web-react/icon';

const isLinkCreateFormData = (
  data: LinkFormData | LinkCreateFormData
): data is LinkCreateFormData => 'linkPairs' in data;

export default function OntologySceneLinksCreate() {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<LinkFormRef>(null);

  const listPath = `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/list`;

  const getAttributeNameById = async (
    attributeId: string,
    objectTypeId: number,
    ontologyModelID: number
  ): Promise<string | undefined> => {
    try {
      const attrId = Number(attributeId);
      if (isNaN(attrId)) {
        return attributeId;
      }

      const response = await listOntologyPhysicalProperties({
        objectTypeIdList: [objectTypeId],
        ontologyModelID,
        pageNo: 1,
        pageSize: 1000,
        isUse: 1
      });

      if (response.status === 200 && response.data?.result) {
        const attribute = response.data.result.find(
          (item) => item.id === attrId
        );
        return attribute?.name || attribute?.tableField || attributeId;
      }
      return attributeId;
    } catch (error) {
      console.error('Get attribute name error:', error);
      return attributeId;
    }
  };

  const buildCreateRequest = async (
    pair: LinkPairFormItem,
    ontologyModelID: number
  ): Promise<CreateOntologyLinkTypeReq> => {
    const linkType = mapLinkDirectionToFormLinkType(pair.linkDirection);
    const requestData: CreateOntologyLinkTypeReq = {
      code: pair.id,
      name: pair.name,
      type: mapFormLinkTypeToApi(linkType),
      ontologyModelID,
      sourceObjectTypeID: pair.sourceObjectType!,
      targetObjectTypeID: pair.targetObjectType!
    };

    if (pair.targetObjectAttribute && pair.targetObjectType) {
      const targetAttrName = await getAttributeNameById(
        pair.targetObjectAttribute,
        pair.targetObjectType,
        ontologyModelID
      );
      if (targetAttrName) {
        requestData.linkTargetColumnName = targetAttrName;
      }
    }

    return requestData;
  };

  const handleSubmit = async (data: LinkFormData | LinkCreateFormData) => {
    if (!isLinkCreateFormData(data)) {
      return;
    }

    setLoading(true);
    try {
      const ontologyModelID = OSId ? Number(OSId) : undefined;
      if (!ontologyModelID) {
        Message.error('缺少本体模型ID');
        return;
      }

      const { linkPairs } = data;
      let successCount = 0;

      for (const pair of linkPairs) {
        const requestData = await buildCreateRequest(pair, ontologyModelID);
        const response = await createOntologyLinkType(requestData);
        if (response.status === 200 && response.code === '') {
          successCount += 1;
        } else {
          Message.error(
            response.message ||
              `链接「${pair.name || pair.id}」创建失败，请重试`
          );
          return;
        }
      }

      if (successCount === linkPairs.length) {
        Message.success(
          linkPairs.length > 1 ? `成功创建 ${successCount} 个链接` : '创建成功'
        );
        history.push(listPath);
      }
    } catch (error: any) {
      console.error('Create link error:', error);
      Message.error(error?.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push(listPath);
  };

  const goBack = () => {
    history.replace(listPath);
  };

  return (
    <div className="relative flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
      <div className="flex items-center gap-[16px] border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[32px] text-[var(--color-text-1)]">
        <Button
          icon={<IconLeft />}
          size="default"
          type="default"
          onClick={goBack}
        />
        创建链接
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="overflow-y-auto pb-[65px]">
          <LinkForm
            ref={formRef}
            createMode
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            showFooter={false}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
          <div className="flex justify-start gap-[8px]">
            <Button
              type="primary"
              onClick={() => {
                formRef.current?.submit();
              }}
              loading={loading}
            >
              确定
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
