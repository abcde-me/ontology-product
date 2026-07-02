import type { OntologyFunctionParam } from '@/pages/ontologyScene/types/ontologyFunction';
import { buildPythonFunctionScript } from '@/pages/ontologyScene/modules/functionDetail/utils';
import { fetchSceneOntologyRefs } from './fetchSceneOntologyContext';
import { sanitizeOntologyFunctionRuntimeApi } from './sanitizeOntologyFunctionRuntimeApi';
import {
  mergeSceneInputParams,
  rewriteObjectRefTypeToInputDriven
} from './rewriteObjectRefTypeToInputDriven';

export interface PrepareFunctionForSceneExecutionInput {
  sceneId: number;
  code: string;
  content: string;
  input?: OntologyFunctionParam[];
  output?: OntologyFunctionParam[];
}

export interface PrepareFunctionForSceneExecutionResult {
  content: string;
  input: OntologyFunctionParam[];
  notes: string[];
  changed: boolean;
}

/**
 * 试运行/保存前：修正无效 API，并将 ObjectRef.Type 改写为场景库入参驱动。
 * 全程仅使用场景库信息，不依赖运行时元数据后端接口。
 */
export const prepareFunctionForSceneExecution = async (
  params: PrepareFunctionForSceneExecutionInput
): Promise<PrepareFunctionForSceneExecutionResult> => {
  const notes: string[] = [];
  let content = String(params.content ?? '');
  let input = [...(params.input ?? [])];
  let changed = false;

  const runtimeSanitized = sanitizeOntologyFunctionRuntimeApi(content);
  if (runtimeSanitized.changed) {
    content = runtimeSanitized.content;
    notes.push(...runtimeSanitized.notes);
    changed = true;
  }

  const rewrite = rewriteObjectRefTypeToInputDriven(content);
  if (rewrite.changed) {
    content = rewrite.content;
    notes.push(...rewrite.notes);
    changed = true;
  }

  if (rewrite.addedInputParams.length) {
    const sceneRefs = await fetchSceneOntologyRefs(params.sceneId);
    const mergedInput = mergeSceneInputParams(
      input,
      rewrite.addedInputParams,
      sceneRefs.objectTypes
    );
    if (mergedInput.length !== input.length) {
      input = mergedInput;
      changed = true;
      content = buildPythonFunctionScript({
        code: params.code,
        input,
        output: params.output,
        content
      });
    }
  }

  return {
    content,
    input,
    notes,
    changed
  };
};
