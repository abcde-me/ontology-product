import { getAppList } from '@/api/app';
import { types, flow } from 'mobx-state-tree';

const AppList = types
  .model({
    list: types.array(types.frozen()),
    loading: false
  })
  .actions((self) => {
    return {
      getList: flow(function* () {
        if (self.loading) return;
        self.loading = true;
        try {
          const res = yield getAppList();
          self.list = res.data;
        } catch (err) {
        } finally {
          self.loading = false;
        }
      }),
      setLoading(loading: boolean) {
        self.loading = loading;
      }
    };
  });

const appListStore = AppList.create({
  list: [],
  loading: false
});

export default appListStore;
