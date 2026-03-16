import { Message } from '@arco-design/web-react';
import { getLoginToken } from '@/utils/env';

/**
 * 通用下载方法 - 通过URL下载文件
 * @param url 下载URL
 * @param fileName 自定义文件名（可选）
 */
export const downloadFileByUrl = async (url: string, fileName?: string) => {
  const token = getLoginToken();
  if (!token) {
    Message.error('请先登录');
    return;
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`);
    }

    const blob = await response.blob();

    // 从响应头获取文件名（如果有）
    let downloadFileName = fileName;
    if (!downloadFileName) {
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (match && match[1]) {
          downloadFileName = match[1].replace(/['"]/g, '');
        }
      }
    }

    if (!downloadFileName) {
      downloadFileName = `download_${Date.now()}`;
    }

    // 创建下载链接并触发下载
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadFileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);

    Message.success('文件下载成功');
    return true;
  } catch (error) {
    console.error('下载失败:', error);
    const errorMessage = error instanceof Error ? error.message : '下载失败';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * 通用下载方法 - 通过Blob下载文件
 * @param blob 文件Blob对象
 * @param fileName 文件名
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
