import {
  getOntologyObjectTypeDetail,
  getRuntimeOntologyObjectTypeMetadata,
  registerOntologyObjectTypeMetadata,
  updateOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import type { SceneObjectTypeRef } from '@/pages/ontologyScene/modules/functionDetail/services/fetchSceneOntologyContext';
import type {
  GetOntologyObjectTypeDetailRes,
  UpdateOntologyObjectTypeReq
} from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  devMirrorOntologyObjectType,
  resolveDevInstancesForPayload
} from '@/utils/devObjectTypeStore';
import { isDevBypassEnabled } from '@/utils/devFallback';

export type RuntimeMetadataProbeResult =
  | 'registered'
  | 'missing'
  | 'unavailable'
  | 'unknown';

export interface RegisterSceneObjectTypeMetadataResult {
  ready: boolean;
  message: string;
  registeredCodes: string[];
  failedCodes: string[];
}

const METADATA_MISSING_MARKERS = [
  '资源不存在',
  'ResourceNotFound',
  'not found'
];

export const responseIndicatesMetadataMissing = (response: {
  message?: string;
  code?: string | number;
  statusCode?: number;
}): boolean => {
  const message = String(response.message || '');
  const code = String(response.code || '');

  if (
    response.statusCode === 500 &&
    METADATA_MISSING_MARKERS.some((m) => message.includes(m))
  ) {
    return true;
  }

  return (
    code === 'ERROR' &&
    METADATA_MISSING_MARKERS.some((marker) =>
      message.toLowerCase().includes(marker.toLowerCase())
    )
  );
};

export const responseIndicatesProbeApiUnavailable = (response: {
  message?: string;
  code?: string | number;
}): boolean => {
  const message = String(response.message || '');
  const code = String(response.code || '');
  return (
    code === 'APINotFound' ||
    message.includes('API 不存在') ||
    message.toLowerCase().includes('not found')
  );
};

const isRuntimeMetadataApiUnavailable = (error: unknown): boolean => {
  const message = String(
    error instanceof Error ? error.message : error || ''
  ).toLowerCase();

  return (
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('network error') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  );
};

export const probeRuntimeObjectTypeMetadata = async (
  code: string,
  ontologyModelID?: number
): Promise<RuntimeMetadataProbeResult> => {
  try {
    const response = await getRuntimeOntologyObjectTypeMetadata({
      code,
      ontologyModelID
    });

    if (isOntologyApiSuccess(response)) {
      return 'registered';
    }

    if (responseIndicatesProbeApiUnavailable(response)) {
      return 'unavailable';
    }

    if (responseIndicatesMetadataMissing(response)) {
      return 'missing';
    }

    return 'unknown';
  } catch (error) {
    if (isRuntimeMetadataApiUnavailable(error)) {
      return 'unavailable';
    }
    return 'unknown';
  }
};

const buildMetadataRegistrationUpdatePayload = (
  detail: GetOntologyObjectTypeDetailRes
): UpdateOntologyObjectTypeReq => ({
  id: detail.id,
  code: detail.code || '',
  name: detail.name || detail.code || '',
  description: detail.description,
  icon: detail.icon || 'object-type-1',
  ontologyModelID: detail.ontologyModelID,
  filePath: detail.filePath,
  enableSyncSourceData: detail.enableSyncSourceData ?? false,
  originalDbName: detail.originalDbName || '',
  originalTableName: detail.originalTableName || '',
  sourceType: detail.sourceType,
  isReUpload: 0,
  ontologyPhysicalPropertiesList: detail.ontologyPhysicalPropertiesList || []
});

const registerViaObjectTypeUpdate = async (
  objectTypeId: number
): Promise<{ ok: boolean; message: string }> => {
  const detailRes = await getOntologyObjectTypeDetail({ id: objectTypeId });
  if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
    return {
      ok: false,
      message: detailRes.message || '获取对象类型详情失败'
    };
  }

  const payload = buildMetadataRegistrationUpdatePayload(detailRes.data);
  const updateRes = await updateOntologyObjectType(payload);

  if (isOntologyApiSuccess(updateRes)) {
    if (isDevBypassEnabled()) {
      devMirrorOntologyObjectType(
        objectTypeId,
        payload,
        resolveDevInstancesForPayload(payload)
      );
    }
    return { ok: true, message: '' };
  }

  return {
    ok: false,
    message: updateRes.message || '通过更新对象类型补注册失败'
  };
};

