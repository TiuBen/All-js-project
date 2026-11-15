// src/pages/workbench/Workbench.jsx - 工作台：待办/已办/消息/反馈四 tab + 搜索 + 横幅
// 对齐小程序工作台：底部双按钮在后台里放为页头右侧操作按钮
// 页面占满 main 剩余高度：根节点 h-full 纵向 flex，列表区 flex-1 内部滚动
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import useTaskStore from '../../store/taskStore';

const TABS = [
  { key: 'todo', name: '待办任务' },
  { key: 'done', name: '已办任务' },
  { key: 'msg', name: '消息提醒' },
  { key: 'feedback', name: '反馈记录' },
];

export default function Workbench() {
  const nav = useNavigate();
  const { todos, done, messages, feedbacks, stats, loadWorkbench } = useTaskStore();
  const [active, setActive] = useState('todo');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadWorkbench().catch((e) => alert(e.message));
  }, []);

  // 关键词前端过滤（列表已一次拉全，量小无需再请求后端）
  const filter = (list) =>
    keyword.trim()
      ? list.filter((it) => (it.title || '').includes(keyword.trim()))
      : list;

  const listMap = {
    todo: filter(todos),
    done: filter(done),
    msg: filter(messages),
    feedback: filter(feedbacks),
  };
  const list = listMap[active];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 页头：标题 + 新建入口 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">工作台</h1>
        <div className="flex gap-3">
          <button
            onClick={() => nav('/simulator-form')}
            className="h-9 px-4 rounded-md bg-danger text-white text-sm hover:opacity-90 transition-opacity"
          >
            ＋ 模拟机培训/考核
          </button>
          <button
            onClick={() => nav('/theory-form')}
            className="h-9 px-4 rounded-md bg-success text-white text-sm hover:opacity-90 transition-opacity"
          >
            ＋ 理论培训
          </button>
        </div>
      </div>

      {/* 月/年度报告横幅 */}
      <Link
        to="/profile"
        className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-md px-4 py-3 text-amber-600 text-sm hover:bg-amber-100 transition-colors"
      >
        点击此处生成月/年度报告/在个人信息页面生成
        <span>›</span>
      </Link>

      {/* Tab + 搜索 */}
      <div className="card flex items-center px-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={
              'relative px-4 h-12 text-sm transition-colors ' +
              (active === t.key
                ? 'text-primary font-semibold'
                : 'text-gray-500 hover:text-gray-800')
            }
          >
            {t.name}
            {stats[t.key] > 0 && (
              <span className="ml-1 min-w-5 h-4.5 px-1.5 inline-flex items-center rounded-full bg-danger text-white text-[11px]">
                {stats[t.key]}
              </span>
            )}
            {active === t.key && (
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-10 h-0.5 rounded bg-primary" />
            )}
          </button>
        ))}
        <div className="ml-auto pr-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="请输入搜索关键词"
            className="w-64 h-9 px-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* 列表（占据剩余高度，超出部分内部滚动） */}
      <div className="card divide-y divide-gray-100 flex-1 min-h-0 overflow-y-auto">
        {list.map((it) => (
          <div
            key={it.id}
            onClick={() => active === 'todo' && nav(`/tasks/${it.id}`)}
            className={
              'px-5 py-4 flex items-center justify-between gap-4 ' +
              (active === 'todo' ? 'cursor-pointer hover:bg-gray-50 transition-colors' : '')
            }
          >
            <div className="min-w-0">
              <div className="text-sm leading-6 line-clamp-2">{it.title}</div>
              <div className="mt-1 text-xs text-gray-400">
                {dayjs(it.created_at || it.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            {active === 'todo' && (
              <div className="shrink-0 flex gap-2">
                <span className="text-xs text-gray-400">{it.status === 'todo' ? '待评分' : ''}</span>
                <span className="text-primary text-sm">›</span>
              </div>
            )}
            {active === 'done' && (
              <span className="shrink-0 text-sm text-gray-400">
                得分 {it.score ?? '-'} · {dayjs(it.finished_at || it.finishedAt).format('MM-DD HH:mm')}
              </span>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <div className="py-20 text-center text-sm text-gray-300">暂无内容</div>
        )}
      </div>
    </div>
  );
}
