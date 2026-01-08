import { Upload, Message, Tooltip } from '@arco-design/web-react';
import React, { useState } from 'react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { PrefixAimdp } from '@/api/endpoints';
import { useUserInfoStore } from '@/store/userInfoStore';

interface UploadsProps {
  onFileChange: (fileData: any, blobURL?: string) => void;
  onFileDelete?: (fileName: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  getChunkedFile?: (file: any) => void;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const Uploads: React.FC<UploadsProps> = ({
  onFileChange,
  onFileDelete,
  onUploadingChange,
  getChunkedFile
}) => {
  let hasShownFileCountError = false;
  const [fileList, setFileList] = useState<any>([]);
  const projectId = useUserInfoStore((state) => state.projectId);

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

    // 过滤文件：只保留上传中的文件和上传成功的文件（成功条件：status === 'done' && code === '' && status === 200）
    // 过滤掉上传失败或错误状态的文件
    const filteredFiles = files.filter((file: any) => {
      // 保留即将的文件
      if (file.status === 'init') {
        return true;
      }
      // 保留上传中的文件
      if (file.status === 'uploading') {
        return true;
      }
      // 保留上传成功的文件
      if (
        file.status === 'done' &&
        file.response &&
        file.response.data &&
        file.response.code === '' &&
        file.response.status === 200
      ) {
        return true;
      }
      // 如果是上传失败的文件，显示错误提示并过滤掉
      if (file.status === 'done' && file.response) {
        if (file.response.code !== '' || file.response.status !== 200) {
          Message.error(
            file.response.message || `${file.name} 上传失败，请重试`
          );
          return false;
        }
      }
      // 其他状态（如 error）也过滤掉
      return false;
    });

    setFileList(filteredFiles);
    if (getChunkedFile) {
      getChunkedFile(filteredFiles);
    }
    // 检查是否有文件正在上传
    const isUploading = filteredFiles.some(
      (file: any) => file.status === 'uploading'
    );
    if (onUploadingChange) {
      onUploadingChange(isUploading);
    }

    // 检查是否有文件被删除
    if (prevLength > filteredFiles.length) {
      const deletedFiles = fileList.filter(
        (prevFile) =>
          !filteredFiles.some((newFile) => newFile.name === prevFile.name)
      );
      // 通知父组件文件被删除（只有真正上传成功的文件才需要通知删除）
      deletedFiles.forEach((file) => {
        if (
          onFileDelete &&
          file.response &&
          file.response.data &&
          file.response.code === '' &&
          file.response.status === 200
        ) {
          onFileDelete(file.response.data.name);
        }
      });
    }

    if (onFileChange) {
      if (filteredFiles.length === 0) {
        // 清空文件列表
        onFileChange([]);
        return;
      }

      // 处理所有上传完成的文件
      // 只有当 status === 'done' 且 code === '' 且 status === 200 时才认为上传成功
      const completedFiles = filteredFiles.filter(
        (file) =>
          file.status === 'done' &&
          file.response &&
          file.response.data &&
          file.response.code === '' &&
          file.response.status === 200
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
      /\.(doc|docx|ppt|pptx|pdf|jpg|jpeg|png|txt|md|wav|mp3|aac|flac|mp4|mov|mkv|xlsx|xls)$/i.test(
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
        '只能上传 .doc,.docx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.txt,.md,.wav,.mp3,.aac,.flac,.mp4,.mov,.mkv,.xlsx,.xls文件'
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
    if (file.size > MAX_FILE_SIZE) {
      Message.error('单文件大小不能超过500M');
      return false;
    }
    return true;
  };

  const handleRemove = (file: any) => {
    const newFileList = fileList.filter((item: any) => item.uid !== file.uid);
    setFileList(newFileList);

    // 通知父组件文件被删除（只有真正上传成功的文件才需要通知删除）
    if (
      onFileDelete &&
      file.response &&
      file.response.data &&
      file.response.code === '' &&
      file.response.status === 200
    ) {
      onFileDelete(file.response.data.name);
    }

    // 更新已完成文件列表
    if (onFileChange) {
      const completedFiles = newFileList.filter(
        (f: any) =>
          f.status === 'done' &&
          f.response &&
          f.response.data &&
          f.response.code === '' &&
          f.response.status === 200
      );
      if (completedFiles.length > 0) {
        const allFilesData = completedFiles.map((f: any) => f.response.data);
        onFileChange(allFilesData);
      } else {
        onFileChange([]);
      }
    }

    if (getChunkedFile) {
      getChunkedFile(newFileList);
    }
  };

  return (
    <Upload
      drag
      className="upload-file"
      multiple
      accept=".doc,.docx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.txt,.md,.wav,.mp3,.aac,.flac,.mp4,.mov,.mkv,.xlsx,.xls"
      fileList={fileList}
      showUploadList={fileList.length > 0 ? true : false}
      beforeUpload={(file, list) => {
        return checkFile(file, list);
      }}
      action={`${PrefixAimdp}/UploadLoadTaskFile`}
      onChange={handleUploadChange}
      onRemove={handleRemove}
      onDrop={handleDrop}
      headers={{
        Authorization: getToken(),
        'X-Auth-Validate': 'true',
        'X-Regionid': 'region1',
        'x-ceai-project-id': projectId[1]
      }}
      tip={
        <>
          单次上传文件总量不超过1000个文件，单个文件最大不超过500M
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
                <br />
                表格：XLSX, XLS
              </>
            }
          >
            <IconQuestionCircle style={{ marginLeft: '1px' }} />
          </Tooltip>
        </>
      }
    />
  );
};

export default Uploads;
