import {
  getOntologyObjectTypeDetail,
  syncObjectTypeTask
} from '@/api/ontologySceneLibrary/objectType';
import {
  canAutoConfigureDataResourceInstanceSync,
  configureDataResourceInstanceSync
} from '@/pages/ontologyScene/modules/objectType/services/configureDataResourceInstanceSync';
import { isDataResourceBackedObjectTypeFromRecord } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import type { OntologyFunctionParam } from '@/pages/ontologyScene/types/ontologyFunction';
import { SyncStatus } from '@/types/graphApi';
import type { ObjectType } from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { fetchSceneOntologyRefs } from './fetchSceneOntologyContext';
import type { SceneObjectTypeRef } from './fetchSceneOntologyContext';

const OBJECT_TYPE_CODE_PATTERNS = [
  /Object(?:Ref|Set)\.Type\(\s*["']([^"']+)["']\s*\)/g,
  /object_type\s*=\s*["']([^"']+)["']/g
];

const QUERY_OBJECT_TYPE_CODE_PATTERN =
  /"ontology_object_type_code"\s*:\s*"([^"]+)"/g;

const DATASET_READY_POLL_INTERVAL_MS = 2000;
const DATASET_READY_TIMEOUT_MS = 120_000;

export const functionUsesObjectRefTypeApi = (content: string): boolean =>
  /ObjectRef\.Type\s*\(/i.test(content);

export const functionUsesQueryObjectsApi = (content: string): boolean =>
  /client\.service\.query_objects/i.test(content);

/** dataset Query 在 FROM 后表名为空时的典型报错 */
export const isDatasetEmptyTableSqlError = (errorLog: string): boolean =>
  /Error 1064/i.test(errorLog) &&
  /near\s+""/i.test(errorLog) &&
  /dataset\/internal\/v1\/Query/i.test(errorLog);

export const extractQueryObjectTypeCodes = (content: string): string[] => {
  const codes = new Set<string>();
  let match: RegExpExecArray | null;
  const pattern = new RegExp(
    QUERY_OBJECT_TYPE_CODE_PATTERN.source,
    QUERY_OBJECT_TYPE_CODE_PATTERN.flags
  );

  while ((match = pattern.exec(content)) !== null) {
    const code = match[1]?.trim();
    if (code) {
      codes.add(code);
    }
  }

  return [...codes];
};

const extractObjectTypeCodesFromFunction = (
  content: string,
  input: OntologyFunctionParam[] = []
): string[] => {
  const codes = new Set<string>();

  OBJECT_TYPE_CODE_PATTERNS.forEach((pattern) => {
    let match: RegExpExecArray | null;
    const regexp = new RegExp(pattern.source, pattern.flags);
    while ((match = regexp.exec(content)) !== null) {
      const code = match[1]?.trim();
      if (code) {
        codes.add(code);
      }
    }
  });

  extractQueryObjectTypeCodes(content).forEach((code) => codes.add(code));

  input.forEach((param) => {
    const objectTypeData = param.uiTypeAndValue?.paramValue?.objectTypeData;
    if (objectTypeData?.code) {
      codes.add(String(objectTypeData.code).trim());
    }
  });

  return [...codes].filter(Boolean);
};

const formatObjectTypeLabel = (objectType: SceneObjectTypeRef) =>
  `${objectType.name}（code: ${objectType.code}）`;

const normalizeSyncStatus = (
  status?: SyncStatus | number | string
): SyncStatus | undefined => {
  if (status === undefined || status === null) {
    return undefined;
  }

  const numeric = Number(status);
  if (Number.isFinite(numeric) && numeric >= SyncStatus.NOT_SYNC) {
    return numeric as SyncStatus;
  }

  return status as SyncStatus;
};

export const resolveOntologyTableName = (
  objectType: Pick<ObjectType, 'ontologyTableName'>
): string => objectType.ontologyTableName?.trim() || '';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const fetchObjectTypeRecord = async (
  id: number
): Promise<ObjectType | null> => {
  const detailRes = await getOntologyObjectTypeDetail({ id });
  if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
    return null;
  }
  return detailRes.data;
};

