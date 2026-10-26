/**
 * ============================================================
 * 任务性质（航班性质）代码字典 —— 中英文对照
 * ------------------------------------------------------------
 * ecyilang 表的 d_flight_type_code / a_flight_type_code 存的是
 * 民航两位字母代码（'H/Z'、'W/Z'、'N/M' …），前端要显示中英文就得查表。
 *
 * 来源（两份官方口径，本字典是它们的并集）：
 *   ① 民航局《民用航空预先飞行计划布置电报格式和拍发规定》任务性质表（33 项）
 *   ② 机场生产运行统计「航班性质」分类表（含 H/Z 货物正班、Y/B 运输备降、
 *      Y/F 运输返航等 ① 里没有的代码）
 *   两份对同一代码含义一致；仅 W/A 有出入（①「转场飞行」/另一处「技术经停航班」），
 *   这里按 ① 取「转场飞行」。
 *
 * ★ 查不到的代码不猜：返回 cn/en = null，mapped = false，前端原样显示代码即可。
 * ★ 代码表是纯静态数据，不入库（几十条、几乎不变；要改直接改这里）。
 * ============================================================
 */

/**
 * 代码 → { cn, en }
 * 顺序按「运输 / 非运输」两大类排，运输在前（快照表里都是运输航班）
 */
const CODES = {
  /* ---------- 运输 · 正班 ---------- */
  'W/Z': { cn: '正班飞行', en: 'Scheduled flight' },
  'E/A': { cn: '正班换飞机', en: 'Scheduled flight (aircraft change)' },
  'H/Z': { cn: '货物正班飞行', en: 'Cargo scheduled flight' },
  'T/C': { cn: '正班推迟起飞', en: 'Scheduled flight (delayed departure)' },

  /* ---------- 运输 · 补班 ---------- */
  'Z/P': { cn: '补班飞行', en: 'Make-up flight' },

  /* ---------- 运输 · 加班 ---------- */
  'C/B': { cn: '旅客加班飞行', en: 'Passenger extra flight' },
  'E/B': { cn: '加班换飞机', en: 'Extra flight (aircraft change)' },
  'H/Y': { cn: '货运加班飞行', en: 'Cargo extra flight' },
  'Z/X': { cn: '重要旅客加班飞行', en: 'VIP extra flight' },

  /* ---------- 运输 · 专机 ---------- */
  'B/W': { cn: '专机飞行', en: 'Special (VIP) flight' },
  'J/B': { cn: '班机按专机保障', en: 'Scheduled flight under VIP protection' },
  'VIP': { cn: '要客飞行', en: 'VIP flight' },

  /* ---------- 运输 · 包机 ---------- */
  'L/W': { cn: '旅客包机飞行', en: 'Passenger charter flight' },
  'H/G': { cn: '货运包机飞行', en: 'Cargo charter flight' },
  'E/C': { cn: '包机换飞机', en: 'Charter flight (aircraft change)' },

  /* ---------- 运输 · 其他 ---------- */
  'N/M': { cn: '调机飞行', en: 'Ferry flight' },
  'Q/T': { cn: '其它运输飞行', en: 'Other transport flight' },
  'Y/B': { cn: '运输备降', en: 'Transport diversion flight' },
  'Y/F': { cn: '运输返航', en: 'Transport return flight' },

  /* ---------- 非运输 · 训练 / 熟练 ---------- */
  'A/V': { cn: '熟练飞行', en: 'Proficiency flight' },
  'K/L': { cn: '本场训练飞行', en: 'Local training flight' },
  'X/L': { cn: '航线训练飞行', en: 'Route training flight' },
  'D/Y': { cn: '带飞飞行', en: 'Supervised (training) flight' },

  /* ---------- 非运输 · 试飞 / 校验 / 验证 ---------- */
  'S/F': { cn: '试飞飞行', en: 'Test flight' },
  'F/J': { cn: '校验飞行', en: 'Navaid calibration flight' },
  'R/Z': { cn: '试航飞行', en: 'Route-proving flight' },
  'Y/Z': { cn: '验证飞行', en: 'Verification flight' },
  'D/M': { cn: '展示飞行', en: 'Demonstration flight' },

  /* ---------- 非运输 · 转场 / 公务 ---------- */
  'W/A': { cn: '转场飞行', en: 'Transfer flight' },
  'U/H': { cn: '公务飞行', en: 'Business flight' },

  /* ---------- 非运输 · 作业 / 救护 / 执法 ---------- */
  'O/F': { cn: '急救飞行', en: 'Emergency (relief) flight' },
  'S/Q': { cn: '视察飞行（含巡线飞行）', en: 'Inspection flight (incl. line patrol)' },
  'H/F': { cn: '航摄飞行', en: 'Aerial photography flight' },
  'Z/F': { cn: '执法飞行', en: 'Law-enforcement flight' },
  'B/F': { cn: '播种飞行', en: 'Aerial seeding flight' },

  /* ---------- 其他 ---------- */
  'X/X': { cn: '其他飞行', en: 'Other flight' },
  OVERFLIGHT: { cn: '临时飞越', en: 'Overflight' },
  'TECH STOP': { cn: '技术经停', en: 'Technical stop' },
};

/**
 * 代码 → 中英文四件套
 * @param {string|null} code 快照里的原始代码（如 'H/Z'）
 * @returns {{ code: string|null, cn: string|null, en: string|null, mapped: boolean }}
 *   mapped=false 表示代码不在字典里（cn/en 为 null，前端退回显示 code）
 */
export function flightTypeOf(code) {
  const key = typeof code === 'string' ? code.trim() : '';
  if (!key) return { code: null, cn: null, en: null, mapped: false };
  const hit = CODES[key];
  if (!hit) return { code: key, cn: null, en: null, mapped: false };
  return { code: key, cn: hit.cn, en: hit.en, mapped: true };
}

/** 全部已知代码（调试 / 字典接口用） */
export const FLIGHT_TYPE_CODES = CODES;