const buildMetadataNotReadyMessage = (
  objectType: SceneObjectTypeRef,
  probe: RuntimeMetadataProbeResult
): string => {
  if (probe === 'missing') {
    return `${objectType.name || objectType.code}（${objectType.code}）：场景库已有该类型，但运行时元数据服务返回「资源不存在」——属于后端注册断层，不是代码写错`;
  }

  return [
    `${objectType.name || objectType.code}（${objectType.code}）：无法确认已同步到运行时元数据服务`,
    '函数中使用了 ObjectRef.Type()，试运行必然会查询 ontology-metadata-service',
    '建议：改为 ObjectRef/ObjectSet 入参（试运行时选择实例），或联系后端修复对象类型创建/更新后的元数据同步'
  ].join('；');
};

const registerSingleObjectTypeRuntimeMetadata = async (
  objectType: SceneObjectTypeRef,
  sceneId: number
): Promise<{
  ok: boolean;
  message: string;
  probe: RuntimeMetadataProbeResult;
}> => {
  let probe = await probeRuntimeObjectTypeMetadata(objectType.code, sceneId);
  if (probe === 'registered') {
    return { ok: true, message: '', probe };
  }

  if (probe !== 'unavailable') {
    try {
      const registerRes = await registerOntologyObjectTypeMetadata({
        id: objectType.id,
        ontologyModelID: sceneId,
        code: objectType.code
      });

      if (isOntologyApiSuccess(registerRes)) {
        probe = await probeRuntimeObjectTypeMetadata(objectType.code, sceneId);
        if (probe === 'registered') {
          return { ok: true, message: '', probe };
        }
      } else if (!responseIndicatesProbeApiUnavailable(registerRes)) {
        return {
          ok: false,
          message: registerRes.message || '补注册运行时元数据失败',
          probe
        };
      }
    } catch {
      // 专用补注册接口不可用时，回退 UpdateOntologyObjectType
    }
  }

  const updateResult = await registerViaObjectTypeUpdate(objectType.id);
  if (!updateResult.ok) {
    return { ok: false, message: updateResult.message, probe };
  }

  probe = await probeRuntimeObjectTypeMetadata(objectType.code, sceneId);
  if (probe === 'registered') {
    return { ok: true, message: '', probe };
  }

  return {
    ok: false,
    message: buildMetadataNotReadyMessage(objectType, probe),
    probe
  };
};

/** 对象浏览/条件查询前确保运行时元数据已注册，避免 ListOntologyObjectTypeData 报「资源不存在」 */
export const ensureObjectTypeRuntimeMetadata = async (params: {
  sceneId: number;
  objectTypeId: number;
  code: string;
  name?: string;
}): Promise<{ ok: boolean; message: string }> => {
  const result = await registerSingleObjectTypeRuntimeMetadata(
    {
      id: params.objectTypeId,
      code: params.code,
      name: params.name
    },
    params.sceneId
  );

  return {
    ok: result.ok,
    message: result.message
  };
};

/**
 * 对函数引用的对象类型执行运行时元数据补注册。
 * 仅当探测为 registered 时才视为可运行；禁止 devBypass 跳过元数据校验。
 */
export const registerSceneObjectTypesRuntimeMetadata = async (
  sceneId: number,
  codes: string[],
  objectTypes: SceneObjectTypeRef[]
): Promise<RegisterSceneObjectTypeMetadataResult> => {
  if (!codes.length) {
    return {
      ready: true,
      message: '',
      registeredCodes: [],
      failedCodes: []
    };
  }

  const registeredCodes: string[] = [];
  const failedCodes: string[] = [];
  const errors: string[] = [];

  for (const code of codes) {
    const objectType = objectTypes.find((item) => item.code === code);
    if (!objectType) {
      failedCodes.push(code);
      errors.push(`${code}：不在当前场景库`);
      continue;
    }

    const initialProbe = await probeRuntimeObjectTypeMetadata(code, sceneId);
    if (initialProbe === 'registered') {
      continue;
    }

    const result = await registerSingleObjectTypeRuntimeMetadata(
      objectType,
      sceneId
    );

    if (result.ok) {
      registeredCodes.push(code);
      continue;
    }

    failedCodes.push(code);
    errors.push(result.message || `${code}：补注册失败`);
  }

  if (failedCodes.length) {
    return {
      ready: false,
      message: [
        '以下对象类型尚不能在运行时执行（与是否参考 SDK 文档无关）：',
        errors.join('；')
      ].join(''),
      registeredCodes,
      failedCodes
    };
  }

  const summary =
    registeredCodes.length > 0
      ? `已自动补注册运行时元数据：${registeredCodes.join('、')}`
      : '';

  return {
    ready: true,
    message: summary,
    registeredCodes,
    failedCodes
  };
};
