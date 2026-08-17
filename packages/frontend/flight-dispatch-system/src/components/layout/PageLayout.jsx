/**
 * ============================================================
 * 页面级公共布局：左侧边栏 + 右侧内容（插槽）
 * ------------------------------------------------------------
 * 供「航班列表」「填写记录」等 Tab 页复用，保证：
 *   - 左侧边栏宽度统一（默认 360px，可调）
 *   - 边栏与内容间距统一（gap-3）
 *   - 视口高度固定（h-[calc(100vh-90px)]），不产生页面滚动
 *   - 左侧边栏超高时内部垂直滚动，右侧内容填满剩余空间
 *
 * 用法：
 *   <PageLayout sidebar={<左侧内容 />}>
 *     右侧内容（children）
 *   </PageLayout>
 * ============================================================
 */
export default function PageLayout({ sidebar, children, sidebarWidth = 360 }) {
  return (
    <div className="flex h-[calc(100vh-90px)] gap-3 overflow-hidden">
      {/* 左侧边栏：固定宽度、内部可滚动 */}
      <aside
        className="flex shrink-0 flex-col gap-3 overflow-y-auto"
        style={{ width: sidebarWidth }}
      >
        {sidebar}
      </aside>

      {/* 右侧内容区：填满剩余空间，由子组件自行控制内部滚动 */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
