import type {
  GetOntologyTopologyResponse,
  LinkInfo,
  ListOntologyLinkTypeReq,
  ListOntologyLinkTypeRes,
  ListOntologyObjectTypeDataRes,
  ListOntologyPhysicalPropertiesReq,
  ListOntologyPhysicalPropertiesRes
} from '@/types/graphApi';
import { LinkType, SyncStatus } from '@/types/graphApi';
import UAPI from '@/api';

// 获取本体拓扑（mock 数据）
export async function getOntologyTopology(params: {
  id: number;
}): Promise<ApiRes<GetOntologyTopologyResponse>> {
  return UAPI.RES.GetOntologyTopologyApi({}).post(params).inRegion().do();

  // const mockData: GetOntologyTopologyResponse = {
  //   nodes: [
  //     {
  //       id: 1,
  //       name: '原始情报',
  //       code: 'RAW_INTELLIGENCE',
  //       description: '原始情报 - 6项属性',
  //       type: 'entity',
  //       ontologyPhysicalPropertiesList: [
  //         {
  //           id: 1,
  //           name: '属性1',
  //           type: 'string'
  //         },
  //         {
  //           id: 2,
  //           name: '属性2',
  //           type: 'string'
  //         }
  //       ],
  //       syncStatus: SyncStatus.FAILED
  //     },
  //     {
  //       id: 2,
  //       name: '意图研判',
  //       code: 'INTENT_HYPOTHESIS',
  //       description: '意图研判 - 4项属性',
  //       type: 'entity',
  //       ontologyPhysicalPropertiesList: [
  //         {
  //           id: 1,
  //           name: '属性1',
  //           type: 'string'
  //         },
  //         {
  //           id: 2,
  //           name: '属性2',
  //           type: 'string'
  //         },
  //         {
  //           id: 3,
  //           name: '属性3',
  //           type: 'string'
  //         },
  //         {
  //           id: 4,
  //           name: '属性4',
  //           type: 'string'
  //         }
  //       ],
  //       syncStatus: SyncStatus.FAILED
  //     },
  //     {
  //       id: 3,
  //       name: '作战事件',
  //       code: 'MILITARY_EVENT',
  //       description: '作战事件 - 6项属性',
  //       type: 'entity',
  //       ontologyPhysicalPropertiesList: [
  //         {
  //           id: 1,
  //           name: '属性1',
  //           type: 'string'
  //         }
  //       ],
  //       syncStatus: SyncStatus.SUCCESS
  //     },
  //     {
  //       id: 4,
  //       name: '传感器航迹',
  //       code: 'SENSOR_TRACK',
  //       description: '传感器航迹 - 6项属性',
  //       type: 'entity',
  //       ontologyPhysicalPropertiesList: [
  //         {
  //           id: 1,
  //           name: '属性1',
  //           type: 'string'
  //         }
  //       ],
  //       syncStatus: SyncStatus.SUCCESS
  //     },
  //     {
  //       id: 5,
  //       name: '行动方案',
  //       code: 'COURSE_OF_ACTION',
  //       description: '行动方案 - 5项属性',
  //       type: 'entity',
  //       syncStatus: SyncStatus.NOT_SYNC
  //     },
  //     {
  //       id: 6,
  //       name: '作战任务',
  //       code: 'MISSION',
  //       description: '作战任务 - 3项属性',
  //       type: 'entity',
  //       syncStatus: SyncStatus.NOT_SYNC
  //     },
  //     {
  //       id: 7,
  //       name: '作战资源',
  //       code: 'MILITARY_ASSET',
  //       description: '作战资源 - 10项属性',
  //       type: 'entity',
  //       syncStatus: SyncStatus.SYNCING
  //     },
  //     {
  //       id: 8,
  //       name: '部队编制',
  //       code: 'ORGANIZATION',
  //       description: '部队编制 - 5项属性',
  //       type: 'entity',
  //       syncStatus: SyncStatus.SUCCESS
  //     }
  //   ],
  //   edges: [
  //     {
  //       id: 101,
  //       name: '研判支撑',
  //       code: 'EDGE_RAW_INTELLIGENCE_TO_INTENT_HYPOTHESIS',
  //       description: '原始情报 -> 意图研判 (研判支撑)',
  //       sourceId: 1,
  //       targetId: 2,
  //       type: 1,
  //       syncStatus: SyncStatus.FAILED
  //     },
  //     {
  //       id: 102,
  //       name: '情报支撑',
  //       code: 'EDGE_RAW_INTELLIGENCE_TO_MILITARY_EVENT',
  //       description: '原始情报 -> 作战事件',
  //       sourceId: 1,
  //       targetId: 3,
  //       type: 1,
  //       syncStatus: SyncStatus.FAILED
  //     },
  //     {
  //       id: 103,
  //       name: '研判关联',
  //       code: 'EDGE_INTENT_HYPOTHESIS_TO_MILITARY_EVENT',
  //       description: '意图研判 -> 作战事件',
  //       sourceId: 2,
  //       targetId: 3,
  //       type: 1,
  //       syncStatus: SyncStatus.SUCCESS
  //     },
  //     {
  //       id: 104,
  //       name: '事件追踪',
  //       code: 'EDGE_MILITARY_EVENT_TO_SENSOR_TRACK',
  //       description: '原始情报 -> 传感器航迹',
  //       sourceId: 1,
  //       targetId: 4,
  //       type: 1,
  //       syncStatus: SyncStatus.FAILED
  //     },
  //     {
  //       id: 105,
  //       name: '推荐方案',
  //       code: 'EDGE_MILITARY_EVENT_TO_COURSE_OF_ACTION',
  //       description: '作战事件 -> 行动方案 (推荐方案)',
  //       sourceId: 3,
  //       targetId: 5,
  //       type: 1,
  //       syncStatus: SyncStatus.FAILED
  //     },
  //     {
  //       id: 106,
  //       name: '航迹关联',
  //       code: 'EDGE_SENSOR_TRACK_TO_MILITARY_ASSET',
  //       description: '传感器航迹 -> 作战资源',
  //       sourceId: 4,
  //       targetId: 7,
  //       type: 1,
  //       syncStatus: SyncStatus.NOT_SYNC
  //     },
  //     {
  //       id: 107,
  //       name: '方案执行',
  //       code: 'EDGE_COURSE_OF_ACTION_TO_MISSION',
  //       description: '行动方案 -> 作战任务',
  //       sourceId: 5,
  //       targetId: 6,
  //       type: 1,
  //       syncStatus: SyncStatus.SYNCING
  //     },
  //     {
  //       id: 108,
  //       name: '任务分配',
  //       code: 'EDGE_MISSION_TO_MILITARY_ASSET',
  //       description: '作战任务 -> 作战资源',
  //       sourceId: 6,
  //       targetId: 7,
  //       type: 1,
  //       syncStatus: SyncStatus.SUCCESS
  //     },
  //     {
  //       id: 109,
  //       name: '下',
  //       code: 'EDGE_MILITARY_ASSET_TO_ORGANIZATION',
  //       description: '作战资源 -> 部队编制 (下)',
  //       sourceId: 7,
  //       targetId: 8,
  //       type: 1,
  //       syncStatus: SyncStatus.SUCCESS
  //     }
  //   ]
  // };

  // const res: ApiRes<GetOntologyTopologyResponse> = {
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // };

  // // 保留 params 参数以避免未使用告警
  // void params;

  // return Promise.resolve(res);
}

