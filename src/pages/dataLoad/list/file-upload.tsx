import { Upload, Message, Tooltip } from '@arco-design/web-react';
import React, { useState } from 'react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';

const Uploads = ({ onFileChange }) => {
  let hasShownFileCountError = false;
  const [fileList, setFileList] = useState<any>([]);
  const handleUploadChange = (files: any) => {
    console.log(files, 'files666');
    setFileList(files);

    if (onFileChange) {
      if (files.length == 0) {
        // 清空文件列表
        onFileChange([]);
        return;
      }
      // 处理所有上传完成的文件
      const completedFiles = files.filter(
        (file) => file.status === 'done' && file.response && file.response.data
      );

      if (completedFiles.length > 0) {
        // 对于每个完成的文件，调用回调
        completedFiles.forEach((file) => {
          console.log('文件上传完成:', file.response.data);
          const blob = new Blob([file.data], {
            type: file.type || 'application/octet-stream'
          });
          const blobURL = URL.createObjectURL(blob);
          onFileChange(file.response.data, blobURL);
        });
      }
    }
  };
  const getToken = () => {
    // 从 localStorage 获取
    const token = localStorage.getItem('loginToken');
    return token ? token.replace(/"/g, '') : ''; // 移除所有引号
  };
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
      className="upload-file"
      multiple
      accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt,.md,.wav,.mp3,.aac,.flac,.mp4,.mov,.mkv"
      beforeUpload={(file, list) => checkFile(file, list)}
      action="/api/aimdp/v1/load_tasks/upload"
      onChange={handleUploadChange}
      headers={{
        Authorization: getToken(),
        'X-Auth-Validate': 'true',
        'X-Regionid': 'region1'
      }}
      tip={
        <>
          单次上传文件总量不超过10个文件，单个文件最大不超过100M
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
