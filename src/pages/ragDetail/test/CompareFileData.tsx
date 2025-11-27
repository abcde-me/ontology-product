/**
 * 对比 PDF 和 PPT 接口返回的数据格式
 * 用于验证后端返回的二进制数据是否一致
 */

import React, { useState } from 'react';
import axios from 'axios';

const CompareFileData: React.FC = () => {
  const [pdfInfo, setPdfInfo] = useState<any>(null);
  const [pptInfo, setPptInfo] = useState<any>(null);
  const [docxInfo, setDocxInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // PDF 接口
  const PDF_URL =
    '/metadata-service/api/v1/file/downloadFile?bucket=datasource-dev&path=/10/10/orginal/用户权限.pdf&convertPdf=true';

  // PPT 接口
  const PPT_URL =
    '/metadata-service/api/v1/file/downloadFile?bucket=datasource-dev&path=/src/3d22f480-c250-499c-b8e7-3d5c5e6694d2/volume/ba07214b-fcda-4dfb-8fd0-681f54c6c12c/技术架构图0902.pptx&convertPdf=true';

  // DOCX 接口
  const DOCX_URL =
    '/metadata-service/api/v1/file/downloadFile?bucket=datasource-dev&path=/src/78376d9d-ce8b-423f-8c8f-0c363d76120c/volume/516b4eb1-a098-483f-adda-dae338b7cf97/202407dashiji-jian.docx&convertPdf=true';

  const fetchFileData = async (url: string, fileType: string) => {
    try {
      console.log(`🔍 开始请求 ${fileType} 文件...`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });

      const info = {
        // 响应头信息
        headers: {
          contentType: response.headers['content-type'],
          contentLength: response.headers['content-length'],
          contentDisposition: response.headers['content-disposition'],
          allHeaders: response.headers
        },
        // 数据信息
        data: {
          type: typeof response.data,
          isArrayBuffer: response.data instanceof ArrayBuffer,
          isBlob: response.data instanceof Blob,
          size: response.data?.byteLength || response.data?.size || 0,
          // 前100个字节的十六进制表示（用于对比文件头）
          firstBytes:
            response.data instanceof ArrayBuffer
              ? Array.from(new Uint8Array(response.data.slice(0, 100)))
                  .map((b) => b.toString(16).padStart(2, '0'))
                  .join(' ')
              : 'N/A'
        },
        // 状态信息
        status: response.status,
        statusText: response.statusText
      };

      console.log(`✅ ${fileType} 文件信息:`, info);
      return info;
    } catch (error: any) {
      console.error(`❌ ${fileType} 请求失败:`, error);
      return {
        error: error.message,
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
              data: error.response.data
            }
          : null
      };
    }
  };

  const handleCompare = async () => {
    setLoading(true);
    setPdfInfo(null);
    setPptInfo(null);
    setDocxInfo(null);

    const [pdf, ppt, docx] = await Promise.all([
      fetchFileData(PDF_URL, 'PDF'),
      fetchFileData(PPT_URL, 'PPT'),
      fetchFileData(DOCX_URL, 'DOCX')
    ]);

    setPdfInfo(pdf);
    setPptInfo(ppt);
    setDocxInfo(docx);
    setLoading(false);
  };

  const renderInfo = (info: any, title: string) => {
    if (!info) return null;

    return (
      <div className="rounded-lg border border-gray-300 bg-white p-4">
        <h3 className="mb-3 text-lg font-bold text-gray-900">{title}</h3>

        {info.error ? (
          <div className="text-red-600">
            <p className="font-semibold">错误: {info.error}</p>
            {info.response && (
              <pre className="mt-2 overflow-auto rounded bg-red-50 p-2 text-xs">
                {JSON.stringify(info.response, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* 响应状态 */}
            <div>
              <p className="font-semibold text-gray-700">响应状态:</p>
              <p className="text-sm text-gray-600">
                {info.status} {info.statusText}
              </p>
            </div>

            {/* 响应头 */}
            <div>
              <p className="font-semibold text-gray-700">Content-Type:</p>
              <p className="text-sm text-gray-600">
                {info.headers.contentType || 'N/A'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Content-Length:</p>
              <p className="text-sm text-gray-600">
                {info.headers.contentLength || 'N/A'}
              </p>
            </div>

            {/* 数据类型 */}
            <div>
              <p className="font-semibold text-gray-700">数据类型:</p>
              <p className="text-sm text-gray-600">
                Type: {info.data.type}
                <br />
                Is ArrayBuffer: {info.data.isArrayBuffer ? '✅' : '❌'}
                <br />
                Is Blob: {info.data.isBlob ? '✅' : '❌'}
                <br />
                Size: {info.data.size} bytes
              </p>
            </div>

            {/* 文件头（前100字节） */}
            <div>
              <p className="font-semibold text-gray-700">文件头 (前100字节):</p>
              <pre className="mt-1 overflow-auto rounded bg-gray-100 p-2 text-xs">
                {info.data.firstBytes}
              </pre>
            </div>

            {/* 所有响应头 */}
            <div>
              <p className="font-semibold text-gray-700">所有响应头:</p>
              <pre className="mt-1 overflow-auto rounded bg-gray-100 p-2 text-xs">
                {JSON.stringify(info.headers.allHeaders, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          PDF vs PPT 接口数据对比
        </h1>

        <div className="mb-6">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '加载中...' : '开始对比'}
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-700">
            <strong>PDF URL:</strong> {PDF_URL}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            <strong>PPT URL:</strong> {PPT_URL}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            <strong>DOCX URL:</strong> {DOCX_URL}
          </p>
        </div>

        {(pdfInfo || pptInfo || docxInfo) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {renderInfo(pdfInfo, 'PDF 文件信息')}
            {renderInfo(pptInfo, 'PPT 文件信息')}
            {renderInfo(docxInfo, 'DOCX 文件信息')}
          </div>
        )}

        {pdfInfo &&
          pptInfo &&
          docxInfo &&
          !pdfInfo.error &&
          !pptInfo.error &&
          !docxInfo.error && (
            <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4">
              <h3 className="mb-3 text-lg font-bold text-green-900">
                📊 三文件对比结果
              </h3>
              <div className="space-y-3 text-sm">
                {/* Content-Type 对比 */}
                <div className="rounded bg-white p-3">
                  <p className="mb-2 font-semibold text-gray-800">
                    1️⃣ Content-Type 对比:
                  </p>
                  <div className="ml-4 space-y-1 text-xs">
                    <p>
                      • PDF: <code>{pdfInfo.headers.contentType || 'N/A'}</code>
                    </p>
                    <p>
                      • PPT: <code>{pptInfo.headers.contentType || 'N/A'}</code>
                    </p>
                    <p>
                      • DOCX:{' '}
                      <code>{docxInfo.headers.contentType || 'N/A'}</code>
                    </p>
                    <p className="mt-2 font-medium">
                      {pdfInfo.headers.contentType ===
                        pptInfo.headers.contentType &&
                      pdfInfo.headers.contentType ===
                        docxInfo.headers.contentType
                        ? '✅ 三个文件的 Content-Type 相同'
                        : '❌ Content-Type 不完全相同'}
                    </p>
                  </div>
                </div>

                {/* 数据类型对比 */}
                <div className="rounded bg-white p-3">
                  <p className="mb-2 font-semibold text-gray-800">
                    2️⃣ 数据类型对比:
                  </p>
                  <div className="ml-4 space-y-1 text-xs">
                    <p>
                      • PDF: {pdfInfo.data.type} (ArrayBuffer:{' '}
                      {pdfInfo.data.isArrayBuffer ? '✅' : '❌'})
                    </p>
                    <p>
                      • PPT: {pptInfo.data.type} (ArrayBuffer:{' '}
                      {pptInfo.data.isArrayBuffer ? '✅' : '❌'})
                    </p>
                    <p>
                      • DOCX: {docxInfo.data.type} (ArrayBuffer:{' '}
                      {docxInfo.data.isArrayBuffer ? '✅' : '❌'})
                    </p>
                    <p className="mt-2 font-medium">
                      {pdfInfo.data.isArrayBuffer &&
                      pptInfo.data.isArrayBuffer &&
                      docxInfo.data.isArrayBuffer
                        ? '✅ 三个文件都是 ArrayBuffer 格式'
                        : '❌ 数据类型不完全一致'}
                    </p>
                  </div>
                </div>

                {/* 文件大小对比 */}
                <div className="rounded bg-white p-3">
                  <p className="mb-2 font-semibold text-gray-800">
                    3️⃣ 文件大小对比:
                  </p>
                  <div className="ml-4 space-y-1 text-xs">
                    <p>
                      • PDF: {(pdfInfo.data.size / 1024).toFixed(2)} KB (
                      {pdfInfo.data.size.toLocaleString()} bytes)
                    </p>
                    <p>
                      • PPT: {(pptInfo.data.size / 1024).toFixed(2)} KB (
                      {pptInfo.data.size.toLocaleString()} bytes)
                    </p>
                    <p>
                      • DOCX: {(docxInfo.data.size / 1024).toFixed(2)} KB (
                      {docxInfo.data.size.toLocaleString()} bytes)
                    </p>
                  </div>
                </div>

                {/* 文件头对比（魔数） */}
                <div className="rounded bg-white p-3">
                  <p className="mb-2 font-semibold text-gray-800">
                    4️⃣ 文件头魔数对比 (前8字节):
                  </p>
                  <div className="ml-4 space-y-1 text-xs">
                    <p>
                      • PDF:{' '}
                      <code className="rounded bg-gray-100 px-1">
                        {pdfInfo.data.firstBytes
                          .split(' ')
                          .slice(0, 8)
                          .join(' ')}
                      </code>
                      {pdfInfo.data.firstBytes.startsWith('25 50 44 46') &&
                        ' ✅ (标准PDF: %PDF)'}
                    </p>
                    <p>
                      • PPT:{' '}
                      <code className="rounded bg-gray-100 px-1">
                        {pptInfo.data.firstBytes
                          .split(' ')
                          .slice(0, 8)
                          .join(' ')}
                      </code>
                      {pptInfo.data.firstBytes.startsWith('50 4b 03 04') &&
                        ' ✅ (ZIP/PPTX)'}
                      {pptInfo.data.firstBytes.startsWith('d0 cf 11 e0') &&
                        ' ✅ (OLE/PPT)'}
                    </p>
                    <p>
                      • DOCX:{' '}
                      <code className="rounded bg-gray-100 px-1">
                        {docxInfo.data.firstBytes
                          .split(' ')
                          .slice(0, 8)
                          .join(' ')}
                      </code>
                      {docxInfo.data.firstBytes.startsWith('50 4b 03 04') &&
                        ' ✅ (ZIP/DOCX)'}
                      {docxInfo.data.firstBytes.startsWith('d0 cf 11 e0') &&
                        ' ✅ (OLE/DOC)'}
                    </p>
                  </div>
                </div>

                {/* 最终结论 */}
                <div className="rounded border-2 border-green-500 bg-green-100 p-4">
                  <p className="mb-2 text-base font-bold text-green-900">
                    🎯 最终结论:
                  </p>
                  <div className="ml-4 space-y-2 text-sm">
                    {pdfInfo.data.isArrayBuffer &&
                    pptInfo.data.isArrayBuffer &&
                    docxInfo.data.isArrayBuffer ? (
                      <>
                        <p className="font-semibold text-green-800">
                          ✅ 三个接口都正确返回了二进制数据 (ArrayBuffer)
                        </p>
                        <p className="text-green-700">
                          ✅ 后端数据格式统一，都是原始文件的二进制流
                        </p>
                        <div className="mt-3 rounded bg-orange-50 p-3">
                          <p className="font-semibold text-orange-800">
                            ⚠️ 但是前端需要不同的渲染方式：
                          </p>
                          <ul className="ml-6 mt-2 list-disc space-y-1 text-orange-700">
                            <li>
                              <strong>PDF</strong>: 使用 PDF.js 可以直接渲染 ✅
                            </li>
                            <li>
                              <strong>PPT</strong>: PDF.js
                              无法渲染，需要转换或使用专门库 ❌
                            </li>
                            <li>
                              <strong>DOCX</strong>: PDF.js
                              无法渲染，需要转换或使用专门库 ❌
                            </li>
                          </ul>
                        </div>
                        <div className="mt-3 rounded bg-blue-50 p-3">
                          <p className="font-semibold text-blue-800">
                            💡 推荐解决方案：
                          </p>
                          <p className="mt-2 text-blue-700">
                            让后端统一将 PPT/DOCX 转换为 PDF
                            格式后返回，这样前端可以统一使用 PDF.js 渲染所有文档
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="font-semibold text-red-700">
                        ❌ 接口返回的数据格式不一致，需要后端统一处理
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default CompareFileData;
