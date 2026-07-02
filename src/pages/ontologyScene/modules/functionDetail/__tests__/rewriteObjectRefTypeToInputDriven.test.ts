import { rewriteObjectRefTypeToInputDriven } from '../services/rewriteObjectRefTypeToInputDriven';

describe('rewriteObjectRefTypeToInputDriven', () => {
  it('将 ObjectRef.Type + all 改为 ObjectSet 入参', () => {
    const source = `def my_function(arg1: str) -> dict:
    VehicleType = ObjectRef.Type("cheliangjichuzhushuju")
    vehicles = VehicleType.all()
    count = 0
    for v in vehicles:
        count += 1
    return {"var_1": count}`;

    const result = rewriteObjectRefTypeToInputDriven(source);

    expect(result.changed).toBe(true);
    expect(result.content).not.toContain('ObjectRef.Type');
    expect(result.content).not.toContain('VehicleType');
    expect(result.content).toContain('for v in vehicles');
    expect(result.addedInputParams).toEqual([
      expect.objectContaining({
        name: 'vehicles',
        objectTypeCode: 'cheliangjichuzhushuju'
      })
    ]);
    expect(result.remainingObjectRefType).toBe(false);
  });
});
