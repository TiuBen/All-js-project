import pg8000
conn = pg8000.connect(host='127.0.0.1', port=5432, user='postgres', password='admin', database='flight_dispatch')
cur = conn.cursor()
cur.execute("SELECT count(*) FROM fips")
print('fips 总数:', cur.fetchone()[0])

cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='fips' ORDER BY ordinal_position")
print('\n表结构:')
for (c,) in cur.fetchall(): print(' ', c)

cur.execute("""SELECT task, flight_no, origin_station, landing_station,
                         atot, aldt, aircraft_type, mapped_date
                  FROM fips WHERE source_file='20240401流量明细.xls' LIMIT 5""")
print('\n样例（20240401 前5条）:')
for r in cur.fetchall():
    print(' ', r)

cur.execute("SELECT mapped_date, count(*) FROM fips GROUP BY mapped_date ORDER BY mapped_date LIMIT 5")
print('\n映射日期样本:')
for r in cur.fetchall(): print(' ', r)
cur.close()
conn.close()