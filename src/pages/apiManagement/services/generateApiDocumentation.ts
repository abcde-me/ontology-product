import { DEFAULT_ONTOLOGY_API_BASE_URL } from '../constants/ontologyApiCatalog';
import type {
  CreateOntologyApiInput,
  HttpMethod,
  OntologyApiConfig,
  OntologyApiCustomMeta
} from '../types';

const DEFAULT_RESPONSE_EXAMPLE = {
  code: 'success',
  message: '',
  requestId: '',
  statusCode: 0,
  data: {}
};

const buildRequestExample = (method: HttpMethod, name: string) => {
  if (method === 'GET' || method === 'DELETE') {
    return '（无请求体）';
  }

  return JSON.stringify(
    {
      ontology_object_type_code: 'your_object_type_code',
      remark: `调用 ${name} 的请求参数示例，请按实际接口定义调整`
    },
    null,
    2
  );
};

export const generateCustomApiCode = (existingCodes: string[]) => {
  const usedNumbers = existingCodes
    .map((code) => {
      const standardMatch = code.match(/^API-(\d+)$/);
      if (standardMatch) {
        return Number(standardMatch[1]);
      }

      const legacyMatch = code.match(/^API-CUSTOM-(\d+)$/);
      if (legacyMatch) {
        return Number(legacyMatch[1]);
      }

      return NaN;
    })
    .filter((value) => Number.isFinite(value));

  const nextNumber = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1;
  return `API-${String(nextNumber).padStart(2, '0')}`;
};

export const generateApiDocumentation = (
  input: CreateOntologyApiInput,
  code: string
): { config: OntologyApiConfig; customMeta: OntologyApiCustomMeta } => {
  const baseUrl = input.baseUrl?.trim() || DEFAULT_ONTOLOGY_API_BASE_URL;
  const category = input.category?.trim() || '自定义';
  const normalizedPath = input.path.trim().startsWith('/')
    ? input.path.trim()
    : `/${input.path.trim()}`;
  const name = input.name.trim();

  const description = `「${name}」接口通过 ${input.method} 请求访问 ${normalizedPath}，用于 Ontology HTTP REST API 集成与数据交互。`;
  const useCase = `适用于外部系统、自动化流程或第三方应用调用「${name}」相关业务能力。`;
  const notes =
    '本文档由系统自动生成，可在编辑页补充参数说明、错误码与业务约束。';

  return {
    customMeta: {
      code,
      name,
      method: input.method,
      path: normalizedPath,
      category
    },
    config: {
      baseUrl,
      path: normalizedPath,
      description,
      useCase,
      requestExample: buildRequestExample(input.method, name),
      responseExample: JSON.stringify(DEFAULT_RESPONSE_EXAMPLE, null, 2),
      notes
    }
  };
};
