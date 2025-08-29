export const subLeafKeys: { [prop: string]: string } = {
  volume: '数据卷',
  db: '数据库'
};

export const tabKeys = [
  { key: 'src', title: '源数据' },
  { key: 'dst', title: '目标数据' }
];

export enum CatalogTypeEnum {
  catalog = 1,
  volume = 2,
  db = 3,
  table
}

export enum RootTypeEnum {
  src = 1,
  dst = 2
}
