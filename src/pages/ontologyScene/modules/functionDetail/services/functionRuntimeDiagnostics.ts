/**
 * 函数运行失败诊断：区分 Python 语法、SDK 用法、场景库 code、运行时元数据等问题。
 */

export type FunctionFailureCategory =
  | 'metadata_not_found'
  | 'python_syntax'
  | 'sdk_usage'
  | 'scene_code_missing'
  | 'execution_unknown'
  | 'success';

export interface FunctionRuntimeDiagnosticInput {
  errorLog: string;
  functionCode: string;
  sdkDoc?: string;
  sceneObjectTypeCodes?: string[];
  referencedObjectTypeCodes?: string[];
}

export interface FunctionRuntimeDiagnosticCheck {
  id: string;
  name: string;
  passed: boolean;
  conclusion: string;
  evidence?: string[];
}

export interface FunctionRuntimeDiagnosticReport {
  category: FunctionFailureCategory;
  summary: string;
  rootCause: string;
  isSdkDocIssue: boolean;
  isInfrastructureIssue: boolean;
  checks: FunctionRuntimeDiagnosticCheck[];
  recommendations: string[];
}

const METADATA_ERROR_MARKERS = [
  /Failed to resolve metadata for/i,
  /ontology-metadata-service/i,
  /"message"\s*:\s*"资源不存在"/i,
  /GetOntologyObjectType/i
];

const PYTHON_SYNTAX_MARKERS = [
  /expected an indented block/i,
  /SyntaxError/i,
  /定义语法错误/i,
  /invalid syntax/i
];

const OBJECT_REF_TYPE_PATTERN =
  /Object(?:Ref|Set)\.Type\(\s*["']([^"']+)["']\s*\)/g;
