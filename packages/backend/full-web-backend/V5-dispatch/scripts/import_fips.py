# -*- coding: utf-8 -*-
"""
历史航班原始数据 → PG `fips` 表（v3 简化版）
======================================================
规则（按用户明确要求）：
  1. 文件名为年月日（20240401 → 2024-04-01），作为日期基准
  2. 时间字段 "02 23:50"：前两位 day 是日号
     - day 与文件日不同（如文件 20240401 的 day=31）→ 往前算（上月 day 日）
     - day ≤ 文件日（如文件 20240402 的 day=01）→ 当月 day 日
  3. 时间映射：2024年X月 → 2026年(X+3)月（日期时刻不变，仅月/年平移）
  4. 保存为 YYYY-MM-DD HH:mm:ss（本地时间，不转 UTC）

字段继承：ATOT 单段 → 日期取 EOBT；ALDT 单段 → 日期取 ELDT；in_out_time → 同 ALDT
"""
import os, re, glob
import calendar
from datetime import datetime
import pg8000

DB = dict(host="127.0.0.1", port=5432, user="postgres", password="admin", database="flight_dispatch")
ROOT = r"C:\Users\HJW-AMD-PRP\Documents\GitHub\All-js-project"
DATA_DIR = os.path.join(ROOT, "packages", "frontend", "flight-dispatch-system", "资料", "历史航班")


def resolve_local(src_y, src_m, src_d, day_str, time_str):
    """'02 23:50' → 本地 datetime。
    规则（day 为日号，文件名=年月日基准）：
      - day > 文件日（如文件 20240401 的 day=31）→ 往前算：上月 day 日
      - day ≤ 文件日（如文件 20240402 的 day=01，即当天/前一天）→ 当月 day 日
    """
    day = int(day_str)
    hh, mm = map(int, time_str.split(":"))
    if day > src_d:
        # 往前算：上月 day 日（钳制到上月末）
        py, pm = (src_y - 1, 12) if src_m == 1 else (src_y, src_m - 1)
        pl = calendar.monthrange(py, pm)[1]
        return datetime(py, pm, min(day, pl), hh, mm)
    return datetime(src_y, src_m, day, hh, mm)


def map_to_str(dt):
    """本地时间 → 年月映射(年+2、月+3，钳制月末) → 'YYYY-MM-DD HH:mm:ss'"""
    if dt is None:
        return None
    total = dt.year * 12 + (dt.month - 1) + 2 * 12 + 3
    ny, nm = divmod(total, 12)
    nm += 1
    last = calendar.monthrange(ny, nm)[1]
    nd = min(dt.day, last)
    return f"{ny:04d}-{nm:02d}-{nd:02d} {dt.hour:02d}:{dt.minute:02d}:00"


def map_date_str(src_y, src_m, src_d):
    """源日期 → 映射后日期字符串 YYYY-MM-DD"""
    total = src_y * 12 + (src_m - 1) + 2 * 12 + 3
    ny, nm = divmod(total, 12)
    nm += 1
    last = calendar.monthrange(ny, nm)[1]
    return f"{ny:04d}-{nm:02d}-{min(src_d, last):02d}"


def parse_timestr(parts, idx, sy, sm, sd, base_day):
    """解析时间列：返回本地 datetime 或 None。
    base_day 供单段 ATOT/ALDT 继承日期（EOBT/ELDT 的 day）。
    """
    raw = parts[idx].strip() if idx < len(parts) else ""
    if not raw:
        return None
    sp = raw.split()
    if len(sp) >= 2:
        # 双段 "02 23:50"
        return resolve_local(sy, sm, sd, sp[0], sp[1])
    # 单段 "20:48" → 日期继承 base_day
    if base_day is None or not re.match(r"^\d{1,2}:\d{2}$", raw):
        return None
    hh, mm = map(int, raw.split(":"))
    # 用 base_day（EOBT/ELDT 的 day）按相同规则解析
    return resolve_local(sy, sm, sd, str(base_day), f"{hh:02d}:{mm:02d}")


