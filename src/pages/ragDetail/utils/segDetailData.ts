export const SegDetailData = {
  requestId: '98',
  statusCode: 24,
  code: '100',
  message: 'minim Excepteur irure dolore dolore',
  data: {
    id: 'file_001_chunk_001', // 分段编号
    char_count: 100, // 分段大小
    parent_id: 'file_001_chunk_001', // 父分片ID
    left_chunk_id: 'file_001_chunk_001', // 左邻分片ID
    right_chunk_id: 'file_001_chunk_001', // 右邻分片ID
    materials: [
      {
        id: '1',
        type: 'text', // "text","title","table","image","formula"
        text: '按照本次发行前的股份数计算，对于截止本次发行前本行已经审计的最近一个审计基准日的滚存未分配利润，由本次发行前的本行老股东享有其中的 35%，其余部分由老股东和新股东共享；对于基准日之后实现的可分配利润，则全部由老股东和新股东共享。截至 2006 年 12 月 31 日，按滚存未分配利润计算的应由老', // 文本内容
        positions: [
          {
            bbox: [1, 2, 3, 4],
            text_offset: {
              start: 2450,
              end: 2460
            },
            xpath: '/document/section[2]/p[1]',
            block_index: 5,
            page_id: 1
          }
        ],
        uri: 's3://aimpd-test/01/1.jpg'
      }
    ],
    ai_data: {
      summary: 'exercitation sunt consectetur ex aute',
      querys: 'in consectetur laboris culpa laborum'
    }
  }
};