const resolvePhysicalTableName = async (
  objectType: SceneObjectTypeRef
): Promise<{ tableName: string; record: ObjectType | null }> => {
  const fromList = objectType.ontologyTableName?.trim();
  if (fromList) {
    return { tableName: fromList, record: null };
  }

  const record = await fetchObjectTypeRecord(objectType.id);
  return {
    tableName: record ? resolveOntologyTableName(record) : '',
    record
  };
};

export const isObjectTypeDatasetQueryable = (
  record: Pick<ObjectType, 'ontologyTableName' | 'syncStatus'>
): boolean =>
  !!resolveOntologyTableName(record) &&
  normalizeSyncStatus(record.syncStatus) === SyncStatus.SUCCESS;

const areObjectTypesDatasetReady = async (
  objectTypes: SceneObjectTypeRef[]
): Promise<boolean> => {
  const checks = await Promise.all(
    objectTypes.map(async (objectType) => {
      const record =
        (await fetchObjectTypeRecord(objectType.id)) ||
        ({
          ontologyTableName: objectType.ontologyTableName,
          syncStatus: objectType.syncStatus
        } as ObjectType);
      return isObjectTypeDatasetQueryable(record);
    })
  );

  return checks.every(Boolean);
};

const waitForObjectTypesDatasetReady = async (
  objectTypes: SceneObjectTypeRef[],
  options?: { timeoutMs?: number; intervalMs?: number }
): Promise<{ ready: boolean; message: string }> => {
  const timeoutMs = options?.timeoutMs ?? DATASET_READY_TIMEOUT_MS;
  const intervalMs = options?.intervalMs ?? DATASET_READY_POLL_INTERVAL_MS;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await areObjectTypesDatasetReady(objectTypes)) {
      return { ready: true, message: '' };
    }

    await sleep(intervalMs);
  }

  const labels = objectTypes.map(formatObjectTypeLabel).join('、');
  return {
    ready: false,
    message: [
      `等待对象类型实例同步到 dataset 超时：${labels}`,
      '请在场景库「对象类型」列表确认同步状态为「同步成功」后再测试'
    ].join('。')
  };
};

const repairObjectTypeForDataset = async (
  objectType: SceneObjectTypeRef
): Promise<{ repaired: boolean; message: string }> => {
  const record = await fetchObjectTypeRecord(objectType.id);
  if (!record) {
    return { repaired: false, message: '获取对象类型详情失败' };
  }

  if (isObjectTypeDatasetQueryable(record)) {
    return { repaired: false, message: '' };
  }

  if (canAutoConfigureDataResourceInstanceSync(record)) {
    const result = await configureDataResourceInstanceSync(objectType.id);
    return { repaired: result.ok, message: result.message };
  }

  if (
    record.enableSyncSourceData &&
    isDataResourceBackedObjectTypeFromRecord(record)
  ) {
    const result = await configureDataResourceInstanceSync(objectType.id);
    return { repaired: result.ok, message: result.message };
  }

  const syncStatus = normalizeSyncStatus(record.syncStatus);
  if (syncStatus === SyncStatus.SYNCING) {
    return { repaired: false, message: '' };
  }

  const response = await syncObjectTypeTask({ id: objectType.id });
  if (response.status === 200 && response.code === '') {
    const message =
      syncStatus === SyncStatus.SUCCESS
        ? '已重新触发实例同步以修复 dataset 物理表映射'
        : '已触发实例同步';
    return { repaired: true, message };
  }

  return {
    repaired: false,
    message: response.message || '触发实例同步失败'
  };
};

const buildDatasetNotReadyMessage = (
  labels: string,
  extraMessages: string[] = []
) =>
  [
    ...extraMessages.filter(Boolean),
    `对象类型尚未在 dataset 注册物理表（query_objects 会报 SQL Error 1064）：${labels}`,
    '数据资源建模的类型请先在对象类型列表点击「未配置 → 配置」自动同步原表数据',
    '其他类型请在列表开启实例同步开关或执行「重试」后再测试'
  ]
    .filter(Boolean)
    .join('。');

