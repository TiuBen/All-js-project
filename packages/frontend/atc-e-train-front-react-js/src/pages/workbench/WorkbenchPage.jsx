// src/pages/workbench/WorkbenchPage.jsx - 工作台：Outlook 式日历布局
// 左侧堆叠两个 mini-calendar（上一月 + 当前查看月），右侧 full-calendar 月视图
// 待办/已办任务作为事件 chip 展示在对应日期格子里，点击 chip 进入任务详情
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Plus, CalendarDays, BookOpen } from "lucide-react";
import Calendar from "../../components/Calendar";
import NewTaskDialog from "./Dialog/NewTaskDialog";
import useTaskStore from "../../store/taskStore";

export default function Workbench() {
    const nav = useNavigate();
    const { todos, done, loadWorkbench } = useTaskStore();
    const [viewMonth, setViewMonth] = useState(dayjs().startOf("month")); // full 日历查看的月份
    const [selected, setSelected] = useState(dayjs());
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadWorkbench().catch((e) => alert(e.message));
    }, []);

    // 任务 → 日历事件：优先用 start_time，没有就用 created_at
    const events = useMemo(
        () =>
            todos.concat(done).map((t) => ({
                date: t.start_time || t.created_at,
                label: t.title,
                taskId: t.id,
                onClick: () => nav(`/tasks/${t.id}`),
            })),
        [todos, done]
    );

    // mini 日历堆叠：查看月的上一月 + 查看月（对齐 Outlook 左栏）
    const miniMonths = [viewMonth.subtract(1, "month"), viewMonth];

    return (
        <div className="flex gap-2  flex-1 border h-full">
            {/* ---------- 左栏：mini 日历堆叠 ---------- */}
            <aside className="w-52 shrink-0 flex flex-col gap-2">
                {miniMonths.map((m) => (
                    <div key={m.format("YYYY-MM")} className="card p-2">
                        <Calendar
                            mode="mini"
                            month={m}
                            onMonthChange={setViewMonth}
                            selected={selected}
                            onSelect={(d) => {
                                setSelected(d);
                                setViewMonth(d.startOf("month"));
                            }}
                            showGrid={false}
                        />
                    </div>
                ))}

                {/* 新建入口（原底部双按钮迁移到这里） */}
                <div className="mt-2 space-y-2">
                    <button
                        onClick={() => setDialogOpen(true)}
                        className="w-full h-9 px-3 rounded-md bg-primary text-white text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                        <Plus size={15} />
                        新建任务
                    </button>
                    <button
                        onClick={() => nav("/simulator-form")}
                        className="w-full h-9 px-3 rounded-md bg-danger text-white text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                        <CalendarDays size={15} />
                        模拟机培训/考核
                    </button>
                    <button
                        onClick={() => nav("/theory-form")}
                        className="w-full h-9 px-3 rounded-md bg-success text-white text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                        <BookOpen size={15} />
                        理论培训
                    </button>
                </div>
            </aside>

            {/* ---------- 右侧：full 日历 ---------- */}
            <section className="flex-1 min-w-0 flex flex-col card ">
                <Calendar
                    mode="full"
                    month={viewMonth}
                    onMonthChange={setViewMonth}
                    selected={selected}
                    onSelect={setSelected}
                    events={events}
                    showGrid={true}
                    className="flex-1"
                />
            </section>

            {/* 新建任务弹窗（原生 dialog） */}
            <NewTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </div>
    );
}
