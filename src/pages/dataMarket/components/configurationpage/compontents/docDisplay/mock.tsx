import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosRequestHeaders } from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { PrefixV2 } from '@/api/endpoints';
import { Message, Spin } from '@arco-design/web-react';
import { getToken } from '@/utils/request';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const DocumentCloud = (props) => {
  const { documentid, datasetid, positionbox } = props;
  const divRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const BACKGROUND_COLOR = `rgba(255, 0, 0, 0.3)`;
  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const originalImagesRef = useRef<{ [page: number]: ImageData }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [Pages, setPages] = useState(1);
  const [loadingfile, setloadingfile] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (documentid) {
      const loadDocContent = () => {
        setloadingfile(true);
        // 如果上次请求还在进行中，取消它
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // 创建新的 AbortController
        const abortController = new AbortController();
        abortControllerRef.current = abortController; // 将新控制器存储到 ref 中
        const url = `${PrefixV2}/files/datasets/${datasetid}/documents/${documentid}/browser`;
        axios
          .get(url, {
            signal: abortController.signal,
            responseType: 'arraybuffer',
            headers: { ...getToken() } as AxiosRequestHeaders
          })
          .then(async (res) => {
            // 转换pdf
            try {
              const blob = new Blob([res.data], { type: 'application/pdf' });
              const docURL = URL.createObjectURL(blob);
              const loadingTask = pdfjsLib.getDocument(docURL);
              // window.open(docURL, '_blank');
              pdfDocRef.current = await loadingTask.promise;
              setPages(1);
              setTotalPages(pdfDocRef.current.numPages);
              originalImagesRef.current = {};
              //     // 计算滚动位置
              // const container = containerRef.current;
              // // 平滑滚动
              // container.scrollTo({
              //   top: 0
              // });

              setloadingfile(false);
            } catch {
              console.log(2);
              setTotalPages(0);
              setloadingfile(false);
              // Message.error('无法加载PDF文件，请检查文件结构或文件完整性');
            }
          })
          .catch(() => {
            // Message.error('加载失败！');
          });
      };
      loadDocContent();
    }
    return () => {};
  }, [documentid]);
  //点击高亮
  useEffect(() => {
    if (positionbox && totalPages > 0) {
      console.log(positionbox, 'positionbox');

      goToPage(positionbox);
    }
  }, [positionbox]);
  const goToPage = (value) => {
    //清空所有
    for (let page = 1; page <= totalPages; page++) {
      const canvas = canvasRef.current[page - 1];
      if (canvas && originalImagesRef.current[page]) {
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(originalImagesRef.current[page], 0, 0);
      }
    }
    //加1 后端返回0
    const newObj = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        const newKey = Number(key) + 1; // 键加 1
        newObj[newKey] = value[key]; // 保留原值不变
      }
    }
    //多页面滚动
    const pageNumberlistnum = Number(Object.keys(newObj)[0]);
    // clearHighlights();
    for (const key in newObj) {
      const pageNumber = Number(key);
      const targetCanvaslistnum = canvasRef.current[pageNumberlistnum - 1];
      const targetCanvas = canvasRef.current[pageNumber - 1];
      const [x1, y1, x2, y2] = newObj[key];
      const width = x2 - x1;
      const height = y2 - y1;
      const container = containerRef.current;
      const targetOffset = targetCanvaslistnum.offsetTop - container!.offsetTop;
      container!.scrollTo({ top: targetOffset, behavior: 'smooth' });

      const ctx = targetCanvas.getContext('2d')!;

      // 先绘制背景
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(x1, y1, width, height);
      ctx.restore();
    }
  };
  // 渲染页面
  //上下颠倒https://www.jianshu.com/p/e9f5943d9340解决方案
  const busyPageSet = new Set();
  const renderPage = useCallback(
    async (pageNum: number) => {
      // setloadingfile(true);
      if (busyPageSet.has(pageNum)) {
        return;
      }
      busyPageSet.add(pageNum); // 标记当前页面为渲染状态

      if (!pdfDocRef.current || !canvasRef.current[pageNum - 1]) return;

      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current[pageNum - 1];
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        // 限制 canvas 宽度
        ctx.imageSmoothingEnabled = false; // 禁用平滑，图像渲染质量较低
        const containerWidth = divRef?.current?.offsetWidth || 0;

        const maxWidth = containerWidth * 1; // 最大宽度为容器宽度的 95%

        const scaleFactor = maxWidth / viewport.width;

        const newViewport = page.getViewport({ scale: scaleFactor });

        canvas.height = newViewport.height;
        canvas.width = newViewport.width;

        await page.render({ canvasContext: ctx, viewport: newViewport })
          .promise;
        originalImagesRef.current[pageNum] = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
      busyPageSet.delete(pageNum); // 解除标记当前页面的渲染状态
      // setloadingfile(false);
    },
    [scale]
  );
  useEffect(() => {
    if (totalPages > 0 && pdfDocRef.current) {
      let currentPage = Pages;

      const renderNextPage = () => {
        if (currentPage <= totalPages) {
          renderPage(currentPage);
          currentPage += 1;

          // 递归调用 renderNextPage，在下一次可用的动画帧时继续渲染
          requestAnimationFrame(renderNextPage);
        } else {
          console.log('停止');
        }
      };

      // 开始渲染第一页
      requestAnimationFrame(renderNextPage);

      // 取消渲染操作
      return () => {
        currentPage = totalPages + 1; // 结束时更新 currentPage，防止继续渲染
      };
    }
  }, [totalPages, Pages, pdfDocRef.current]);

  return (
    <div className="relative flex h-full bg-[#f0f2f5]" ref={divRef}>
      {loadingfile ? (
        <div className="absolute z-10 flex h-full w-full items-center justify-center">
          <Spin tip="文档加载中..."></Spin>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          {totalPages > 0 ? (
            <div
              className="flex-1 overflow-auto bg-white"
              ref={containerRef} // 添加ref
            >
              {/* 动态渲染 canvas */}
              {[...Array(totalPages)].map((_, index) => {
                return (
                  <canvas
                    className="w-full"
                    key={index}
                    ref={(el) => (canvasRef.current[index] = el!)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-600">
              <p>无法加载PDF文件，请检查文件结构或文件完整性</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentCloud;
