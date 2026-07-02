import { SyncStatus } from '@/types/graphApi';
import { SourceType } from '@/types/objectType';

jest.mock('@/api/ontologySceneLibrary/objectType', () => ({
  getOntologyObjectTypeDetail: jest.fn(),
  syncObjectTypeTask: jest.fn()
}));

jest.mock(
  '@/pages/ontologyScene/modules/objectType/services/configureDataResourceInstanceSync',
  () => ({
    canAutoConfigureDataResourceInstanceSync: jest.fn(),
    configureDataResourceInstanceSync: jest.fn()
  })
);

jest.mock('../services/fetchSceneOntologyContext', () => ({
  fetchSceneOntologyRefs: jest.fn()
}));

import {
  getOntologyObjectTypeDetail,
  syncObjectTypeTask
} from '@/api/ontologySceneLibrary/objectType';
import {
  canAutoConfigureDataResourceInstanceSync,
  configureDataResourceInstanceSync
} from '@/pages/ontologyScene/modules/objectType/services/configureDataResourceInstanceSync';
import { ensureFunctionObjectTypeMetadata } from '../services/ensureFunctionObjectTypeMetadata';
import { fetchSceneOntologyRefs } from '../services/fetchSceneOntologyContext';

const MYINDEX_FUNCTION = `def my_index(arg1: str) -> dict:
    query_vehicle_payload = {
        "ontology_object_type_code": "cheliangjichuzhushuju",
        "select": [
            {"type": "column", "name": "vin"},
            {"type": "column", "name": "plate_number"},
        ],
    }
    _res_vehicle = client.service.query_objects(payload=query_vehicle_payload)
    _query_data = getattr(_res_vehicle, "data", None) or {}
    vehicles = _query_data.get("results") or []
    return {"count": len(vehicles)}`;

describe('ensureFunctionObjectTypeMetadata integration (myindex)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('myindex 测试前自动配置数据资源实例同步并等待 ontologyTableName 就绪', async () => {
    (fetchSceneOntologyRefs as jest.Mock).mockResolvedValue({
      objectTypes: [
        {
          id: 101,
          name: '车辆基础主数据',
          code: 'cheliangjichuzhushuju',
          syncStatus: SyncStatus.SUCCESS
        }
      ],
      links: [],
      contextText: ''
    });

    (getOntologyObjectTypeDetail as jest.Mock).mockResolvedValue({
      status: 200,
      code: '',
      data: {
        id: 101,
        code: 'cheliangjichuzhushuju',
        name: '车辆基础主数据',
        syncStatus: SyncStatus.SUCCESS,
        enableSyncSourceData: false,
        originalDbName: 'PostgreSQL',
        originalTableName: 'vehicle',
        sourceType: SourceType.ICEBERG,
        ontologyTableName: ''
      }
    });

    (canAutoConfigureDataResourceInstanceSync as jest.Mock).mockReturnValue(
      true
    );
    (configureDataResourceInstanceSync as jest.Mock).mockImplementation(() => {
      (getOntologyObjectTypeDetail as jest.Mock).mockResolvedValue({
        status: 200,
        code: '',
        data: {
          id: 101,
          code: 'cheliangjichuzhushuju',
          syncStatus: SyncStatus.SUCCESS,
          ontologyTableName: 'ot_cheliangjichuzhushuju'
        }
      });
      return {
        ok: true,
        message: '已开启实例同步，正在将原表「vehicle」数据同步到对象实例'
      };
    });

    const result = await ensureFunctionObjectTypeMetadata(
      1,
      MYINDEX_FUNCTION,
      []
    );

    expect(configureDataResourceInstanceSync).toHaveBeenCalledWith(101);
    expect(result.ready).toBe(true);
    expect(result.syncTriggered).toBe(true);
    expect(syncObjectTypeTask).not.toHaveBeenCalled();
  });
});
