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

// ---------- 用户（PG e_train 库）----------
export const userApi = {
  // 用户列表：keyword 模糊匹配姓名/电话/邮箱，is_instructor 过滤教员
  list: (keyword, isInstructor) =>
    client.get('/users', { params: { keyword, is_instructor: isInstructor } }),

  detail: (id) => client.get(`/users/${id}`),

  // { name, gender, phone, email, profile, is_instructor }
  create: (data) => client.post('/users', data),

  // patch 为部分字段，后端动态 UPDATE
  update: (id, patch) => client.put(`/users/${id}`, patch),

  remove: (id) => client.delete(`/users/${id}`),
};

// ---------- 理论题库目录树（执照题库/地方题库 → 部分 → 大类）----------
export const theoryCategoryApi = {
  // 整棵目录树：[{ id, name, parent_id, sort_order, children: [...] }]
  list: () => client.get('/theory-categories'),

  create: (data) => client.post('/theory-categories', data),

  update: (id, patch) => client.put(`/theory-categories/${id}`, patch),

  // 有子目录或已挂题目时后端会拒绝并返回 message
  remove: (id) => client.delete(`/theory-categories/${id}`),
};

// ---------- 理论题库题目（导入的执照题库，只读）----------
export const theoryDbApi = {
  // 分页查询：{ page, page_size, category_id, type, keyword }
  // category_id 含全部后代目录；返回 { list, total, page, page_size }
  list: (params) => client.get('/theory-dbs', { params }),

  detail: (id) => client.get(`/theory-dbs/${id}`),
};

// ---------- 模拟机培训目录树（2025 年/2026 年 → 1 月-12 月，固定骨架只读）----------
export const simulatorCategoryApi = {
  // 整棵目录树：[{ id, name, parent_id, tree_type, sort_order, children: [...] }]
  // tree_type：YEAR = 年份/月份固定骨架（只读），CUSTOM = 自建节点（可编辑）
  list: () => client.get('/simulator-categories'),

  // 新建自建节点：{ name, parent_id }（parent 不能是年份顶层；tree_type 后端强制 CUSTOM）
  create: (data) => client.post('/simulator-categories', data),

  // 重命名 / 排序：{ name?, sort_order? }（YEAR 骨架节点会被后端拒绝）
  update: (id, patch) => client.put(`/simulator-categories/${id}`, patch),

  // 递归复制子树，副本插到原节点后面
  copy: (id) => client.post(`/simulator-categories/${id}/copy`),

  // 删除（有子目录时后端拒绝）
  remove: (id) => client.delete(`/simulator-categories/${id}`),
};
