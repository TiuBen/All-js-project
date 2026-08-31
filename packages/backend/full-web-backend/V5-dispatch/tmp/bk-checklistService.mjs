import { query } from "../db/pool.js";
const EDIT_LOCK_HOURS = 24;
function assertEditable(record) {
  if (record?.status !== "submitted") return;
  const ts = record.checked_at ? new Date(record.checked_at).getTime() : 0;
  if (ts && Date.now() - ts > EDIT_LOCK_HOURS * 3600 * 1e3) {
    const err = new Error(`\u8BE5\u68C0\u67E5\u5355\u5DF2\u63D0\u4EA4\u8D85\u8FC7 ${EDIT_LOCK_HOURS} \u5C0F\u65F6\uFF0C\u4E0D\u53EF\u518D\u4FEE\u6539`);
    err.status = 409;
    throw err;
  }
}
async function syncChecklistUuid(flightId, recordId) {
  if (!flightId || !recordId) return;
  const fipsMatch = String(flightId).match(/^fips-(\d+)$/);
  if (fipsMatch) {
    await query("UPDATE fips SET checklist_uuid = $1 WHERE id = $2", [
      String(recordId),
      Number(fipsMatch[1])
    ]);
    return;
  }
  const manualMatch = String(flightId).match(/^manual-(\d+)$/);
  if (manualMatch) {
    await query("UPDATE manual_fips SET checklist_uuid = $1 WHERE id = $2", [
      String(recordId),
      Number(manualMatch[1])
    ]);
  }
}
async function listRecords(filter = {}) {
  const { flightId, category, date, from, to } = filter;
  let sql = "SELECT * FROM checklist_records WHERE 1=1";
  const params = [];
  if (flightId) {
    params.push(flightId);
    sql += ` AND flight_id = $${params.length}`;
  }
  if (category) {
    params.push(category);
    sql += ` AND checklist_category = $${params.length}`;
  }
  if (date) {
    params.push(date);
    sql += ` AND (COALESCE(checked_at, created_at) AT TIME ZONE 'UTC' + interval '8 hours')::date = $${params.length}`;
  } else {
    if (from) {
      params.push(from);
      sql += ` AND (COALESCE(checked_at, created_at) AT TIME ZONE 'UTC' + interval '8 hours')::date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND (COALESCE(checked_at, created_at) AT TIME ZONE 'UTC' + interval '8 hours')::date <= $${params.length}`;
    }
  }
  sql += " ORDER BY COALESCE(checked_at, created_at) DESC LIMIT 500";
  const { rows } = await query(sql, params);
  return rows;
}
async function getRecord(id) {
  const { rows } = await query("SELECT * FROM checklist_records WHERE id = $1", [id]);
  return rows.length ? rows[0] : null;
}
async function findRecordByFlightId(flightId) {
  if (!flightId) return null;
  const { rows } = await query("SELECT * FROM checklist_records WHERE flight_id = $1 LIMIT 1", [
    flightId
  ]);
  return rows[0] || null;
}
async function createRecord(data) {
  if (!data.flightId) {
    const err = new Error("flightId is required");
    err.status = 400;
    throw err;
  }
  const existing = await findRecordByFlightId(data.flightId);
  if (existing) {
    assertEditable(existing);
    const updated = await updateRecord(existing.id, data);
    return updated;
  }
  const { rows } = await query(
    `INSERT INTO checklist_records
      (flight_id, flight_no, aircraft_type, checklist_category, flight_date,
       header, items, video_supervision, inspector, status, checked_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      data.flightId,
      data.flightNo || null,
      data.aircraftType || null,
      data.checklistCategory || null,
      data.flightDate || null,
      data.header ? JSON.stringify(data.header) : null,
      data.items ? JSON.stringify(data.items) : null,
      data.videoSupervision ? JSON.stringify(data.videoSupervision) : null,
      data.inspector || null,
      data.status || "draft",
      data.checkedAt || (/* @__PURE__ */ new Date()).toISOString()
    ]
  );
  await syncChecklistUuid(data.flightId, rows[0].id);
  return rows[0];
}
async function updateRecord(id, data) {
  const current = await getRecord(id);
  if (!current) return null;
  assertEditable(current);
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
      id
    ]
  );
  if (rows.length) {
    await syncChecklistUuid(rows[0].flight_id, rows[0].id);
  }
  return rows.length ? rows[0] : null;
}
async function deleteRecord(id) {
  const { rows } = await query("DELETE FROM checklist_records WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
export {
  EDIT_LOCK_HOURS,
  createRecord,
  deleteRecord,
  findRecordByFlightId,
  getRecord,
  listRecords,
  updateRecord
};
