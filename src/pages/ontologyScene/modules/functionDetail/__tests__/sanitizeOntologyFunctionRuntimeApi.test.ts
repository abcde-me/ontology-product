import { sanitizeOntologyFunctionRuntimeApi } from '../services/sanitizeOntologyFunctionRuntimeApi';

describe('sanitizeOntologyFunctionRuntimeApi', () => {
  it('将 ObjectSet.Type + ObjectRef.Type 改为 query_objects', () => {
    const source = `def my_function(arg1: str) -> dict:
    vehicles = ObjectSet.Type("cheliangjichuzhushuju")
    return {"count": 1}`;

    const result = sanitizeOntologyFunctionRuntimeApi(source, {
      queryProfiles: {
        cheliangjichuzhushuju: ['vehicle_id', 'plate_no']
      }
    });

    expect(result.changed).toBe(true);
    expect(result.content).toContain('client.service.query_objects');
    expect(result.content).toContain('cheliangjichuzhushuju');
    expect(result.content).toContain('"select"');
    expect(result.content).toContain('plate_no');
    expect(result.content).not.toMatch(/ObjectRef\.Type\s*\(/);
    expect(result.content).not.toMatch(/ObjectSet\.Type\s*\(/);
  });

  it('将 ObjectRef.Type + all 改为 query_objects', () => {
    const source = `def my_function(arg1: str) -> dict:
    VehicleType = ObjectRef.Type("cheliangjichuzhushuju")
    vehicles = VehicleType.all()
    return {"count": len(vehicles)}`;

    const result = sanitizeOntologyFunctionRuntimeApi(source, {
      queryProfiles: {
        cheliangjichuzhushuju: ['vehicle_id']
      }
    });

    expect(result.changed).toBe(true);
    expect(result.content).toContain('client.service.query_objects');
    expect(result.content).toContain('"select"');
    expect(result.content).not.toMatch(/ObjectRef\.Type\s*\(/);
  });

  it('无场景属性时不修改已有不完整 query_objects', () => {
    const source = `_res = client.service.query_objects(payload={"ontology_object_type_code": "code"})`;
    const result = sanitizeOntologyFunctionRuntimeApi(source);
    expect(result.changed).toBe(false);
    expect(result.content).toBe(source);
  });

  it('移除非法 where 并改为 Python 行过滤', () => {
    const source = `_query_payload = {
    "ontology_object_type_code": "cheliangjichuzhushuju",
    "select": [{"type": "column", "name": "plate_number"}],
    "where": {
        "type": "or",
        "conditions": [
            {"type": "condition", "column": "plate_number", "operator": "like", "value": "解放"},
            {"type": "condition", "column": "brand_model", "operator": "like", "value": "解放"}
        ]
    }
}
_res = client.service.query_objects(payload=_query_payload)
_query_data = getattr(_res, "data", None) or {}
vehicles = _query_data.get("results") or []`;

    const result = sanitizeOntologyFunctionRuntimeApi(source);

    expect(result.changed).toBe(true);
    expect(result.content).not.toContain('"conditions"');
    expect(result.content).not.toContain('"operator"');
    expect(result.content).toContain('vehicles = [');
    expect(result.content).toContain('plate_number');
    expect(result.content).toContain('brand_model');
    expect(result.content).toContain('解放');
  });

  it('有场景属性时补全缺少 select 的 query_objects', () => {
    const source = `_res = client.service.query_objects(payload={"ontology_object_type_code": "cheliangjichuzhushuju"})`;
    const result = sanitizeOntologyFunctionRuntimeApi(source, {
      queryProfiles: {
        cheliangjichuzhushuju: ['vehicle_id', 'plate_no']
      }
    });

    expect(result.changed).toBe(true);
    expect(result.content).toContain('_query_payload');
    expect(result.content).toContain('"select"');
    expect(result.content).toContain('plate_no');
    expect(result.content).toContain(
      '_res = client.service.query_objects(payload=_query_payload)'
    );
  });
});
