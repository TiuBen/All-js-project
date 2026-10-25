import { useRef } from "react";
import { Check, UserRound, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../utils/cn";
import { useAppStore } from "../store/app.store";

/**
 * 用户花名册（本地 mock）—— 后端接口好了之后，把这份换成接口返回的
 * **同形状**数组即可（字段别改名）：
 *   id       后端主键（列表的 React key）—— ★ 与库里 user 表的 id 一致
 *            （建表时按这份花名册显式灌的 0..39），切换用户 / 提交检查单的
 *            currentUserId 都直接用它
 *   username 姓名（当前用户就用它，落在 app.store 的 currentUser）
 *   team     班组号（0 / 1 / 2）—— 现在只是卡片角标，留给后续排班/筛选
 * ⚠️ 原始接口还给了 rank / position[]（席位 + dutyType + roleType 教员标记），
 *    当前用不上，已按要求剔掉。
 */
const USERS = [
    { id: 0, username: "巴富毅", team: 0 },
    { id: 1, username: "刘琦", team: 0 },
    { id: 2, username: "姜文夫", team: 2 },
    { id: 3, username: "董志华", team: 1 },
    { id: 4, username: "金鼎", team: 1 },
    { id: 5, username: "徐万友", team: 1 },
    { id: 6, username: "马莲花", team: 1 },
    { id: 7, username: "李秋实", team: 1 },
    { id: 8, username: "明嘉", team: 1 },
    { id: 9, username: "温若春", team: 1 },
    { id: 10, username: "张虎", team: 1 },
    { id: 11, username: "李明", team: 1 },
    { id: 12, username: "刘国莲", team: 1 },
    { id: 13, username: "周岸", team: 1 },
    { id: 14, username: "杜涛", team: 1 },
    { id: 15, username: "张笑延", team: 1 },
    { id: 16, username: "耿若岩", team: 1 },
    { id: 17, username: "张文中", team: 1 },
    { id: 18, username: "詹泽彬", team: 1 },
    { id: 19, username: "朱永春", team: 2 },
    { id: 20, username: "郭永杰", team: 1 },
    { id: 21, username: "吴疆", team: 2 },
    { id: 22, username: "边昊", team: 2 },
    { id: 23, username: "胡鑫", team: 2 },
    { id: 24, username: "黄恩", team: 2 },
    { id: 25, username: "叶大鹏", team: 2 },
    { id: 26, username: "张宗根", team: 2 },
    { id: 27, username: "潘伟生", team: 2 },
    { id: 28, username: "王建超", team: 2 },
    { id: 29, username: "王风瑞", team: 2 },
    { id: 30, username: "邓心豪", team: 2 },
    { id: 31, username: "蔡昊霖", team: 2 },
    { id: 32, username: "严亮", team: 2 },
    { id: 33, username: "宋天霖", team: 2 },
    { id: 34, username: "沈宁", team: 2 },
    { id: 35, username: "蓝宇航", team: 2 },
    { id: 36, username: "郑文卓", team: 1 },
    { id: 39, username: "程卓", team: 1 },
    { id: 38, username: "蒋露裕", team: 2 },
    { id: 37, username: "陈宏伟", team: 2 },
];

/**
 * ============================================================
 * SwitchUserDialog —— 切换用户（右上角「用户按钮 + 弹窗」一体）
 * ------------------------------------------------------------
 * 只干一件事：从花名册里挑一个人作为「当前用户」，结果写进 app.store 的
 * currentUser，**同时往 user_login_log 记一笔**（谁、什么时候登录 / 登出）。
 *
 * ★ 一趟「切人」= 两个请求，顺序不能反：
 *     logout()  先给**上一场**盖上 logout_time（app.store 拿 loginLogId 找行）
 *     login(新) 再插新的一行，把返回的 id 存成新的 loginLogId
 *   所以 loginLogId 必须活着 —— 它随 store 落 localStorage，刷新页面不丢。
 *
 * ★ 登录日志只是**台账**：写不进去（后端没起 / 断网）也不该拦着人干活 ——
 *   所以下面的 switchTo 里失败只 console.warn + 本地照切。
 *   唯一例外是显式点「登出」：那是用户明确要的动作，失败了得吭一声（alert）。
 *
 * ★ 用**浏览器原生 `<dialog>` 元素**（`showModal()`），不自己搭遮罩层：
 *   ::backdrop、Esc 关闭、焦点锁在弹窗内、背景 inert、真实 top-layer
 *   （不受任何 z-index / transform / 父级 overflow 影响）全是浏览器白送的。
 * ★ 开关状态**就住在 DOM 里**（`el.open`），不另开一个 useState：
 *   打开 = `showModal()`，关闭 = `close()`，Esc / 点遮罩由浏览器自己关。
 *   少一份和 `el.open` 会对不上的 React 状态，也就没有「谁是真源」的问题。
 * ⚠️ 两个原生坑：
 *   ① 已打开的 dialog 再 `showModal()` 会抛错 → 先判 `el.open`；
 *   ② 作者样式里的 `display` 会盖掉 UA 的 `dialog:not([open]){display:none}`
 *      → 所以 display 写成 `open:flex`（只在 [open] 时才 flex），
 *      直接写 `flex` 会让关着的弹窗也显示出来。
 * ★ 确认用**浏览器原生 `window.confirm`**（切换是低频动作，够了，省一套弹窗）。
 * ★ 花名册只有 id / username / team（就在本文件顶部），所以卡片是一行
 *   姓名 + 班组角标；人不多，**不做搜索、不做过滤**，直接铺开。
 * ============================================================
 */
export default function SwitchUserDialog() {
    const dialogRef = useRef(null);
    const currentUser = useAppStore((s) => s.currentUser);
    const setCurrentUser = useAppStore((s) => s.setCurrentUser);
    const login = useAppStore((s) => s.login);
    const logout = useAppStore((s) => s.logout);

    // 开关就调原生 API：open 属性就是唯一真源，不用再拿 state 跟它对齐
    const openDialog = () => {
        const el = dialogRef.current;
        if (el && !el.open) el.showModal();
    };
    const closeDialog = () => dialogRef.current?.close();

    /**
     * 记流水 + 切人：先登出上一场，再登进新的一场
     * ⚠️ 两步各自 try/catch —— 登出失败不该连带把新的一场也丢掉。
     *    台账写不进去时本地照样切（setCurrentUser 兜底），控制台留痕。
     * ★ 登录成功路径：currentUserId 由 app.store.login 从返回行里取（后端按名字解析）；
     *   兜底路径：直接用花名册的 user.id（与库里 user 表 id 一致）。
     */
    const switchTo = async (user) => {
        try {
            await logout();
        } catch (err) {
            console.warn("[登录日志] 上一场的登出时间没记上：", err.message);
        }
        try {
            await login(user.username);
        } catch (err) {
            console.warn("[登录日志] 本次登录没记上，本地照切：", err.message);
            setCurrentUser(user.username, user.id);
        }
    };

    const handlePick = async (user) => {
        // 点的就是当前用户 = 没有变化，直接关掉，不弹确认
        if (user.username === currentUser) {
            closeDialog();
            return;
        }
        if (!window.confirm(`确定切换到「${user.username}」吗？`)) return;
        closeDialog(); // 先关弹窗再发请求：不让人对着一个卡住的弹窗等
        await switchTo(user);
    };

    // 显式登出：盖 logout_time + 清掉当前用户
    const handleLogout = async () => {
        if (!window.confirm(`确定登出「${currentUser}」吗？`)) return;
        closeDialog();
        try {
            await logout();
        } catch (err) {
            // 这一条是用户主动点的，失败得让他知道（会话保留，还能再点一次）
            window.alert(`登出没能记上：${err.message}`);
        }
    };

    // 点 ::backdrop 时没有对应 DOM 节点，事件目标就是 <dialog> 自己；
    // 卡片内部任何一处命中的都是子元素 —— 据此判断「点了外面」
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) closeDialog();
    };

    // 1. 按 team 分组
    const groupedUsers = USERS.reduce((acc, user) => {
        acc[user.team] = acc[user.team] || [];
        acc[user.team].push(user);
        return acc;
    }, {});

    return (
        <>
            {/* 入口按钮：显示当前用户，点开选人 */}
            <button
                onClick={openDialog}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                title="切换当前用户"
                aria-label="切换当前用户"
            >
                <UserRound size={16} />
                <span className="max-w-[6rem] truncate">{currentUser || "选择用户"}</span>
            </button>

            {/* 弹窗本体：inset-0 + m-auto 让它在视口居中（UA 的 dialog:modal 默认就是这样，
                写出来免得依赖浏览器默认样式）；open:flex 见文件头注释 ② */}
            <dialog
                ref={dialogRef}
                aria-label="切换用户"
                onClick={handleBackdropClick}
                className="inset-0 m-auto h-fit max-h-[85vh] w-[720px] max-w-[calc(100vw_-_2rem)] flex-col overflow-hidden rounded-xl bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/50 open:flex"
            >
                {/* 头部：标题 + 当前用户 */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                        <UserRound size={16} className="text-primary-600" />
                        切换用户
                        <span className="text-xs font-normal text-slate-500">
                            当前：
                            <span className="font-medium text-primary-700">{currentUser || "未选择"}</span>
                        </span>
                    </div>
                    <button
                        onClick={closeDialog}
                        className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="关闭"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 用户网格：人名多、信息少 → 用密一点的 chip 网格，比大卡片好扫 */}
                <div className="flex-1 overflow-auto px-4 py-2">
                    {Object.entries(groupedUsers)
                        .sort(([a], [b]) => a - b) // 按 team 编号排序
                        .map(([teamId, teamUsers]) => (
                            <div key={teamId} className="mb-2 ">
                                <div className="grid  gap-1.5 sm:grid-cols-4 md:grid-cols-6 ">
                                    {teamUsers.map((user) => {
                                        const active = user.username === currentUser;
                                        return (
                                            <button
                                                key={user.id}
                                                onClick={() => handlePick(user)}
                                                title={user.username}
                                                className={cn(
                                                    "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
                                                    active
                                                        ? "border-primary-400 bg-primary-50 ring-1 ring-primary-100"
                                                        : "border-slate-100 bg-white hover:border-primary-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "truncate text-sm ",
                                                        active ? "text-primary-500 font-semibold" : "text-slate-700"
                                                    )}
                                                >
                                                    {user.username}
                                                </span>

                                                {active && (
                                                    <Check size={14} className="ml-auto shrink-0 text-primary-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                </div>

                {/* 底部：条数 + 登出 / 关闭 */}
                <div className="flex items-center justify-end border-t border-slate-100 px-5 py-2.5">
                    <div className="flex items-center gap-2">
                        {/* 有当前用户才给登出入口（登出 = 盖上 logout_time 并清空当前用户） */}
                        {currentUser && (
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                登出
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={closeDialog}>
                            关闭
                        </Button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
