import { functionUsesObjectRefTypeApi } from '../services/ensureFunctionObjectTypeMetadata';

describe('ensureFunctionObjectTypeMetadata helpers', () => {
  it('识别 ObjectRef.Type 用法', () => {
    expect(
      functionUsesObjectRefTypeApi(
        'VehicleType = ObjectRef.Type("cheliangjichuzhushuju")'
      )
    ).toBe(true);
    expect(
      functionUsesObjectRefTypeApi(
        'def fn(v: ObjectRef): return v.properties.name'
      )
    ).toBe(false);
  });
});
