import React, { memo, useState, FC, useRef, useEffect } from 'react';
import SearchPlusIcon from '@/pages/aiOntologyWorkbench/assets/chat/search-plus.svg';
import DeleteFileIcon from '@/pages/aiOntologyWorkbench/assets/chat/delete-file.svg';
import PdfIcon from '@/pages/aiOntologyWorkbench/assets/chat/pdf.svg';
import DocIcon from '@/pages/aiOntologyWorkbench/assets/chat/doc.svg';
import WpsIcon from '@/pages/aiOntologyWorkbench/assets/chat/wps.svg';
import ExcelIcon from '@/pages/aiOntologyWorkbench/assets/chat/excel.svg';
import CsvIcon from '@/pages/aiOntologyWorkbench/assets/chat/csv.svg';
import OfdIcon from '@/pages/aiOntologyWorkbench/assets/chat/ofd.svg';
import TxtIcon from '@/pages/aiOntologyWorkbench/assets/chat/txt.svg';
import Mp3Icon from '@/pages/aiOntologyWorkbench/assets/chat/mp3.svg';
import ErrorImage from '@/pages/aiOntologyWorkbench/assets/errorImg.png';
import LeftIcon from '@/pages/aiOntologyWorkbench/assets/chat/left-arrow.svg';
import RightIcon from '@/pages/aiOntologyWorkbench/assets/chat/right-arrow.svg';
import { Image, Message, Typography } from '@arco-design/web-react';
import { IconLoading } from '@arco-design/web-react/icon';
import { PreviewFile, OpenPreview } from '@/api/aiOntologyWorkbench/chat';
import { DeleteFile } from '@/api/aiOntologyWorkbench/chat';
import { useUserInfoStore } from '@/store/userInfoStore';

const { Paragraph } = Typography;

type FileCardProps = {
  fileList: any[];
  onDelFile?: (uid: string) => void;
  showDelBtn?: boolean;
};

// 适配 ai-onto 的文件格式到 UserFileCard 期望的格式
const adaptFileFormat = (file: any) => {
  // 如果已经是 Arco Upload 格式（有 originFile），直接返回
  if (file.originFile) {
    return file;
  }

  // 否则，将 ai-onto 格式转换为 Arco Upload 格式
  return {
    uid: file.id || file.uid,
    name: file.name,
    size: file.size,
    status: 'done' as const,
    originFile: {
      name: file.name,
      size: file.size,
      type: file.type
    },
    response: {
      uri: file.objectURI,
      data: {
        url: file.url
      }
    },
    previewUrl: file.url // 直接使用 url 作为预览地址
  };
};

