import { Upload, Message } from '@arco-design/web-react';
import React, { useState } from 'react';
import { PrefixAimdp } from '@/api/endpoints';
import { IconUpload, IconDownload } from '@arco-design/web-react/icon';
import { UploadStatus } from '../types/objectType';
import { downloadDataAssetFieldsTemplate } from '@/api/dataAsset';
import { useUserInfoStore } from '@/store/userInfoStore';

interface FieldImportUploadProps {
  onFileChange: (fileData: any) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  accept?: string; // 支持的文件类型，默认为 .xlsx,.xls
  fileType?: 'excel' | 'csv'; // 文件类型，用于不同的验证和提示
  maxSize?: number; // 文件大小限制（MB），默认50MB
}

const FieldImportUpload: React.FC<FieldImportUploadProps> = ({
  onFileChange,
  onUploadingChange,
  accept = '.xlsx,.xls',
  fileType = 'excel',
  maxSize = 50
}) => {
  const [fileList, setFileList] = useState<any>([]);
  const projectId = useUserInfoStore((state) => state.projectId);

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
        setFileList([]);
        onUploadingChange?.(false);
        return;
      }

      // 从最终的fileList中取值
      const doneFile = files.find((f: any) => f.status === UploadStatus.done);
      onFileChange(doneFile?.response?.data ?? []);
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
    if (fileType === 'csv') {
      return /\.(csv)$/i.test(fileName);
    }
    return /\.(xlsx|xls)$/i.test(fileName);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const invalidFiles = files.filter((file: any) => !checkFileType(file));
    if (invalidFiles.length > 0) {
      Message.error(
        fileType === 'csv' ? '只能上传 .csv文件' : '只能上传 .xlsx,.xls文件'
      );
      return false;
    }
  };

  const checkFile = (file: any) => {
    // 检查文件类型
    if (!checkFileType(file)) {
      Message.error(
        fileType === 'csv'
          ? '只能上传CSV格式文件'
          : '只能上传Excel格式 (.xlsx,.xls) 文件'
      );
      return false;
    }

    // 检查文件大小
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      Message.error(`单文件大小不能超过${maxSize}MB`);
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
      const res = await downloadDataAssetFieldsTemplate();

      if (res?.status !== 200 || res?.code !== '') {
        Message.error(res.message ?? '下载模板失败');
        return;
      }

      // 处理base64下载
      const base64Data = res?.data;
      if (!base64Data) {
        Message.error('下载模板失败：数据为空');
        return;
      }

      // 移除base64前缀（如果有的话）
      const base64String = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

      // 使用fetch配合data URL，更简洁的方法
      const blob = await fetch(
        `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64String}`
      ).then((r) => r.blob());

      // 创建下载链接并触发下载
      const url = window.URL.createObjectURL(blob);
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
        accept={accept}
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
          'X-Regionid': 'region1',
          'x-ceai-project-id': projectId[1]
        }}
        tip={
          fileType === 'csv' ? (
            <>仅支持上传UTF-8编码格式的文件,文件大小不超过{maxSize}MB</>
          ) : (
            <>
              支持Excel格式（.xlsx,.xls）文件
              <br />
              最多上传1个文件，文件/压缩包源文件大小不超过{maxSize}MB
            </>
          )
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
              {fileType === 'csv'
                ? '仅支持上传UTF-8编码格式的文件,文件大小不超过500MB'
                : '支持Excel格式（.xlsx,.xls）文件'}
            </span>
            {fileType === 'excel' && (
              <span className="text-[12px] text-[var(--color-text-4)]">
                最多上传1个文件，文件大小不超过{maxSize}M
              </span>
            )}
          </div>
          {/* 下载模板提示 */}
          {fileType === 'excel' && (
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
          )}
          {fileType === 'csv' && (
            <div className="mt-[4px] flex items-center gap-1 text-[14px] text-[var(--color-text-2)]">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownloadTemplate();
                }}
                className="text-[#007DFA] hover:underline"
              >
                <IconDownload className="mr-1 inline" />
                标准模板(.csv)
              </a>
            </div>
          )}
        </div>
      </Upload>
    </div>
  );
};

export default FieldImportUpload;
