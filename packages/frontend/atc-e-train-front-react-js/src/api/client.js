// src/api/client.js - axios 实例：统一 baseURL 与响应解包
import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 后端统一返回 { success, data, message }，拦截器直接把 data 剥出来
client.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.message || '请求失败'));
      }
      return body.data;
    }
    return body;
  },
  (err) => {
    const msg = err.response?.data?.message || err.message || '网络错误';
    return Promise.reject(new Error(msg));
  }
);

export default client;
