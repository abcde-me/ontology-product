export const LogData = {
  requestId: 'string',
  statusCode: 0,
  code: 'string',
  message: 'string',
  data: {
    node_count: 10, // 总节点数量
    node_success_count: 2, // 成功节点数量
    cost_time: 10000000, // 总处理时间，返回的是毫秒，需要转成分钟
    nodes: [
      {
        node_index: 0,
        node_type: '开始', // 节点名称
        status: 1, // 1:成功 2:失败
        start_time: 1765469532, // 开始时间，需要转成 2025-12-12:12:12 这种格式
        end_time: 0,
        cost_time: 10000, // 处理时长, 返回的毫秒，需要转成秒
        node_input: '', // json格式的 字符串
        node_output: '', //   // json格式的 字符串
        msg: 'string'
      },
      {
        node_index: 1,
        node_type: '文档解析', // 节点名称
        status: 1, // 1:成功 2:失败
        start_time: 1765469532, // 开始时间，需要转成 2025-12-12:12:12 这种格式
        end_time: 0,
        cost_time: 10000, // 处理时长, 返回的毫秒，需要转成秒
        node_input: '', // json格式的 字符串
        node_output: '', //   // json格式的 字符串
        msg: 'string'
      },
      {
        node_index: 2,
        node_type: '增强', // 节点名称
        status: 2, // 1:成功 2:失败
        start_time: 1765469532, // 开始时间，需要转成 2025-12-12:12:12 这种格式
        end_time: 0,
        cost_time: 10000, // 处理时长, 返回的毫秒，需要转成秒
        node_input: '', // json格式的 字符串
        node_output: '', //   // json格式的 字符串
        msg: 'string'
      }
    ]
  }
};
