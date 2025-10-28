import { Upload, Message } from '@arco-design/web-react';
import React, { useState } from 'react';
import { PrefixAimdp } from '@/api/endpoints';
import { IconUpload } from '@arco-design/web-react/icon';

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

  const handleDownloadTemplate = () => {
    // TODO: 实现模板下载功能
    Message.info('模板下载功能待实现');
  };

  return (
    <div>
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
        tip={
          <>
            支持Excel格式（.xlsx,.xls）文件
            <br />
            最多上传1个文件，文件/压缩包源文件大小不超过xx
          </>
        }
      >
        <div>
          <div className="flex h-[210px] w-full flex-col items-center justify-center rounded-[2px] border border-dashed border-[#CBD5E1]">
            <IconUpload
              className="mb-[24px] size-[24px]"
              style={{ color: 'var(--text-color-text-1)' }}
            />
            <span className="text-[14px] text-[var(--color-text-1)]">
              点击或拖拽文件到此处上传
            </span>
            <span className="text-[12px] text-[var(--color-text-4)]">
              支持Excel格式（.xlsx,.xls）文件
            </span>
            <span className="text-[12px] text-[var(--color-text-4)]">
              最多上传1个文件，文件/压缩包源文件大小不超过xx
            </span>
          </div>
          {/* 下载模板提示 */}
          <div className="mt-[4px] text-[14px] text-[var(--color-text-2)]">
            <span>按照格式准备数据，点击</span>
            <a
              href="#"
              onClick={handleDownloadTemplate}
              className="text-[#007DFA]"
            >
              下载模板
            </a>
          </div>
        </div>
      </Upload>
    </div>
  );
};

export default FieldImportUpload;
