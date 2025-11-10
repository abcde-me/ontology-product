/**
 * 生成Mock PDF二进制数据
 * 这是一个最小的有效PDF文件，包含一页内容
 */
export function generateMockPdfData(): ArrayBuffer {
  // 这是一个最小的有效PDF文件的base64编码
  // 包含一页空白页面，可以被pdfjs正确解析
  const pdfBase64 = `
JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL1Jl
c291cmNlcyAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUuMjggODQxLjg5XQovQ29udGVudHMg
NCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSAy
NCBUZgoxMDAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1
IDAgb2JqCjw8L1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0
aWNhCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9Qcm9jU2V0IFsvUERGIC9UZXh0XQovRm9udCA8
PC9GMSA1IDAgUj4+Cj4+CmVuZG9iagoxIDAgb2JqCjw8L1R5cGUgL1BhZ2VzCi9LaWRzIFsz
IDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1LjI4IDg0MS44OV0KPj4KZW5kb2Jq
CjYgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDEgMCBSCj4+CmVuZG9iagp4cmVm
CjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAzMTggMDAwMDAgbiAKMDAwMDAwMDI2
NiAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMjQgMDAwMDAgbiAKMDAw
MDAwMDIxNiAwMDAwMCBuIAowMDAwMDAwMzk3IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUg
NwovUm9vdCA2IDAgUgo+PgpzdGFydHhyZWYKNDQ2CiUlRU9GCg==
  `.trim();

  // 将base64转换为ArrayBuffer
  const binaryString = atob(pdfBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 生成包含多页的Mock PDF二进制数据
 * 这个PDF包含3页，每页都有文本内容
 */
export function generateMultiPageMockPdfData(): ArrayBuffer {
  // 这是一个包含3页的PDF文件的base64编码
  const pdfBase64 = `
JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL1Jl
c291cmNlcyAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUuMjggODQxLjg5XQovQ29udGVudHMg
NCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDU1Pj4Kc3RyZWFtCkJUCi9GMSAy
NCBUZgoxMDAgNzAwIFRkCihQYWdlIDEgLSBIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFt
CmVuZG9iago3IDAgb2JqCjw8L1R5cGUgL1BhZ2UKL1BhcmVudCAxIDAgUgovUmVzb3VyY2Vz
IDIgMCBSCi9NZWRpYUJveCBbMCAwIDU5NS4yOCA4NDEuODldCi9Db250ZW50cyA4IDAgUgo+
PgplbmRvYmoKOCAwIG9iago8PC9MZW5ndGggNTU+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEw
MCA3MDAgVGQKKFBhZ2UgMiAtIFNlY29uZCBQYWdlKSBUagpFVAplbmRzdHJlYW0KZW5kb2Jq
CjkgMCBvYmoKPDwvVHlwZSAvUGFnZQovUGFyZW50IDEgMCBSCi9SZXNvdXJjZXMgMiAwIFIK
L01lZGlhQm94IFswIDAgNTk1LjI4IDg0MS44OV0KL0NvbnRlbnRzIDEwIDAgUgo+PgplbmRv
YmoKMTAgMCBvYmoKPDwvTGVuZ3RoIDUzPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAw
IFRkCihQYWdlIDMgLSBUaGlyZCBQYWdlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBv
YmoKPDwvVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EK
Pj4KZW5kb2JqCjIgMCBvYmoKPDwKL1Byb2NTZXQgWy9QREYgL1RleHRdCi9Gb250IDw8L0Yx
IDUgMCBSPj4KPj4KZW5kb2JqCjEgMCBvYmoKPDwvVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBS
IDcgMCBSIDkgMCBSXQovQ291bnQgMwovTWVkaWFCb3ggWzAgMCA1OTUuMjggODQxLjg5XQo+
PgplbmRvYmoKNiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMSAwIFIKPj4KZW5k
b2JqCnhyZWYKMCAxMQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDA2MjcgMDAwMDAgbiAK
MDAwMDAwMDU3NSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMjQgMDAw
MDAgbiAKMDAwMDAwMDUyNSAwMDAwMCBuIAowMDAwMDAwNzA2IDAwMDAwIG4gCjAwMDAwMDAy
MjcgMDAwMDAgbiAKMDAwMDAwMDMzNiAwMDAwMCBuIAowMDAwMDAwNDM5IDAwMDAwIG4gCjAw
MDAwMDA1NDggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSAxMQovUm9vdCA2IDAgUgo+Pgpz
dGFydHhyZWYKNzU1CiUlRU9GCg==
  `.trim();

  const binaryString = atob(pdfBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 从URL获取PDF二进制数据
 * 模拟真实的API请求
 */
export async function fetchPdfBinaryData(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching PDF binary data:', error);
    throw error;
  }
}

/**
 * 模拟API请求返回PDF二进制数据
 * 在真实环境中，这个函数会调用后端API
 */
export async function mockApiGetPdfBinaryData(
  datasetId: string,
  documentId: string
): Promise<ArrayBuffer> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 在真实环境中，这里会调用类似这样的API:
  // const response = await axios.get(
  //   `/api/datasets/${datasetId}/documents/${documentId}/content`,
  //   { responseType: 'arraybuffer' }
  // );
  // return response.data;

  // 现在返回mock数据
  return generateMultiPageMockPdfData();
}
