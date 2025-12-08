/**
 * 图片 URL 转换工具
 * 用于将非标准格式的图片地址（S3路径、本地路径等）转换为可访问的 HTTP URL
 */

import { previewUrl } from '@/api/modules/rag';

/**
 * 图片地址类型
 */
export enum ImageUrlType {
  HTTP = 'http', // 标准 HTTP URL
  S3 = 's3', // S3 路径 (s3://bucket/path)
  LOCAL = 'local', // 本地路径 (/path/to/image)
  UNKNOWN = 'unknown' // 未知格式
}

/**
 * 解析图片地址信息
 */
export interface ParsedImageUrl {
  type: ImageUrlType;
  bucket?: string;
  path?: string;
  originalUrl: string;
}

/**
 * 识别图片地址类型
 */
export function identifyImageUrlType(url: string): ImageUrlType {
  if (!url) return ImageUrlType.UNKNOWN;

  // HTTP/HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return ImageUrlType.HTTP;
  }

  // S3 URL (s3://bucket/path)
  if (url.startsWith('s3://')) {
    return ImageUrlType.S3;
  }

  // 本地路径 (/path 或 ./path 或 ../path)
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return ImageUrlType.LOCAL;
  }

  return ImageUrlType.UNKNOWN;
}

/**
 * 解析 S3 URL
 * 格式: s3://bucket-name/path/to/image.jpg
 */
export function parseS3Url(s3Url: string): ParsedImageUrl {
  const match = s3Url.match(/^s3:\/\/([^/]+)\/(.+)$/);

  if (match) {
    return {
      type: ImageUrlType.S3,
      bucket: match[1],
      path: match[2],
      originalUrl: s3Url
    };
  }

  return {
    type: ImageUrlType.UNKNOWN,
    originalUrl: s3Url
  };
}

/**
 * 解析本地路径
 * 格式: /path/to/image.jpg 或 bucket/path/to/image.jpg
 */
export function parseLocalPath(
  localPath: string,
  defaultBucket?: string
): ParsedImageUrl {
  // 如果路径中包含 bucket 信息（通常是第一个目录）
  const parts = localPath.split('/').filter(Boolean);

  if (parts.length >= 2) {
    const bucket = parts[0];
    const path = parts.slice(1).join('/');
    return {
      type: ImageUrlType.LOCAL,
      bucket,
      path,
      originalUrl: localPath
    };
  }

  // 如果只有文件名，使用默认 bucket
  if (defaultBucket) {
    return {
      type: ImageUrlType.LOCAL,
      bucket: defaultBucket,
      path: localPath,
      originalUrl: localPath
    };
  }

  return {
    type: ImageUrlType.UNKNOWN,
    originalUrl: localPath
  };
}

/**
 * 将非标准图片地址转换为 HTTP URL
 * @param imageUrl 原始图片地址
 * @param defaultBucket 默认的 bucket 名称（用于本地路径）
 * @returns 转换后的 HTTP URL，如果无法转换则返回原始 URL
 */
export async function convertImageUrlToHttp(
  imageUrl: string,
  defaultBucket?: string
): Promise<string> {
  try {
    const urlType = identifyImageUrlType(imageUrl);

    // 如果已经是 HTTP URL，直接返回
    if (urlType === ImageUrlType.HTTP) {
      return imageUrl;
    }

    let parsed: ParsedImageUrl;

    // 解析不同格式的 URL
    if (urlType === ImageUrlType.S3) {
      parsed = parseS3Url(imageUrl);
    } else if (urlType === ImageUrlType.LOCAL) {
      parsed = parseLocalPath(imageUrl, defaultBucket);
    } else {
      // 未知格式，返回原始 URL
      return imageUrl;
    }

    // 如果解析失败，返回原始 URL
    if (!parsed.bucket || !parsed.path) {
      return imageUrl;
    }

    // 调用 API 获取预览 URL
    const response = await previewUrl({
      bucket_name: parsed.bucket,
      path: parsed.path
    });

    // 返回转换后的 URL，如果失败则返回原始 URL
    return response.data?.url || imageUrl;
  } catch (error) {
    console.error('❌ 转换图片 URL 失败:', error, imageUrl);
    // 转换失败时返回原始 URL
    return imageUrl;
  }
}

/**
 * 批量转换 markdown 中的图片 URL
 * @param markdown markdown 文本
 * @param defaultBucket 默认的 bucket 名称
 * @returns 转换后的 markdown 文本
 */
export async function convertMarkdownImageUrls(
  markdown: string,
  defaultBucket?: string
): Promise<string> {
  // 匹配 markdown 图片语法: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let result = markdown;
  const matches = Array.from(markdown.matchAll(imageRegex));

  // 并行转换所有图片 URL
  const conversions = await Promise.all(
    matches.map(async (match) => {
      const fullMatch = match[0]; // ![alt](url)
      const alt = match[1]; // alt text
      const originalUrl = match[2]; // url
      const convertedUrl = await convertImageUrlToHttp(
        originalUrl,
        defaultBucket
      );

      return {
        fullMatch,
        alt,
        originalUrl,
        convertedUrl
      };
    })
  );

  // 替换 markdown 中的图片 URL
  conversions.forEach(({ fullMatch, alt, convertedUrl }) => {
    const newMatch = `![${alt}](${convertedUrl})`;
    result = result.replace(fullMatch, newMatch);
  });

  return result;
}

/**
 * 缓存已转换的 URL，避免重复调用 API
 */
const urlCache = new Map<string, string>();

/**
 * 获取缓存的转换 URL
 */
export function getCachedUrl(originalUrl: string): string | undefined {
  return urlCache.get(originalUrl);
}

/**
 * 设置缓存的转换 URL
 */
export function setCachedUrl(originalUrl: string, convertedUrl: string): void {
  urlCache.set(originalUrl, convertedUrl);
}

/**
 * 清空 URL 缓存
 */
export function clearUrlCache(): void {
  urlCache.clear();
}

/**
 * 带缓存的 URL 转换
 */
export async function convertImageUrlToHttpWithCache(
  imageUrl: string,
  defaultBucket?: string
): Promise<string> {
  // 检查缓存
  const cached = getCachedUrl(imageUrl);
  if (cached) {
    return cached;
  }

  // 转换 URL
  const converted = await convertImageUrlToHttp(imageUrl, defaultBucket);

  // 保存到缓存
  if (converted !== imageUrl) {
    setCachedUrl(imageUrl, converted);
  }

  return converted;
}

/**
 * 检测内容是否包含 markdown 格式的图片
 * 匹配 markdown 图片语法: ![alt](url)
 * @param content 内容文本
 * @returns 是否包含 markdown 图片
 */
export function hasMarkdownImages(content: string): boolean {
  if (!content) return false;
  // 匹配 markdown 图片语法: ![alt](url)
  // ![...] 中可以是任何非 ] 的字符
  // (...) 中可以是任何非 ) 的字符
  const imageRegex = /!\[[^\]]*\]\([^)]+\)/;
  return imageRegex.test(content);
}

/**
 * 获取内容中的所有 markdown 图片
 * @param content 内容文本
 * @returns markdown 图片数组
 */
export function getMarkdownImages(content: string): string[] {
  if (!content) return [];
  const imageRegex = /!\[[^\]]*\]\([^)]+\)/g;
  const matches = content.match(imageRegex);
  return matches || [];
}
