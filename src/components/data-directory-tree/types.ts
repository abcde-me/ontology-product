import { FluffyVolume, Db } from '@/api/dataCatalog';

// 数据卷类型定义
export interface VolumeData extends Omit<FluffyVolume, 'type'> {
  type?: 'volume';
  parentCatalog?: any;
}

// 数据库类型定义
export interface DatabaseData extends Omit<Db, 'type'> {
  type?: 'database';
  parentCatalog?: any;
}

// 文件类型定义
export interface FileData {
  id: number;
  name: string;
  size?: number;
  path?: string;
  type?: 'file';
  parentVolumeOrDb?: any;
}

// 目录类型定义
export interface CatalogData {
  id: number;
  name: string;
  base_dir?: string;
  children?: {
    volume?: VolumeData[];
    db?: DatabaseData[];
  };
  type?: 'catalog';
}
