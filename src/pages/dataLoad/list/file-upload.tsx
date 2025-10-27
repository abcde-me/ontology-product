import { Upload, Message, Tooltip } from '@arco-design/web-react';
import React, { useState } from 'react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { PrefixAimdp } from '@/api/endpoints';

interface UploadsProps {
  onFileChange: (fileData: any, blobURL?: string) => void;
  onFileDelete?: (fileName: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const Uploads: React.FC<UploadsProps> = ({
  onFileChange,
  onFileDelete,
  onUploadingChange
}) => {
  let hasShownFileCountError = false;
  const [fileList, setFileList] = useState<any>([]);

  // 标准化文件名用于同名比较（将后缀转为小写）
  const normalizeFileNameForComparison = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return fileName;

    const baseName = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex + 1).toLowerCase();
    return baseName + '.' + extension;
  };

  const handleUploadChange = (files: any) => {
    const prevLength = fileList.length;
    setFileList(files);

    // 检查是否有文件正在上传
    const isUploading = files.some((file: any) => file.status === 'uploading');
    if (onUploadingChange) {
      onUploadingChange(isUploading);
    }

    // 检查是否有文件被删除
    if (prevLength > files.length) {
      const deletedFiles = fileList.filter(
        (prevFile) => !files.some((newFile) => newFile.name === prevFile.name)
      );
      // 通知父组件文件被删除
      deletedFiles.forEach((file) => {
        if (onFileDelete && file.response && file.response.data) {
          onFileDelete(file.response.data.name);
        }
      });
    }

    if (onFileChange) {
      if (files.length === 0) {
        // 清空文件列表
        onFileChange([]);
        return;
      }

      // 处理所有上传完成的文件
      const completedFiles = files.filter(
        (file) => file.status === 'done' && file.response && file.response.data
      );

      // 一次性传递所有已完成的文件数据
      if (completedFiles.length > 0) {
        console.log(
          '所有文件上传完成:',
          completedFiles.map((f) => f.response.data)
        );
        const allFilesData = completedFiles.map((file) => file.response.data);
        onFileChange(allFilesData);
      }
    }
  };
  const getToken = () => {
    // 从 localStorage 获取
    const token = localStorage.getItem('loginToken');
    return token ? token.replace(/"/g, '') : ''; // 移除所有引号
  };
  // 检查文件类型的公共方法（不显示错误信息）
  const checkFileType = (file: any) => {
    const fileName = file.name || '';
    const isValidFileType =
      /\.(doc|docx|ppt|pptx|pdf|jpg|jpeg|png|txt|md|wav|mp3|aac|flac|mp4|mov|mkv)$/i.test(
        fileName
      );
    return isValidFileType;
  };

  // 处理拖拽事件
  const handleDrop = (e: any) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    // 检查拖拽的文件类型（不显示单个错误信息）
    const invalidFiles = files.filter((file: any) => !checkFileType(file));
    if (invalidFiles.length > 0) {
      // 只显示一次错误提示
      Message.error(
        '只能上传 .doc,.docx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.txt,.md,.wav,.mp3,.aac,.flac,.mp4,.mov,.mkv文件'
      );
      return false;
    }
  };

  const checkFile = (file: any, list: any) => {
    // 检查文件数量
    const currentFilesCount = fileList.length;

    if (Array.isArray(list)) {
      // 找到当前文件在本次上传列表中的索引
      const currentFileIndex = list.findIndex((f) => f === file);
      // 计算这个文件的总体位置（已有文件数 + 在本次列表中的位置）
      const filePosition = currentFilesCount + currentFileIndex + 1;

      if (filePosition > 1000) {
        if (!hasShownFileCountError) {
          Message.error('单次最多上传1000个文件');
          hasShownFileCountError = true;
          setTimeout(() => {
            hasShownFileCountError = false;
          }, 2000);
        }
        return false;
      }
    }

    // 检查重名文件（忽略后缀大小写）
    const normalizedCurrentFileName = normalizeFileNameForComparison(file.name);
    const existingFileNames = fileList.map((existingFile: any) =>
      normalizeFileNameForComparison(existingFile.name)
    );
    if (existingFileNames.includes(normalizedCurrentFileName)) {
      Message.error(`未导入成功 "${file.name}"文件重名`);
      return false;
    }

    // 检查本次上传列表中的重名文件（忽略后缀大小写）
    if (Array.isArray(list)) {
      const currentUploadNames = list.map((f: any) =>
        normalizeFileNameForComparison(f.name)
      );
      const duplicateCount = currentUploadNames.filter(
        (name: string) => name === normalizedCurrentFileName
      ).length;
      if (duplicateCount > 1) {
        Message.error(`未导入成功 "${file.name}"文件重名`);
        return false;
      }
    }

    // 检查文件类型
    if (!checkFileType(file)) {
      return false;
    }

    // 检查文件大小
    if (file.size > 100 * 1024 * 1024) {
      Message.error('单文件大小不能超过100M');
      return false;
    }
    return true;
  };
  return (
    <Upload
      drag
      className="upload-file"
      multiple
      accept=".doc,.docx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.txt,.md,.wav,.mp3,.aac,.flac,.mp4,.mov,.mkv"
      beforeUpload={(file, list) => {
        return checkFile(file, list);
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
          单次上传文件总量不超过1000个文件，单个文件最大不超过100M
          不支持文件夹及压缩包，只支持上传部分文件类型
          <Tooltip
            content={
              <>
                文本：PDF, PPT/PPTX, DOC/DOCX, TXT/MD
                <br />
                图片：JPEG, PNG, JPG
                <br />
                音频：WAV, MP3, AAC, FLAC
                <br />
                视频：MP4, MOV, MKV
              </>
            }
            style={{ padding: '12px' }}
          >
            <IconQuestionCircle style={{ marginLeft: '1px' }} />
          </Tooltip>
        </>
      }
    />
  );
};

export default Uploads;
