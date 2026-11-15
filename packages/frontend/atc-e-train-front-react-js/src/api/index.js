// src/api/index.js - 接口清单：字段名与数据库列名（snake_case）原样进出
import client from './client';

// ---------- 任务 ----------
export const taskApi = {
  // 任务列表：status = 'todo' | 'done' | undefined(全部)
  list: (status, keyword) =>
    client.get('/tasks', { params: { status, keyword } }),

  detail: (id) => client.get(`/tasks/${id}`),

  create: (data) => client.post('/tasks', data),

  update: (id, patch) => client.put(`/tasks/${id}`, patch),

  remove: (id) => client.delete(`/tasks/${id}`),

  // 提交评分：{ counts: [{name, count}], overall, attachments }
  submitScore: (id, payload) => client.post(`/tasks/${id}/score`, payload),

  stats: () => client.get('/tasks/stats'),
};

// ---------- 消息 / 反馈 ----------
export const messageApi = {
  listMessages: () => client.get('/messages'),
  listFeedbacks: () => client.get('/messages/feedbacks'),
  addFeedback: (data) => client.post('/messages/feedbacks', data),
};

// ---------- 字典 ----------
export const dictApi = {
  formOptions: () => client.get('/dict/form-options'),
  trainingGroups: () => client.get('/dict/training-groups'),
  scoreGroups: () => client.get('/dict/score-groups'),
};
