import { Upload, Message, Tooltip } from '@arco-design/web-react';
import React, { useState, useEffect } from 'react';
import { PrefixAimdp } from '@/api/endpoints';
import {
  IconCheckCircleFill,
  IconDelete,
  IconDownload,
  IconFile,
  IconRobot
} from '@arco-design/web-react/icon';
import { UploadStatus } from '../types/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import { getTemplateFile } from '@/api/ontologySceneLibrary/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { DEV_CEAI_USER_ID, isDevBypassEnabled } from '@/utils/devFallback';
import {
  buildOntologySchemaCsvFromParsed,
  downloadBase64CsvTemplate,
  downloadCsvTemplate,
  getOntologyCsvTemplate,
  getOntologyCsvTemplateFileName,
  parseOntologySchemaCsvFile,
  type ParsedOntologySchemaCsv
} from '@/utils/ontologyCsvTemplate';
import {
  cacheDevCsvInstances,
  getDevCsvInstances
} from '@/utils/devObjectTypeStore';
import styles from './FieldImportUpload.module.scss';

const UPLOADED_FILE_BLOCK_MESSAGE = '请先删除已上传的附件后再执行此操作';

export interface CsvSchemaTemplateLinksProps {
  from?: 'object_type' | 'link_type';
  disabled?: boolean;
  hasUploadedFile?: boolean;
  onGenerateSchema?: () => void | Promise<void>;
  generatingSchema?: boolean;
  showGenerateSchemaButton?: boolean;
}

export const downloadCsvSchemaTemplate = async (
  from: 'object_type' | 'link_type' = 'object_type'
) => {
  const templateFileName = getOntologyCsvTemplateFileName(from);

  const downloadLocalTemplate = () => {
    downloadCsvTemplate(getOntologyCsvTemplate(from), templateFileName);
    Message.success('开始下载模板');
  };

  try {
    const res = await getTemplateFile({ file_name: from });

    if (isOntologyApiSuccess(res) && res.data) {
      downloadBase64CsvTemplate(res.data, templateFileName);
      Message.success('开始下载模板');
      return;
    }

    downloadLocalTemplate();
  } catch (error) {
    console.error('下载模板失败', error);
    downloadLocalTemplate();
  }
};

export const CsvSchemaTemplateLinks: React.FC<CsvSchemaTemplateLinksProps> = ({
  from = 'object_type',
  disabled = false,
  hasUploadedFile = false,
  onGenerateSchema,
  generatingSchema = false,
  showGenerateSchemaButton = false
}) => {
  const handleDownloadTemplate = async () => {
    if (disabled) {
      return;
    }

    if (hasUploadedFile) {
      Message.warning(UPLOADED_FILE_BLOCK_MESSAGE);
      return;
    }

    await downloadCsvSchemaTemplate(from);
  };

  const handleGenerateClick = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || generatingSchema) {
      return;
    }

    if (hasUploadedFile) {
      Message.warning(UPLOADED_FILE_BLOCK_MESSAGE);
      return;
    }

    await onGenerateSchema?.();
  };

  return (
    <div className={styles.templateLinks}>
      <a
        href="#"
        onClick={async (event) => {
          event.preventDefault();
          event.stopPropagation();
          await handleDownloadTemplate();
        }}
        className={
          disabled
            ? 'cursor-not-allowed text-[var(--color-text-4)]'
            : 'text-[var(--color-text-3)] hover:text-[#007DFA] hover:underline'
        }
      >
        <IconDownload className="mr-1 inline" />
        标准模板(.csv)
      </a>
      {showGenerateSchemaButton && onGenerateSchema && (
        <Tooltip content="根据基本信息生成数据">
          <a
            href="#"
            onClick={handleGenerateClick}
            className={
              disabled || generatingSchema
                ? 'cursor-not-allowed text-[var(--color-text-4)]'
                : 'text-[var(--color-text-3)] hover:text-[#007DFA] hover:underline'
            }
          >
            <IconRobot className="mr-1 inline" />
            {generatingSchema ? '生成中...' : '智能生成模板'}
          </a>
        </Tooltip>
      )}
    </div>
  );
};

interface FieldImportUploadProps {
  onFileChange: (fileData: any) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  accept?: string; // 支持的文件类型，默认为 .csv
  fileType?: 'excel' | 'csv'; // 文件类型，用于不同的验证和提示
  maxSize?: number; // 文件大小限制（MB），默认50MB
  customAction?: string; // 自定义上传接口地址
  from?: 'object_type' | 'link_type';
  fileList?: any[]; // 初始文件列表
  disabled?: boolean;
  onGenerateSchema?: () => void | Promise<void>;
  generatingSchema?: boolean;
  showGenerateSchemaButton?: boolean;
  /** 为 false 时不在上传区内渲染模板链接（由外部 FormItem label 等位置展示） */
  showTemplateLinks?: boolean;
  hasUploadedFile?: boolean;
}

