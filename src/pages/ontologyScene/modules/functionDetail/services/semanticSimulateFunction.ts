import { fetchSceneOntologyRefs } from './fetchSceneOntologyContext';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import {
  DIRECT_LLM_APP_ID,
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { AI_WORKBENCH_LLM_CONFIG } from '@/pages/aiOntologyWorkbench/config/llm';

export interface SemanticSimulateResult {
  success: boolean;
  runLog: string[];
  result?: any;
  error?: string;
}

/**
 * 使用大模型进行语义模拟执行（演示模式）。
 * 完全在前端运行，不依赖后端 dataset / metadata。
 */
export const semanticSimulateFunction = async (
  sceneId: number,
  code: string,
  functionName: string,
  description = ''
): Promise<SemanticSimulateResult> => {
  const logs: string[] = [];
  logs.push(`[语义模拟] 函数 "${functionName}" 开始语义模拟执行`);

  try {
    // 1. 获取当前场景的完整图谱上下文
    const sceneRefs = await fetchSceneOntologyRefs(sceneId);
    const contextText = sceneRefs.contextText || '（当前场景无图谱信息）';

    logs.push(
      `[语义模拟] 已加载场景图谱：${sceneRefs.objectTypes.length} 个对象类型，${sceneRefs.links.length} 个链接`
    );

    // 2. 检查是否有可用的 LLM（优先使用 workbench 默认配置）
    const hasSpecificScenario = isScenarioLlmAvailable(
      'ontology-function-semantic-simulate'
    );
    const llmConfig = hasSpecificScenario
      ? resolveScenarioLlmConfig('ontology-function-semantic-simulate')
      : null;

    // 如果没有特定 scenario，也允许使用 workbench 的默认 LLM
    const canUseLlm = hasSpecificScenario || !!AI_WORKBENCH_LLM_CONFIG.apiKey;

    // 3. 构造高质量 Prompt（正式环境演示级真实度）
    const systemPrompt = `你是一个本体函数语义模拟助手。
你将收到当前场景的完整图谱结构（对象类型、属性、链接）和一个 Python 函数。
请基于图谱语义，生成**真实、合理、有业务含义**的模拟实例数据，用于正式环境演示。

输出必须是严格的 JSON，格式如下：
{
  "queryResults": {
    "<ontology_object_type_code>": [
      { "属性1": "值1", "属性2": "值2", ... },
      { "属性1": "值1", "属性2": "值2", ... }
      // 建议返回 3~10 条真实记录
    ]
  },
  "finalResult": { ... }
}

严格要求：
- 只能使用场景中已定义的对象类型 code 和属性英文名
- 数据必须符合业务语义和属性值域（例如车辆状态只能是“运行/停用/维修中”，日期格式正确等）
- 如果函数代码里有 where 条件，请在生成数据时体现过滤后的结果
- 每条记录都要有业务含义，不要出现明显占位符或重复数据
- finalResult 必须能让函数的 return 语句成立
- 优先返回多条记录，体现真实查询效果
- 不要编造场景中不存在的 code 或属性`;

    const userPrompt = `【当前场景图谱】
${contextText}

【函数代码】
${code}

【函数描述】
${description || '（无描述）'}

请生成语义合理的模拟执行数据。`;

    // 4. 调用 LLM
    const messages: DirectLlmMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const url = resolveDirectLlmRequestUrl();
    const apiKey = llmConfig?.apiKey || AI_WORKBENCH_LLM_CONFIG.apiKey;
    const model =
      llmConfig?.model || AI_WORKBENCH_LLM_CONFIG.model || 'deepseek-chat';

    logs.push('[语义模拟] 正在调用大模型生成模拟数据...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 4000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`LLM 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 5. 解析 LLM 返回的 JSON
    let llmResult: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        llmResult = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logs.push(`[语义模拟] LLM 返回解析失败: ${(e as Error).message}`);
      return basicSimulateFallback(code, functionName, logs);
    }

    if (!llmResult) {
      logs.push('[语义模拟] LLM 未返回有效数据，退回基础模拟');
      return basicSimulateFallback(code, functionName, logs);
    }

    logs.push('[语义模拟] 大模型已生成模拟数据（含多条真实实例）');

    // 6. 把 LLM 生成的数据注入执行环境（支持多条记录）
    const env: Record<string, any> = {};
    if (llmResult.queryResults) {
      Object.entries(llmResult.queryResults).forEach(([code, rows]) => {
        env[`_res_${code}`] = { data: { results: rows } };
      });
    }

    // 7. 简单执行 return 表达式
    const returnMatch = code.match(/return\s+(\{[\s\S]*?\})/);
    let finalResult = llmResult.finalResult;

    if (returnMatch && !finalResult) {
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

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        finalResult = new Function(...Object.keys(env), `return ${jsExpr}`)(
          ...Object.values(env)
        );
      } catch {
        finalResult = llmResult.finalResult || { simulated: true };
      }
    }

    logs.push(`[语义模拟] 语义模拟执行完成`);

    return {
      success: true,
      runLog: logs,
      result: finalResult
    };
  } catch (error) {
    logs.push(`[语义模拟] 执行异常: ${(error as Error).message}`);
    return {
      success: false,
      runLog: logs,
      error: (error as Error).message
    };
  }
};

/** 基础模拟兜底（当 LLM 不可用时） */
const basicSimulateFallback = async (
  code: string,
  functionName: string,
  existingLogs: string[]
): Promise<SemanticSimulateResult> => {
  // 直接复用基础模拟器
  const { simulateTestFunction } = await import('./simulateFunctionTest');
  const fallback = await simulateTestFunction(code, functionName, {});
  return {
    ...fallback,
    runLog: [...existingLogs, ...fallback.runLog]
  };
};
