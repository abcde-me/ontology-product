import { FILE_RESOURCE_CATALOG } from '../data/fileCatalog';
import {
  SEED_PREVIEW_IMAGE_DESCRIPTION,
  SEED_PREVIEW_TEXT,
  SEED_PREVIEW_URL
} from '../data/filePreviewMocks';
import {
  getFilePreviewMode,
  isFilePreviewSupported,
  parseFileFormat
} from '../utils/fileFormat';
import type {
  FileResourceExtractSource,
  FileResourceListItem,
  FileResourceListResponse,
  FileResourcePreviewPayload,
  GetFileResourceListParams
} from '../types';

interface FilePreviewStore {
  url?: string;
  text?: string;
}

const uploadedFiles: FileResourceListItem[] = [];
const deletedCatalogIds = new Set<string>();
const previewStore = new Map<string, FilePreviewStore>();

const TEXT_EXTRACT_MAX_CHARS = 32000;

const truncateText = (text: string): { text: string; truncated: boolean } => {
  if (text.length <= TEXT_EXTRACT_MAX_CHARS) {
    return { text, truncated: false };
  }
  return {
    text: `${text.slice(0, TEXT_EXTRACT_MAX_CHARS)}\n\n…（内容过长，已截断）`,
    truncated: true
  };
};

const buildList = (): FileResourceListItem[] =>
  [...uploadedFiles, ...FILE_RESOURCE_CATALOG].filter(
    (item) =>
      !deletedCatalogIds.has(item.id) && isFilePreviewSupported(item.fileFormat)
  );

export const getFileResourceById = (id: string): FileResourceListItem | null =>
  buildList().find((item) => item.id === id) ?? null;

export const fetchFileResourceList = (
  params: GetFileResourceListParams
): Promise<FileResourceListResponse> => {
  const keyword = (params.filter || '').trim().toLowerCase();
  let items = buildList();

  if (keyword) {
    items = items.filter(
      (item) =>
        item.fileName.toLowerCase().includes(keyword) ||
        item.fileFormat.toLowerCase().includes(keyword)
    );
  }

  const total = items.length;
  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;

  return Promise.resolve({
    items: items.slice(start, start + pageSize),
    total,
    pageNo,
    pageSize
  });
};

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

export const uploadFileResource = async (
  file: File
): Promise<FileResourceListItem> => {
  const id = `upload-${Date.now()}`;
  const fileFormat = parseFileFormat(file.name);
  const previewMode = getFilePreviewMode(fileFormat);
  const store: FilePreviewStore = {};

  if (previewMode === 'image' || previewMode === 'pdf') {
    store.url = URL.createObjectURL(file);
  } else if (previewMode === 'text') {
    store.text = await readFileAsText(file);
  }

  previewStore.set(id, store);

  const item: FileResourceListItem = {
    id,
    fileName: file.name,
    fileSize: file.size,
    fileFormat,
    uploadTime: new Date().toLocaleString('zh-CN', { hour12: false })
  };

  uploadedFiles.unshift(item);
  return item;
};

export const deleteFileResource = (id: string): Promise<void> => {
  const uploadedIndex = uploadedFiles.findIndex((item) => item.id === id);
  if (uploadedIndex >= 0) {
    uploadedFiles.splice(uploadedIndex, 1);
  } else if (FILE_RESOURCE_CATALOG.some((item) => item.id === id)) {
    deletedCatalogIds.add(id);
  } else {
    return Promise.reject(new Error('文件不存在或已被删除'));
  }

  const stored = previewStore.get(id);
  if (stored?.url) {
    URL.revokeObjectURL(stored.url);
  }
  previewStore.delete(id);

  return Promise.resolve();
};

export const getFileResourcePreview = (
  record: FileResourceListItem
): Promise<FileResourcePreviewPayload> => {
  const stored = previewStore.get(record.id);
  const mode = getFilePreviewMode(record.fileFormat);

  if (stored?.url && (mode === 'image' || mode === 'pdf')) {
    return Promise.resolve({
      mode,
      fileName: record.fileName,
      fileFormat: record.fileFormat,
      url: stored.url
    });
  }

  if (stored?.text && mode === 'text') {
    return Promise.resolve({
      mode: 'text',
      fileName: record.fileName,
      fileFormat: record.fileFormat,
      text: stored.text
    });
  }

  if (SEED_PREVIEW_URL[record.id] && (mode === 'image' || mode === 'pdf')) {
    return Promise.resolve({
      mode,
      fileName: record.fileName,
      fileFormat: record.fileFormat,
      url: SEED_PREVIEW_URL[record.id]
    });
  }

  if (SEED_PREVIEW_TEXT[record.id] && mode === 'text') {
    return Promise.resolve({
      mode: 'text',
      fileName: record.fileName,
      fileFormat: record.fileFormat,
      text: SEED_PREVIEW_TEXT[record.id]
    });
  }

  if (mode === 'unsupported') {
    return Promise.resolve({
      mode: 'unsupported',
      fileName: record.fileName,
      fileFormat: record.fileFormat,
      message: `${record.fileFormat} 格式暂不支持在线预览，请下载后查看`
    });
  }

  return Promise.resolve({
    mode: 'metadata',
    fileName: record.fileName,
    fileFormat: record.fileFormat,
    message:
      '当前为示例文件记录，暂无实体文件。请通过「文件上传」添加文件后即可在线预览。'
  });
};

export const getFileResourceExtractSource = (
  record: FileResourceListItem
): Promise<FileResourceExtractSource> => {
  const mode = getFilePreviewMode(record.fileFormat);
  const stored = previewStore.get(record.id);
  const base = {
    fileName: record.fileName,
    fileFormat: record.fileFormat,
    fileSize: record.fileSize
  };

  const resolveTextSource = (text: string): FileResourceExtractSource => {
    const { text: normalized, truncated } = truncateText(text);
    return {
      ...base,
      contentType: 'text',
      text: normalized,
      note: truncated ? '文件内容较长，已截断后发送给大模型' : undefined
    };
  };

  if (stored?.text && mode === 'text') {
    return Promise.resolve(resolveTextSource(stored.text));
  }

  if (SEED_PREVIEW_TEXT[record.id] && (mode === 'text' || mode === 'pdf')) {
    return Promise.resolve(resolveTextSource(SEED_PREVIEW_TEXT[record.id]));
  }

  if (SEED_PREVIEW_IMAGE_DESCRIPTION[record.id] && mode === 'image') {
    return Promise.resolve(
      resolveTextSource(SEED_PREVIEW_IMAGE_DESCRIPTION[record.id])
    );
  }

  if (mode === 'unsupported') {
    return Promise.resolve({
      ...base,
      contentType: 'binary',
      note: `${record.fileFormat} 格式暂不支持内容解析，请基于文件元信息与提取要求作答。`
    });
  }

  return Promise.resolve({
    ...base,
    contentType: 'binary',
    note: '当前为示例文件记录，暂无实体内容。请结合文件名与提取要求给出合理推断，并提示用户上传实体文件以获得更准确结果。'
  });
};
