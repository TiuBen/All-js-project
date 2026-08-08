/**
 * ============================================================
 * 检查单记录 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 封装 checklist_records 表的全部数据访问：
 *   listRecords / getRecord / createRecord / updateRecord
 * ============================================================
 */
import { query } from '../db/pool.js';

/**
 * 查询检查单填写记录
 * @param {Object} filter 过滤条件
 * @param {string} [filter.flightId]  按航班过滤
 * @param {string} [filter.templateId] 按模板过滤
 * @param {string} [filter.date]      精确日期（按航班日期 flight_date）
 * @param {string} [filter.from]      范围起始日期
 * @param {string} [filter.to]        范围结束日期
 * @returns {Promise<Array>} 记录数组
 */
export async function listRecords(filter = {}) {
  const { flightId, templateId, date, from, to } = filter;
  let sql = 'SELECT * FROM checklist_records WHERE 1=1';
  const params = [];

  if (flightId) {
    params.push(flightId);
    sql += ` AND flight_id = $${params.length}`;
  }
  if (templateId) {
    params.push(templateId);
    sql += ` AND checklist_template_id = $${params.length}`;
  }
  // 按航班日期过滤（精确日期优先，否则范围）
  if (date) {
    params.push(date);
    sql += ` AND flight_date = $${params.length}`;
  } else {
    if (from) {
      params.push(from);
      sql += ` AND flight_date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND flight_date <= $${params.length}`;
    }
  }

  sql += ' ORDER BY COALESCE(checked_at, created_at) DESC LIMIT 500';
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * 查询单个填写记录
 * @param {string|number} id 记录主键
 * @returns {Promise<Object|null>} 记录；不存在返回 null
 */
export async function getRecord(id) {
  const { rows } = await query('SELECT * FROM checklist_records WHERE id = $1', [id]);
  return rows.length ? rows[0] : null;
}

/**
 * 创建填写记录
 * @param {Object} data 记录数据
 * @returns {Promise<Object>} 创建的记录
 */
export async function createRecord(data) {
  const { rows } = await query(
    `INSERT INTO checklist_records
      (flight_id, flight_no, aircraft_type, flight_type, checklist_category,
       checklist_template_id, checklist_title, flight_date, header, items, video_supervision,
       inspector, status, checked_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      data.flightId,
      data.flightNo || null,
      data.aircraftType || null,
      data.flightType || null,
      data.checklistCategory || null,
      data.checklistTemplateId,
      data.checklistTitle || null,
      data.flightDate || null,
      data.header ? JSON.stringify(data.header) : null,
      data.items ? JSON.stringify(data.items) : null,
      data.videoSupervision ? JSON.stringify(data.videoSupervision) : null,
      data.inspector || null,
      data.status || 'draft',
      data.checkedAt || new Date().toISOString(),
    ],
  );
  return rows[0];
}

/**
 * 更新填写记录（只更新传入的字段）
 * @param {string|number} id 记录主键
 * @param {Object} data 要更新的字段
 * @returns {Promise<Object|null>} 更新后的记录；不存在返回 null
 */
export async function updateRecord(id, data) {
  const { rows } = await query(
    `UPDATE checklist_records
       SET header = COALESCE($1, header),
           items = COALESCE($2, items),
           video_supervision = COALESCE($3, video_supervision),
           inspector = COALESCE($4, inspector),
           status = COALESCE($5, status),
           checked_at = COALESCE($6, checked_at),
           updated_at = now()
     WHERE id = $7
     RETURNING *`,
    [
      data.header ? JSON.stringify(data.header) : null,
      data.items ? JSON.stringify(data.items) : null,
      data.videoSupervision ? JSON.stringify(data.videoSupervision) : null,
      data.inspector || null,
      data.status || null,
      data.checkedAt ? new Date(data.checkedAt).toISOString() : null,
      id,
    ],
  );
  return rows.length ? rows[0] : null;
}
