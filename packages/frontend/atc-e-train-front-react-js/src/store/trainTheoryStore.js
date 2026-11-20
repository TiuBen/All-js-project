// src/store/trainTheoryStore.js - 理论培训数据 store
// 当前数据为本地 fakedata，接后端时把 FAKE_RECORDS 换成接口返回即可，页面零改动
import { create } from 'zustand';
import { CalendarDays, UserRound } from 'lucide-react';

// ===== fakedata：理论培训记录 =====
const FAKE_RECORDS = [
  { id: 'th-001', title: '航空气象基础', student: '李依玲', gender: 'female', year: 2026, month: 11, date: '2026-11-05', courseName: '航空气象基础', teacher: '周明远', category: '岗位培训', location: '培训教室 A', duration: '3小时', result: '合格', remark: '' },
  { id: 'th-002', title: '管制英语无线电通话', student: '李依玲', gender: 'female', year: 2026, month: 11, date: '2026-11-14', courseName: '管制英语无线电通话', teacher: '吴其奇', category: '专项培训', location: '培训教室 B', duration: '2小时', result: '优秀', remark: '口语需加强' },
  { id: 'th-003', title: '人为因素与班组资源管理', student: '王思远', gender: 'male', year: 2026, month: 11, date: '2026-11-18', courseName: '人为因素与班组资源管理（CRM）', teacher: '周明远', category: '岗位培训', location: '培训教室 A', duration: '2.5小时', result: '合格', remark: '' },
  { id: 'th-004', title: '航空法规与规章', student: '王思远', gender: 'male', year: 2026, month: 10, date: '2026-10-15', courseName: '航空法规与规章体系', teacher: '吴其奇', category: '岗前培训', location: '培训教室 C', duration: '4小时', result: '优秀', remark: '' },
  { id: 'th-005', title: '跑道安全与侵入防范', student: '陈志远', gender: 'male', year: 2026, month: 10, date: '2026-10-26', courseName: '跑道安全与跑道侵入防范', teacher: '周明远', category: '专项培训', location: '培训教室 A', duration: '2小时', result: '合格', remark: '结合案例讲解' },
  { id: 'th-006', title: '应急疏散预案', student: '陈志远', gender: 'male', year: 2026, month: 9, date: '2026-09-20', courseName: '机场应急救援与疏散预案', teacher: '吴其奇', category: '岗位复训', location: '培训教室 B', duration: '3小时', result: '合格', remark: '' },
  { id: 'th-007', title: '年度理论考核', student: '李依玲', gender: 'female', year: 2025, month: 12, date: '2025-12-18', courseName: '年度理论综合考核', teacher: '周明远', category: '考核', location: '电教室', duration: '2小时', result: '优秀', remark: '96 分' },
  { id: 'th-008', title: '新通则宣贯', student: '王思远', gender: 'male', year: 2025, month: 12, date: '2025-12-26', courseName: '民航局新规章宣贯', teacher: '吴其奇', category: '岗位复训', location: '培训教室 C', duration: '1.5小时', result: '合格', remark: '' },
  { id: 'th-009', title: '雷达管制基础', student: '陈志远', gender: 'male', year: 2025, month: 11, date: '2025-11-08', courseName: '雷达管制基础理论', teacher: '周明远', category: '岗前培训', location: '培训教室 A', duration: '4小时', result: '合格', remark: '' },
];

// ===== 分组模式（与模拟机培训保持一致） =====
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
const useTrainTheoryStore = create((set, get) => ({
  records: FAKE_RECORDS,
  mode: 'ym-user',
  setMode: (mode) => set({ mode }),
  selectedId: null,
  select: (selectedId) => set({ selectedId }),
  // 就地编辑选中记录（右侧表单回写）
  updateRecord: (id, patch) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}));

export default useTrainTheoryStore;
