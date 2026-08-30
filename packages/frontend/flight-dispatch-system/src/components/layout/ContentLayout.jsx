/**
 * ============================================================
 * ContentLayout —— 页面内容区布局（左侧边栏 + 右侧内容，插槽）
 * ------------------------------------------------------------
 * 供「航班列表」「填写记录」等页面复用：
 *   - sidebar 为**可选**：不传则内容全宽（无侧栏的页面直接用）
 *   - 左侧边栏宽度统一（默认 360px，可调）
 *   - 边栏与内容间距统一（gap-3）
 *   - 视口高度固定（h-[calc(100vh-90px)]），不产生页面滚动
 *   - 左侧边栏超高时内部垂直滚动，右侧内容填满剩余空间
 *
 * 用法：
 *   <ContentLayout sidebar={<Sidebar />}>右侧内容</ContentLayout>   // 有侧栏
 *   <ContentLayout>纯内容页</ContentLayout>                          // 无侧栏
 * ============================================================
 */
export default function ContentLayout({ sidebar, children, sidebarWidth = 360 }) {
    return (
        <div className="flex flex-1  gap-2 overflow-hidden">
            {/* 左侧边栏：可选；固定宽度、内部可滚动 */}
            {sidebar != null && (
                <aside className="flex shrink-0 flex-col gap-3 overflow-y-auto" style={{ width: sidebarWidth }}>
                    {sidebar}
                </aside>
            )}

            {/* 右侧内容区：填满剩余空间，由子组件自行控制内部滚动 */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
    );
}
