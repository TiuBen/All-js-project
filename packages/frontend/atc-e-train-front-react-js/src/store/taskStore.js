// src/store/taskStore.js - 任务/消息/反馈数据 + 角标统计
import { create } from 'zustand';
import { taskApi, messageApi } from '../api';

const useTaskStore = create((set, get) => ({
  // ---------- state ----------
  todos: [], // 待办任务
  done: [], // 已办任务
  messages: [], // 消息提醒
  feedbacks: [], // 反馈记录
  stats: { todo: 0, done: 0, message: 0, feedback: 0 },
  loading: false,

  // ---------- actions ----------
  // 拉取工作台全部数据（列表 + 角标），进页面 / 操作后刷新用
  async loadWorkbench() {
    set({ loading: true });
    try {
      const [todos, done, messages, feedbacks, stats] = await Promise.all([
        taskApi.list('todo'),
        taskApi.list('done'),
        messageApi.listMessages(),
        messageApi.listFeedbacks(),
        taskApi.stats(),
      ]);
      set({ todos, done, messages, feedbacks, stats, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  // 新建待办任务
  async createTask(data) {
    const task = await taskApi.create(data);
    await get().loadWorkbench();
    return task;
  },

  // 更新任务字段（详情页弹层选择后即时回写）
  async updateTask(id, patch) {
    const task = await taskApi.update(id, patch);
    await get().loadWorkbench();
    return task;
  },

  // 删除任务
  async deleteTask(id) {
    await taskApi.remove(id);
    await get().loadWorkbench();
  },

  // 提交评分：待办 -> 已办
  async submitScore(id, payload) {
    const task = await taskApi.submitScore(id, payload);
    await get().loadWorkbench();
    return task;
  },
}));

export default useTaskStore;
