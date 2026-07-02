import {
  analyzeSdkDocumentationAlignment,
  buildFunctionRuntimeDiagnosticReport,
  classifyFunctionRunFailure,
  extractObjectTypeCodesFromErrorLog,
  extractObjectTypeCodesFromFunctionCode,
  FUNCTION_RUNTIME_DIAGNOSTIC_CASES,
  runFunctionRuntimeDiagnosticCase,
  VEHICLE_METADATA_FAILURE_FIXTURE
} from '../services/functionRuntimeDiagnostics';

describe('functionRuntimeDiagnostics', () => {
  describe('classifyFunctionRunFailure', () => {
    it('识别 metadata-service 资源不存在', () => {
      expect(
        classifyFunctionRunFailure(VEHICLE_METADATA_FAILURE_FIXTURE.errorLog)
      ).toBe('metadata_not_found');
    });

    it('识别 Python 缩进语法错误', () => {
      expect(
        classifyFunctionRunFailure(
          'expected an indented block after for statement on line 9'
        )
      ).toBe('python_syntax');
    });
  });

  describe('extractObjectTypeCodes', () => {
    it('从运行报错日志提取 cheliangjichuzhushuju', () => {
      expect(
        extractObjectTypeCodesFromErrorLog(
          VEHICLE_METADATA_FAILURE_FIXTURE.errorLog
        )
      ).toContain('cheliangjichuzhushuju');
    });

    it('从函数代码提取 ObjectRef.Type 参数', () => {
      expect(
        extractObjectTypeCodesFromFunctionCode(
          VEHICLE_METADATA_FAILURE_FIXTURE.functionCode
        )
      ).toEqual(['cheliangjichuzhushuju']);
    });
  });

  describe('analyzeSdkDocumentationAlignment', () => {
    it('车辆案例：使用 Type() 且 SDK 有记载时不应判为文档错误', () => {
      const result = analyzeSdkDocumentationAlignment(
        VEHICLE_METADATA_FAILURE_FIXTURE.functionCode,
        VEHICLE_METADATA_FAILURE_FIXTURE.sdkDocSnippet
      );

      expect(result.usesObjectRefType).toBe(true);
      expect(result.sdkMentionsObjectRefType).toBe(true);
      expect(result.mismatchNotes).toHaveLength(0);
    });

    it('SDK 未记载 ObjectRef.Type 时标记文档不一致', () => {
      const result = analyzeSdkDocumentationAlignment(
        'Vehicle = ObjectRef.Type("code")',
        '使用 ObjectRef(object_type="code", pk="1") 传入对象实例'
      );

      expect(result.mismatchNotes.length).toBeGreaterThan(0);
    });
  });

  describe('预置诊断用例 FUNCTION_RUNTIME_DIAGNOSTIC_CASES', () => {
    it.each(FUNCTION_RUNTIME_DIAGNOSTIC_CASES.map((item) => [item.id, item]))(
      '用例 %s 应得到预期结论',
      (_id, testCase) => {
        const report = runFunctionRuntimeDiagnosticCase(testCase);

        expect(report.category).toBe(testCase.expect.category);
        expect(report.isInfrastructureIssue).toBe(
          testCase.expect.isInfrastructureIssue
        );
        expect(report.isSdkDocIssue).toBe(testCase.expect.isSdkDocIssue);
        expect(report.checks.length).toBeGreaterThan(0);
        expect(report.recommendations.length).toBeGreaterThan(0);
      }
    );
  });

  describe('车辆基础主数据现场案例完整报告', () => {
    it('结论应为后端元数据断层，而非 SDK 文档错误', () => {
      const report = buildFunctionRuntimeDiagnosticReport({
        errorLog: VEHICLE_METADATA_FAILURE_FIXTURE.errorLog,
        functionCode: VEHICLE_METADATA_FAILURE_FIXTURE.functionCode,
        sdkDoc: VEHICLE_METADATA_FAILURE_FIXTURE.sdkDocSnippet,
        sceneObjectTypeCodes:
          VEHICLE_METADATA_FAILURE_FIXTURE.sceneObjectTypeCodes
      });

      expect(report.category).toBe('metadata_not_found');
      expect(report.isInfrastructureIssue).toBe(true);
      expect(report.isSdkDocIssue).toBe(false);
      expect(report.rootCause).toContain('ontology-metadata-service');
      expect(report.summary).toContain('非 SDK 文档问题');

      const metadataCheck = report.checks.find(
        (item) => item.id === 'metadata_service_gap'
      );
      expect(metadataCheck?.passed).toBe(false);
      expect(metadataCheck?.conclusion).toContain('后端注册断层');

      const sdkCheck = report.checks.find(
        (item) => item.id === 'sdk_doc_alignment'
      );
      expect(sdkCheck?.passed).toBe(true);
    });
  });
});
