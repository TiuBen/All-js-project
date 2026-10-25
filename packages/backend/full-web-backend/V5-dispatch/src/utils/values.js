/**
 * ============================================================
 * 值 / 键 的小工具（无业务语义）
 * ============================================================
 */

/**
 * 归一化文本：null / undefined 原样返回；空串、纯空白 → null；其余去掉首尾空白。
 * 非字符串（数字、对象、布尔）原样返回，避免把 JSON 字段搞坏。
 */
export function cleanText(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return value;
  const s = value.trim();
  return s === '' ? null : s;
}

/**
 * 请求体 → 可写字段（**没有白名单**，整份 body 都收，靠数据库约束兜底）：
 *   - 空串 / 纯空白 → null（可选列留空即清空）
 *   - 剔除 drop 里的键（默认主键 id，主键不参与写入）
 *   - **没传的键不会出现** → 天然是「局部更新」语义
 * @param {Object} body 请求体
 * @param {string[]} [drop] 要剔除的键，默认 ['id']
 */
export function cleanBody(body = {}, drop = ['id']) {
  const data = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (drop.includes(key)) continue;
    data[key] = cleanText(value);
  }
  return data;
}

/** camelCase → snake_case（flightNo → flight_no）；本来就是 snake 的原样返回 */
export const toSnake = (key) => String(key).replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/** snake_case → camelCase（flight_no → flightNo） */
export const toCamel = (key) => String(key).replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

/**
 * 从请求体里挑出「表里真实存在的列」，拼成 Prisma 的 data / patch：
 *   - 键名 camelCase、snake_case 都收（统一转成 snake）
 *   - 不在白名单里的键直接丢掉（前端多传无关字段不会炸 Prisma）
 *   - 空串归一成 null
 *   - **没传的键不会出现在返回值里** → 天然是「局部更新」语义
 * @param {Object} body 请求体
 * @param {string[]} columns 该表允许写入的列名（snake_case）
 */
export function pickColumns(body = {}, columns = []) {
  const allowed = new Set(columns);
  const patch = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    const column = toSnake(key);
    if (!allowed.has(column)) continue;
    patch[column] = cleanText(value);
  }
  return patch;
}

/** 路径参数里的整数主键：只认纯数字，其余返回 null */
export function toInt(value) {
  const s = String(value ?? '').trim();
  return /^\d+$/.test(s) ? Number(s) : null;
}

/** 是不是 uuid（三张航班表的主键都是 uuid） */
export const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value ?? '').trim());
