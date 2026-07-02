import { DATA_RESOURCE_SAMPLE_DATA } from '@/pages/dataResource/data/sampleData';

export interface SimulateTestResult {
  success: boolean;
  runLog: string[];
  result?: any;
  error?: string;
}

/**
 * 纯前端模拟执行 ontology 函数（不依赖后端）。
 * 目前仅支持 query_objects + 简单 Python 逻辑，足够 myindex 等场景使用。
 */
export const simulateTestFunction = (
  code: string,
  functionName: string,
  args: Record<string, any> = {}
): Promise<SimulateTestResult> =>
  // 纯前端模拟，无需 await，显式返回 Promise 以满足类型要求
  Promise.resolve().then(() => {
    const logs: string[] = [];
    logs.push(`[模拟] 函数 "${functionName}" 开始执行（纯前端模式）`);

    try {
      // 1. 提取所有 query_objects 调用（支持任意变量名）
      // 匹配形式：
      //   xxx_payload = { ... }
      //   xxx_res = client.service.query_objects(payload=xxx_payload)
      const queryMatches = [
        ...code.matchAll(
          /(\w+)\s*=\s*\{([\s\S]*?)\}\s*\n?\s*(\w+)\s*=\s*client\.service\.query_objects\(payload=\1\)/g
        )
      ];

      // 简单的变量环境
      const env: Record<string, any> = { ...args };

      // 2. 模拟 query_objects
      for (const match of queryMatches) {
        const payloadVar = match[1]; // e.g. vehicle_payload
        const payloadStr = match[2]; // JSON 字符串
        const resVar = match[3]; // e.g. vehicle_res

        // 尝试解析 ontology_object_type_code
        const codeMatch = payloadStr.match(
          /"ontology_object_type_code"\s*:\s*"([^"]+)"/
        );
        const objectTypeCode = codeMatch?.[1];

        // 解析 select
        const selectMatch = payloadStr.match(/"select"\s*:\s*\[([\s\S]*?)\]/);
        let selectFields: string[] = [];
        if (selectMatch) {
          const fieldNames = [
            ...selectMatch[1].matchAll(/"name"\s*:\s*"([^"]+)"/g)
          ].map((m) => m[1]);
          selectFields = fieldNames;
        }

        if (!objectTypeCode) {
          logs.push(
            `[模拟] 无法解析 query_objects 的 ontology_object_type_code`
          );
          continue;
        }

        // 从 sampleData 里找匹配的表
        let mockRows: any[] = [];
        if (
          objectTypeCode.includes('cheliang') ||
          objectTypeCode.includes('vehicle')
        ) {
          mockRows = DATA_RESOURCE_SAMPLE_DATA.vehicle || [];
        } else {
          mockRows = [];
        }

        // 只保留 select 的字段
        const projected = mockRows.map((row) => {
          const out: Record<string, any> = {};
          if (selectFields.length === 0) {
            return row;
          }
          for (const f of selectFields) {
            out[f] = row[f];
          }
          return out;
        });

        logs.push(
          `[模拟] query_objects(${objectTypeCode}) 返回 ${projected.length} 条记录（select: ${selectFields.join(', ')}）`
        );

        // 把 payload 和 res 都写回 env
        env[payloadVar] = {
          ontology_object_type_code: objectTypeCode,
          select: selectFields.map((name) => ({ type: 'column', name }))
        };
        env[resVar] = { data: { results: projected } };
      }

      // 3. 增强的简单 Python 执行（支持 getattr、dict.get、len、return）
      const returnMatch = code.match(/return\s+(\{[\s\S]*?\})/);
      let result: any = null;

      if (returnMatch) {
        try {
          const jsExpr = returnMatch[1]
            .replace(
              /getattr\(\s*([^,]+)\s*,\s*"([^"]+)"\s*,\s*None\s*\)\s*or\s*\{\}/g,
              '($1 && $1.$2) || {}'
            )
            .replace(
              /(\w+)\.get\(\s*"([^"]+)"\s*\)\s*or\s*\[\]/g,
              '($1.$2) || []'
            )
            .replace(/len\(([^)]+)\)/g, '($1 || []).length');

          const evalEnv = { ...env };
          // eslint-disable-next-line @typescript-eslint/no-implied-eval
          result = new Function(...Object.keys(evalEnv), `return ${jsExpr}`)(
            ...Object.values(evalEnv)
          );
        } catch (e) {
          logs.push(`[模拟] return 表达式执行失败: ${(e as Error).message}`);

          // 兜底策略：
          // 1. 如果 return 里有 count，返回车辆数量
          if (/count/.test(returnMatch[1])) {
            result = {
              count:
                Object.values(env).filter((v) => v?.data?.results).length || 8
            };
          }
          // 2. 否则尝试返回最后一个 query_objects 的结果
          else {
            const lastRes = Object.entries(env)
              .reverse()
              .find(([, v]) => v && typeof v === 'object' && 'data' in v);
            if (lastRes) {
              result = { [lastRes[0]]: lastRes[1] };
            }
          }
        }
      }

      logs.push(`[模拟] 函数执行完成`);
      return {
        success: true,
        runLog: logs,
        result
      };
    } catch (error) {
      logs.push(`[模拟] 执行异常: ${(error as Error).message}`);
      return {
        success: false,
        runLog: logs,
        error: (error as Error).message
      };
    }
  });
