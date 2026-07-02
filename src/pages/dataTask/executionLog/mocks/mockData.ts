import { RunStatus, ExecutionLogItem, ExecutionLogDetail } from '../types';
import {
  buildDataSyncTaskName,
  mockDataTasks
} from '@/pages/dataTask/mocks/mockData';

const resolveTaskName = (taskId: string) =>
  mockDataTasks.find((task) => task.id === taskId)?.name ||
  buildDataSyncTaskName(0);

const buildDetailLog = (taskName: string, tableName: string, lines: string[]) =>
  lines
    .map((line) =>
      line.replace('{taskName}', taskName).replace('{tableName}', tableName)
    )
    .join('\n');

const runningLogLines = (startTime: string) => [
  `[${startTime}] INFO  Task started: {taskName}`,
  `[${startTime.replace(/:\d{2}$/, ':01')}] INFO  Connecting to source database...`,
  `[${startTime.replace(/:\d{2}$/, ':02')}] INFO  Source connection established`,
  `[${startTime.replace(/:\d{2}$/, ':03')}] INFO  Connecting to target database...`,
  `[${startTime.replace(/:\d{2}$/, ':04')}] INFO  Target connection established`,
  `[${startTime.replace(/:\d{2}$/, ':05')}] INFO  Reading source table: {tableName}`,
  `[${startTime.replace(/:\d{2}$/, ':10')}] INFO  Total records to sync: 1,256,890`,
  `[${startTime.replace(/:\d{2}$/, ':15')}] INFO  Sync progress: 45% (565,600 / 1,256,890)`,
  `[${startTime.replace(/:\d{2}$/, ':30')}] INFO  Sync in progress...`
];

const successLogLines = (startTime: string, endTime: string) => [
  `[${startTime}] INFO  Task started: {taskName}`,
  `[${startTime.replace(/:\d{2}$/, ':01')}] INFO  Connecting to source database...`,
  `[${startTime.replace(/:\d{2}$/, ':02')}] INFO  Source connection established`,
  `[${startTime.replace(/:\d{2}$/, ':03')}] INFO  Connecting to target database...`,
  `[${startTime.replace(/:\d{2}$/, ':04')}] INFO  Target connection established`,
  `[${startTime.replace(/:\d{2}$/, ':05')}] INFO  Reading source table: {tableName}`,
  `[${startTime.replace(/:\d{2}$/, ':10')}] INFO  Total records to sync: 856,320`,
  `[${endTime.replace(/:\d{2}$/, ':50')}] INFO  Data validation passed`,
  `[${endTime}] INFO  Task completed successfully`
];

const failedLogLines = (startTime: string, endTime: string) => [
  `[${startTime}] INFO  Task started: {taskName}`,
  `[${startTime.replace(/:\d{2}$/, ':01')}] INFO  Connecting to source database...`,
  `[${startTime.replace(/:\d{2}$/, ':02')}] INFO  Source connection established`,
  `[${startTime.replace(/:\d{2}$/, ':03')}] INFO  Connecting to target database...`,
  `[${endTime}] ERROR Target connection failed: Connection refused`,
  `[${endTime}] ERROR Task execution failed`
];

const createLogDetail = (
  record: ExecutionLogItem,
  taskId: string,
  tableName: string,
  errorMessage?: string
): ExecutionLogDetail => {
  const taskName = resolveTaskName(taskId);
  const detailLog =
    record.status === RunStatus.RUNNING
      ? buildDetailLog(taskName, tableName, runningLogLines(record.startTime))
      : record.status === RunStatus.SUCCESS
        ? buildDetailLog(
            taskName,
            tableName,
            successLogLines(
              record.startTime,
              record.endTime || record.startTime
            )
          )
        : buildDetailLog(
            taskName,
            tableName,
            failedLogLines(record.startTime, record.endTime || record.startTime)
          );

  return {
    ...record,
    detailLog,
    errorMessage
  };
};