// 分页查询对象类型实例数据
export async function listOntologyObjectTypeData(params: {
  id: number;
  page: number;
  pageSize: number;
}): Promise<ApiRes<ListOntologyObjectTypeDataRes>> {
  return UAPI.RES.ListOntologyObjectTypeDataApi({})
    .post(params)
    .inRegion()
    .do();

  // return Promise.resolve({
  //   code: '',
  //   data: {
  //     result: [
  //       {
  //         id: 'WS-01WS-01WS-01WS-01WS-01WS-01WS-01WS-01WS-01WS-01WS-01',
  //         wind: '8.5m/s',
  //         vis: '12km',
  //         wind_speed: '8.5m/s'
  //         // visibility: '12km'
  //       },
  //       {
  //         id: 'WS-02',
  //         wind: '22.0m/s',
  //         vis: '2km',
  //         wind_speed: '22.0m/s',
  //         visibility: '2km'
  //       },
  //       {
  //         id: 'WS-03',
  //         wind: '5.4m/s',
  //         vis: '32km',
  //         wind_speed: '5.4m/s',
  //         visibility: '32km'
  //       },
  //       {
  //         id: 'WS-04',
  //         wind: '8.5m/s',
  //         vis: '12km',
  //         wind_speed: '8.5m/s',
  //         visibility: '12km'
  //       },
  //       {
  //         id: 'WS-05',
  //         wind: '22.0m/s',
  //         vis: '2km',
  //         wind_speed: '22.0m/s',
  //         visibility: '2km'
  //       },
  //       {
  //         id: 'WS-06',
  //         wind: '5.4m/s',
  //         vis: '32km',
  //         wind_speed: '5.4m/s',
  //         visibility: '32km'
  //       },
  //       {
  //         id: 'WS-07',
  //         wind: '8.5m/s',
  //         vis: '12km',
  //         wind_speed: '8.5m/s',
  //         visibility: '12km'
  //       },
  //       {
  //         id: 'WS-08',
  //         wind: '22.0m/s',
  //         vis: '2km',
  //         wind_speed: '22.0m/s',
  //         visibility: '2km'
  //       }
  //     ],
  //     totalCount: 8
  //   },
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
}

