import { CatalogTreeStore } from '../../store/CatalogTreeStore';

export class DataCatalog {
  catalogTreeStore: CatalogTreeStore;
  constructor() {
    this.catalogTreeStore = new CatalogTreeStore(this); // 数据目录 Tree
  }
}
