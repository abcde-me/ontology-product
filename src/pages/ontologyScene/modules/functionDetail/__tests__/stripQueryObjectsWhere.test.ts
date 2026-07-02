import { stripQueryObjectsWhere } from '../services/stripQueryObjectsWhere';

describe('stripQueryObjectsWhere', () => {
  it('移除 query_objects payload 中的 where（op/left/right 格式，含嵌套对象）', () => {
    const source = `_vehicle_payload = {
        "ontology_object_type_code": "cheliangjichuzhushuju",
        "select": [{"type": "column", "name": "vin"}, {"type": "column", "name": "plate_number"}],
        "where": {"op": "=", "left": {"type": "column", "name": "plate_number"}, "right": {"type": "value", "value": "苏E·F67890"}}
    }
vehicle_res = client.service.query_objects(payload=vehicle_payload)`;

    const result = stripQueryObjectsWhere(source);

    expect(result.changed).toBe(true);
    expect(result.content).not.toContain('"where"');
    expect(result.content).toContain('query_objects(payload=vehicle_payload)');
    // 确保没有破坏 JSON 结构
    expect(result.content).toContain('"select"');
  });

  it('没有 where 时不修改', () => {
    const source = `_res = client.service.query_objects(payload={"ontology_object_type_code": "x", "select": []})`;
    const result = stripQueryObjectsWhere(source);
    expect(result.changed).toBe(false);
  });
});