def main():
    conn = pg8000.connect(**DB)
    cur = conn.cursor()

    # 重建表：时间列改为 VARCHAR，存 YYYY-MM-DD HH:mm:ss（本地时间）
    cur.execute("DROP TABLE IF EXISTS fips")
    cur.execute("""
      CREATE TABLE fips (
        id SERIAL PRIMARY KEY,
        task VARCHAR(8),
        flight_no VARCHAR(32),
        origin_station VARCHAR(8),
        dest_station VARCHAR(8),
        landing_station VARCHAR(8),
        in_out_time VARCHAR(19),
        sobt VARCHAR(19),
        eobt VARCHAR(19),
        atot VARCHAR(19),
        sibt VARCHAR(19),
        eldt VARCHAR(19),
        aldt VARCHAR(19),
        corridor VARCHAR(16),
        runway VARCHAR(16),
        stand VARCHAR(16),
        aircraft_type VARCHAR(16),
        source_file VARCHAR(32),
        source_date VARCHAR(16),
        mapped_date VARCHAR(16)
      )
    """)
    conn.commit()
    print("表 fips 已重建（时间列 = VARCHAR，存本地时间 YYYY-MM-DD HH:mm:ss）")

    files = []
    for d in sorted(os.listdir(DATA_DIR)):
        dp = os.path.join(DATA_DIR, d)
        if os.path.isdir(dp):
            files.extend(sorted(glob.glob(os.path.join(dp, "*.xls"))))
    print(f"发现 {len(files)} 个文件")

    INSERT_SQL = """
      INSERT INTO fips
        (task, flight_no, origin_station, dest_station, landing_station,
         in_out_time, sobt, eobt, atot, sibt, eldt, aldt,
         corridor, runway, stand, aircraft_type,
         source_file, source_date, mapped_date)
      VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    total = 0
    batch = []
    for fp in files:
        fname = os.path.basename(fp)
        m = re.search(r"(\d{4})(\d{2})(\d{2})", fname)
        if not m:
            continue
        sy, sm, sd = int(m.group(1)), int(m.group(2)), int(m.group(3))
        src_date = f"{sy:04d}-{sm:02d}-{sd:02d}"
        mapped_date = map_date_str(sy, sm, sd)

        with open(fp, "rb") as fh:
            text = fh.read().decode("gbk", errors="replace")

        for line in text.split("\n"):
            parts = line.split("\t")
            if len(parts) < 16:
                continue
            flight_no = parts[1].strip()
            if not re.match(r"^[A-Z0-9]+$", flight_no):
                continue

            # 双段字段：SOBT/EOBT/SIBT/ELDT
            sobt_dt = parse_timestr(parts, 6, sy, sm, sd, None)
            eobt_dt = parse_timestr(parts, 7, sy, sm, sd, None)
            sibt_dt = parse_timestr(parts, 9, sy, sm, sd, None)
            eldt_dt = parse_timestr(parts, 10, sy, sm, sd, None)

            # 单段字段：ATOT 继承 EOBT 日期、ALDT 继承 ELDT 日期
            atot_dt = parse_timestr(parts, 8, sy, sm, sd, eobt_dt.day if eobt_dt else None)
            aldt_dt = parse_timestr(parts, 11, sy, sm, sd, eldt_dt.day if eldt_dt else None)

            # 进/出时间：同 ALDT
            inout_dt = None
            raw_inout = parts[5].strip()
            if aldt_dt is not None and re.match(r"^\d{1,2}:\d{2}$", raw_inout):
                hh, mm = map(int, raw_inout.split(":"))
                inout_dt = aldt_dt.replace(hour=hh, minute=mm)
            elif aldt_dt is None and re.match(r"^\d{1,2}:\d{2}$", raw_inout):
                inout_dt = datetime(sy, sm, sd, *map(int, raw_inout.split(":")))

            batch.append((
                parts[0].strip(),
                flight_no,
                parts[2].strip(),
                parts[3].strip(),
                parts[4].strip(),
                map_to_str(inout_dt),
                map_to_str(sobt_dt),
                map_to_str(eobt_dt),
                map_to_str(atot_dt),
                map_to_str(sibt_dt),
                map_to_str(eldt_dt),
                map_to_str(aldt_dt),
                parts[12].strip(),
                parts[13].strip(),
                parts[14].strip(),
                parts[15].strip(),
                fname,
                src_date,
                mapped_date,
            ))
            total += 1
            if len(batch) >= 500:
                cur.executemany(INSERT_SQL, batch)
                conn.commit()
                batch = []
    if batch:
        cur.executemany(INSERT_SQL, batch)
        conn.commit()

    cur.execute("SELECT count(*) FROM fips")
    cnt = cur.fetchone()[0]
    print(f"\n✅ 导入 {total} 条 → fips 表 {cnt} 条")

    # 校验样例
    cur.execute("""
      SELECT id, flight_no, origin_station, in_out_time, sobt, eobt, atot, sibt, eldt, aldt, mapped_date
      FROM fips WHERE source_file='20240402流量明细.xls' LIMIT 3
    """)
    print("\n20240402 样例（本地时间）:")
    for r in cur.fetchall():
        print(f"  id={r[0]} {r[1]} | in={r[3]} | SOBT={r[4]} | EOBT={r[5]} | ATOT={r[6]} | ALDT={r[8]} | 日期={r[10]}")

    cur.execute("""
      SELECT id, flight_no, in_out_time, sobt, aldt, mapped_date
      FROM fips WHERE source_file='20240101流量明细.xls' AND flight_no='ETD9680'
    """)
    print("\nETD9680 in 20240101（修复跨月）:")
    for r in cur.fetchall():
        print(f"  id={r[0]} | in={r[2]} | SOBT={r[3]} | ALDT={r[4]} | 日期={r[5]}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
