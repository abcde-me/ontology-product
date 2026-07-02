import { getApiErrorMessage } from '@/utils/apiResponse';

const FS_ID_FIELDS = [
  'fsID',
  'fsId',
  'filesystemID',
  'filesystemId',
  'fileSystemId',
  'file_system_id',
  'defaultFsID',
  'defaultFsId'
] as const;

/** 从对象上解析文件存储 ID（兼容多种后端字段名） */
export const pickFilesystemId = (
  source?: Record<string, unknown> | null
): string | undefined => {
  if (!source) {
    return undefined;
  }

  for (const key of FS_ID_FIELDS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  const nested =
    source.filesystem ||
    source.fileSystem ||
    source.defaultFilesystem ||
    source.defaultFileSystem;

  if (nested && typeof nested === 'object') {
    const id = (nested as Record<string, unknown>).id;
    if (typeof id === 'string' && id.trim()) {
      return id.trim();
    }
    if (typeof id === 'number' && Number.isFinite(id)) {
      return String(id);
    }
  }

  return undefined;
};

/** 根据组织/项目从 GetProjOrg 列表解析 fsID */
export const resolveProjectFilesystemId = (
  projectList: any[] | null | undefined,
  projectId: string[] | undefined
): string | undefined => {
  if (!projectList?.length || !projectId?.[0] || !projectId?.[1]) {
    return undefined;
  }

  const org = projectList.find((r) => r.id === projectId[0]);
  const project = org?.projectList?.find(
    (p: { id?: string }) => p.id === projectId[1]
  );

  return pickFilesystemId(project) || pickFilesystemId(org);
};

export const FILESYSTEM_NOT_CONFIGURED_HINT =
  '当前项目未绑定文件存储（Filesystem），无法上传附件。请在平台为该项目绑定文件存储后重试；本地开发可在 .env.development 中配置 REACT_APP_DEV_REAL_FS_ID。';

export const UPLOAD_PROJECT_REQUIRED_HINT =
  '请先在页面顶部选择有效项目后再上传文件；本地开发可配置 REACT_APP_DEV_REAL_ORG_ID 与 REACT_APP_DEV_REAL_PROJECT_ID。';

export const isFilesystemNotConfiguredError = (message?: string): boolean => {
  if (!message) {
    return false;
  }
  return (
    /no filesystem is configured/i.test(message) ||
    /filesystem.*bind/i.test(message) ||
    /未绑定.*文件存储/i.test(message)
  );
};

export const formatUploadErrorMessage = (
  error: unknown,
  fallback = '文件上传失败'
): string => {
  const msg = getApiErrorMessage(error, fallback);
  if (isFilesystemNotConfiguredError(msg)) {
    return FILESYSTEM_NOT_CONFIGURED_HINT;
  }
  return msg;
};
