// API 地址：开发环境用相对路径 /api（vite proxy 转发到 localhost:5183）；
// 生产构建时通过环境变量指定，避免把 localhost 写死进编译产物。
// 部署命令示例：VITE_API_BASE=/api npm run build   （配合 nginx /api 反代）
// 或：VITE_API_BASE=https://dd.atc1215.cn/api npm run build
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const flightsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v)
    })
    return request(`/flights?${qs.toString()}`)
  },
  get: (id) => request(`/flights/${id}`),
  create: (data) => request('/flights', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/flights/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

export const checklistsApi = {
  listTemplates: () => request('/checklists/templates'),
  getTemplate: (id) => request(`/checklists/templates/${id}`),
  listRecords: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v)
    })
    return request(`/checklists/records?${qs.toString()}`)
  },
  getRecord: (id) => request(`/checklists/records/${id}`),
  createRecord: (data) => request('/checklists/records', { method: 'POST', body: JSON.stringify(data) }),
  updateRecord: (id, data) => request(`/checklists/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// fips 原始数据详情（双击航班号打开 Dialog 用）
export const fipsApi = {
  getById: (id) => request(`/fips/${id}`),
}

// 手动添加航班（manual-fips 表）
export const manualFipsApi = {
  list: () => request('/manual-fips'),
  create: (data) => request('/manual-fips', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/manual-fips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/manual-fips/${id}`, { method: 'DELETE' }),
}

// 生鲜货物航班标记（fresh_air_cargo 表）
export const freshAirCargoApi = {
  list: () => request('/fresh-air-cargo'),
  mark: (manualFipsId, content = {}) =>
    request('/fresh-air-cargo/mark', { method: 'POST', body: JSON.stringify({ manualFipsId, content }) }),
  unmark: (manualFipsId) => request(`/fresh-air-cargo/mark/${manualFipsId}`, { method: 'DELETE' }),
}

export default API_BASE