export const mockExecutionLogs: Record<string, ExecutionLogItem[]> = {
  '1': [
    {
      id: '1-1',
      runId: 'RUN-A7B2C9',
      status: RunStatus.RUNNING,
      startTime: '2026-06-09 08:30:00',
      duration: '00:45:00',
      retryCount: 0,
      maxRetryCount: 0
    },
    {
      id: '1-2',
      runId: 'RUN-1K3L9M',
      status: RunStatus.SUCCESS,
      startTime: '2026-06-08 09:30:00',
      endTime: '2026-06-08 09:35:00',
      duration: '00:05:00',
      retryCount: 0,
      maxRetryCount: 0
    },
    {
      id: '1-3',
      runId: 'RUN-Z2P8Q4',
      status: RunStatus.FAILED,
      startTime: '2026-06-07 13:10:00',
      endTime: '2026-06-07 13:10:04',
      duration: '00:00:04',
      retryCount: 0,
      maxRetryCount: 0
    }
  ],
  '2': [
    {
      id: '2-1',
      runId: 'RUN-B8C3D1',
      status: RunStatus.SUCCESS,
      startTime: '2026-06-09 06:30:00',
      endTime: '2026-06-09 06:35:00',
      duration: '00:05:00',
      retryCount: 0,
      maxRetryCount: 0
    },
    {
      id: '2-2',
      runId: 'RUN-C9D4E2',
      status: RunStatus.SUCCESS,
      startTime: '2026-06-08 07:15:00',
      endTime: '2026-06-08 07:20:00',
      duration: '00:05:00',
      retryCount: 0,
      maxRetryCount: 0
    }
  ],
  '3': [
    {
      id: '3-1',
      runId: 'RUN-D1E5F3',
      status: RunStatus.FAILED,
      startTime: '2026-06-08 18:00:00',
      endTime: '2026-06-08 18:00:04',
      duration: '00:00:04',
      retryCount: 1,
      maxRetryCount: 3
    },
    {
      id: '3-2',
      runId: 'RUN-E2F6G4',
      status: RunStatus.SUCCESS,
      startTime: '2026-06-07 11:20:00',
      endTime: '2026-06-07 11:26:00',
      duration: '00:06:00',
      retryCount: 0,
      maxRetryCount: 0
    }
  ],
  '4': [
    {
      id: '4-1',
      runId: 'RUN-F3G7H5',
      status: RunStatus.SUCCESS,
      startTime: '2026-06-08 13:45:00',
      endTime: '2026-06-08 13:52:00',
      duration: '00:07:00',
      retryCount: 0,
      maxRetryCount: 0
    }
  ],
  '5': [
    {
      id: '5-1',
      runId: 'RUN-G4H8I6',
      status: RunStatus.RUNNING,
      startTime: '2026-06-08 09:00:00',
      duration: '01:30:00',
      retryCount: 0,
      maxRetryCount: 0
    }
  ],
  '6': [
    {
      id: '6-1',
      runId: 'RUN-H5I9J7',
      status: RunStatus.FAILED,
      startTime: '2026-06-07 16:30:00',
      endTime: '2026-06-07 16:30:05',
      duration: '00:00:05',
      retryCount: 2,
      maxRetryCount: 3
    }
  ],
  '7': [
    {
      id: '7-1',
      runId: 'RUN-I6J0K8',
      status: RunStatus.SUCCESS,
      startTime: '2026-06-07 10:00:00',
      endTime: '2026-06-07 10:08:00',
      duration: '00:08:00',
      retryCount: 0,
      maxRetryCount: 0
    }
  ]
};

const tableNames = [
  'vehicle',
  'asset_component',
  'failure_mode',
  'work_order',
  'maintenance_task',
  'part',
  'technician'
];

const mockLogDetails: Record<string, ExecutionLogDetail> = Object.fromEntries(
  Object.entries(mockExecutionLogs).flatMap(([taskId, logs]) =>
    logs.map((record) => {
      const tableName = tableNames[Number(taskId) - 1] || 'vehicle';
      return [
        record.id,
        createLogDetail(
          record,
          taskId,
          tableName,
          record.status === RunStatus.FAILED
            ? 'java.sql.SQLException: Connection refused - target database unavailable'
            : undefined
        )
      ] as const;
    })
  )
);

export const getMockLogsByTaskId = (taskId: string): ExecutionLogItem[] => {
  if (mockExecutionLogs[taskId]) {
    return mockExecutionLogs[taskId];
  }

  return mockExecutionLogs['1'].map((item) => ({
    ...item,
    id: `${taskId}-${item.runId}`
  }));
};

export const getMockLogDetail = (
  id: string,
  record?: ExecutionLogItem
): ExecutionLogDetail | null => {
  if (mockLogDetails[id]) {
    return mockLogDetails[id];
  }

  const baseRecord =
    record || getMockLogsByTaskId('1').find((item) => item.id === id);
  if (!baseRecord) {
    const fallback = mockLogDetails['1-2'];
    return {
      ...fallback,
      id,
      runId: id
    };
  }

  const taskId = id.split('-')[0] || '1';
  const tableName = tableNames[Number(taskId) - 1] || 'vehicle';
  return createLogDetail(
    baseRecord,
    taskId,
    tableName,
    baseRecord.status === RunStatus.FAILED
      ? 'java.sql.SQLException: Connection refused - target database unavailable'
      : undefined
  );
};
