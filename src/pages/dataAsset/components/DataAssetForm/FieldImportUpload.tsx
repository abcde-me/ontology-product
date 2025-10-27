import { Upload, Message } from '@arco-design/web-react';
import React, { useState } from 'react';
import { PrefixAimdp } from '@/api/endpoints';

interface FieldImportUploadProps {
  onFileChange: (fileData: any) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const FieldImportUpload: React.FC<FieldImportUploadProps> = ({
  onFileChange,
  onUploadingChange
}) => {
  const [fileList, setFileList] = useState<any>([]);

  const handleUploadChange = (files: any) => {
    setFileList(files);

    // 检查是否有文件正在上传
    const isUploading = files.some((file: any) => file.status === 'uploading');
    if (onUploadingChange) {
      onUploadingChange(isUploading);
    }

    if (onFileChange) {
      if (files.length === 0) {
        onFileChange(null);
        return;
      }

      // 处理已完成的文件
      const completedFiles = files.filter(
        (file: any) =>
          file.status === 'done' && file.response && file.response.data
      );

      if (completedFiles.length > 0) {
        // 传递第一个完成的文件数据
        onFileChange(completedFiles[0].response.data);
      }
    }
  };

  const getToken = () => {
    const token = localStorage.getItem('loginToken');
    return token ? token.replace(/"/g, '') : '';
  };

  const checkFileType = (file: any) => {
    const fileName = file.name || '';
    const isValidFileType = /\.(xlsx|xls)$/i.test(fileName);
    return isValidFileType;
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const invalidFiles = files.filter((file: any) => !checkFileType(file));
    if (invalidFiles.length > 0) {
      Message.error('只能上传 .xlsx,.xls文件');
      return false;
    }
  };

  const checkFile = (file: any) => {
    // 检查文件类型
    if (!checkFileType(file)) {
      Message.error('只能上传Excel格式 (.xlsx,.xls) 文件');
      return false;
    }

    // 检查文件大小 (假设限制为50M)
    if (file.size > 50 * 1024 * 1024) {
      Message.error('单文件大小不能超过50M');
      return false;
    }

    // 只允许上传1个文件
    if (fileList.length >= 1) {
      Message.error('最多上传1个文件');
      return false;
    }

    return true;
  };

  return (
    <Upload
      drag
      className="upload-file"
      accept=".xlsx,.xls"
      beforeUpload={(file) => {
        return checkFile(file);
      }}
      action={`${PrefixAimdp}/UploadLoadTaskFile`}
      onChange={handleUploadChange}
      onDrop={handleDrop}
      headers={{
        Authorization: getToken(),
        'X-Auth-Validate': 'true',
        'X-Regionid': 'region1'
      }}
    />
  );
};

export default FieldImportUpload;
