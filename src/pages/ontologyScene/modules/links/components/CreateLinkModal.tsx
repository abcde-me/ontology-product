import React, { useMemo, useRef, useState } from 'react';
import { Message, Modal } from '@arco-design/web-react';
import { createOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import { CreateOntologyLinkTypeReq } from '@/types/links';
import { LinkType } from '../../../types/link';
import LinkForm, {
  LinkCreateFormData,
  LinkFormData,
  LinkFormRef
} from './LinkForm';
import { mapFormLinkTypeToApi } from './linkForm/constants';

export interface CreateLinkPreset {
  sourceObjectTypeID?: number;
  targetObjectTypeID?: number;
  name?: string;
  linkType?: LinkType;
}

interface CreateLinkModalProps {
  visible: boolean;
  sceneId: number;
  onClose: () => void;
  onSuccess?: () => void;
  preset?: CreateLinkPreset;
  title?: string;
  closeOnSuccess?: boolean;
}

const isLinkCreateFormData = (
  data: LinkFormData | LinkCreateFormData
): data is LinkCreateFormData => 'linkPairs' in data;

const buildCreateRequest = (
  data: LinkFormData,
  ontologyModelID: number
): CreateOntologyLinkTypeReq => {
  const requestData: CreateOntologyLinkTypeReq = {
    code: data.id,
    name: data.name,
    type: mapFormLinkTypeToApi(data.linkType),
    ontologyModelID,
    sourceObjectTypeID: data.sourceObjectType,
    targetObjectTypeID: data.targetObjectType
  };

  if (data.linkType !== LinkType.MANY_TO_MANY) {
    if (data.linkTargetColumnName) {
      requestData.linkTargetColumnName = data.linkTargetColumnName;
      if (data.linkSourceColumnName) {
        requestData.linkSourceColumnName = data.linkSourceColumnName;
      }
    } else if (data.targetObjectAttribute) {
      requestData.linkTargetColumnName = data.targetObjectAttribute;
      if (data.linkSourceColumnName) {
        requestData.linkSourceColumnName = data.linkSourceColumnName;
      }
    }
  }

  return requestData;
};

export default function CreateLinkModal({
  visible,
  sceneId,
  onClose,
  onSuccess,
  preset,
  title = '创建链接',
  closeOnSuccess = true
}: CreateLinkModalProps) {
  const formRef = useRef<LinkFormRef>(null);
  const [loading, setLoading] = useState(false);

  const initialValues = useMemo(() => {
    if (!preset) {
      return undefined;
    }

    return {
      name: preset.name,
      sourceObjectType: preset.sourceObjectTypeID,
      targetObjectType: preset.targetObjectTypeID,
      linkType: preset.linkType ?? LinkType.ONE_TO_ONE
    };
  }, [preset]);

  const handleSubmit = async (data: LinkFormData | LinkCreateFormData) => {
    if (isLinkCreateFormData(data)) {
      return;
    }

    setLoading(true);
    try {
      const requestData = buildCreateRequest(data, sceneId);
      const response = await createOntologyLinkType(requestData);

      if (response.status === 200 && response.code === '') {
        Message.success('创建成功');
        onSuccess?.();
        if (closeOnSuccess) {
          onClose();
        }
        return;
      }

      Message.error(response.message || '创建失败，请重试');
    } catch (error: unknown) {
      console.error('Create link error:', error);
      Message.error(
        error instanceof Error ? error.message : '创建失败，请重试'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      visible={visible}
      confirmLoading={loading}
      onOk={() => formRef.current?.submit()}
      onCancel={onClose}
      unmountOnExit
      style={{ width: 800 }}
    >
      <LinkForm
        ref={formRef}
        ontologyModelID={sceneId}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        showFooter={false}
      />
    </Modal>
  );
}
