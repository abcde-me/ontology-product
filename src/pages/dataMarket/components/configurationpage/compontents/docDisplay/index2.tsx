import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { getToken } from '@/utils/request';
import { PrefixV2 } from '@/api/endpoints';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PdfViewer = ({
  documentid,
  datasetid
}: {
  documentid: string;
  datasetid: string;
}) => {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pageSize = 1024 * 2; // 每次请求1MB
  let currentStart = 0;
  let currentEnd = pageSize - 1;

  // 请求 PDF 的部分数据
  const loadPdf = async () => {
    try {
      const url = `${PrefixV2}/files/datasets/${datasetid}/documents/${documentid}/browser-with-part`;
      const res = await axios.get(url, {
        headers: {
          ...getToken(),
          Range: `bytes=${currentStart}-${currentEnd}`
        },
        responseType: 'arraybuffer'
      });

      const arrayBuffer = res.data;
      const newPdfData = new Uint8Array(arrayBuffer);
      setPdfData(newPdfData);
      currentStart += pageSize;
      currentEnd = currentStart + pageSize - 1;

      // 如果页面需要加载更多数据，可以继续请求更多的页面数据
      setLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setLoading(false);
    }
  };

  const renderPdf = async () => {
    if (pdfData && canvasRef.current) {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);

        // 渲染当前页面
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({
            canvasContext: context,
            viewport
          }).promise;
        }
      } catch (error) {
        console.error('Error rendering PDF:', error);
      }
    }
  };

  useEffect(() => {
    if (documentid) {
      loadPdf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentid]);

  useEffect(() => {
    renderPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfData, pageNumber]);

  return (
    <div className="relative flex h-full bg-[#f0f2f5]">
      {loading && <div>Loading PDF...</div>}
      <canvas ref={canvasRef} />
      {/* 可加入页码控制器 */}
      <div>
        <button
          onClick={() => setPageNumber(pageNumber > 1 ? pageNumber - 1 : 1)}
        >
          Previous
        </button>
        <span>
          {pageNumber} / {numPages}
        </span>
        <button
          onClick={() =>
            setPageNumber(
              pageNumber < (numPages || 1) ? pageNumber + 1 : numPages
            )
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