const prepareQueryObjectsDataset = async (
  referencedTypes: SceneObjectTypeRef[]
): Promise<{ ready: boolean; message: string; syncTriggered: boolean }> => {
  if (await areObjectTypesDatasetReady(referencedTypes)) {
    return { ready: true, message: '', syncTriggered: false };
  }

  const repairMessages: string[] = [];
  let syncTriggered = false;
  let hasSyncingType = false;

  for (const objectType of referencedTypes) {
    const record = await fetchObjectTypeRecord(objectType.id);
    if (
      record &&
      normalizeSyncStatus(record.syncStatus) === SyncStatus.SYNCING
    ) {
      hasSyncingType = true;
      continue;
    }

    const repairResult = await repairObjectTypeForDataset(objectType);
    if (repairResult.message) {
      repairMessages.push(repairResult.message);
    }
    if (repairResult.repaired) {
      syncTriggered = true;
    }
  }

  if (await areObjectTypesDatasetReady(referencedTypes)) {
    return {
      ready: true,
      message: repairMessages.join('。'),
      syncTriggered
    };
  }

  if (syncTriggered || hasSyncingType) {
    const waitResult = await waitForObjectTypesDatasetReady(referencedTypes);
    if (waitResult.ready) {
      return {
        ready: true,
        message: [repairMessages.join('。'), '实例同步已完成，开始测试']
          .filter(Boolean)
          .join('。'),
        syncTriggered: true
      };
    }

    return {
      ready: false,
      message: [repairMessages.join('。'), waitResult.message]
        .filter(Boolean)
        .join('。'),
      syncTriggered: true
    };
  }

  const labels = referencedTypes.map(formatObjectTypeLabel).join('、');
  return {
    ready: false,
    message: buildDatasetNotReadyMessage(labels, repairMessages),
    syncTriggered: false
  };
};

const ensureQueryObjectsDatasetReady = async (
  content: string,
  sceneObjectTypes: SceneObjectTypeRef[]
): Promise<{ ready: boolean; message: string; syncTriggered: boolean }> => {
  if (!functionUsesQueryObjectsApi(content)) {
    return { ready: true, message: '', syncTriggered: false };
  }

  const queryCodes = extractQueryObjectTypeCodes(content);
  if (!queryCodes.length) {
    return { ready: true, message: '', syncTriggered: false };
  }

  const referencedTypes = sceneObjectTypes.filter((item) =>
    queryCodes.includes(item.code)
  );
  const missingCodes = queryCodes.filter(
    (code) => !referencedTypes.some((item) => item.code === code)
  );

  if (missingCodes.length) {
    return {
      ready: false,
      message: `query_objects 引用的对象类型 code 不在当前场景库：${missingCodes.join('、')}`,
      syncTriggered: false
    };
  }

  return prepareQueryObjectsDataset(referencedTypes);
};

/**
 * 校验函数引用的对象类型 code 是否存在于当前场景库，并确保 query_objects 目标已同步到 dataset。
 */
export const ensureFunctionObjectTypeMetadata = async (
  sceneId: number,
  content: string,
  input: OntologyFunctionParam[] = []
): Promise<{ ready: boolean; message: string; syncTriggered: boolean }> => {
  const codes = extractObjectTypeCodesFromFunction(content, input);
  if (!codes.length) {
    return { ready: true, message: '', syncTriggered: false };
  }

  const sceneRefs = await fetchSceneOntologyRefs(sceneId);
  const missingCodes = codes.filter(
    (code) => !sceneRefs.objectTypes.some((item) => item.code === code)
  );

  if (missingCodes.length) {
    const allowedCodes = sceneRefs.objectTypes
      .map((item) => `${item.code}（${item.name}）`)
      .join('、');

    return {
      ready: false,
      message: [
        `函数引用的对象类型 code 不在当前场景库：${missingCodes.join('、')}`,
        allowedCodes
          ? `当前场景可用 code：${allowedCodes}`
          : '当前场景暂无对象类型'
      ].join('。'),
      syncTriggered: false
    };
  }

  return ensureQueryObjectsDatasetReady(content, sceneRefs.objectTypes);
};
