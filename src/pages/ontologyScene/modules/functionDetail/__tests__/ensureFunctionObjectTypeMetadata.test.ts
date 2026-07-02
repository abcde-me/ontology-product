import {
  extractQueryObjectTypeCodes,
  functionUsesQueryObjectsApi,
  isDatasetEmptyTableSqlError,
  isObjectTypeDatasetQueryable,
  resolveOntologyTableName
} from '../services/ensureFunctionObjectTypeMetadata';
import { SyncStatus } from '@/types/graphApi';
import { buildQueryProfilesFromOntologyPhysicalPropertiesList } from '../services/sceneObjectTypeQueryProfiles';

describe('ensureFunctionObjectTypeMetadata helpers', () => {
  it('识别 query_objects 调用', () => {
    expect(
      functionUsesQueryObjectsApi(
        '_res = client.service.query_objects(payload=_query_payload)'
      )
    ).toBe(true);
  });

  it('从 payload 提取 ontology_object_type_code', () => {
    const source = `_query_payload = {
      "ontology_object_type_code": "cheliangjichuzhushuju",
      "select": []
    }`;

    expect(extractQueryObjectTypeCodes(source)).toEqual([
      'cheliangjichuzhushuju'
    ]);
  });

  it('从对象类型详情属性构建 select 字段', () => {
    const fields = buildQueryProfilesFromOntologyPhysicalPropertiesList(
      'cheliangjichuzhushuju',
      [
        {
          propertyID: 'vin',
          propertyName: 'vin',
          sourceColumnName: 'vin',
          isPrimary: 1,
          isVector: 0
        },
        {
          propertyID: 'plate_number',
          propertyName: 'plate_number',
          sourceColumnName: 'plate_number',
          isPrimary: 0,
          isVector: 0
        }
      ] as never
    );

    expect(fields).toEqual(['vin', 'plate_number']);
  });

  it('识别 dataset 空表名 SQL 报错', () => {
    const log = `Error 1064 (42000): You have an error in your SQL syntax near ""
POST http://ontology-dataset-service.ceai.svc.cluster.local/dataset/internal/v1/Query`;

    expect(isDatasetEmptyTableSqlError(log)).toBe(true);
  });

  it('ontologyTableName 为空时不视为已注册物理表', () => {
    expect(resolveOntologyTableName({ ontologyTableName: '  ' })).toBe('');
    expect(resolveOntologyTableName({ ontologyTableName: 'ot_vehicle' })).toBe(
      'ot_vehicle'
    );
  });

  it('dataset 可查询需同时满足 sync 成功与 ontologyTableName', () => {
    expect(
      isObjectTypeDatasetQueryable({
        ontologyTableName: 'ot_vehicle',
        syncStatus: SyncStatus.SUCCESS
      })
    ).toBe(true);
    expect(
      isObjectTypeDatasetQueryable({
        ontologyTableName: '',
        syncStatus: SyncStatus.SUCCESS
      })
    ).toBe(false);
  });
});
