const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5183/api'

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

export default API_BASE
