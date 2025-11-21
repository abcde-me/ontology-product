import { Upload, Message } from '@arco-design/web-react';
import React, { useState } from 'react';
import { PrefixAimdp } from '@/api/endpoints';
import { IconUpload } from '@arco-design/web-react/icon';
import { UploadStatus } from '../../types';
import { downloadDataAssetFieldsTemplate } from '@/api/dataAsset';
import { AxiosResponse } from 'axios';

const getFileNameFromDisposition = (disposition?: string) => {
  if (!disposition) return '';

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch (error) {
      console.error('decode filename error', error);
      return utf8Match[1];
    }
  }

  const asciiMatch = disposition.match(/filename="?([^"]+)"?/i);
  return asciiMatch?.[1] ?? '';
};

interface FieldImportUploadProps {
  onFileChange: (fileData: any) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const FieldImportUpload: React.FC<FieldImportUploadProps> = ({
  onFileChange,
  onUploadingChange
}) => {
  const [fileList, setFileList] = useState<any>([]);

  const handleUploadChange = (files: any, file: any) => {
    // 更新 fileList 状态，让 Upload 组件受控
    setFileList(files);

    // 检查上传状态
    if (file.status === UploadStatus.uploading) {
      onUploadingChange?.(true);
      return;
    }

    if (file.status === UploadStatus.done) {
      if (file.response?.code !== '' || file.response?.status !== 200) {
        Message.error(file?.response?.message ?? '上传失败，请重试');
        onUploadingChange?.(false);
        return;
      }

      onFileChange(file?.response?.data ?? []);
      onUploadingChange?.(false);
    } else if (file.status === UploadStatus.error) {
      onUploadingChange?.(false);
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

  const handleDownloadTemplate = async () => {
    try {
      const res = (await downloadDataAssetFieldsTemplate()) as unknown as Blob;
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = `数据资产表模板.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      Message.success('开始下载模板');
    } catch (error) {
      console.error('下载模板失败', error);
      Message.error('下载模板失败');
    }
  };

  const handleRemove = (file: any) => {
    const newFileList = fileList.filter((item: any) => item.uid !== file.uid);
    setFileList(newFileList);
    onFileChange([]);
  };

  return (
    <div>
      <Upload
        drag
        className="upload-file"
        accept=".xlsx,.xls"
        fileList={fileList}
        showUploadList={fileList.length > 0 ? true : false}
        onRemove={handleRemove}
        beforeUpload={(file) => {
          return checkFile(file);
        }}
        action={`${PrefixAimdp}/AnalyzeDataAssetFieldsFile`}
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
              最多上传1个文件，文件大小不超过50M
            </span>
          </div>
          {/* 下载模板提示 */}
          <div className="mt-[4px] text-[14px] text-[var(--color-text-2)]">
            <span>按照格式准备数据，点击</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadTemplate();
              }}
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
