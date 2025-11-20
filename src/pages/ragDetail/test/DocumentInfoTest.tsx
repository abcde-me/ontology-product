/**
 * Document Info Test Component
 * 用于测试 getKnowledgeDocument 接口和面包屑显示
 */

import React, { useState, useEffect } from 'react';
import { useRagDetailStore } from '../store/ragDetailStore';
import { getKnowledgeDocument } from '@/api/modules/rag';

const DocumentInfoTest: React.FC = () => {
  const [testDocumentId, setTestDocumentId] = useState('');
  const [testDatasetName, setTestDatasetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    documentName,
    datasetName,
    documentFormat,
    sceneType,
    initializeRagDetail
  } = useRagDetailStore();

  // 测试 getKnowledgeDocument 接口
  const handleTestApi = async () => {
    if (!testDocumentId) {
      setError('请输入 Document ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getKnowledgeDocument({
        document_id: testDocumentId
      });

      console.log('📄 API 响应:', response);
      setResult(response);
    } catch (err: any) {
      console.error('❌ API 调用失败:', err);
      setError(err.message || '接口调用失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试 initializeRagDetail
  const handleTestInitialize = async () => {
    if (!testDocumentId || !testDatasetName) {
      setError('请输入 Document ID 和 Dataset Name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await initializeRagDetail(
        'test-dataset-id',
        testDocumentId,
        null,
        null,
        testDatasetName
      );
      console.log('✅ initializeRagDetail 调用成功');
    } catch (err: any) {
      console.error('❌ initializeRagDetail 调用失败:', err);
      setError(err.message || '初始化失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          📄 Document Info 测试
        </h1>

        {/* 输入区域 */}
        <div className="mb-6 rounded-lg border border-gray-300 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">输入参数</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document ID:
              </label>
              <input
                type="text"
                value={testDocumentId}
                onChange={(e) => setTestDocumentId(e.target.value)}
                placeholder="例如: 1001"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dataset Name:
              </label>
              <input
                type="text"
                value={testDatasetName}
                onChange={(e) => setTestDatasetName(e.target.value)}
                placeholder="例如: 知识库名称"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleTestApi}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '加载中...' : '测试 API'}
              </button>

              <button
                onClick={handleTestInitialize}
                disabled={loading}
                className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? '加载中...' : '测试初始化'}
              </button>
            </div>
          </div>
        </div>

        {/* 错误显示 */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-red-800">❌ 错误: {error}</p>
          </div>
        )}

        {/* API 响应结果 */}
        {result && (
          <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-green-900">
              ✅ API 响应结果
            </h2>
            <pre className="overflow-auto rounded bg-white p-4 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Store 状态显示 */}
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">
            📊 Store 状态
          </h2>

          <div className="space-y-3">
            <div className="rounded bg-white p-3">
              <p className="text-sm font-medium text-gray-700">
                Document Name:
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {documentName || '(未设置)'}
              </p>
            </div>

            <div className="rounded bg-white p-3">
              <p className="text-sm font-medium text-gray-700">Dataset Name:</p>
              <p className="mt-1 text-sm text-gray-600">
                {datasetName || '(未设置)'}
              </p>
            </div>

            <div className="rounded bg-white p-3">
              <p className="text-sm font-medium text-gray-700">
                Document Format:
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {documentFormat || '(未设置)'}
              </p>
            </div>

            <div className="rounded bg-white p-3">
              <p className="text-sm font-medium text-gray-700">Scene Type:</p>
              <p className="mt-1 text-sm text-gray-600">{sceneType}</p>
            </div>

            {/* 面包屑预览 */}
            <div className="rounded bg-white p-3">
              <p className="text-sm font-medium text-gray-700">面包屑预览:</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span>知识库</span>
                <span>/</span>
                <span>{datasetName || '(未设置)'}</span>
                <span>/</span>
                <span>{documentName || '(未设置)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentInfoTest;
