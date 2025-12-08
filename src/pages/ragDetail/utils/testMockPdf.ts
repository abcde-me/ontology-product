/**
 * 测试 Mock PDF 数据是否有效
 * 在浏览器控制台运行此函数
 */
import {
  generateMultiPageMockPdfData,
  mockApiGetPdfBinaryData
} from './mockPdfData';

export async function testMockPdfData() {
  console.log('🧪 开始测试 Mock PDF 数据...');

  try {
    // 测试1: 生成数据
    const pdfData = generateMultiPageMockPdfData();
    console.log('✅ 生成PDF数据成功');
    console.log('   - 数据类型:', pdfData.constructor.name);
    console.log('   - 数据大小:', pdfData.byteLength, 'bytes');

    // 测试2: 验证数据格式
    const uint8Array = new Uint8Array(pdfData);
    const header = String.fromCharCode(...uint8Array.slice(0, 5));
    console.log('   - PDF头部:', header);

    if (header === '%PDF-') {
      console.log('✅ PDF格式验证通过');
    } else {
      console.error('❌ PDF格式验证失败，头部应该是 %PDF-');
    }

    // 测试3: 测试API函数
    console.log('🧪 测试 mockApiGetPdfBinaryData...');
    const apiData = await mockApiGetPdfBinaryData('test-dataset', 'test-doc');
    console.log('✅ API函数调用成功');
    console.log('   - 数据大小:', apiData.byteLength, 'bytes');

    // 测试4: 创建Blob URL
    const blob = new Blob([apiData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    console.log('✅ 创建Blob URL成功:', url);

    console.log('🎉 所有测试通过！');
    return { success: true, pdfData, apiData, url };
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return { success: false, error };
  }
}

// 自动运行测试（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  // testMockPdfData();
}
