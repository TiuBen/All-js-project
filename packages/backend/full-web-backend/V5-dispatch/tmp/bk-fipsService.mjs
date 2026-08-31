import { query } from "../db/pool.js";
import { airportName } from "../utils/airports.js";
async function getLatestDate() {
  const { rows } = await query("SELECT MAX(mapped_date) AS d FROM fips");
  return rows[0]?.d || null;
}
const ZHEC = "ZHEC";
function toFlight(r) {
  const isArrival = r.landing_station === ZHEC;
  const isDeparture = r.origin_station === ZHEC;
  const norm = (s) => s ? s.replace(" ", "T") : null;
  return {
    id: `fips-${r.id}`,
    flightNo: r.flight_no,
    origin: airportName(r.origin_station),
    destination: airportName(r.landing_station),
    departureTimeUtc: norm(r.atot),
    // 实际起飞时间（本地）
    landingTimeUtc: norm(r.aldt),
    // 实际落地时间（本地）
    flightDate: r.mapped_date,
    status: "\u5230\u8FBE",
    // 历史航班均为已完成
    aircraftType: r.aircraft_type,
    flightType: "\u5E38\u89C4\u822A\u73ED",
    category: "\u8D27\u8FD0\u822A\u73ED",
    // 已关联检查单：checklist_uuid 存 checklist_records.id（无则 false）
    hasChecklist: !!r.checklist_uuid,
    checklistId: r.checklist_uuid || null,
    /** 进港 / 离港（以鄂州 ZHEC 为基准） */
    direction: isArrival ? "\u8FDB\u6E2F" : isDeparture ? "\u79BB\u6E2F" : "\u4E2D\u8F6C",
    // 完整时间字段透传（SOBT/EOBT/ATOT/SIBT/ELDT/ALDT，本地时间）
    times: {
      inOut: norm(r.in_out_time),
      sobt: norm(r.sobt),
      eobt: norm(r.eobt),
      atot: norm(r.atot),
      sibt: norm(r.sibt),
      eldt: norm(r.eldt),
      aldt: norm(r.aldt)
    },
    // 原始字段透传（便于前端扩展展示）
    raw: {
      task: r.task,
      originStation: r.origin_station,
      destStation: r.dest_station,
      landingStation: r.landing_station,
      corridor: r.corridor,
      runway: r.runway,
      stand: r.stand,
      sourceFile: r.source_file
    }
  };
}
async function listFlights(filter = {}) {
  const { date, from, to } = filter;
  let rows = [];
  let usedDate = date || null;
  const queryByDate = async (d) => {
    const r = await query("SELECT * FROM fips WHERE mapped_date = $1 ORDER BY id", [d]);
    return r.rows;
  };
  if (date) {
    rows = await queryByDate(date);
    if (rows.length === 0) {
      const latest = await getLatestDate();
      if (latest) {
        usedDate = latest;
        rows = await queryByDate(latest);
      }
    }
  } else if (from || to) {
    let sql = "SELECT * FROM fips WHERE 1=1";
    const params = [];
    if (from) {
      params.push(from);
      sql += ` AND mapped_date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND mapped_date <= $${params.length}`;
    }
    sql += " ORDER BY mapped_date, id LIMIT 1000";
    const r = await query(sql, params);
    rows = r.rows;
    usedDate = rows.length ? null : await getLatestDate();
  } else {
    const latest = await getLatestDate();
    if (latest) {
      usedDate = latest;
      rows = await queryByDate(latest);
    }
  }
  return { date: usedDate, items: rows.map(toFlight) };
}
async function getById(id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;
  const { rows } = await query("SELECT * FROM fips WHERE id = $1", [num]);
  return rows.length ? rows[0] : null;
}
async function getFlightById(id) {
  const num = Number(String(id).replace(/^fips-/, ""));
  if (Number.isNaN(num)) return null;
  const { rows } = await query("SELECT * FROM fips WHERE id = $1", [num]);
  if (!rows.length) return null;
  return toFlight(rows[0]);
}
export {
  ZHEC,
  getById,
  getFlightById,
  getLatestDate,
  listFlights
};