const OBJECT_REF_INSTANCE_PATTERN =
  /ObjectRef\(\s*object_type\s*=\s*["']([^"']+)["']/g;

export const extractObjectTypeCodesFromErrorLog = (
  errorLog: string
): string[] => {
  const codes = new Set<string>();

  const metadataMatch = errorLog.match(
    /Failed to resolve metadata for ([^\s:"']+)/i
  );
  if (metadataMatch?.[1]) {
    codes.add(metadataMatch[1].trim());
  }

  const bodyCodePattern = /"code"\s*:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = bodyCodePattern.exec(errorLog)) !== null) {
    if (
      errorLog.includes('资源不存在') ||
      errorLog.includes('Failed to resolve metadata')
    ) {
      codes.add(match[1].trim());
    }
  }

  return [...codes];
};

export const extractObjectTypeCodesFromFunctionCode = (
  code: string
): string[] => {
  const codes = new Set<string>();

  let match: RegExpExecArray | null;
  const typePattern = new RegExp(OBJECT_REF_TYPE_PATTERN.source, 'g');
  while ((match = typePattern.exec(code)) !== null) {
    codes.add(match[1].trim());
  }

  const instancePattern = new RegExp(OBJECT_REF_INSTANCE_PATTERN.source, 'g');
  while ((match = instancePattern.exec(code)) !== null) {
    codes.add(match[1].trim());
  }

  return [...codes];
};

export const classifyFunctionRunFailure = (
  errorLog: string
): FunctionFailureCategory => {
  if (!errorLog.trim()) {
    return 'success';
  }

  if (PYTHON_SYNTAX_MARKERS.some((pattern) => pattern.test(errorLog))) {
    return 'python_syntax';
  }

  if (METADATA_ERROR_MARKERS.some((pattern) => pattern.test(errorLog))) {
    return 'metadata_not_found';
  }

  if (/Target execution failed/i.test(errorLog)) {
    return 'execution_unknown';
  }

  return 'execution_unknown';
};

export const analyzeSdkDocumentationAlignment = (
  functionCode: string,
  sdkDoc: string
): {
  usesObjectRefType: boolean;
  sdkMentionsObjectRefType: boolean;
  sdkMentionsObjectRefInstance: boolean;
  mismatchNotes: string[];
} => {
  const usesObjectRefType = /Object(?:Ref|Set)\.Type\(/i.test(functionCode);
  const sdkMentionsObjectRefType = /Object(?:Ref|Set)\.Type/i.test(sdkDoc);
  const sdkMentionsObjectRefInstance = /ObjectRef\(\s*object_type/i.test(
    sdkDoc
  );

  const mismatchNotes: string[] = [];

  if (usesObjectRefType && !sdkMentionsObjectRefType) {
    mismatchNotes.push(
      '函数使用了 ObjectRef.Type()，但 SDK 文档未提及该 API，需核对文档是否过时'
    );
  }

  if (
    usesObjectRefType &&
    sdkMentionsObjectRefInstance &&
    !sdkMentionsObjectRefType
  ) {
    mismatchNotes.push(
      '平台试运行入参使用 ObjectRef(object_type=..., pk=...) 构造实例，与 ObjectRef.Type() 获取类型是不同用法'
    );
  }

  return {
    usesObjectRefType,
    sdkMentionsObjectRefType,
    sdkMentionsObjectRefInstance,
    mismatchNotes
  };
};

export const buildFunctionRuntimeDiagnosticReport = (
  input: FunctionRuntimeDiagnosticInput
): FunctionRuntimeDiagnosticReport => {
  const category = classifyFunctionRunFailure(input.errorLog);
  const errorCodes = extractObjectTypeCodesFromErrorLog(input.errorLog);
  const codeCodes =
    input.referencedObjectTypeCodes ||
    extractObjectTypeCodesFromFunctionCode(input.functionCode);
  const sceneCodes = input.sceneObjectTypeCodes || [];
  const sdkDoc = input.sdkDoc || '';
  const sdkAlignment = analyzeSdkDocumentationAlignment(
    input.functionCode,
    sdkDoc
  );

  const checks: FunctionRuntimeDiagnosticCheck[] = [];

  checks.push({
    id: 'failure_category',
    name: '失败类型识别',
    passed: category !== 'execution_unknown',
    conclusion:
      category === 'metadata_not_found'
        ? '运行时元数据服务找不到对象类型（资源不存在）'
        : category === 'python_syntax'
          ? 'Python 函数语法错误'
          : category === 'success'
            ? '无报错'
            : '未能自动归类，请人工查看 Traceback',
    evidence: [category]
  });

  const codesInScene = codeCodes.every((code) => sceneCodes.includes(code));
  checks.push({
    id: 'scene_code_exists',
    name: '场景库 code 是否存在',
    passed: !codeCodes.length || codesInScene,
    conclusion: codesInScene
      ? '函数引用的对象类型 code 均在当前场景库中'
      : `以下 code 不在场景库：${codeCodes
          .filter((code) => !sceneCodes.includes(code))
          .join('、')}`,
    evidence: codeCodes
  });

  const metadataCodes = errorCodes.length ? errorCodes : codeCodes;
  const sceneHasButMetadataFails =
    category === 'metadata_not_found' &&
    metadataCodes.some((code) => sceneCodes.includes(code));

  checks.push({
    id: 'metadata_service_gap',
    name: '场景库与 metadata-service 是否断层',
    passed: !sceneHasButMetadataFails,
    conclusion: sceneHasButMetadataFails
      ? '场景库已有该 code，但 ontology-metadata-service 返回资源不存在——属于后端注册断层，不是 SDK 文档错误'
      : '未发现场景库与运行时元数据断层特征',
    evidence: metadataCodes
  });

  checks.push({
    id: 'sdk_doc_alignment',
    name: 'SDK 文档与代码用法是否明显不一致',
    passed: sdkAlignment.mismatchNotes.length === 0,
    conclusion:
      sdkAlignment.mismatchNotes[0] ||
      (sdkAlignment.usesObjectRefType
        ? '函数使用 ObjectRef.Type()，SDK 文档中有相关说明'
        : '未检测到明显的 SDK 文档与代码用法冲突'),
    evidence: sdkAlignment.mismatchNotes
  });

  checks.push({
    id: 'instance_sync_confusion',
    name: '是否误用实例同步解决元数据问题',
    passed: category !== 'metadata_not_found' || !sceneHasButMetadataFails,
    conclusion: sceneHasButMetadataFails
      ? 'SyncObjectTypeTask 仅用于实例数据同步，不能修复 metadata-service 资源不存在'
      : '无需区分实例同步与元数据注册',
    evidence: []
  });

  const isSdkDocIssue =
    sdkAlignment.mismatchNotes.length > 0 && category !== 'metadata_not_found';

  const isInfrastructureIssue = sceneHasButMetadataFails;

  let rootCause = '待进一步分析';
  let summary = '函数运行失败';
  const recommendations: string[] = [];

  if (category === 'metadata_not_found' && sceneHasButMetadataFails) {
    rootCause =
      '对象类型已在场景库创建，但未注册到 ontology-metadata-service；CreateOntologyObjectType 后端链路需排查';
    summary = '运行失败：运行时元数据未注册（非 SDK 文档问题）';
    recommendations.push(
      '保持 code 不变（如 cheliangjichuzhushuju），不要修改函数中的 ObjectRef.Type() 参数'
    );
    recommendations.push(
      '请后端确认 Create/Update 对象类型后是否写入 ontology-metadata-service'
    );
    recommendations.push('不要用对象类型列表的「实例同步重试」来解决此问题');
  } else if (category === 'python_syntax') {
    rootCause = '生成的 Python 函数体缩进或语法有误';
    summary = '运行失败：Python 语法错误';
    recommendations.push(
      '检查 for/if 块内缩进是否为 8 个空格（函数体 4 + 块内 4）'
    );
  } else if (!codesInScene && codeCodes.length) {
    rootCause = '函数引用了当前场景库中不存在的对象类型 code';
    summary = '运行失败：对象类型 code 不在场景库';
    recommendations.push(
      '使用场景库白名单中的 code，或先在场景库创建对应对象类型'
    );
  } else if (isSdkDocIssue) {
    rootCause = 'SDK 文档与函数代码用法可能不一致';
    summary = '运行失败：疑似 SDK 文档或示例问题';
    recommendations.push(
      '对照 SDK 开发文档核对 ObjectRef / ObjectSet 的正确用法'
    );
  } else {
    rootCause = '请结合 Traceback 与运行日志人工排查';
    summary = '运行失败：原因未完全自动识别';
    recommendations.push('展开运行结果中的完整 Traceback 进行分析');
  }

  return {
    category,
    summary,
    rootCause,
    isSdkDocIssue,
    isInfrastructureIssue,
    checks,
    recommendations
  };
};

/** 预置诊断用例：车辆基础主数据 metadata 资源不存在（用户现场） */
export const VEHICLE_METADATA_FAILURE_FIXTURE = {
  objectTypeCode: 'cheliangjichuzhushuju',
  objectTypeName: '车辆基础主数据',
  functionCode: `def my_function(arg1: str) -> dict:
    Vehicle = ObjectRef.Type("cheliangjichuzhushuju")
    var_1 = 1.0
    return {"var_1": var_1}`,
  errorLog: `Target execution failed
[Ontology SDK] Body: {"code": "cheliangjichuzhushuju"}
[Ontology SDK] Response Content: {"statusCode":500,"code":"ERROR","message":"资源不存在","data":{}}
Traceback (most recent call last):
  File "<user-function my_function>", line 5, in my_function
    Vehicle = ObjectRef.Type("cheliangjichuzhushuju")
ValueError: Failed to resolve metadata for cheliangjichuzhushuju: Business error: code=ERROR, message=资源不存在`,
  sdkDocSnippet: `
ObjectRef.Type(type_name) 用于获取对象类型。
试运行入参示例：ObjectRef(object_type="your_code", pk="instance_id")
`,
  sceneObjectTypeCodes: ['cheliangjichuzhushuju']
};

export const FUNCTION_RUNTIME_DIAGNOSTIC_CASES = [
  {
    id: 'vehicle-metadata-not-in-runtime',
    name: '车辆基础主数据：场景库有 code 但 metadata-service 资源不存在',
    input: {
      errorLog: VEHICLE_METADATA_FAILURE_FIXTURE.errorLog,
      functionCode: VEHICLE_METADATA_FAILURE_FIXTURE.functionCode,
      sdkDoc: VEHICLE_METADATA_FAILURE_FIXTURE.sdkDocSnippet,
      sceneObjectTypeCodes:
        VEHICLE_METADATA_FAILURE_FIXTURE.sceneObjectTypeCodes
    },
    expect: {
      category: 'metadata_not_found' as const,
      isInfrastructureIssue: true,
      isSdkDocIssue: false
    }
  },
  {
    id: 'python-for-indent-syntax',
    name: 'for 循环缩进错误导致 Python 语法失败',
    input: {
      errorLog:
        'Code generation failed: 函数my_function定义语法错误: expected an indented block after for statement on line 9',
      functionCode: `def my_function(arg1: str) -> dict:
    for item in items:
    var_1 = 1
    return {"var_1": var_1}`,
      sdkDoc: 'ObjectRef.Type("code")',
      sceneObjectTypeCodes: []
    },
    expect: {
      category: 'python_syntax' as const,
      isInfrastructureIssue: false,
      isSdkDocIssue: false
    }
  },
  {
    id: 'code-not-in-scene',
    name: '函数引用了场景库中不存在的 code',
    input: {
      errorLog: 'Failed to resolve metadata for unknown_type_code',
      functionCode: 'Vehicle = ObjectRef.Type("unknown_type_code")',
      sdkDoc: 'ObjectRef.Type(type_name)',
      sceneObjectTypeCodes: ['cheliangjichuzhushuju']
    },
    expect: {
      category: 'metadata_not_found' as const,
      isInfrastructureIssue: false,
      isSdkDocIssue: false
    }
  },
  {
    id: 'sdk-doc-missing-type-api',
    name: '代码使用 ObjectRef.Type 但 SDK 文档未记载',
    input: {
      errorLog: 'some other error',
      functionCode: 'Vehicle = ObjectRef.Type("cheliangjichuzhushuju")',
      sdkDoc:
        '仅说明 ObjectRef(object_type="x", pk="y") 传入实例，未说明如何按 code 获取类型类',
      sceneObjectTypeCodes: ['cheliangjichuzhushuju']
    },
    expect: {
      category: 'execution_unknown' as const,
      isInfrastructureIssue: false,
      isSdkDocIssue: true
    }
  }
] as const;

export const runFunctionRuntimeDiagnosticCase = (
  testCase: (typeof FUNCTION_RUNTIME_DIAGNOSTIC_CASES)[number]
) => buildFunctionRuntimeDiagnosticReport(testCase.input);
