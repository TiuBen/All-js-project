import { query } from "../db/pool.js";
import { flightRowToApi } from "../utils/mapper.js";
import { localDateStr } from "../utils/time.js";
import * as fipsService from "./fipsService.js";
import * as manualFipsService from "./manualFipsService.js";
async function listFlights(filter = {}) {
  return fipsService.listFlights(filter);
}
async function getFlight(id) {
  if (String(id).startsWith("fips-")) {
    return fipsService.getFlightById(id);
  }
  if (String(id).startsWith("manual-")) {
    return getManualFlight(id);
  }
  const { rows } = await query("SELECT * FROM flights WHERE id = $1", [id]);
  return rows.length ? flightRowToApi(rows[0]) : null;
}
async function getManualFlight(id) {
  const row = await manualFipsService.getManualFipsById(String(id).replace(/^manual-/, ""));
  if (!row) return null;
  const landing = row.aldt || row.landing_time || null;
  const landingDate = landing ? String(landing).slice(0, 10) : localDateStr();
  return {
    id,
    flightNo: row.flight_no,
    aircraftType: row.aircraft_type || "",
    // 航班类别：优先取手动航班的 checklist_category（货运/客运，决定检查单模板）；缺省按货运处理
    category: row.checklist_category || "\u8D27\u8FD0\u822A\u73ED",
    flightType: "\u5E38\u89C4\u822A\u73ED",
    origin: "\u2014",
    destination: "\u9102\u5DDE",
    flightDate: landingDate,
    landingTimeUtc: landing,
    status: "\u8BA1\u5212",
    // 已关联检查单：checklist_uuid 存 checklist_records.id（无则 false）
    hasChecklist: !!row.checklist_uuid,
    checklistId: row.checklist_uuid || null,
    // 原始字段透传
    raw: {
      task: row.task,
      originStation: row.origin_station,
      destStation: row.dest_station,
      landingStation: row.landing_station,
      sobt: row.sobt,
      eobt: row.eobt,
      atot: row.atot,
      sibt: row.sibt,
      eldt: row.eldt,
      aldt: row.aldt,
      corridor: row.corridor,
      runway: row.runway,
      stand: row.stand,
      source: "manual-fips"
    }
  };
}
async function createFlight(data) {
  const id = data.id || `FL${Date.now()}`;
  const { rows } = await query(
    `INSERT INTO flights
      (id, flight_no, origin, destination, departure_time_utc, landing_time_utc,
       flight_date, status, aircraft_type, flight_type, category, has_checklist)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      id,
      data.flightNo || "",
      data.origin || "",
      data.destination || "",
      data.departureTimeUtc || null,
      data.landingTimeUtc || null,
      data.flightDate || localDateStr(),
      data.status || "\u8BA1\u5212",
      data.aircraftType || "",
      data.flightType || "\u5E38\u89C4\u822A\u73ED",
      data.category || "\u8D27\u8FD0\u822A\u73ED",
      data.hasChecklist || false
    ]
  );
  return flightRowToApi(rows[0]);
}
async function updateFlight(id, data) {
  const { rows } = await query(
    `UPDATE flights SET
       flight_no = COALESCE($1, flight_no),
       origin = COALESCE($2, origin),
       destination = COALESCE($3, destination),
       departure_time_utc = COALESCE($4, departure_time_utc),
       landing_time_utc = COALESCE($5, landing_time_utc),
       flight_date = COALESCE($6, flight_date),
       status = COALESCE($7, status),
       aircraft_type = COALESCE($8, aircraft_type),
       flight_type = COALESCE($9, flight_type),
       category = COALESCE($10, category),
       has_checklist = COALESCE($11, has_checklist)
     WHERE id = $12
     RETURNING *`,
    [
      data.flightNo ?? null,
      data.origin ?? null,
      data.destination ?? null,
      data.departureTimeUtc ?? null,
      data.landingTimeUtc ?? null,
      data.flightDate ?? null,
      data.status ?? null,
      data.aircraftType ?? null,
      data.flightType ?? null,
      data.category ?? null,
      data.hasChecklist ?? null,
      id
    ]
  );
  return rows.length ? flightRowToApi(rows[0]) : null;
}
async function deleteFlight(id) {
  const { rowCount } = await query("DELETE FROM flights WHERE id = $1", [id]);
  return rowCount > 0;
}
export {
  createFlight,
  deleteFlight,
  getFlight,
  listFlights,
  updateFlight
};
