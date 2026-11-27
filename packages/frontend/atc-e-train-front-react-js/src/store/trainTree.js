// src/store/trainTree.js - 培训树共用构建逻辑（模拟机/理论两个 store 共用，避免重复代码）
//
// 树不再从 fakedata 记录分组，而是「真实员工骨架」：
// - 员工来自 PG user 表（经 userStore 拉取），按 gender 渲染男女头像，教员带 meta 标记
// - 年份固定默认 2025、2026（DEFAULT_YEARS），月份固定 1-12（MONTHS）
// - 等培训记录数据入库后，把叶子层换成记录即可，分组骨架不变
//
// 模拟机树额外支持（第 3/4 参数可选，理论树不传不受影响）：
// - exercises：练习说明列表 [{ id, userId, title }]，作为用户节点下的叶子（FileText 图标）
//   节点 id 约定：练习说明 ex-<id>；用户 u-<uuid>（不含 -y-）；年/月组节点其余
// - labelOverrides：组名覆盖 { [nodeId]: label }，「修改组名」右键操作写入
//   （年/月骨架是固定数据，改名不能改源数据，只在构建时覆盖显示）
import { CalendarDays, FileText, UserRound } from 'lucide-react';

// 年份默认都有这两年；月份骨架 1-12
export const DEFAULT_YEARS = [2025, 2026];
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export const TREE_MODES = [
  { value: 'ym-user', label: '按时间', icon: CalendarDays },
  { value: 'user-ym', label: '按姓名', icon: UserRound },
];

// PG 的 gender（'男'/'女'）→ TreeViewer 头像用的 male/female
const mapGender = (g) => (g === '女' ? 'female' : 'male');

// 员工节点：TreeViewer 对带 gender 的节点渲染成男女小头像；教员资格显示在行尾
// 名下有练习说明时，练习说明作为用户节点下的叶子
const userNode = (u, exercises = []) => {
  const exNodes = exercises
    .filter((e) => e.userId === u.id)
    .map((e) => ({ id: `ex-${e.id}`, label: e.title, icon: FileText }));
  return {
    id: `u-${u.id}`,
    label: u.name,
    gender: mapGender(u.gender),
    ...(u.is_instructor ? { meta: '教员' } : {}),
    ...(exNodes.length ? { children: exNodes } : {}),
  };
};

// 「修改组名」的 label 覆盖：递归应用（练习说明改名也走这里，按 ex-<id> 覆盖）
function applyOverrides(nodes, overrides) {
  return nodes.map((n) => {
    const next = overrides[n.id] ? { ...n, label: overrides[n.id] } : n;
    return n.children ? { ...next, children: applyOverrides(n.children, overrides) } : next;
  });
}

// ===== 组树 =====
// mode='ym-user'（按时间）→ 年(2025/2026) → 月(1-12) → 员工（叶子，男女头像）
// mode='user-ym' （按姓名）→ 员工（男女头像）→ 年(2025/2026) → 月(1-12, 叶子)
export function buildTree(users, mode, exercises = [], labelOverrides = {}) {
  // 员工按中文姓名排序，两种分组模式下顺序一致
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name, 'zh'));

  let tree;
  if (mode === 'user-ym') {
    // 用户节点 children = 年月组 + 名下练习说明叶子
    tree = sorted.map((u) => ({
      ...userNode(u),
      children: [
        ...DEFAULT_YEARS.map((y) => ({
          id: `u-${u.id}-y-${y}`,
          label: `${y} 年`,
          meta: String(MONTHS.length),
          children: MONTHS.map((m) => ({
            id: `u-${u.id}-y-${y}-m-${m}`,
            label: `${m} 月`,
            icon: CalendarDays,
          })),
        })),
        ...exercises
          .filter((e) => e.userId === u.id)
          .map((e) => ({ id: `ex-${e.id}`, label: e.title, icon: FileText })),
      ],
    }));
  } else {
    tree = DEFAULT_YEARS.map((y) => ({
      id: `y-${y}`,
      label: `${y} 年`,
      meta: String(MONTHS.length),
      children: MONTHS.map((m) => ({
        id: `y-${y}-m-${m}`,
        label: `${m} 月`,
        icon: CalendarDays,
        meta: String(sorted.length),
        children: sorted.map((u) => userNode(u, exercises)),
      })),
    }));
  }
  return applyOverrides(tree, labelOverrides);
}
