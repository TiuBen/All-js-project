// src/store/dictStore.js - 字典缓存（表单选项 / 训练项目 / 评分项），全局只拉一次
import { create } from 'zustand';
import { dictApi } from '../api';

const useDictStore = create((set, get) => ({
  // ---------- state ----------
  formOptions: null, // { students, trainCategories, formNames, sectors, ... }
  trainingGroups: [], // [{ name, items: [{ id, name, positions }] }]
  scoreGroups: [], // [{ name, items: [{ id, name, score }] }]
  loaded: false,

  // ---------- actions ----------
  async loadDict() {
    if (get().loaded) return;
    const [formOptions, trainingGroups, scoreGroups] = await Promise.all([
      dictApi.formOptions(),
      dictApi.trainingGroups(),
      dictApi.scoreGroups(),
    ]);
    set({ formOptions, trainingGroups, scoreGroups, loaded: true });
  },
}));

export default useDictStore;
