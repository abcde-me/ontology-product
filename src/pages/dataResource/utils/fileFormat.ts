const IMAGE_FORMATS = new Set([
  'PNG',
  'JPG',
  'JPEG',
  'GIF',
  'WEBP',
  'BMP',
  'SVG'
]);
const PDF_FORMATS = new Set(['PDF']);
const TEXT_FORMATS = new Set([
  'TXT',
  'CSV',
  'JSON',
  'XML',
  'MD',
  'LOG',
  'YAML',
  'YML'
]);

export const parseFileFormat = (fileName: string): string => {
  const segments = fileName.split('.');
  if (segments.length < 2) {
    return '未知';
  }
  return segments.pop()?.toUpperCase() || '未知';
};

export const getFilePreviewMode = (
  format: string
): 'image' | 'pdf' | 'text' | 'unsupported' => {
  const normalized = format.toUpperCase();
  if (IMAGE_FORMATS.has(normalized)) {
    return 'image';
  }
  if (PDF_FORMATS.has(normalized)) {
    return 'pdf';
  }
  if (TEXT_FORMATS.has(normalized)) {
    return 'text';
  }
  return 'unsupported';
};

export const isFilePreviewSupported = (format: string): boolean =>
  getFilePreviewMode(format) !== 'unsupported';

export const FILE_UPLOAD_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.xml,.md,.png,.jpg,.jpeg,.gif,.webp';

export const FILE_UPLOAD_MAX_SIZE_MB = 50;
