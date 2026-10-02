# -*- coding: utf-8 -*-
"""
把「生鲜航班调度节点.xlsx」里 9. 开头的 sheet（2026 年 9 月）解析成
special.json —— 供后端 specialSchema.js 灌进 PG 的 special 表。

用法（需 python3；无需第三方库，openpyxl 因该文件 styles.xml 畸形会加载失败）：
    python xlsx-to-special-json.py [输入.xlsx] [输出.json]

版面约定（每天一个 sheet，横向可排 1~N 个航班块）：
    r1  「9月X日」              ← 块的时间节点列 c
    r2  航班号 [（机型）]        ← 块的时间节点列 c
    r3  「时间节点」|「间隔时长」  ← c / c+1，**块的定位锚点**
    r4~r12  9 个环节的时间节点     ← c；间隔时长在 c+1
    r13 生鲜货物板数 / r14 是否启动保障程序 / r15 货物保障时长小计

已处理的录入不规范（原表手录，值不统一）：
    · 日期 '9月26' 缺「日」
    · 时间用全角冒号 '19：24'、分号 '11;25'
    · 空块（表头行有「时间节点」但整块无数据，9.15/9.16/9.17 第 2 块）
    · 占位块 callsign='无' 且时间全为 '/'（9.18）→ 跳过
    · 机型括号中英文混用 'ET3690（B77L)'、空括号 'CSS182（）'
    · 板数带单位/备注 '24板1箱' '3版'（错别字）/ 小计带说明 '125\n驳运超时…'
    · 是否启动保障程序取值混杂：是 / 是（B） / B类 / 启动生鲜保障 / 否 / 无 / '/'
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
RNS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'

YEAR = 2026

# 9 个环节 key —— 与前端 config/specialSpec.js 的 PROCESS_STEPS 顺序严格一致
STEP_KEYS = [
    'landing', 'arrive_stand', 'open_door', 'start_unload', 'end_unload',
    'first_truck_leave', 'first_truck_arrive', 'last_truck_leave', 'last_truck_arrive',
]

LBL_BOARD = '生鲜货物板数'
LBL_PROGRAM = '是否启动保障程序'
LBL_TOTAL = '货物保障时长小计'
NONE_TOKENS = {'', '/', '无', '-', '—'}


# --------------------------------------------------------------------------
# 极简 xlsx 读取（只解析 sharedStrings + 目标 sheet）
# --------------------------------------------------------------------------
class Book:
    def __init__(self, path):
        self.zf = zipfile.ZipFile(path)
        self.shared = self._shared()
        self.sheets = self._sheets()

    def _shared(self):
        try:
            root = ET.fromstring(self.zf.read('xl/sharedStrings.xml'))
        except KeyError:
            return []
        return [''.join(t.text or '' for t in si.iter(f'{NS}t')) for si in root.findall(f'{NS}si')]

    def _sheets(self):
        wb = ET.fromstring(self.zf.read('xl/workbook.xml'))
        rels = ET.fromstring(self.zf.read('xl/_rels/workbook.xml.rels'))
        rid2t = {r.get('Id'): r.get('Target') for r in rels}
        out = {}
        for sh in wb.find(f'{NS}sheets'):
            t = rid2t.get(sh.get(f'{RNS}id'), '')
            if t.startswith('/'):
                t = t[1:]
            elif not t.startswith('xl/'):
                t = 'xl/' + t
            out[sh.get('name')] = t
        return out

    def grid(self, name):
        root = ET.fromstring(self.zf.read(self.sheets[name]))
        rows, max_col = {}, 0
        for row in root.iter(f'{NS}row'):
            cells = {}
            for c in row.findall(f'{NS}c'):
                col = _col_index(re.sub(r'\d+', '', c.get('r')))
                t, v, is_el = c.get('t'), c.find(f'{NS}v'), c.find(f'{NS}is')
                if t == 's':
                    val = self.shared[int(v.text)] if v is not None else ''
                elif t == 'inlineStr' and is_el is not None:
                    val = ''.join(x.text or '' for x in is_el.iter(f'{NS}t'))
                else:
                    val = v.text if v is not None else ''
                cells[col] = val or ''
                max_col = max(max_col, col)
            rows[int(row.get('r'))] = cells
        if not rows:
            return []
        return [[rows.get(r, {}).get(c, '') for c in range(1, max_col + 2)]
                for r in range(1, max(rows) + 1)]


def _col_index(letters):
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n


# --------------------------------------------------------------------------
# 取值规整
# --------------------------------------------------------------------------
def norm_time(v):
    """节点时间 → 'HH:mm'；'/' 或空 → ''。"""
    s = str(v or '').strip().replace('：', ':').replace(';', ':')
    if s in NONE_TOKENS:
        return ''
    if re.fullmatch(r'\d{1,2}:\d{2}', s):
        h, m = s.split(':')
        return f'{int(h):02d}:{m}'
    if re.fullmatch(r'\d{3,4}', s):
        s = s.zfill(4)
        return f'{s[:2]}:{s[2:]}'
    return s


def is_valid_time(t):
    return bool(re.fullmatch(r'\d{2}:\d{2}', t))


def norm_gap(v):
    s = str(v or '').strip()
    if s in NONE_TOKENS:
        return None
    m = re.fullmatch(r'-?\d+(?:\.\d+)?', s)
    return int(float(s)) if m else None


def norm_int(v):
    """取字符串里的第一个整数（'24板1箱'→24、'3版'→3、'125\\n驳运超时…'→125）。"""
    m = re.search(r'-?\d+', str(v or ''))
    return int(m.group()) if m else None


def split_callsign(raw):
    """'5Y8608(B77L)' / 'ET3690（B77L)' → (航班号, 机型)；空括号视为无机型。"""
    s = str(raw or '').strip()
    m = re.fullmatch(r'([^(（]+)[(（]\s*([^)）]*)\s*[)）]', s)
    if m:
        return m.group(1).strip(), (m.group(2).strip() or None)
    return s, None


def parse_day(txt):
    """'9月26' / '9月26日' → 26；解析不出 → None。"""
    m = re.fullmatch(r'\s*9\s*月\s*(\d{1,2})\s*日?\s*', str(txt or ''))
    return int(m.group(1)) if m else None


# --------------------------------------------------------------------------
# 解析一个 sheet
# --------------------------------------------------------------------------
def extract_sheet(book, name, warn):
    grid = book.grid(name)
    if not grid:
        warn.append(f'{name}: 空 sheet')
        return []

    header_row = next((i for i, r in enumerate(grid, 1)
                       if any(str(c).strip() == '时间节点' for c in r)), None)
    if not header_row:
        warn.append(f'{name}: 找不到「时间节点」表头行，跳过')
        return []

    def cell(r, c):
        if r < 1 or r > len(grid) or c < 1:
            return ''
        row = grid[r - 1]
        return row[c - 1] if c <= len(row) else ''

    anchors = [j + 1 for j, c in enumerate(grid[header_row - 1])
               if str(c).strip() == '时间节点']
    date_row, call_row = header_row - 2, header_row - 1
    node_rows = range(header_row + 1, header_row + 10)

    # 三个附注行的行号（按标签文字定位，不写死行号）
    row_board = next((i for i, r in enumerate(grid, 1)
                      if any(str(c).strip() == LBL_BOARD for c in r)), None)
    row_program = next((i for i, r in enumerate(grid, 1)
                        if any(str(c).strip() == LBL_PROGRAM for c in r)), None)
    row_total = next((i for i, r in enumerate(grid, 1)
                      if any(str(c).strip().startswith(LBL_TOTAL) for c in r)), None)

    # 日期兜底：块内日期为空时，用同 sheet 其它块的日期，再退到 sheet 名（9.19）
    sheet_day = next((parse_day(cell(date_row, c)) for c in anchors
                      if parse_day(cell(date_row, c))), None)
    if sheet_day is None:
        m = re.fullmatch(r'9\.(\d{1,2})', name)
        sheet_day = int(m.group(1)) if m else None

    out = []
    for idx, c in enumerate(anchors):
        callsign, aircraft = split_callsign(cell(call_row, c))
        if callsign in NONE_TOKENS:
            warn.append(f'{name} 块{idx + 1}(列{c}): 占位块（航班号 {callsign!r}），跳过')
            continue
        if not callsign:
            warn.append(f'{name} 块{idx + 1}(列{c}): 空块（无航班号），跳过')
            continue

        steps, times = {}, []
        for k, r in zip(STEP_KEYS, node_rows):
            t = norm_time(cell(r, c))
            if t and not is_valid_time(t):
                warn.append(f'{name} 块{idx + 1} {k}: 时间无法解析 {cell(r, c)!r} → {t!r}')
            steps[k] = {'time': t, 'gap': norm_gap(cell(r, c + 1))}
            times.append(t)

        # 有航班号但 9 个节点全空（如 9.22 的两个块）：保留 —— 「当日有该航班
        # 但未录入保障数据」本身是有效信息，节点留空即可；仅告警，不丢行。
        if not any(times):
            warn.append(f'{name} 块{idx + 1}: 航班 {callsign} 时间节点全空（保留空记录）')

        day = parse_day(cell(date_row, c)) or sheet_day
        if day is None:
            warn.append(f'{name} 块{idx + 1}: 日期无法确定，跳过')
            continue

        board_raw = str(cell(row_board, c)).strip() if row_board else ''
        prog_raw = str(cell(row_program, c)).strip() if row_program else ''
        total_raw = str(cell(row_total, c)).strip() if row_total else ''

        out.append({
            'sheet': name,
            'day': day,
            'callsign': callsign,
            'aircraftType': aircraft,
            'boardCount': norm_int(board_raw),
            'boardRaw': None if board_raw in NONE_TOKENS else board_raw,
            'programStarted': prog_raw not in NONE_TOKENS and prog_raw != '否',
            'programRaw': None if prog_raw in NONE_TOKENS else prog_raw,
            'totalMinutes': norm_int(total_raw),
            'totalRaw': None if total_raw in NONE_TOKENS else total_raw,
            'steps': steps,
        })
    return out


# --------------------------------------------------------------------------
def main():
    xlsx = sys.argv[1] if len(sys.argv) > 1 else '生鲜航班调度节点.xlsx'
    out_path = sys.argv[2] if len(sys.argv) > 2 else 'special.json'

    book = Book(xlsx)
    warn, flights, per_sheet = [], [], {}
    for name in book.sheets:
        if not name.startswith('9.'):
            continue
        rows = extract_sheet(book, name, warn)
        per_sheet[name] = len(rows)
        flights.extend(rows)

    flights.sort(key=lambda r: (r['day'], r['sheet'], r['callsign']))

    records = [{
        'callsign': f['callsign'],
        'belongTime': f'{YEAR}-09-{f["day"]:02d}',
        'nodesTime': {
            'sheet': f['sheet'],
            'aircraftType': f['aircraftType'],
            'boardCount': f['boardCount'],
            'boardRaw': f['boardRaw'],
            'programStarted': f['programStarted'],
            'programRaw': f['programRaw'],
            'totalMinutes': f['totalMinutes'],
            'totalRaw': f['totalRaw'],
            'steps': f['steps'],
        },
    } for f in flights]

    # 唯一性自检：同一 (航班号, 日期) 不应出现两次
    seen, dup = set(), []
    for r in records:
        k = (r['callsign'], r['belongTime'])
        if k in seen:
            dup.append(k)
        seen.add(k)

    doc = {
        'source': xlsx,
        'month': f'{YEAR}-09',
        'sheets': len(per_sheet),
        'count': len(records),
        'rows': records,
    }
    with open(out_path, 'w', encoding='utf-8') as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=2)

    print(f'9.* sheets = {len(per_sheet)}   flights = {len(records)}')
    print('per sheet:', ', '.join(
        f'{k}:{v}' for k, v in sorted(per_sheet.items(), key=lambda x: int(x[0].split(".")[1]))))
    days = {}
    for r in records:
        days[r['belongTime']] = days.get(r['belongTime'], 0) + 1
    print('per day:', ', '.join(f'{k[-2:]}:{v}' for k, v in sorted(days.items())))
    print(f'duplicates = {len(dup)}', dup[:5])
    print(f'warnings = {len(warn)}')
    for w in warn:
        print('  !', w)
    print('out =', out_path)


if __name__ == '__main__':
    main()
