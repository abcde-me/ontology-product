import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo
} from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import './index.css';
import { Button, Message, Upload } from '@arco-design/web-react';
import { getDocContent } from '@/api/datasetsV2';

// 类型定义
interface CloudDocument {
  id: string;
  name: string;
  size: number;
  uploadTime: Date;
  url: string;
  thumbnail?: string;
}
interface HighlightInfo {
  page: number;
  area: [number, number, number, number];
}
const DocumentCloud = (props) => {
  const { documentid, datasetid, positionbox } = props;
  const [selectedDoc, setSelectedDoc] = useState<CloudDocument | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const BACKGROUND_COLOR = `rgba(255, 0, 0, 0.3)`;
  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const originalImagesRef = useRef<{ [page: number]: ImageData }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (documentid) {
      const loadDocContent = async () => {
        const url = `https://10.252.26.5:31708/api/aiap/v1/files/datasets/${datasetid}/documents/${documentid}/browser`;
        axios
          .get(url, {
            responseType: 'arraybuffer'
          })
          .then(async (res) => {
            // 转换pdf
            try {
              const blob = new Blob([res.data], { type: 'application/pdf' });
              const docURL = URL.createObjectURL(blob);
              const loadingTask = pdfjsLib.getDocument(docURL);
              console.log(docURL, 'loadingTask');

              pdfDocRef.current = await loadingTask.promise;

              setSelectedDoc({
                id: documentid,
                name: 'Document',
                size: blob.size,
                uploadTime: new Date(),
                url: docURL
              });

              setTotalPages(pdfDocRef.current.numPages);
              originalImagesRef.current = {};
              //     // 计算滚动位置
              const container = containerRef.current;
              // 平滑滚动
              container.scrollTo({
                top: 0
              });
            } catch {
              Message.error('无法加载PDF文件，请检查文件结构或文件完整性');
            }
          });
      };
      loadDocContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentid]);
  //点击高亮
  useEffect(() => {
    if (
      positionbox &&
      totalPages > 0 &&
      originalImagesRef.current[Number(Object.keys(positionbox)[0])]
    ) {
      goToPage(positionbox);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionbox]);
  const goToPage = async (value) => {
    console.log(value, 'scdsc');

    const pageNumberlistnum = Number(Object.keys(value)[0]);
    // clearHighlights();
    for (const key in value) {
      const pageNumber = Number(key);
      const targetCanvaslistnum = canvasRef.current[pageNumberlistnum - 1];
      const targetCanvas = canvasRef.current[pageNumber - 1];
      const [x1, y1, x2, y2] = value[key];
      const width = x2 - x1;
      const height = y2 - y1;
      const container = containerRef.current;
      const targetOffset = targetCanvaslistnum.offsetTop - container.offsetTop;
      container.scrollTo({ top: targetOffset + y1, behavior: 'smooth' });

      const ctx = targetCanvas.getContext('2d')!;

      if (originalImagesRef.current[pageNumber]) {
        ctx.putImageData(originalImagesRef.current[pageNumber], 0, 0);
      }

      // 先绘制背景
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(x1, y1, width, height);
      ctx.restore();
    }
  };
  const clearHighlights = useCallback(() => {
    if (!selectedDoc) return;

    // 遍历所有页面清除高亮
    for (let page = 1; page <= totalPages; page++) {
      const canvas = canvasRef.current[page - 1];
      if (canvas && originalImagesRef.current[page]) {
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(originalImagesRef.current[page], 0, 0);
        delete originalImagesRef.current[page];
      }
    }
  }, [totalPages, selectedDoc]);
  // 渲染页面
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasRef.current[pageNum - 1]) return;

      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current[pageNum - 1];
      if (canvas) {
        const ctx = canvas.getContext('2d')!;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: ctx, viewport }).promise;
        originalImagesRef.current[pageNum] = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    },
    [scale]
  );

  useEffect(() => {
    if (totalPages > 0 && pdfDocRef.current) {
      // renderPage(1);
      const renderAllPages = async () => {
        for (let i = 1; i <= totalPages; i++) {
          await renderPage(i);
        }
      };

      renderAllPages();
    }
  }, [renderPage, totalPages]);
  return (
    <div className="document-cloud-container">
      <div className="main-content">
        {selectedDoc ? (
          <div
            className="canvas-container"
            ref={containerRef} // 添加ref
            style={{ overflowY: 'auto', height: '100vh' }} // 确保容器可滚动
          >
            {/* 动态渲染 canvas */}
            {[...Array(totalPages)].map((_, index) => (
              <canvas
                key={index}
                ref={(el) => (canvasRef.current[index] = el!)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>选择或上传文档开始浏览</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCloud;
