/**
 * ============================================================
 * 机场代码映射
 * ------------------------------------------------------------
 * 历史航班数据（fips 表）中机场以四字码（ICAO）存储，
 * 本模块将其转换为中文显示名，未识别代码原样返回。
 * ============================================================
 */

const AIRPORTS = {
  // ===== 国内 =====
  ZHEC: '鄂州', ZSPD: '上海浦东', ZSSS: '上海虹桥', ZGSZ: '深圳', ZUCK: '重庆',
  ZSHC: '杭州', ZPPP: '昆明', ZSWZ: '温州', ZSJN: '济南', ZLXY: '西安',
  ZSQD: '青岛', ZBHH: '呼和浩特', ZSWX: '无锡', ZSQZ: '泉州', ZBTJ: '天津',
  ZBAA: '北京首都', ZBAD: '北京大兴', ZSAM: '厦门', ZHCC: '郑州', ZUUU: '成都',
  ZUTF: '成都天府', ZSNJ: '南京', ZYTX: '沈阳', ZGHA: '长沙', ZYTL: '大连',
  ZYHB: '哈尔滨', ZSNB: '宁波', ZBSJ: '石家庄', ZSOF: '合肥', ZSYW: '义乌',
  ZGNN: '南宁', ZLLL: '兰州', ZGGG: '广州', ZSNT: '南通', ZJHK: '海口',
  ZYCC: '长春', ZUGY: '贵阳', ZBYN: '太原', ZSFZ: '福州', ZSWF: '潍坊',
  ZGOW: '揭阳', ZSXZ: '徐州', ZWWW: '乌鲁木齐', ZGSD: '珠海', ZLIC: '银川',
  ZHHH: '武汉', ZBOW: '包头', ZLXN: '西宁', ZSYT: '烟台', ZHXF: '襄阳',
  ZHYC: '宜昌', ZLQY: '庆阳', ZJQH: '琼海', ZGZJ: '湛江', ZHES: '恩施',
  ZBXJ: '巴音郭楞', ZSYA: '烟台蓬莱', ZZZZ: '未知',
  // ===== 国际 =====
  VIDP: '德里', OMAA: '阿布扎比', VOMM: '金奈', OPLA: '拉合尔', EBLG: '列日',
  EDDF: '法兰克福', PANC: '安克雷奇', UAAA: '阿拉木图', UAKK: '卡拉干达',
  UUEE: '莫斯科', UNAA: '阿巴坎', HAAB: '亚的斯亚贝巴', HDAM: '吉布提',
  VECC: '加尔各答',
};

/**
 * 机场四字码 → 中文显示名
 * @param {string} code ICAO 四字码
 * @returns {string} 中文名；未识别返回原码
 */
export function airportName(code) {
  if (!code) return '';
  return AIRPORTS[code] || code;
}
