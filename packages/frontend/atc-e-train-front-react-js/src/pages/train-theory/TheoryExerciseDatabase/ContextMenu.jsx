// src/pages/train-theory/TheoryExerciseDatabase/ContextMenu.jsx - 理论题库目录树右键菜单
// 操作：新建子级 / 新建同级 / 上移 / 下移 / 重命名 / 删除（全部落到 /api/theory-categories）
// 权限由后端强制兜底（tree_type 校验），菜单按节点类型动态控制只是交互引导：
//   执照题库（tree_type = LICENSE）：整棵子树只读，只显示只读提示，不提供任何写操作
//   地方题库根节点：仅可新建子级（根由系统固定，不提供同级/移动/改名/删除）
//   地方题库普通节点：六项操作全部可用（边界位置自动置灰上移/下移）
import {
  FolderPlus,
  CopyPlus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Lock,
} from 'lucide-react';
import { theoryCategoryApi } from '../../../api';
import useTheoryCategoryStore from '../../../store/theoryCategoryStore';

// 在嵌套树里定位节点：返回 { parent, siblings, index }（siblings 已按显示顺序排列）
function findInTree(nodes, id, parent = null) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { parent, siblings: nodes, index: i };
    if (nodes[i].children) {
      const found = findInTree(nodes[i].children, id, nodes[i]);
      if (found) return found;
    }
  }
  return null;
}

export default function ContextMenu({ node, onClose }) {
  const { tree, loadCategories, select } = useTheoryCategoryStore();
  // 树节点结构：{ id, label, children?, data }，data 里带原始字段（parent_id / sort_order / tree_type）
  const located = findInTree(tree, node.id);

  // ---- 权限判定（howto 方案：后端返回的节点已带 tree_type）----
  const data = node.data || {};
  const readOnly = data.tree_type === 'LICENSE'; // 执照题库整棵子树只读
  const isRoot = !data.parent_id; // 顶层根节点系统固定
  const canEdit = !readOnly && !isRoot; // 普通地方目录才有完整六项操作

  // 刷新树并把指定 id 的节点重新置为选中（节点被删则清空选中）
  const refresh = async (selectId = node.id) => {
    await loadCategories();
    const { tree: fresh } = useTheoryCategoryStore.getState();
    const found = selectId ? findInTree(fresh, selectId) : null;
    select(found ? found.siblings[found.index] : null);
  };

  const run = async (fn) => {
    try {
      await fn();
      await refresh();
    } catch (err) {
      if (err.message !== 'cancelled') alert(err.message || '操作失败');
    }
    onClose();
  };

  // ---- 新建子级：挂在当前节点下（tree_type 由后端继承，不传）----
  const createChild = () =>
    run(async () => {
      const name = window.prompt('新建子级目录名：', '新目录');
      if (!name) throw new Error('cancelled');
      await theoryCategoryApi.create({ name, parent_id: node.id });
    });

  // ---- 新建同级：与当前节点同一父目录，排在同级末尾 ----
  const createSibling = () =>
    run(async () => {
      const name = window.prompt('新建同级目录名：', '新目录');
      if (!name) throw new Error('cancelled');
      const parentId = located?.parent ? located.parent.id : null; // 普通节点必有父目录
      await theoryCategoryApi.create({ name, parent_id: parentId });
    });

  // ---- 上移/下移：同级重新编号 1..n，只提交顺序变化的节点 ----
  const move = (dir) =>
    run(async () => {
      if (!located) throw new Error('未找到节点位置');
      const to = located.index + dir;
      if (to < 0 || to >= located.siblings.length) return; // 已在边界，无操作
      const order = [...located.siblings];
      [order[located.index], order[to]] = [order[to], order[located.index]];
      for (let i = 0; i < order.length; i++) {
        if (order[i].data?.sort_order !== i + 1) {
          await theoryCategoryApi.update(order[i].id, { sort_order: i + 1 });
        }
      }
    });

  // ---- 重命名 ----
  const rename = () =>
    run(async () => {
      const name = window.prompt('重命名为：', node.label);
      if (!name || name === node.label) throw new Error('cancelled');
      await theoryCategoryApi.update(node.id, { name });
    });

  // ---- 删除（后端会拒绝执照题库/顶层根/有子目录或挂题目的节点） ----
  const removeNode = () =>
    run(async () => {
      if (!window.confirm(`确认删除「${node.label}」？`)) throw new Error('cancelled');
      await theoryCategoryApi.remove(node.id);
      await refresh(null); // 已删除，清空选中
    });

  // 菜单项通用样式
  const itemCls = (disabled, danger) =>
    'flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm w-full text-left ' +
    (disabled
      ? 'text-gray-300 cursor-not-allowed'
      : danger
        ? 'text-red-600 hover:bg-red-50 cursor-pointer'
        : 'text-gray-700 hover:bg-gray-100 cursor-pointer');

  const Item = ({ icon: Icon, label, disabled, danger, onClick }) => (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={itemCls(disabled, danger)}
    >
      <Icon size={13} className="shrink-0" />
      {label}
    </button>
  );

  const atFirst = !located || located.index === 0;
  const atLast = !located || located.index === located.siblings.length - 1;

  // 执照题库（含全部后代）：只读目录，不显示任何写操作
  if (readOnly) {
    return (
      <div className="w-44 py-1 bg-white rounded-md shadow-lg border border-gray-200 select-none">
        <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 cursor-not-allowed">
          <Lock size={13} className="shrink-0" />
          执照题库 · 只读目录
        </div>
      </div>
    );
  }

  // 地方题库根节点：仅可新建子级，其余操作因根目录系统固定而置灰
  if (isRoot) {
    return (
      <div className="w-44 py-1 bg-white rounded-md shadow-lg border border-gray-200 select-none">
        <Item icon={FolderPlus} label="在当前层级新建子级" onClick={createChild} />
        <div className="my-1 border-t border-gray-100" />
        <Item icon={CopyPlus} label="在当前层级新建同级" disabled />
        <div className="my-1 border-t border-gray-100" />
        <Item icon={ArrowUp} label="选中节点上移" disabled />
        <Item icon={ArrowDown} label="选中节点下移" disabled />
        <div className="my-1 border-t border-gray-100" />
        <Item icon={Pencil} label="重命名" disabled />
        <Item icon={Trash2} label="删除此节点" danger disabled />
      </div>
    );
  }

  // 地方题库普通节点：六项操作，按同级边界置灰上移/下移
  return (
    <div className="w-44 py-1 bg-white rounded-md shadow-lg border border-gray-200 select-none">
      <Item icon={FolderPlus} label="在当前层级新建子级" onClick={createChild} />
      <Item icon={CopyPlus} label="在当前层级新建同级" onClick={createSibling} />
      <div className="my-1 border-t border-gray-100" />
      <Item icon={ArrowUp} label="选中节点上移" disabled={atFirst} onClick={() => move(-1)} />
      <Item icon={ArrowDown} label="选中节点下移" disabled={atLast} onClick={() => move(1)} />
      <div className="my-1 border-t border-gray-100" />
      <Item icon={Pencil} label="重命名" onClick={rename} />
      <Item icon={Trash2} label="删除此节点" danger onClick={removeNode} />
    </div>
  );
}
