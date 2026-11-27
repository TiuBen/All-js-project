// src/store/userStore.js - 用户数据（PG e_train 库）+ CRUD
import { create } from 'zustand';
import { userApi } from '../api';

const useUserStore = create((set, get) => ({
  // ---------- state ----------
  users: [], // 用户列表
  loading: false,

  // ---------- actions ----------
  // 拉取用户列表；keyword 模糊搜索，isInstructor 过滤教员（true/false/undefined 全部）
  async loadUsers(keyword, isInstructor) {
    set({ loading: true });
    try {
      const users = await userApi.list(keyword, isInstructor);
      set({ users, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  // 新建用户，成功后刷新列表
  async createUser(data) {
    const user = await userApi.create(data);
    await get().loadUsers();
    return user;
  },

  // 更新用户（patch 部分字段），成功后刷新列表
  async updateUser(id, patch) {
    const user = await userApi.update(id, patch);
    await get().loadUsers();
    return user;
  },

  // 删除用户，成功后刷新列表
  async deleteUser(id) {
    await userApi.remove(id);
    await get().loadUsers();
  },
}));

export default useUserStore;
