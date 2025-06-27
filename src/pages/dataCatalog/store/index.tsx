import { create } from 'zustand';

const useStore = create((set) => ({
  selectedPath: null,
  setSelectedPath: (path) => set({ selectedPath: path }),
}));

export default useStore;