// 获取物理属性列表
export async function listOntologyPhysicalProperties(
  params: ListOntologyPhysicalPropertiesReq
): Promise<ApiRes<ListOntologyPhysicalPropertiesRes>> {
  return UAPI.RES.ListOntologyPhysicalPropertiesApi({})
    .post(params)
    .inRegion()
    .do();

  // return Promise.resolve({
  //   code: '',
  //   data: {
  //     result: [
  //       {
  //         id: 1,
  //         name: '风速',
  //         description: '风速属性，单位：m/s',
  //         columnType: 'double',
  //         comment: '风速',
  //         tableField: 'wind_speed',
  //         isPrimary: 0,
  //         isDeleted: 0,
  //         objectTypeID: 1,
  //         ontologyModelID: 1,
  //         ontologyObjectTypeId: 1,
  //         ontologyObjectTypeName: '原始情报',
  //         ontologyObjectTypeIcon: 'object-type-1',
  //         ontologyPublicPropertiesId: 101,
  //         ontologyPublicPropertiesName: '风速',
  //         publicPropertyID: 101,
  //         createTime: '2024-01-01 10:00:00',
  //         createUser: 'admin',
  //         updateTime: '2024-01-01 10:00:00',
  //         updateUser: 'admin'
  //       },
  //       {
  //         id: 2,
  //         name: '能见度',
  //         description: '能见度属性，单位：km',
  //         columnType: 'double',
  //         comment: '能见度',
  //         tableField: 'visibility',
  //         isPrimary: 0,
  //         isDeleted: 0,
  //         objectTypeID: 1,
  //         ontologyModelID: 1,
  //         ontologyObjectTypeId: 1,
  //         ontologyObjectTypeName: '原始情报',
  //         ontologyObjectTypeIcon: 'object-type-1',
  //         ontologyPublicPropertiesId: 102,
  //         ontologyPublicPropertiesName: '能见度',
  //         publicPropertyID: 102,
  //         createTime: '2024-01-01 10:00:00',
  //         createUser: 'admin',
  //         updateTime: '2024-01-01 10:00:00',
  //         updateUser: 'admin'
  //       },
  //       {
  //         id: 3,
  //         name: '温度',
  //         description: '温度属性，单位：℃',
  //         columnType: 'double',
  //         comment: '温度',
  //         tableField: 'temperature',
  //         isPrimary: 0,
  //         isDeleted: 0,
  //         objectTypeID: 2,
  //         ontologyModelID: 1,
  //         ontologyObjectTypeId: 2,
  //         ontologyObjectTypeName: '意图研判',
  //         ontologyObjectTypeIcon: 'object-type-2',
  //         ontologyPublicPropertiesId: 103,
  //         ontologyPublicPropertiesName: '温度',
  //         publicPropertyID: 103,
  //         createTime: '2024-01-01 11:00:00',
  //         createUser: 'admin',
  //         updateTime: '2024-01-01 11:00:00',
  //         updateUser: 'admin'
  //       },
  //       {
  //         id: 4,
  //         name: '事件类型',
  //         description: '作战事件类型',
  //         columnType: 'string',
  //         comment: '事件类型',
  //         tableField: 'event_type',
  //         isPrimary: 0,
  //         isDeleted: 0,
  //         objectTypeID: 3,
  //         ontologyModelID: 1,
  //         ontologyObjectTypeId: 3,
  //         ontologyObjectTypeName: '作战事件',
  //         ontologyObjectTypeIcon: 'object-type-3',
  //         createTime: '2024-01-01 12:00:00',
  //         createUser: 'admin',
  //         updateTime: '2024-01-01 12:00:00',
  //         updateUser: 'admin'
  //       },
  //       {
  //         id: 5,
  //         name: '航迹ID',
  //         description: '传感器航迹唯一标识',
  //         columnType: 'string',
  //         comment: '航迹ID',
  //         tableField: 'track_id',
  //         isPrimary: 1,
  //         isDeleted: 0,
  //         objectTypeID: 4,
  //         ontologyModelID: 1,
  //         ontologyObjectTypeId: 4,
  //         ontologyObjectTypeName: '传感器航迹',
  //         ontologyObjectTypeIcon: 'object-type-4',
  //         createTime: '2024-01-01 13:00:00',
  //         createUser: 'admin',
  //         updateTime: '2024-01-01 13:00:00',
  //         updateUser: 'admin'
  //       }
  //     ],
  //     totalCount: 5
  //   },
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
}

