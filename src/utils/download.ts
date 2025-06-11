import { Message } from '@arco-design/web-react';
import { downloadFileById } from '@/api/dataCatalog';

/**
 * 通用下载方法
 * @param id 文件ID
 * @param fileName 自定义文件名（可选）
 */
export const downloadFile = async (id: string, fileName?: string) => {
//   在下载前检查token
  const token = localStorage.getItem('loginToken');
  if (!token) {
    Message.error('请先登录');
    // 跳转到登录页
    return;
  }

  try {
    // 调用下载API获取文件
    const response = await downloadFileById(id);

    let blob: Blob;
    let downloadFileName = fileName || `file_${id}`;

    // 处理响应数据
    if (response.data instanceof Blob) {
      blob = response.data;
    } else if (typeof response.data === 'string') {
      blob = new Blob([response.data], { type: 'application/octet-stream' });
    } else {
      // 如果是对象，转换为JSON字符串
      const content = JSON.stringify(response.data, null, 2);
      blob = new Blob([content], { type: 'application/json' });
      if (!fileName) {
        downloadFileName = `file_${id}.json`;
      }
    }

    // 从响应头获取文件名（如果有）
    const contentDisposition = response.headers?.['content-disposition'];
    if (contentDisposition && !fileName) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        downloadFileName = match[1].replace(/['"]/g, '');
      }
    }

    // 创建下载链接并触发下载
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Message.success('文件下载成功');
    return true;
  } catch (error) {
    console.error('下载失败:', error);
    const errorMessage = error instanceof Error ? error.message : '下载失败';
    Message.error(errorMessage);
    return false;
  }
};
