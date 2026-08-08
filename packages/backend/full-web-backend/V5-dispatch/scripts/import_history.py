# -*- coding: utf-8 -*-
"""
历史航班数据入库脚本
====================
读取 资料/历史航班/{1月,2,3,4}/*.xls（GBK 编码 TSV 文本）
解析为航班记录，时间映射：2024年X月 → 2026年(X+3)月（4月→7月、3月→6月、2月→5月、1月→4月）
写入 PostgreSQL flights 表。
"""
import os
import re
import glob
import calendar
from datetime import date, datetime, timedelta
import pg8000

# ---------- 配置 ----------
ROOT = r"C:\Users\HJW-AMD-PRP\Documents\GitHub\All-js-project"
DATA_DIR = os.path.join(ROOT, "packages", "frontend", "flight-dispatch-system", "资料", "历史航班")

DB = dict(
    host="127.0.0.1", port=5432, user="postgres", password="admin",
    database="flight_dispatch",
)

# 机场四字码 → 中文
AIRPORTS = {
    "ZHEC": "鄂州", "ZSPD": "上海浦东", "ZGSZ": "深圳", "ZUCK": "重庆",
    "ZSHC": "杭州", "ZPPP": "昆明", "ZSWZ": "温州", "ZSJN": "济南",
    "ZLXY": "西安", "ZSQD": "青岛", "ZBHH": "呼和浩特", "ZSWX": "无锡",
    "ZSQZ": "泉州", "ZBTJ": "天津", "ZBAA": "北京首都", "ZSAM": "厦门",
    "ZHCC": "郑州", "VIDP": "德里", "ZUUU": "成都", "ZSNJ": "南京",
    "ZYTX": "沈阳", "ZGHA": "长沙", "ZYTL": "大连", "ZYHB": "哈尔滨",
    "ZSNB": "宁波", "ZBSJ": "石家庄", "ZSOF": "合肥", "ZSYW": "义乌",
    "ZGNN": "南宁", "ZLLL": "兰州", "ZGGG": "广州", "ZSNT": "南通",
    "OMAA": "阿布扎比", "ZJHK": "海口", "ZYCC": "长春", "ZUGY": "贵阳",
    "ZBYN": "太原", "ZSFZ": "福州", "ZUTF": "成都天府", "ZSWF": "潍坊",
    "ZGOW": "揭阳", "ZSXZ": "徐州", "ZWWW": "乌鲁木齐", "ZGSD": "珠海",
    "ZBAD": "北京大兴", "VOMM": "金奈", "OPLA": "拉合尔", "EBLG": "列日",
    "EDDF": "法兰克福", "ZLIC": "银川", "ZHHH": "武汉", "ZBOW": "包头",
    "PANC": "安克雷奇", "UAAA": "阿拉木图", "UAKK": "卡拉干达", "UUEE": "莫斯科",
    "UNAA": "阿巴坎", "HAAB": "亚的斯亚贝巴", "ZLXN": "西宁", "ZSSS": "上海虹桥",
    "ZZZZ": "未知", "ZSYT": "烟台", "HDAM": "吉布提", "VECC": "加尔各答",
    "ZBXJ": "巴音郭楞", "ZSYA": "烟台蓬莱", "ZHXF": "襄阳", "ZHYC": "宜昌",
    "ZLQY": "庆阳", "ZJQH": "琼海", "ZGZJ": "湛江", "ZHES": "恩施",
}


def add_months_clamp(y, m, d, add_years, add_months):
    """日期加年/月（天数越界自动钳制到月末）"""
    total = y * 12 + (m - 1) + add_years * 12 + add_months
    ny, nm = divmod(total, 12)
    nm += 1
    last = calendar.monthrange(ny, nm)[1]
    return date(ny, nm, min(d, last))


def parse_daytime(day_str, time_str, base_date):
    """解析 '31 23:55' / '01 00:22' 格式：
       day 为相对当月 1 号的日号，返回 base_date 所在月对应日期的 datetime(UTC)"""
    try:
        day = int(str(day_str).strip())
        hh, mm = str(time_str).strip().split(":")
        hh, mm = int(hh), int(mm)
        # day 相对当月1号（可能跨到上月或下月）
        target = date(base_date.year, base_date.month, 1) + timedelta(days=day - 1)
        return datetime(target.year, target.month, target.day, hh, mm, tzinfo=None)
    except Exception:
        return None


