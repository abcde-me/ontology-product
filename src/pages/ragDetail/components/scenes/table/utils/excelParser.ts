/**
 * Excel 解析工具函数
 */

import * as XLSX from 'xlsx';
import { TableSegment } from '../../../../types';

/**
 * 从二进制数据解析 Excel 文件
 */
export const parseExcelFromBinary = (
  fileBinaryData: ArrayBuffer
): TableSegment[] => {
  const workbook = XLSX.read(fileBinaryData, { type: 'array' });

  // 将每个工作表转换为TableSegment格式
  const sheets: TableSegment[] = workbook.SheetNames.map((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];

    // 将工作表转换为JSON数组，保留所有数据（包括空白行和空白单元格）
    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: true
    });

    // 获取合并单元格信息
    const merges = worksheet['!merges'] || [];

    if (jsonData.length === 0) {
      return {
        id: `sheet-${index}`,
        content: sheetName,
        charCount: 0,
        segmentIndex: index,
        tableData: {
          headers: [],
          rows: [],
          headerRows: [],
          merges: []
        }
      };
    }

    // 计算最大列数
    const maxCols = Math.max(...jsonData.map((row) => row.length), 0);

    // 检查第一行是否有跨行的合并单元格
    // 如果有，说明第一行可能包含数据区域的合并单元格，不应该作为表头
    const hasFirstRowVerticalMerge = merges.some(
      (merge) => merge.s.r === 0 && merge.e.r > 0
    );

    // 如果第一行有跨行合并，说明第一行是数据的一部分，表头为空
    // 否则，第一行作为表头
    const headerRowCount = hasFirstRowVerticalMerge ? 0 : 1;

    // 提取表头行数据
    const headerRows =
      headerRowCount > 0 ? jsonData.slice(0, headerRowCount) : [];

    // 使用第一行作为列标识（用于数据行的键）
    // 如果第一行是数据的一部分，使用列索引作为键
    const headers = Array.from({ length: maxCols }, (_, idx) => {
      if (headerRowCount > 0) {
        const cellValue = jsonData[0]?.[idx];
        return cellValue != null ? String(cellValue) : `col_${idx}`;
      } else {
        // 没有表头，使用列索引
        return `col_${idx}`;
      }
    });

    // 数据行：如果第一行是表头，从第二行开始；如果第一行是数据，从第一行开始
    const dataStartRow = headerRowCount;
    const dataRows = jsonData.slice(dataStartRow);

    // 将数据行转换为对象格式
    const rows = dataRows.map((row, rowIndex) => {
      const rowObj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        const cellValue = row[idx];
        rowObj[header || idx.toString()] =
          cellValue != null ? String(cellValue) : '';
      });
      return rowObj;
    });

    let charCount = 0;
    try {
      charCount = JSON.stringify(jsonData).length;
    } catch (error) {
      console.error('计算字符数失败:', error);
    }

    return {
      id: `sheet-${index}`,
      content: sheetName,
      charCount,
      segmentIndex: index,
      tableData: {
        headers,
        rows,
        headerRows,
        merges: merges.map((merge) => ({
          startRow: merge.s.r,
          endRow: merge.e.r,
          startCol: merge.s.c,
          endCol: merge.e.c
        }))
      }
    };
  });

  return sheets;
};
