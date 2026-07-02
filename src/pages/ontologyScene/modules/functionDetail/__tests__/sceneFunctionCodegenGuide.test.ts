import {
  buildSceneQueryStrategyHints,
  ONTOLOGY_RUNTIME_API_GUIDE,
  QUERY_STRATEGY_GUIDE
} from '../services/sceneFunctionCodegenGuide';

describe('sceneFunctionCodegenGuide', () => {
  it('查询策略使用 query_objects', () => {
    expect(QUERY_STRATEGY_GUIDE).toContain('client.service.query_objects');
    expect(QUERY_STRATEGY_GUIDE).toContain('禁止 ObjectRef.Type');
  });

  it('运行时指南禁止 ObjectRef.Type', () => {
    expect(ONTOLOGY_RUNTIME_API_GUIDE).toContain(
      'client.service.query_objects'
    );
    expect(ONTOLOGY_RUNTIME_API_GUIDE).toContain('"select"');
    expect(ONTOLOGY_RUNTIME_API_GUIDE).toContain('禁止 ObjectRef.Type');
  });

  it('批量描述推荐 query_objects', () => {
    const hints = buildSceneQueryStrategyHints(
      {
        objectTypes: [{ id: 1, code: 'vehicle', name: '车辆' }],
        links: [],
        contextText: ''
      },
      '查询所有车辆列表并统计'
    );

    expect(hints).toContain('client.service.query_objects');
    expect(hints).toContain('禁止 ObjectRef.Type');
  });
});