const FieldImportUpload: React.FC<FieldImportUploadProps> = ({
  onFileChange,
  onUploadingChange,
  accept = '.csv',
  fileType = 'csv',
  maxSize = 50,
  customAction,
  from = 'object_type',
  fileList: initialFileList = [],
  disabled = false,
  onGenerateSchema,
  generatingSchema = false,
  showGenerateSchemaButton = false,
  showTemplateLinks = true,
  hasUploadedFile = false
}) => {
  const [fileList, setFileList] = useState<any>(initialFileList);
  const getEffectiveProjectId = useUserInfoStore(
    (state) => state.getEffectiveProjectId
  );
  const effectiveProjectId = getEffectiveProjectId();

  // 当外部传入的 fileList 变化时，同步更新内部状态
  useEffect(() => {
    if (initialFileList && initialFileList.length > 0) {
      setFileList(initialFileList);
    } else if (initialFileList && initialFileList.length === 0) {
      setFileList([]);
    }
  }, [initialFileList]);

  const handleUploadChange = (files: any, file: any) => {
    console.log('---handleUploadChange', files, file);
    // 检查是否是删除操作：files 为空但 file 存在，说明是删除
    if (files.length === 0 && file) {
      // 删除操作已经在 handleRemove 中处理，这里不需要重复处理
      setFileList([]);
      return;
    }

    // 更新 fileList 状态，让 Upload 组件受控
    setFileList(files);

    // 检查上传状态
    if (file.status === UploadStatus.uploading) {
      onUploadingChange?.(true);
      return;
    }

    if (file.status === UploadStatus.done) {
      if (!isOntologyApiSuccess(file.response)) {
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

  const uploadAction =
    customAction || `${PrefixAimdp}/AnalyzeDataAssetFieldsFile`;
  const isOntologySchemaUpload = uploadAction.includes(
    'UploadOntologyEntityDataFile'
  );
  const shouldUseLocalSchemaUpload =
    isOntologySchemaUpload && isDevBypassEnabled() && !effectiveProjectId;

  const completeLocalSchemaUpload = async (file: File) => {
    onUploadingChange?.(true);

    try {
      const parsed = await parseOntologySchemaCsvFile(file, from);
      if (parsed.instances.length) {
        cacheDevCsvInstances(parsed.path, parsed.instances);
      }
      const uploadItem = {
        uid: `${Date.now()}`,
        name: file.name,
        status: UploadStatus.done,
        response: {
          status: 200,
          code: '',
          message: '',
          data: parsed
        },
        originFile: file
      };

      setFileList([uploadItem]);
      onFileChange(parsed);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '请按照输入参数要求，使用标准导入模板';
      Message.error(message);
      setFileList([]);
      throw error;
    } finally {
      onUploadingChange?.(false);
    }
  };

  const handleRemove = (file: any) => {
    if (disabled) {
      return false;
    }
    setFileList([]);
    onFileChange([]);
  };

  const resolveParsedSchemaFromFile = (
    file: any
  ): ParsedOntologySchemaCsv | null => {
    const parsed = file?.response?.data;
    if (!parsed?.columnList?.length) {
      return null;
    }

    const instances =
      parsed.instances?.length > 0
        ? parsed.instances
        : getDevCsvInstances(parsed.path);

    return {
      columnList: parsed.columnList,
      commentList: parsed.commentList || [],
      typeList: parsed.typeList || [],
      path: parsed.path || '',
      instances: instances || []
    };
  };

  const handleDownloadUploadedFile = async (file: any) => {
    const fileName = file?.name || 'schema.csv';

    if (file?.originFile instanceof File) {
      try {
        const content = await file.originFile.text();
        downloadCsvTemplate(content, fileName);
        Message.success('开始下载');
        return;
      } catch (error) {
        console.error('下载原始文件失败', error);
      }
    }

    const parsed = resolveParsedSchemaFromFile(file);
    if (parsed) {
      downloadCsvTemplate(buildOntologySchemaCsvFromParsed(parsed), fileName);
      Message.success('开始下载');
      return;
    }

    Message.warning('暂无可下载的文件内容');
  };

  const renderUploadListItem = (originNode: React.ReactNode, file: any) => {
    if (
      fileType !== 'csv' ||
      !isOntologySchemaUpload ||
      file.status !== UploadStatus.done
    ) {
      return originNode;
    }

    return (
      <div className={styles.uploadListItem}>
        <div className={styles.uploadListItemMain}>
          <IconFile />
          <span className={styles.uploadListItemName} title={file.name}>
            {file.name}
          </span>
        </div>
        <div className={styles.uploadListItemActions}>
          <span
            className={`${styles.uploadListItemAction} ${styles.uploadListItemActionSuccess}`}
            aria-label="上传成功"
          >
            <IconCheckCircleFill />
          </span>
          <span
            role="button"
            tabIndex={0}
            aria-label="删除文件"
            className={styles.uploadListItemAction}
            onClick={(event) => {
              event.stopPropagation();
              handleRemove(file);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                handleRemove(file);
              }
            }}
          >
            <IconDelete />
          </span>
          <span
            role="button"
            tabIndex={0}
            aria-label="下载文件"
            className={styles.uploadListItemAction}
            onClick={(event) => {
              event.stopPropagation();
              void handleDownloadUploadedFile(file);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                void handleDownloadUploadedFile(file);
              }
            }}
          >
            <IconDownload />
          </span>
        </div>
      </div>
    );
  };

  const handleBeforeUpload = async (file: File) => {
    if (disabled) {
      return false;
    }
    if (!checkFile(file)) {
      return false;
    }

    if (shouldUseLocalSchemaUpload) {
      try {
        await completeLocalSchemaUpload(file);
      } catch {
        // 错误已在 completeLocalSchemaUpload 中提示
      }
      return false;
    }

    if (isOntologySchemaUpload && !effectiveProjectId) {
      Message.warning(
        '请先在左侧选择项目，或在 .env.development 中配置 REACT_APP_DEV_REAL_PROJECT_ID'
      );
      return false;
    }

    return true;
  };

  const resolvedHasUploadedFile =
    hasUploadedFile ||
    fileList.some((file: any) => file.status === UploadStatus.done);

  return (
    <div className={styles.uploadRoot}>
      {fileType === 'csv' && showTemplateLinks && (
        <div className="mb-[6px]">
          <CsvSchemaTemplateLinks
            from={from}
            disabled={disabled}
            hasUploadedFile={resolvedHasUploadedFile}
            onGenerateSchema={onGenerateSchema}
            generatingSchema={generatingSchema}
            showGenerateSchemaButton={showGenerateSchemaButton}
          />
        </div>
      )}
      <Upload
        drag
        disabled={disabled}
        className="upload-file"
        accept={accept}
        fileList={fileList}
        showUploadList={fileList.length > 0 ? true : false}
        renderUploadItem={renderUploadListItem}
        onRemove={handleRemove}
        beforeUpload={handleBeforeUpload}
        action={uploadAction}
        data={
          effectiveProjectId
            ? {
                projectID: effectiveProjectId
              }
            : undefined
        }
        onChange={handleUploadChange}
        onDrop={handleDrop}
        headers={{
          Authorization: getToken(),
          'X-Auth-Validate': 'true',
          'X-Regionid': 'region1',
          ...(isDevBypassEnabled()
            ? { 'X-Ceai-User-Id': DEV_CEAI_USER_ID }
            : {}),
          ...(effectiveProjectId
            ? { 'x-ceai-project-id': effectiveProjectId }
            : {})
        }}
        tip={
          fileType === 'csv' ? (
            <>仅支持上传UTF-8编码格式的文件,文件大小不超过{maxSize}MB</>
          ) : (
            <>
              支持CSV格式文件
              <br />
              最多上传1个文件，文件/压缩包源文件大小不超过{maxSize}MB
            </>
          )
        }
      >
        <div>
          <div className="flex h-[105px] w-full flex-col items-center justify-center gap-[4px] rounded-[2px] border border-dashed border-[#E5E6EB] bg-[#FAFBFC] px-3">
            <span className="text-[12px] text-[var(--color-text-3)]">
              点击或拖拽文件到此处上传
            </span>
            <span className="text-center text-[11px] leading-[18px] text-[var(--color-text-4)]">
              {fileType === 'csv' ? (
                <>
                  UTF-8 编码，不超过 {maxSize}MB；第 1 行英文名、第 2 行类型、第
                  3 行注释，第 4 行起为数据
                </>
              ) : (
                '支持 CSV 格式文件'
              )}
            </span>
            {fileType === 'excel' && (
              <span className="text-[11px] text-[var(--color-text-4)]">
                最多上传 1 个文件，不超过 {maxSize}MB
              </span>
            )}
          </div>
        </div>
      </Upload>
    </div>
  );
};

export default FieldImportUpload;