export async function listOntologyLinkType(
  params: ListOntologyLinkTypeReq
): Promise<ApiRes<ListOntologyLinkTypeRes>> {
  return UAPI.RES.ListOntologyLinkTypeApi({}).post(params).inRegion().do();

  // 节点名称映射
  // const nodeNameMap: Record<number, string> = {
  //   1: '原始情报',
  //   2: '意图研判',
  //   3: '作战事件',
  //   4: '传感器航迹',
  //   5: '行动方案',
  //   6: '作战任务',
  //   7: '作战资源',
  //   8: '部队编制'
  // };

  // const mockLinkData: LinkInfo[] = [
  //   {
  //     id: 101,
  //     name: '研判支撑',
  //     code: 'EDGE_RAW_INTELLIGENCE_TO_INTENT_HYPOTHESIS',
  //     description: '原始情报 -> 意图研判 (研判支撑)',
  //     sourceObjectTypeID: 1,
  //     sourceObjectTypeName: nodeNameMap[1],
  //     sourceObjectTypeIcon: 'object-type-1',
  //     targetObjectTypeID: 2,
  //     targetObjectTypeName: nodeNameMap[2],
  //     targetObjectTypeIcon: 'object-type-2',
  //     type: LinkType.ONE_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 10:00:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_raw_intelligence_intent_hypothesis',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'raw_intelligence',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 10:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 10:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 102,
  //     name: '情报支撑',
  //     code: 'EDGE_RAW_INTELLIGENCE_TO_MILITARY_EVENT',
  //     description: '原始情报 -> 作战事件',
  //     sourceObjectTypeID: 1,
  //     sourceObjectTypeName: nodeNameMap[1],
  //     sourceObjectTypeIcon: 'object-type-1',
  //     targetObjectTypeID: 3,
  //     targetObjectTypeName: nodeNameMap[3],
  //     targetObjectTypeIcon: 'object-type-3',
  //     type: LinkType.ONE_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 10:30:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_raw_intelligence_military_event',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'raw_intelligence',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 10:30:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 10:30:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 103,
  //     name: '研判关联',
  //     code: 'EDGE_INTENT_HYPOTHESIS_TO_MILITARY_EVENT',
  //     description: '意图研判 -> 作战事件',
  //     sourceObjectTypeID: 2,
  //     sourceObjectTypeName: nodeNameMap[2],
  //     sourceObjectTypeIcon: 'object-type-2',
  //     targetObjectTypeID: 3,
  //     targetObjectTypeName: nodeNameMap[3],
  //     targetObjectTypeIcon: 'object-type-3',
  //     type: LinkType.MANY_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 11:00:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_intent_hypothesis_military_event',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'intent_hypothesis',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 11:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 11:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 104,
  //     name: '事件追踪',
  //     code: 'EDGE_MILITARY_EVENT_TO_SENSOR_TRACK',
  //     description: '原始情报 -> 传感器航迹',
  //     sourceObjectTypeID: 1,
  //     sourceObjectTypeName: nodeNameMap[1],
  //     sourceObjectTypeIcon: 'object-type-1',
  //     targetObjectTypeID: 4,
  //     targetObjectTypeName: nodeNameMap[4],
  //     targetObjectTypeIcon: 'object-type-4',
  //     type: LinkType.ONE_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 11:30:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_raw_intelligence_sensor_track',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'raw_intelligence',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 11:30:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 11:30:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 105,
  //     name: '推荐方案',
  //     code: 'EDGE_MILITARY_EVENT_TO_COURSE_OF_ACTION',
  //     description: '作战事件 -> 行动方案 (推荐方案)',
  //     sourceObjectTypeID: 3,
  //     sourceObjectTypeName: nodeNameMap[3],
  //     sourceObjectTypeIcon: 'object-type-3',
  //     targetObjectTypeID: 5,
  //     targetObjectTypeName: nodeNameMap[5],
  //     targetObjectTypeIcon: 'object-type-5',
  //     type: LinkType.ONE_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 12:00:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_military_event_course_of_action',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'military_event',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 12:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 12:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 106,
  //     name: '航迹关联',
  //     code: 'EDGE_SENSOR_TRACK_TO_MILITARY_ASSET',
  //     description: '传感器航迹 -> 作战资源',
  //     sourceObjectTypeID: 4,
  //     sourceObjectTypeName: nodeNameMap[4],
  //     sourceObjectTypeIcon: 'object-type-4',
  //     targetObjectTypeID: 7,
  //     targetObjectTypeName: nodeNameMap[7],
  //     targetObjectTypeIcon: 'object-type-6',
  //     type: LinkType.MANY_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 12:30:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_sensor_track_military_asset',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'sensor_track',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 12:30:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 12:30:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 107,
  //     name: '方案执行',
  //     code: 'EDGE_COURSE_OF_ACTION_TO_MISSION',
  //     description: '行动方案 -> 作战任务',
  //     sourceObjectTypeID: 5,
  //     sourceObjectTypeName: nodeNameMap[5],
  //     sourceObjectTypeIcon: 'object-type-5',
  //     targetObjectTypeID: 6,
  //     targetObjectTypeName: nodeNameMap[6],
  //     targetObjectTypeIcon: 'object-type-6',
  //     type: LinkType.ONE_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 13:00:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_course_of_action_mission',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'course_of_action',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 13:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 13:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 108,
  //     name: '任务分配',
  //     code: 'EDGE_MISSION_TO_MILITARY_ASSET',
  //     description: '作战任务 -> 作战资源',
  //     sourceObjectTypeID: 6,
  //     sourceObjectTypeName: nodeNameMap[6],
  //     sourceObjectTypeIcon: 'object-type-6',
  //     targetObjectTypeID: 7,
  //     targetObjectTypeName: nodeNameMap[7],
  //     targetObjectTypeIcon: 'object-type-6',
  //     type: LinkType.MANY_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 13:30:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_mission_military_asset',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'mission',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 13:30:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 13:30:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 109,
  //     name: '下',
  //     code: 'EDGE_MILITARY_ASSET_TO_ORGANIZATION',
  //     description: '作战资源 -> 部队编制 (下)',
  //     sourceObjectTypeID: 7,
  //     sourceObjectTypeName: nodeNameMap[7],
  //     sourceObjectTypeIcon: 'object-type-6',
  //     targetObjectTypeID: 8,
  //     targetObjectTypeName: nodeNameMap[8],
  //     targetObjectTypeIcon: 'object-type-5',
  //     type: LinkType.ONE_TO_MANY,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-01 14:00:00',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db',
  //     ontologyTableName: 'link_military_asset_organization',
  //     linkSourceType: 1,
  //     linkDBName: 'source_db',
  //     linkTableName: 'military_asset',
  //     linkSourceColumnID: 1,
  //     linkTargetColumnID: 1,
  //     sourcePropertyID: 1,
  //     targetPropertyID: 1,
  //     isDeleted: 0,
  //     createTime: '2024-01-01 14:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-01 14:00:00',
  //     updateUser: 'admin'
  //   }
  // ];

  // return Promise.resolve({
  //   code: '',
  //   data: {
  //     result: mockLinkData,
  //     totalCount: mockLinkData.length
  //   },
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
}
