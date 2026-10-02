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
  // REST 语义别名（后端 PATCH 路由与 PUT 同一控制器），局部更新用这个更贴切
  patchRecord: (id, data) => request(`/checklists/records/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRecord: (id) => request(`/checklists/records/${id}`, { method: 'DELETE' }),
  /**
   * 上传检查项截图：请求体就是图片**原始二进制**（不走 Base64、不用 FormData）
   * @param {Blob} blob 图片二进制（粘贴/选中的截图）
   * @param {string} [name] 原始文件名（仅用于展示与类型兜底）
   * @returns {Promise<{url:string,name:string,type:string,size:number}>}
   */
  uploadImage: async (blob, name = '') => {
    const qs = name ? `?name=${encodeURIComponent(name)}` : ''
    const res = await fetch(`${API_BASE}/checklists/uploads${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': blob.type || 'image/png' },
      body: blob,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `上传失败 HTTP ${res.status}`)
    }
    return res.json()
  },
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
// ★ 业务键是 (sourceTable, sourceId)：sourceTable 是来源表名（默认 manual_fips），
//   sourceId 是**来源表里的行 UUID**（manual_fips 用 row.uuid，不是自增 id）。
export const freshAirCargoApi = {
  list: () => request('/fresh-air-cargo'),
  mark: (sourceId, content = {}, sourceTable = 'manual_fips') =>
    request('/fresh-air-cargo/mark', {
      method: 'POST',
      body: JSON.stringify({ sourceId, sourceTable, content }),
    }),
  unmark: (sourceId, sourceTable = 'manual_fips') =>
    request(`/fresh-air-cargo/mark/${sourceId}?sourceTable=${encodeURIComponent(sourceTable)}`, {
      method: 'DELETE',
    }),
}

// 航班计划（ecyilang 表 —— 接口抓包快照）
// listFlightPlans：后端已把每组的 d_/a_ 两侧拆成「离港 + 进港」两条，
// 返回结构与 manualFipsApi.list() 一致（{ total, items }），页面可直接换源。
export const ecyilangApi = {
  listFlights: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v)
    })
    const q = qs.toString()
    return request(`/ecyilang/flights${q ? `?${q}` : ''}`)
  },
  getFlight: (id) => request(`/ecyilang/flights/${id}`),
  // 原始行（一行 = 一组成对航班 d_/a_）
  listRows: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v)
    })
    const q = qs.toString()
    return request(`/ecyilang${q ? `?${q}` : ''}`)
  },
  fields: () => request('/ecyilang/fields'),
  create: (data) => request('/ecyilang', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/ecyilang/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/ecyilang/${id}`, { method: 'DELETE' }),
}

// 生鲜航班保障节点台账（special 表 —— 由 9 月人工台账 Excel 导入 + 页面回写）
// 业务自然键 = (callsign, belongTime)，所以「保存」统一走 upsert，不会写出重复行。
// ⚠️ 列名是驼峰，后端返回的 JSON 键也是驼峰（belongTime / nodesTime / createTime / updateTime）。
export const specialApi = {
  /** 台账列表：?date= 精确 / ?from=~?to= 范围 / ?callsign= 模糊 */
  list: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v)
    })
    const q = qs.toString()
    return request(`/special${q ? `?${q}` : ''}`)
  },
  /** 按业务键取一条（航班号 + 归属日期） */
  getByKey: (callsign, belongTime) =>
    request(`/special/key/${encodeURIComponent(callsign)}/${belongTime}`),
  get: (id) => request(`/special/${id}`),
  /** 每日条数（日历徽标用） */
  dates: () => request('/special/dates'),
  /** 字段字典 */
  fields: () => request('/special/fields'),
  create: (data) => request('/special', { method: 'POST', body: JSON.stringify(data) }),
  /** 按 (callsign, belongTime) 新增或覆盖 nodesTime —— 页面保存到台账用这个 */
  upsert: (data) => request('/special/upsert', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/special/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/special/${id}`, { method: 'DELETE' }),
}

export default API_BASE