def parse_file(filepath):
    """解析单个 TSV 文件 → 航班 dict 列表（源时间，未映射）"""
    with open(filepath, "rb") as fh:
        raw = fh.read()
    text = raw.decode("gbk", errors="replace")
    lines = text.split("\n")

    # 文件名 20240401 → 源日期
    fname = os.path.basename(filepath)
    m = re.search(r"(\d{4})(\d{2})(\d{2})", fname)
    if not m:
        return []
    src_date = date(int(m.group(1)), int(m.group(2)), int(m.group(3)))

    flights = []
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith("任务\t") or line.startswith("W/Z\t") is False and i == 0 and "航班号" in line:
            continue
        parts = line.split("\t")
        if len(parts) < 16:
            continue
        try:
            flight_no = parts[1].strip()
            origin_code = parts[2].strip()
            dest_code = parts[4].strip()  # 落地站
            atot = parse_daytime(parts[8].split()[0] if len(parts[8].split()) > 1 else "1", parts[8].split()[-1], src_date)
            aldt = parse_daytime(parts[10].split()[0] if len(parts[10].split()) > 1 else "1", parts[10].split()[-1], src_date)
            aircraft = parts[15].strip()
            stand = parts[14].strip()
        except Exception:
            continue
        if not flight_no or not re.match(r"^[A-Z0-9]+$", flight_no):
            continue
        if atot is None and aldt is None:
            continue
        flights.append({
            "flight_no": flight_no,
            "origin_code": origin_code,
            "dest_code": dest_code,
            "atot": atot,
            "aldt": aldt,
            "aircraft": aircraft,
            "stand": stand,
            "src_date": src_date,
            "src_row": i,
        })
    return flights


def map_time(dt, src_date):
    """源 UTC 时间 → 映射后 UTC 时间：年份 +2、月份 +3"""
    if dt is None:
        return None
    mapped = add_months_clamp(dt.year, dt.month, dt.day, 2, 3)
    return datetime(mapped.year, mapped.month, mapped.day, dt.hour, dt.minute)


def main():
    conn = pg8000.connect(**DB)
    cur = conn.cursor()

    # 统计旧数据
    cur.execute("SELECT count(*) FROM flights")
    old = cur.fetchone()[0]

    files = []
    for d in sorted(os.listdir(DATA_DIR)):
        dp = os.path.join(DATA_DIR, d)
        if os.path.isdir(dp):
            files.extend(sorted(glob.glob(os.path.join(dp, "*.xls"))))
    print(f"发现 {len(files)} 个文件")

    total = 0
    skipped = 0
    rows = []
    for fp in files:
        flist = parse_file(fp)
        for f in flist:
            dep = map_time(f["atot"], f["src_date"])
            arr = map_time(f["aldt"], f["src_date"])
            if arr is None:
                skipped += 1
                continue
            flight_date = arr.strftime("%Y-%m-%d")
            fid = f"HL-{os.path.basename(fp)[:8]}-{f['src_row']}"
            rows.append((
                fid,
                f["flight_no"],
                AIRPORTS.get(f["origin_code"], f["origin_code"]),
                AIRPORTS.get(f["dest_code"], f["dest_code"]),
                dep.strftime("%Y-%m-%dT%H:%M:%SZ") if dep else None,
                arr.strftime("%Y-%m-%dT%H:%M:%SZ"),
                flight_date,
                "到达",
                f["aircraft"] or "",
                "常规航班",
                "货运航班",
                False,
            ))
            total += 1

    # 批量插入（去重：同航班号+落地时间已存在则跳过）
    cur.execute("SELECT flight_no, landing_time_utc FROM flights")
    existing = {(r[0], str(r[1])) for r in cur.fetchall()}

    inserted = 0
    batch = []
    for r in rows:
        key = (r[1], r[5])
        if key in existing:
            skipped += 1
            continue
        batch.append(r)
        if len(batch) >= 500:
            cur.executemany(
                """INSERT INTO flights
                   (id, flight_no, origin, destination, departure_time_utc, landing_time_utc,
                    flight_date, status, aircraft_type, flight_type, category, has_checklist)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                batch,
            )
            inserted += len(batch)
            batch = []
    if batch:
        cur.executemany(
            """INSERT INTO flights
               (id, flight_no, origin, destination, departure_time_utc, landing_time_utc,
                flight_date, status, aircraft_type, flight_type, category, has_checklist)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            batch,
        )
        inserted += len(batch)

    conn.commit()
    cur.execute("SELECT count(*) FROM flights")
    after = cur.fetchone()[0]

    # 月份分布
    cur.execute("SELECT flight_date, count(*) FROM flights GROUP BY flight_date ORDER BY flight_date LIMIT 1000")
    dist = {}
    for d, c in cur.fetchall():
        dist[d[:7]] = dist.get(d[:7], 0) + c

    print(f"\n✅ 解析 {total} 条，跳过 {skipped} 条，新插入 {inserted} 条")
    print(f"   flights 总数: {old} → {after}")
    print("   月份分布:", dict(sorted(dist.items())))
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
