// src/components/TreePane/index.jsx - 左侧树面板：card 包裹的 TreeViewer
// 供各页签子页面独立使用（每个页面自己的左树，不是跨页签共用一块）
// store: 传入 zustand store hook（trainSimulatorStore / trainTheoryStore），提供模式与选中状态
//        模拟机 store 还提供 exercises/labelOverrides（右键操作数据），参与树构建
// buildTree/modes: 对应 store 文件导出的分组函数与模式按钮配置（实现在 trainTree.js）
// renderContextMenu: 右键菜单插槽，透传给 TreeViewer（不传则无自定义菜单）
// 员工数据来自 PG user 表，统一走 userStore 拉取（全局一份，多面板共享不重复请求）
import { useEffect, useMemo } from 'react';
import TreeViewer from '../TreeViewer';
import useUserStore from '../../store/userStore';

export default function TreePane({ store, buildTree, modes, renderContextMenu, className = '' }) {
  const { mode, setMode, selectedId, select, exercises, labelOverrides } = store();
  const { users, loadUsers } = useUserStore();

  // 首次挂载拉取员工列表（loadUsers 内部已有数据也不会自动去重，靠 users.length 兜底）
  useEffect(() => {
    if (!users.length) loadUsers().catch(() => {}); // 拉取失败时树显示空骨架，不打断页面
  }, []);

  // exercises/labelOverrides 为可选数据（理论树 store 没有），buildTree 默认参数兜底
  const nodes = useMemo(
    () => buildTree(users, mode, exercises || [], labelOverrides || {}),
    [users, mode, exercises, labelOverrides]
  );

  return (
    <aside className={'w-64 shrink-0 card p-0 flex flex-col overflow-hidden ' + className}>
      <TreeViewer
        nodes={nodes}
        selectedId={selectedId}
        onSelect={(n) => select(n.id)}
        modes={modes}
        mode={mode}
        onModeChange={setMode}
        className="flex-1"
        renderContextMenu={renderContextMenu}
      />
    </aside>
  );
}
