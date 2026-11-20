// src/store/trainSimulatorStore.js - 模拟机培训数据 store
// 当前数据为本地 fakedata，接后端时把 FAKE_RECORDS 换成接口返回即可，页面零改动
import { create } from 'zustand';
import { CalendarDays, UserRound } from 'lucide-react';

// ===== fakedata：模拟机培训/考核记录 =====
const FAKE_RECORDS = [
  { id: 'sim-001', title: '指挥席位培训', student: '李依玲', gender: 'female', year: 2026, month: 11, date: '2026-11-03', exerciseNo: 'P-101', formName: '（塔台）指挥席位培训记录表', trainCategory: '岗位培训', qualType: '塔台管制', sector: 'TWR-01', weather: '简单气象', military: '无', sorties: 4, complexity: '一般', teacher: '吴其奇', startTime: '09:00', duration: '2小时', score: 96, status: 'done' },
  { id: 'sim-002', title: '冲突搜寻与调配', student: '李依玲', gender: 'female', year: 2026, month: 11, date: '2026-11-12', exerciseNo: 'P-108', formName: '（塔台）复杂情况处置训练记录表', trainCategory: '专项培训', qualType: '塔台管制', sector: 'TWR-02', weather: '复杂气象', military: '有', sorties: 6, complexity: '较复杂', teacher: '吴其奇', startTime: '14:00', duration: '2.5小时', score: 91, status: 'done' },
  { id: 'sim-003', title: '低能见度运行', student: '王思远', gender: 'male', year: 2026, month: 11, date: '2026-11-15', exerciseNo: 'P-112', formName: '（塔台）不正常情况处置训练记录表', trainCategory: '岗位培训', qualType: '塔台管制', sector: 'TWR-01', weather: '复杂气象', military: '无', sorties: 3, complexity: '复杂', teacher: '周明远', startTime: '08:30', duration: '1.5小时', score: 88, status: 'done' },
  { id: 'sim-004', title: '岗前雷达模拟机', student: '王思远', gender: 'male', year: 2026, month: 10, date: '2026-10-09', exerciseNo: 'P-086', formName: '（塔台）指挥席位培训记录表', trainCategory: '岗前培训', qualType: '塔台管制', sector: 'TWR-03', weather: '简单气象', military: '无', sorties: 8, complexity: '一般', teacher: '周明远', startTime: '09:00', duration: '3小时', score: 94, status: 'done' },
  { id: 'sim-005', title: '军用活动协调', student: '陈志远', gender: 'male', year: 2026, month: 10, date: '2026-10-21', exerciseNo: 'P-093', formName: '（塔台）复杂情况处置训练记录表', trainCategory: '专项培训', qualType: '塔台管制', sector: 'TWR-02', weather: '简单气象', military: '有', sorties: 5, complexity: '较复杂', teacher: '吴其奇', startTime: '13:30', duration: '2小时', score: 90, status: 'done' },
  { id: 'sim-006', title: '复训-五边飞行', student: '陈志远', gender: 'male', year: 2026, month: 9, date: '2026-09-18', exerciseNo: 'P-075', formName: '（塔台）指挥席位培训记录表', trainCategory: '岗位复训', qualType: '塔台管制', sector: 'TWR-01', weather: '简单气象', military: '无', sorties: 4, complexity: '一般', teacher: '周明远', startTime: '10:00', duration: '2小时', score: 97, status: 'done' },
  { id: 'sim-007', title: '发动机失效处置', student: '李依玲', gender: 'female', year: 2026, month: 9, date: '2026-09-25', exerciseNo: 'P-080', formName: '（塔台）不正常情况处置训练记录表', trainCategory: '专项培训', qualType: '塔台管制', sector: 'TWR-02', weather: '简单气象', military: '无', sorties: 3, complexity: '复杂', teacher: '吴其奇', startTime: '15:00', duration: '1.5小时', score: 85, status: 'done' },
  { id: 'sim-008', title: '年度考核', student: '王思远', gender: 'male', year: 2025, month: 12, date: '2025-12-10', exerciseNo: 'P-064', formName: '（塔台）模拟机考核记录表', trainCategory: '考核', qualType: '塔台管制', sector: 'TWR-01', weather: '复杂气象', military: '有', sorties: 6, complexity: '较复杂', teacher: '周明远', startTime: '09:00', duration: '2.5小时', score: 92, status: 'done' },
  { id: 'sim-009', title: '复训-穿越跑道', student: '陈志远', gender: 'male', year: 2025, month: 12, date: '2025-12-22', exerciseNo: 'P-068', formName: '（塔台）指挥席位培训记录表', trainCategory: '岗位复训', qualType: '塔台管制', sector: 'TWR-03', weather: '简单气象', military: '无', sorties: 4, complexity: '一般', teacher: '吴其奇', startTime: '14:00', duration: '2小时', score: 95, status: 'done' },
  { id: 'sim-010', title: '不停航施工监管', student: '李依玲', gender: 'female', year: 2025, month: 11, date: '2025-11-14', exerciseNo: 'P-055', formName: '（塔台）复杂情况处置训练记录表', trainCategory: '专项培训', qualType: '塔台管制', sector: 'TWR-01', weather: '简单气象', military: '无', sorties: 5, complexity: '较复杂', teacher: '周明远', startTime: '08:30', duration: '2小时', score: 89, status: 'done' },
];

