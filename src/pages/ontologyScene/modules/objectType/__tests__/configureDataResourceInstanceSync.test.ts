import {
  buildDataResourceInstanceSyncFormData,
  canAutoConfigureDataResourceInstanceSync
} from '../services/configureDataResourceInstanceSync';
import { buildCreateObjectTypeRequest } from '../components/ObjectTypeFormHooks/useObjectTypeSubmit';
import { findDataResourceTableBySource } from '../services/dataResourceMapping';
import { SourceType } from '@/types/objectType';

describe('configureDataResourceInstanceSync', () => {
  it('originalDbName 与目录不一致时仍可按表名识别 vehicle', () => {
    expect(findDataResourceTableBySource('mysql', 'vehicle')?.tableName).toBe(
      'vehicle'
    );
  });

  it('数据资源且未配置同步时可一键配置', () => {
    expect(
      canAutoConfigureDataResourceInstanceSync({
        sourceType: SourceType.ICEBERG,
        originalDbName: 'PostgreSQL',
        originalTableName: 'vehicle',
        enableSyncSourceData: false
      })
    ).toBe(true);
  });

  it('已配置同步后不再走一键配置', () => {
    expect(
      canAutoConfigureDataResourceInstanceSync({
        sourceType: SourceType.ICEBERG,
        originalDbName: 'PostgreSQL',
        originalTableName: 'vehicle',
        enableSyncSourceData: true
      })
    ).toBe(false);
  });

  it('构建开启同步的表单数据', () => {
    const formData = buildDataResourceInstanceSyncFormData({
      code: 'cheliangjichuzhushuju',
      name: '车辆基础主数据',
      icon: 'object-type-car',
      ontologyModelID: 1,
      originalDbName: 'mysql',
      originalTableName: 'vehicle',
      sourceType: SourceType.ICEBERG,
      ontologyPhysicalPropertiesList: [
        {
          propertyID: 'vin',
          propertyComment: 'VIN码',
          propertyType: 'varchar(32)',
          isPrimary: 1,
          sourceColumnName: 'vin',
          sourceTableName: 'vehicle'
        },
        {
          propertyID: 'plate_number',
          propertyComment: '车牌号',
          propertyType: 'varchar(32)',
          isPrimary: 0,
          sourceColumnName: 'plate_number',
          sourceTableName: 'vehicle'
        }
      ]
    } as never);

    expect(formData?.enableSyncSourceData).toBe(true);
    expect(formData?.syncMappingFields?.length).toBe(2);
    expect(formData?.syncSourceDataStrategy?.sourceDataInfo?.tableName).toBe(
      'vehicle'
    );
  });

  it('数据资源同步策略可提交到后端（无 connectorId）', () => {
    const formData = buildDataResourceInstanceSyncFormData({
      code: 'cheliangjichuzhushuju',
      name: '车辆基础主数据',
      icon: 'object-type-car',
      ontologyModelID: 1,
      originalDbName: 'PostgreSQL',
      originalTableName: 'vehicle',
      sourceType: SourceType.ICEBERG,
      ontologyPhysicalPropertiesList: [
        {
          propertyID: 'vin',
          propertyComment: 'VIN码',
          propertyType: 'varchar(32)',
          isPrimary: 1,
          sourceColumnName: 'vin',
          sourceTableName: 'vehicle'
        }
      ]
    } as never);

    const request = buildCreateObjectTypeRequest(formData!);

    expect(request.enableSyncSourceData).toBe(true);
    expect(request.syncSourceDataStrategy).toBeDefined();
    expect(request.syncSourceDataStrategy?.sourceDataInfo?.tableName).toBe(
      'vehicle'
    );
    expect(request.syncSourceDataStrategy?.sourceDataInfo?.databaseName).toBe(
      'PostgreSQL'
    );
    expect(
      request.syncSourceDataStrategy?.sourceDataInfo?.connectorId
    ).toBeUndefined();
    expect(request.syncSourceDataStrategy?.mode).toBe('JDBC_POLLING');
    expect(request.syncSourceDataStrategy?.syncScope).toBe('FULL');
  });
});
