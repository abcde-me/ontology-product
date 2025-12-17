export function isBlob(val): boolean {
  return Object.prototype.toString.call(val) === '[object Blob]';
}

export const setAttrs = (ele, attrs = {}) => {
  Object.entries(attrs).forEach(([k, v]) => {
    ele.setAttribute(k, v);
  });
};

export const downloadBlob = (blob, options = {}) => {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(blob);
  fileReader.onload = (e) => {
    const elmentA = document.createElement('a');
    const href = e.target?.result ?? '';
    if (!href) return;
    setAttrs(elmentA, { ...options, href });
    document.body.appendChild(elmentA);
    elmentA.click();
    document.body.removeChild(elmentA);
  };
};

// 从 content-disposition header 中解析文件名
export const parseFilename = (contentDisposition: string): string => {
  if (!contentDisposition) return 'download.zip';

  // 优先处理 RFC 5987 格式: filename*=UTF-8''encoded-filename
  const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (rfc5987Match?.[1]) {
    try {
      return decodeURIComponent(rfc5987Match[1]);
    } catch (e) {
      console.warn('解码 RFC 5987 文件名失败:', e);
      return rfc5987Match[1];
    }
  }

  // 处理标准格式: filename="encoded-filename" 或 filename=encoded-filename
  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i
  );
  if (filenameMatch?.[1]) {
    let filename = filenameMatch[1];
    // 移除引号（开头和结尾的引号）
    filename = filename.replace(/^["']|["']$/g, '');
    // 尝试 URL 解码（如果文件名被编码了）
    try {
      filename = decodeURIComponent(filename);
    } catch (e) {
      // 如果解码失败，使用原始值（可能已经是解码后的）
    }
    return filename;
  }

  return 'download.zip';
};
