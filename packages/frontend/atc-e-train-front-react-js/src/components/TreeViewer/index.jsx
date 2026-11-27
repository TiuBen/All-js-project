// src/components/TreeViewer/index.jsx - 树状视图（Windows 资源管理器风格）
//
// 特性：
// - 折叠/展开：点击行切换，chevron 旋转，文件夹图标随开合变化
// - 分组模式切换：顶部辅助按钮条（可选），如「年-月-用户 ↔ 用户-年-月」
//   按钮完全由外部受控（modes/mode/onModeChange），组件本身不关心分组语义
// - 节点结构：{ id, label, children?, icon?, meta?, data? }
//   有 children → 文件夹图标（可用 icon 覆盖），无 children → 叶子（FileText，可覆盖）
//   meta 显示在行尾（如子节点数量），data 携带原始数据随 onSelect 抛回
// - 右键菜单规则（整个组件区域一律屏蔽浏览器默认菜单）：
//   · 未配置 renderContextMenu：右键无任何菜单（只有屏蔽，不放行默认菜单）
//   · 配置了 renderContextMenu：右键节点行弹出该节点的菜单；空白处不弹（无节点目标）
//   · contextMenuRequiresSelect（默认 false）：true 时右键未选中的节点只先选中、不弹菜单，
//     再次右键（节点已是选中态）才弹出；false 则右键即选中并直接弹出
import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, UserRound } from 'lucide-react';

export default function TreeViewer({
  nodes = [],          // 树数据：[{ id, label, children?, icon?, meta?, data? }]
  selectedId,          // 当前选中叶子节点 id（受控）
  onSelect,            // 点击叶子回调 (node) => void
  modes,               // 模式切换按钮：[{ value, label }]，不传则不渲染按钮条
  mode,                // 当前模式（受控）
  onModeChange,        // 切换模式回调 (value) => void
  renderContextMenu,   // 右键菜单：(node, close) => JSX；不传则整个树区域右键无任何菜单
  contextMenuRequiresSelect = false, // true：右键未选中节点先只选中，再右键才弹菜单；false：右键即弹
  className = '',
}) {
  const [expanded, setExpanded] = useState({});
  // 右键菜单状态：{ x, y, node }；node 为右键所在行（同时会把该行置为选中）
  const [ctxMenu, setCtxMenu] = useState(null);

  // 节点集合变化（切换分组模式会整棵重建）时，默认展开第一层
  useEffect(() => {
    setExpanded(Object.fromEntries(nodes.map((n) => [n.id, true])));
  }, [nodes]);

  // 菜单打开时：点击任意处 / 再次右键 / Escape 关闭
  useEffect(() => {
    if (!ctxMenu) return undefined;
    const close = () => setCtxMenu(null);
    const onKey = (e) => e.key === 'Escape' && setCtxMenu(null);
    document.addEventListener('click', close);
    document.addEventListener('contextmenu', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('contextmenu', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [ctxMenu]);

  // 行右键：浏览器默认菜单由容器统一屏蔽，这里只负责「有配置时」弹出自定义菜单
  const openCtxMenu = (e, node) => {
    if (!renderContextMenu) return; // 未配置：无菜单（容器已 preventDefault，不出浏览器默认菜单）
    // 需要先选中模式：右键未选中节点时仅选中，不弹菜单
    if (contextMenuRequiresSelect && selectedId !== node.id) {
      e.preventDefault();
      e.stopPropagation();
      onSelect && onSelect(node);
      return;
    }
    e.preventDefault();
    e.stopPropagation(); // 防止 document 的关闭监听立刻把刚打开的菜单关掉
    if (!contextMenuRequiresSelect) onSelect && onSelect(node); // 右键即选中，菜单操作始终有「被选中的节点」
    setCtxMenu({ x: e.clientX, y: e.clientY, node });
  };

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // 人的节点：分男女的小头像（男蓝 / 女粉），替代文件夹图标
  const GenderAvatar = ({ gender }) => (
    <span
      className={
        'w-4 h-4 shrink-0 rounded-full flex items-center justify-center ' +
        (gender === 'female' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-600')
      }
    >
      <UserRound size={10} />
    </span>
  );

  const renderRow = (node, depth) => {
    const hasChildren = node.children && node.children.length > 0;
    const isOpen = !!expanded[node.id];
    const selected = selectedId === node.id;
    const isPerson = node.gender === 'male' || node.gender === 'female';
    const Icon = node.icon || (hasChildren ? (isOpen ? FolderOpen : Folder) : FileText);

    return (
      <div key={node.id}>
        <div
          onClick={() => (hasChildren ? toggle(node.id) : onSelect && onSelect(node))}
          onContextMenu={(e) => openCtxMenu(e, node)}
          className={
            'flex items-center gap-1.5 h-7 pr-2 cursor-pointer select-none text-sm transition-colors ' +
            (selected
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-gray-700 hover:bg-gray-100')
          }
          style={{ paddingLeft: 8 + depth * 16 }}
          title={node.label}
        >
          {/* chevron 占位：叶子也占同宽，保证图标列对齐 */}
          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={13} className="shrink-0 text-gray-400" />
            ) : (
              <ChevronRight size={13} className="shrink-0 text-gray-400" />
            )
          ) : (
            <span className="w-[13px] shrink-0" />
          )}
          {isPerson ? <GenderAvatar gender={node.gender} /> : <Icon size={14} className={selected ? 'shrink-0' : 'shrink-0 text-gray-400'} />}
          <span className="flex-1 truncate">{node.label}</span>
          {node.meta && <span className="text-[10px] text-gray-400 shrink-0">{node.meta}</span>}
        </div>
        {hasChildren && isOpen && node.children.map((c) => renderRow(c, depth + 1))}
      </div>
    );
  };

  return (
    <div
      className={'flex flex-col min-h-0 ' + className}
      onContextMenu={(e) => e.preventDefault()} // 整个组件区域一律屏蔽浏览器默认右键菜单
    >
      {/* 辅助按钮条：分组模式切换 */}
      {modes && modes.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-100">
          {modes.map((m) => {
            const MIcon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => onModeChange && onModeChange(m.value)}
                className={
                  'h-7 px-2 rounded text-xs flex items-center gap-1 transition-colors ' +
                  (mode === m.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                }
              >
                {MIcon && <MIcon size={12} />}
                {m.label}
              </button>
            );
          })}
        </div>
      )}
      {/* 树主体 */}
      <div className="flex-1 overflow-y-auto py-1">{nodes.map((n) => renderRow(n, 0))}</div>
      {/* 右键菜单（fixed 定位在鼠标处） */}
      {ctxMenu && renderContextMenu && (
        <div
          style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 50 }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {renderContextMenu(ctxMenu.node, () => setCtxMenu(null))}
        </div>
      )}
    </div>
  );
}