const FileCard: FC<FileCardProps> = ({
  fileList = [],
  showDelBtn = false,
  onDelFile
}) => {
  // 适配文件格式
  const adaptedFileList = fileList.map(adaptFileFormat);

  const [imgVisible, setImgVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fetchedPreviewRef = useRef<Set<string>>(new Set());
  const previewUrlRef = useRef<Record<string, string>>({});
  const [, forceUpdate] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const projectId = useUserInfoStore((s) => s.projectId);
  const getObjectPath = (file: any) => file?.response?.uri ?? '';

  const handleDelFile = (file: any) => {
    DeleteFile({
      projectID: projectId?.[1] ?? '',
      objectPath: getObjectPath(file)
    }).finally(() => {
      onDelFile?.(file?.uid);
    });
  };

  // 文件类型判断函数
  const getFileType = (file: any) => {
    const type = file?.originFile?.type ?? '';
    const name = (file?.originFile?.name ?? '').toLowerCase();
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('audio/')) return 'Audio';
    // if (fileType.startsWith('video/')) return 'video';  // 视频文件暂时不处理
    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'PDF';
    if (
      type === 'application/vnd.ms-excel' ||
      type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      name.endsWith('.xls') ||
      name.endsWith('.xlsx')
    )
      return 'EXCEL';
    if (
      type === 'application/msword' ||
      type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.doc') ||
      name.endsWith('.docx')
    )
      return 'WORD';
    if (name.endsWith('.wps')) return 'WPS';
    if (type === 'text/csv' || name.endsWith('.csv')) return 'CSV';
    if (name.endsWith('.ofd')) return 'OFD';
    if (type === 'text/plain' || name.endsWith('.txt')) return 'TXT';
    if (/(\.jpg|\.jpeg|\.png|\.gif|\.bmp|\.tif|\.tiff)$/i.test(name)) {
      return 'Image';
    }
    if (/\.(wav|mp3|ogg|webm|m4a|amr|mpga|pcm)$/i.test(name)) {
      return 'Audio';
    }
    return 'unknown';
  };
  // 文件类型判断函数
  const getFileIcon = (file: any) => {
    const fileType = getFileType(file);
    switch (fileType) {
      case 'Audio':
        return <Mp3Icon />;
      case 'PDF':
        return <PdfIcon />;
      case 'WORD':
        return <DocIcon />;
      case 'WPS':
        return <WpsIcon />;
      case 'EXCEL':
        return <ExcelIcon />;
      case 'CSV':
        return <CsvIcon />;
      case 'OFD':
        return <OfdIcon />;
      case 'TXT':
        return <TxtIcon />;
      default:
        return 'unknown';
    }
  };
  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  const previewImg = (file: any) => {
    if (file.status === 'uploading') {
      Message.info('文件正在上传中，请稍后查看');
      return;
    }
    if (file.status === 'error') {
      Message.info('文件上传失败，请重新上传');
      return;
    }
    const url =
      file.previewUrl ||
      previewUrlRef.current[file.uid] ||
      file?.response?.data?.url ||
      ErrorImage;
    setPreviewUrl(url);
    setImgVisible(true);
  };
  const previewFile = async (file: any) => {
    const fileType = getFileType(file);
    let type = 'application/pdf';
    if (file.status === 'uploading') {
      Message.info('文件正在上传中，请稍后查看');
      return;
    }
    if (file.status === 'error') {
      Message.info('文件上传失败，请重新上传');
      return;
    }
    if (['OFD'].includes(fileType)) {
      Message.info('OFD格式暂不支持预览，请在本地打开查看或使用其他软件预览。');
      return;
    }
    if (
      ['Audio', 'PCM', 'WAV', 'OGG', 'WEBM', 'M4A', 'AMR', 'MPGA'].includes(
        fileType
      )
    ) {
      type = 'audio/mpeg';
    }
    if (fileType === 'EXCEL') {
      Message.info({
        content: '.xls(x)文件仅支持以pdf浏览，如需浏览表格版请在本地查看。',
        duration: 3000
      });
    } else {
      Message.info({
        content: '文件打开中，请耐心等待，完成后可在新页签中查看',
        duration: 3000
      });
    }
    const uri = getObjectPath(file);
    if (!uri) {
      Message.info('暂无预览地址，请确认文件已上传成功');
      return;
    }
    try {
      const res = await PreviewFile({
        projectID: projectId?.[1] || '',
        uri
      });
      if (res?.data?.url) {
        await OpenPreview(res.data.url, true, type);
      }
    } catch {
      Message.error('无法加载文件，请检查文件结构或文件完整性');
    }
  };

  // 从PreviewFile接口拿图片url，更新file
  useEffect(() => {
    const filesToFetch = adaptedFileList.filter(
      (file) =>
        getFileType(file) === 'Image' &&
        file.status === 'done' &&
        getObjectPath(file) &&
        !fetchedPreviewRef.current.has(file.uid)
    );
    if (!filesToFetch.length) return;

    Promise.all(
      filesToFetch.map(async (file) => {
        fetchedPreviewRef.current.add(file.uid);
        return PreviewFile({
          projectID: projectId?.[1] || '',
          uri: getObjectPath(file)
        }).then((res) => {
          if (res?.data?.url) {
            file.previewUrl = res.data.url;
            previewUrlRef.current[file.uid] = res.data.url;
            return true;
          }
        });
      })
    ).then((results) => {
      if (results.some(Boolean)) {
        forceUpdate((prev) => prev + 1);
      }
    });

    // return () => abortController.abort();
  }, [adaptedFileList, projectId]);

  // 渲染图片文件
  const renderImage = (file: any) => {
    const previewUrl = file.previewUrl || previewUrlRef.current[file.uid];
    console.log(previewUrl, 'previewUrl');

    return (
      <div
        className={`group relative h-[52px] w-[52px] flex-shrink-0 rounded-[8px] border border-[#eee] ${file.status === 'error' && 'box-border border border-red-500'}`}
      >
        {file.status === 'uploading' && (
          <IconLoading className="absolute left-4 top-4 z-[10] h-[20px] w-[20px] cursor-pointer text-[#81858c]" />
        )}
        {file.status === 'done' && previewUrl && (
          <img
            className="h-full w-full rounded-[8px] object-cover"
            src={previewUrl}
            alt=""
          />
        )}
        <div className="absolute left-[0px] top-[0px] h-full w-full rounded-[8px] bg-[rgba(29,33,41,0.60)] opacity-0 group-hover:opacity-100"></div>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100"
          onClick={() => previewImg(file)}
        >
          <SearchPlusIcon />
        </div>
        {showDelBtn && (
          <DeleteFileIcon
            onClick={(e) => {
              e.stopPropagation();
              handleDelFile(file);
            }}
            className="absolute right-0 top-0 -translate-y-[6px] translate-x-[6px] cursor-pointer opacity-0 group-hover:opacity-100"
          />
        )}
      </div>
    );
  };
  // 渲染DOC文件
  const renderDOC = (file: any) => (
    <div
      className={`group relative flex flex-shrink-0 cursor-pointer items-center rounded-[8px] bg-[#F6F6F6] px-[12px] py-[6px] ${file.status === 'error' && 'box-border border border-red-500'}`}
      onClick={() => previewFile(file)}
    >
      {file.status === 'uploading' ? (
        <IconLoading className="z-[10] h-[20px] w-[20px] cursor-pointer text-[#81858c]" />
      ) : (
        getFileIcon(file)
      )}
      <div className="ml-[6px]">
        <div className="min-w-[100px] max-w-[170px] truncate text-[14px] font-normal leading-[22px] text-[#0F172A]">
          <Paragraph
            ellipsis={{ rows: 1, showTooltip: true }}
            style={{ marginBottom: 0 }}
          >
            {file.name}
          </Paragraph>
        </div>
        <div className="text-[12px] leading-[18px] text-[#7F8C9F]">
          <span className="mr-[8px]">{getFileType(file)}</span>
          {formatFileSize(file.originFile.size)}
        </div>
      </div>
      {showDelBtn && (
        <DeleteFileIcon
          onClick={(e) => {
            e.stopPropagation();
            handleDelFile(file);
          }}
          className="absolute right-0 top-0 z-10 -translate-y-[6px] translate-x-[6px] opacity-0 group-hover:opacity-100"
        />
      )}
    </div>
  );

  // 主渲染函数
  const renderFile = (file: any) => {
    const fileType = getFileType(file);
    if (['Image'].includes(fileType)) {
      return renderImage(file);
    } else {
      return renderDOC(file);
    }
  };

  // 更新最大滚动位置
  const updateMaxScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const maxScrollValue = container.scrollWidth - container.clientWidth;
      setMaxScroll(maxScrollValue);
    }
  };

  // 滚动处理
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200;
    let newScrollPosition: number;

    if (direction === 'left') {
      newScrollPosition = Math.max(0, scrollPosition - scrollAmount);
    } else {
      newScrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
    }

    scrollContainerRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });

    setScrollPosition(newScrollPosition);
  };

  // 监听容器滚动
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollLeft;
      setScrollPosition(currentScroll);
    }
  };

  // 只有当可以向左滚动时才显示左箭头
  const showLeftArrow = scrollPosition > 0;

  // 只有当可以向右滚动时才显示右箭头
  const showRightArrow = scrollPosition < maxScroll && maxScroll > 0;

  useEffect(() => {
    updateMaxScroll();
  }, [adaptedFileList]);

  return (
    <div className="relative mb-[12px] w-full">
      {showLeftArrow && (
        <div
          className="absolute bottom-0 left-0 top-4 z-[100] flex h-[52px] w-[40px] transform cursor-pointer items-center items-center bg-gradient-to-l from-transparent to-white"
          onClick={(e) => {
            e.stopPropagation();
            handleScroll('left');
          }}
        >
          <LeftIcon className="h-[20px] w-[20px]" />
        </div>
      )}

      {showRightArrow && (
        <div
          className="absolute bottom-0 right-0 top-4 z-[100] flex h-[52px] w-[40px] transform cursor-pointer items-center justify-end bg-gradient-to-r from-transparent to-white"
          onClick={(e) => {
            e.stopPropagation();
            handleScroll('right');
          }}
        >
          <RightIcon className="h-[20px] w-[20px]" />
        </div>
      )}

      {/* 文件预览区域 */}
      <div
        className="scroller-hidden flex gap-[8px] overflow-visible  overflow-x-auto pt-[16px]"
        ref={scrollContainerRef}
        onScroll={handleContainerScroll}
      >
        {adaptedFileList.map((file) => (
          <div key={file.uid}>{renderFile(file)}</div>
        ))}
      </div>
      <Image.Preview
        src={previewUrl}
        visible={imgVisible}
        onVisibleChange={setImgVisible}
      />
    </div>
  );
};

export default memo(FileCard);
