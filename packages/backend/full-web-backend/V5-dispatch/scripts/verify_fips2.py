import pg8000
conn = pg8000.connect(host='127.0.0.1', port=5432, user='postgres', password='admin', database='flight_dispatch')
cur = conn.cursor()
cur.execute("SELECT id, flight_no, source_file, in_out_time, sobt, eobt, atot, aldt, mapped_date FROM fips WHERE id=2789")
r = cur.fetchone()
print('id=2789 (20240131 文件):')
print(f'  {r[1]} | in={r[3]} | SOBT={r[4]} | EOBT={r[5]} | ATOT={r[6]} | ALDT={r[7]} | 日期={r[8]}')

# 抽查整表：SOBT 与 ALDT 的合理分布
cur.execute("SELECT count(*) FROM fips")
print('总数:', cur.fetchone()[0])
# 检查几个随机日期的数据
cur.execute("SELECT DISTINCT mapped_date FROM fips ORDER BY mapped_date")
dates = [r[0] for r in cur.fetchall()]
print('映射日期范围:', dates[0], '~', dates[-1], '| 共', len(dates), '天')
cur.close()
conn.close()