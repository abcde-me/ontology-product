import { useEffect, useRef, useCallback } from 'react';
import type { CancelTokenSource } from 'axios';
import {
  createMultipartUpload,
  completeMultipartUpload
} from '@/api/aiOntologyWorkbench/chat';
import createChunksWorker from '@/utils/createChunksWorker';
import { createCancelToken, requestApi } from '@/utils/uploadUtils';
import { uuid } from '@/utils/uuid';

type PartItemType = { partNumber: number; eTag: string };
type PresignedURL = { partNumber: number; url: string };

type MultipartInfo = {
  uploadID: string;
  abortURL: string;
  presignedURLs: PresignedURL[];
  objectPath?: string;
  objectURI?: string;
};

type UploadFileParams = {
  file: File;
  fileKey?: string;
  onCreated?: (info: MultipartInfo) => void;
  onProgress?: (percent: number) => void;
  onSuccess?: (serverResp: any) => void;
  onError?: (err: any) => void;
  uploadParams?: {
    fileName?: string;
    fsID?: string;
    objectPath?: string;
    projectID?: string;
    isInternal?: boolean;
  };
};

type UseMultipartUploaderOptions = {
  autoCancelOnUnmount?: boolean;
};

export function useMultipartUploader(opts?: UseMultipartUploaderOptions) {
  const { autoCancelOnUnmount = true } = opts || {};

  const cancelTokenSourcesRef = useRef<Record<string, CancelTokenSource[]>>({});
  const abortURLMapRef = useRef<Record<string, string>>({});

  const cancelUploadChunks = useCallback((fileKey: string) => {
    cancelTokenSourcesRef.current[fileKey]?.forEach((src) =>
      src?.cancel('用户取消了上传')
    );
    delete cancelTokenSourcesRef.current[fileKey];

    const abortURL = abortURLMapRef.current[fileKey];
    if (abortURL) {
      requestApi({ url: abortURL, method: 'DELETE' }).catch(() => {});
      delete abortURLMapRef.current[fileKey];
    }
  }, []);

  const cancelAllUploads = useCallback(() => {
    const map = cancelTokenSourcesRef.current || {};
    Object.keys(map).forEach((fileKey) => {
      map[fileKey]?.forEach((src) => {
        src?.cancel?.('组件卸载，取消上传');
      });
      delete map[fileKey];
    });
    cancelTokenSourcesRef.current = {};

    const abortMap = abortURLMapRef.current;
    Object.keys(abortMap).forEach((fileKey) => {
      const url = abortMap[fileKey];
      if (url) requestApi({ url, method: 'DELETE' }).catch(() => {});
      delete abortMap[fileKey];
    });
  }, []);

  useEffect(() => {
    return () => {
      if (autoCancelOnUnmount) {
        cancelAllUploads();
      }
    };
  }, [autoCancelOnUnmount, cancelAllUploads]);

  const getFileChunks = (file: File) => {
    const { worker } = createChunksWorker();

    return new Promise<any[]>((resolve, reject) => {
      const timer: any = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        (worker as any)?.terminate?.();
      };

      worker.onmessage = (e: MessageEvent) => {
        const data = (e && (e as any).data) || {};
        if (data?.type === 'chunks') {
          cleanup();
          resolve(data.chunks || []);
        } else if (data?.type === 'error') {
          cleanup();
          reject(new Error(data?.message || 'Worker 切片失败'));
        }
      };

      worker.onerror = (err) => {
        cleanup();
        reject(err);
      };

      worker.postMessage({ file });
    });
  };

  const uploadChunks = async ({
    multipartInfo,
    params,
    chunks,
    fileKey
  }: any) => {
    const { presignedURLs } = multipartInfo;
    const { onProgress, file } = params;
    const urlMap = presignedURLs.reduce(
      (acc: any, { partNumber, url }: any) => {
        acc[partNumber] = url;
        return acc;
      },
      {} as Record<number, string>
    );

    const parts: PartItemType[] = [];
    const chunkLoaded = new Array(chunks.length).fill(0);

    try {
      const requestList = chunks.map((chunk: any, index: number) => {
        const cancelTokenSource = createCancelToken();
        if (!cancelTokenSourcesRef.current[fileKey]) {
          cancelTokenSourcesRef.current[fileKey] = [];
        }
        cancelTokenSourcesRef.current[fileKey][index] = cancelTokenSource;

        return requestApi(
          {
            url: urlMap[index + 1],
            method: 'PUT',
            data: chunk.file,
            cancelToken: cancelTokenSource.token,
            onUploadProgress: (pe: any) => {
              if (file.size === 0) {
                onProgress?.(100);
                return;
              }

              chunkLoaded[index] = pe.loaded || 0;
              const totalLoaded = chunkLoaded.reduce((s, l) => s + l, 0);
              const percent = Math.round((totalLoaded / file.size) * 100);
              onProgress?.(percent);
            }
          },
          cancelTokenSource
        ).then((res) => {
          if (res && res.eTag) {
            parts.push({ partNumber: index + 1, eTag: res.eTag });
          } else {
            throw new Error(`分片 ${index + 1} 上传失败`);
          }
        });
      });

      await Promise.all(requestList);

      if (file.size === 0) {
        onProgress?.(100);
      }
      return parts.sort((a, b) => a.partNumber - b.partNumber);
    } catch {
      if (fileKey) cancelUploadChunks(fileKey);
      throw new Error('文件上传失败');
    }
  };

  const uploadFile = async (params: UploadFileParams) => {
    const {
      file,
      fileKey: inputKey,
      onCreated,
      onSuccess,
      onError,
      uploadParams
    } = params;

    const fileKey = inputKey || uuid();

    try {
      const chunks = await getFileChunks(file);

      const multipartInfo: MultipartInfo = await createMultipartUpload({
        ...uploadParams,
        partCount: chunks.length
      });
      abortURLMapRef.current[fileKey] = multipartInfo.abortURL;
      onCreated?.(multipartInfo);
      const { uploadID } = multipartInfo;

      const parts = await uploadChunks({
        multipartInfo,
        chunks,
        fileKey,
        params
      });

      const objectURI = multipartInfo.objectURI ?? '';
      const completeRes = await completeMultipartUpload({
        ...uploadParams,
        parts: parts,
        uploadID,
        objectPath: objectURI
      });

      if (completeRes?.code === 'Success') {
        onSuccess?.(completeRes);
        delete cancelTokenSourcesRef.current[fileKey];
        delete abortURLMapRef.current[fileKey];
        return completeRes;
      }

      throw new Error('上传完成但服务器返回异常状态');
    } catch (err: any) {
      try {
        cancelUploadChunks(fileKey);
      } catch {}

      onError?.(err);
      throw err;
    }
  };

  return {
    uploadFile,
    cancelUploadChunks
  };
}
