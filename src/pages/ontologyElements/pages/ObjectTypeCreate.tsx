import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Message, Spin } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import ObjectTypeForm, {
  ObjectTypeFormData
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeForm';
import { createOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { buildCreateObjectTypeRequest } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormHooks/useObjectTypeSubmit';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import { invalidateObjectTypeQueryCache } from '@/pages/exploreAnalysis/ontologyQuery/services/objectTypeQuery';
import { ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH } from '../constants';
import { resolveOntologyElementsLibraryModelId } from '../services/elementLibraryModel';
import { prepareObjectTypeCopyFormData } from '../services/prepareObjectTypeCopyFormData';
import formStyles from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeForm.module.scss';

const parseCopyFromId = (search: string) => {
  const raw = new URLSearchParams(search).get('copyFrom')?.trim();
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export default function OntologyElementsObjectTypeCreate() {
  const history = useHistory();
  const location = useLocation();
  const copyFromId = parseCopyFromId(location.search);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(true);
  const [copyLoading, setCopyLoading] = useState(Boolean(copyFromId));
  const [libraryModelId, setLibraryModelId] = useState<number | null>(null);
  const [copyInitialValues, setCopyInitialValues] =
    useState<Partial<ObjectTypeFormData>>();

  useEffect(() => {
    resolveOntologyElementsLibraryModelId()
      .then((modelId) => {
        setLibraryModelId(modelId);
      })
      .catch((error) => {
        console.error('初始化本体要素库失败:', error);
        Message.error(
          error instanceof Error ? error.message : '初始化本体要素库失败'
        );
        setCopyLoading(false);
      })
      .finally(() => {
        setResolving(false);
      });
  }, []);

  useEffect(() => {
    if (!copyFromId) {
      setCopyLoading(false);
      return;
    }

    if (!libraryModelId) {
      return;
    }

    let cancelled = false;
    setCopyLoading(true);

    prepareObjectTypeCopyFormData(copyFromId, libraryModelId)
      .then((values) => {
        if (!cancelled) {
          setCopyInitialValues(values);
        }
      })
      .catch((error) => {
        console.error('加载复制对象类型失败:', error);
        Message.error(
          error instanceof Error ? error.message : '加载复制对象类型失败'
        );
      })
      .finally(() => {
        if (!cancelled) {
          setCopyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [copyFromId, libraryModelId]);

  const initialValues = useMemo(() => {
    if (!libraryModelId) {
      return undefined;
    }

    if (copyFromId) {
      return copyInitialValues;
    }

    return {
      ontologyModelID: libraryModelId
    };
  }, [copyFromId, copyInitialValues, libraryModelId]);

  const handleSubmit = async (data: ObjectTypeFormData) => {
    if (!libraryModelId) {
      Message.error('本体要素库未就绪，请刷新后重试');
      return;
    }

    setLoading(true);
    try {
      const response = await createOntologyObjectType(
        buildCreateObjectTypeRequest({
          ...data,
          ontologyModelID: libraryModelId
        })
      );

      if (isOntologyApiSuccess(response)) {
        invalidateObjectTypeQueryCache();
        Message.success(
          isDevBypassEnabled() ? '创建成功（已保存到本地开发缓存）' : '创建成功'
        );
        history.push(ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH);
        return;
      }

      Message.error(response.message || '创建失败，请重试');
    } catch (error) {
      const message =
        typeof error === 'string' && error.trim() ? error : '创建失败，请重试';
      Message.error(message);
      console.error('创建对象类型失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    history.replace(ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH);
  };

  if (resolving || copyLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-white">
        <Spin
          tip={copyFromId ? '正在加载复制对象类型...' : '正在准备本体要素库...'}
        />
      </div>
    );
  }

  if (!libraryModelId || !initialValues) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full flex-col items-center justify-center gap-3 bg-white">
        <div className="text-[var(--color-text-2)]">
          {copyFromId ? '加载复制对象类型失败' : '本体要素库初始化失败'}
        </div>
        <Button type="primary" onClick={goBack}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden bg-white">
      <div className={formStyles['object-type-form-page-header']}>
        <Button
          icon={<IconLeft />}
          size="small"
          type="default"
          onClick={goBack}
        />
        {copyFromId ? '复制对象类型' : '创建对象类型'}
      </div>

      <div className={formStyles['object-type-form-shell']}>
        <ObjectTypeForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={goBack}
          loading={loading}
          twoStepOnly
        />
      </div>
    </div>
  );
}
