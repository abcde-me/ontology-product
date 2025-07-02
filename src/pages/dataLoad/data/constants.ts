// 每周的数据

import { getConnectionList } from '@/api/connectionApi';
import { getDirectoryList } from '@/api/loadApi';
import { Children } from 'react';

// export  const Weekly_Options=['周一', '周二', '周三', '周四', '周五', '周六','周日']
export const Weekly_Options = [
  { key: 1, label: '周一' },
  { key: 2, label: '周二' },
  { key: 3, label: '周三' },
  { key: 4, label: '周四' },
  { key: 5, label: '周五' },
  { key: 6, label: '周六' },
  { key: 0, label: '周日' }
];
// 每月的数据
export const Monthly_Options = [
  { key: 1, label: '1号' },
  { key: 2, label: '2号' },
  { key: 3, label: '3号' },
  { key: 4, label: '4号' },
  { key: 5, label: '5号' },
  { key: 6, label: '6号' },
  { key: 7, label: '7号' },
  { key: 8, label: '8号' },
  { key: 9, label: '9号' },
  { key: 10, label: '10号' },
  { key: 11, label: '11号' },
  { key: 12, label: '12号' },
  { key: 13, label: '13号' },
  { key: 14, label: '14号' },
  { key: 15, label: '15号' },
  { key: 16, label: '16号' },
  { key: 17, label: '17号' },
  { key: 18, label: '18号' },
  { key: 19, label: '19号' },
  { key: 20, label: '20号' },
  { key: 21, label: '21号' },
  { key: 22, label: '22号' },
  { key: 23, label: '23号' },
  { key: 24, label: '24号' },
  { key: 25, label: '25号' },
  { key: 26, label: '26号' },
  { key: 27, label: '27号' },
  { key: 28, label: '28号' },
  { key: 29, label: '29号' },
  { key: 30, label: '30号' },
  { key: 31, label: '31号' }
];
// 连接器数据
export let Connection_Options = [];
async function request() {
  const res = await getConnectionList({
    page: 1,
    page_size: 1000
  });
  Connection_Options = res.data.items.map((item) => {
    return {
      key: item.connector_id,
      label: item.connector_id_name
    };
  });
}
request();
export let directoryData = [];
async function fn() {
  try {
    const res = await getDirectoryList({
      root_type: 1
    });
    console.log(res.data.src);

    directoryData = res.data.src.map((item) => {
      return item.children
        ? {
            value: item.id,
            label: item.name,
            children: item.children.volume.map((items) => {
              return {
                value: items.id,
                label: items.name
              };
            })
          }
        : { value: item.id, label: item.name };
    });
    console.log(directoryData);
  } catch (err) {
    console.error(err);
  }
}
fn();
