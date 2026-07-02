/**
 * Vercel Serverless：转发 /deepseek-api/* 到 DeepSeek OpenAI 兼容接口
 * 解决浏览器直连 api.deepseek.com 的 CORS 限制，支持 SSE 流式响应
 */
const ALLOW_HEADERS = 'Content-Type, Authorization';

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', ALLOW_HEADERS);
};

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const pathParam = req.query.path;
  const pathStr = Array.isArray(pathParam)
    ? pathParam.join('/')
    : String(pathParam || '').replace(/^\/+/, '');

  if (!pathStr) {
    res.status(400).json({ error: 'Missing DeepSeek API path' });
    return;
  }

  const targetUrl = `https://api.deepseek.com/${pathStr}`;
  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json'
  };

  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body);
    } else if (typeof req.rawBody === 'string') {
      body = req.rawBody;
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    });

    res.status(response.status);
    setCors(res);

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (!response.body) {
      res.end();
      return;
    }

    const { Readable } = require('stream');
    const { pipeline } = require('stream/promises');
    await pipeline(Readable.fromWeb(response.body), res);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'DeepSeek proxy failed';
    res.status(502).json({ error: message });
  }
};