// ===== 分组模式 =====
export const TREE_MODES = [
  { value: 'ym-user', label: '按时间', icon: CalendarDays },
  { value: 'user-ym', label: '按姓名', icon: UserRound },
];

// ===== 树状分组：把平铺记录按 mode 组装成 TreeViewer 需要的节点树 =====
// mode='ym-user'  → 年 → 月 → 用户 → 记录
// mode='user-ym'  → 用户 → 年 → 月 → 记录
export function buildTree(records, mode) {
  const leafNode = (r) => ({ id: r.id, label: `${r.date} ${r.title}`, data: r });

  // 按字段分组一层：sortKey 数字升序，文件夹节点 meta 显示条数
  const group = (list, field, idPrefix, makeNode, next) => {
    const map = {};
    for (const r of list) (map[r[field]] = map[r[field]] || []).push(r);
    return Object.keys(map)
      .sort((a, b) => a - b)
      .map((k) => {
        const children = next(map[k]);
        return { id: `${idPrefix}-${k}`, meta: String(children.length), children, ...makeNode(k, map[k]) };
      });
  };

  // 月份节点统一用日历图标；人的节点带 gender，TreeViewer 渲染成男女头像
  const monthNode = (k) => ({ label: `${k} 月`, icon: CalendarDays });
  const userNode = (k, rs) => ({ label: k, gender: rs[0].gender });

  if (mode === 'user-ym') {
    return group(records, 'student', 'u', userNode, (rs) =>
      group(rs, 'year', 'u-y', (k) => ({ label: `${k} 年` }), (rs2) =>
        group(rs2, 'month', 'u-y-m', monthNode, (rs3) => rs3.map(leafNode)))
    );
  }
  return group(records, 'year', 'y', (k) => ({ label: `${k} 年` }), (rs) =>
    group(rs, 'month', 'y-m', monthNode, (rs2) =>
      group(rs2, 'student', 'y-m-u', userNode, (rs3) => rs3.map(leafNode)))
  );
}

// ===== store =====
const useTrainSimulatorStore = create((set, get) => ({
  records: FAKE_RECORDS,
  mode: 'ym-user', // 树分组模式
  setMode: (mode) => set({ mode }),
  selectedId: null, // 当前选中的记录 id
  select: (selectedId) => set({ selectedId }),
  // 就地编辑选中记录（右侧表单回写）
  updateRecord: (id, patch) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}));

export default useTrainSimulatorStore;
