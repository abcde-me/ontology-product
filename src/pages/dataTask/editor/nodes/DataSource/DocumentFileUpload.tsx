import React, { useEffect, useState } from 'react';
import { Message, Upload } from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import { PrefixAimdp } from '@/api/endpoints';

const DOCUMENT_FILE_PATTERN = /\.(csv|txt|pdf|doc|docx|xls|xlsx)$/i;

interface DocumentFileUploadProps {
  value?: string;
  fileName?: string;
  onChange?: (payload: { path: string; name: string } | null) => void;
}

export default function DocumentFileUpload({
  value,
  fileName,
  onChange
}: DocumentFileUploadProps) {
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (!value?.trim()) {
      setFileList([]);
      return;
    }

    setFileList([
      {
        uid: `document-${value}`,
        name: fileName || value.split('/').pop() || value,
        status: 'done',
        url: value
      }
    ]);
  }, [fileName, value]);

  const getToken = () => {
    const token = localStorage.getItem('loginToken');
    return token ? token.replace(/"/g, '') : '';
  };

  return (
    <Upload
      drag
      limit={1}
      accept=".csv,.txt,.pdf,.doc,.docx,.xls,.xlsx"
      action={`${PrefixAimdp}/UploadOntologyEntityDataFile`}
      headers={{
        Authorization: getToken()
      }}
      fileList={fileList}
      onChange={(_, currentFile) => {
        if (currentFile.status === 'uploading') {
          setFileList([currentFile]);
          return;
        }

        if (currentFile.status === 'error') {
          Message.error('文档上传失败');
          setFileList([]);
          onChange?.(null);
          return;
        }

        if (currentFile.status === 'done') {
          const responseData = currentFile.response?.data;
          const path = responseData?.path;
          if (!path) {
            Message.error('文档上传失败：未返回文件路径');
            setFileList([]);
            onChange?.(null);
            return;
          }

          const name =
            responseData?.name ||
            currentFile.name ||
            String(path).split('/').pop() ||
            path;
          setFileList([
            {
              ...currentFile,
              name
            }
          ]);
          onChange?.({ path, name });
          Message.success('文档上传成功');
          return;
        }

        if (!currentFile) {
          setFileList([]);
          onChange?.(null);
        }
      }}
      beforeUpload={(file) => {
        if (!DOCUMENT_FILE_PATTERN.test(file.name || '')) {
          Message.error('仅支持 CSV、TXT、PDF、Word、Excel 等文档格式');
          return false;
        }

        const maxSizeBytes = 100 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          Message.error('单文件大小不能超过 100MB');
          return false;
        }

        return true;
      }}
      tip="支持 CSV、TXT、PDF、Word、Excel 等文档格式，单文件不超过 100MB"
    >
      <div className="flex flex-col items-center justify-center py-[20px]">
        <IconUpload className="mb-[8px] text-[24px] text-[var(--color-text-3)]" />
        <div className="text-[14px] text-[var(--color-text-2)]">
          点击或拖拽文档到此处上传
        </div>
      </div>
    </Upload>
  );
}
