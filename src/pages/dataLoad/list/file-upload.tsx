import { Upload, Message } from '@arco-design/web-react';
import React, { useState } from 'react';

const Uploads = () => {
  let hasShownFileCountError = false;
  const [fileList, setFileList] = useState<any>([]);

  const checkFile = (file: any, list: any) => {
    // 检查文件数量 - 只在第一次检测到超出限制时显示提示
    if (Array.isArray(list) && list?.length > 10) {
      if (!hasShownFileCountError) {
        Message.error('单次最多上传10个文件');
        hasShownFileCountError = true;
        setTimeout(() => {
          hasShownFileCountError = false;
        }, 2000);
      }
      return false;
    }

    // 检查文件类型
    const isValidFileType =
      /\.(docx|pdf|jpg|jpeg|png|txt|md|wav|mp3|aac|flac|mp4|mov|mkv)$/i.test(
        file.name
      );
    if (!isValidFileType) {
      Message.error(
        '只能上传 .doc,.docx,.pdf,.jpg,.jpeg,.png,.txt,.md,.wav,.mp3,.aac,.flac,.mp4,.mov,.mkv文件'
      );
      return false;
    }

    // 检查文件大小
    if (file.size > 100 * 1024 * 1024) {
      Message.error('单文件大小不能超过50M');
      return false;
    }

    return true;
  };
  return (
    <Upload
      drag
      multiple
      accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt,.md,.wav,.mp3,.aac,.flac,.mp4,.mov,.mkv"
      beforeUpload={(file, list) => checkFile(file, list)}
      action="/"
      tip="Only pictures can be uploaded"
    />
  );
};

export default Uploads;
