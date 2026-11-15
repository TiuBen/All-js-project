// src/pages/ScorePage.jsx - 评分扣分页：分组计次 + 得分自动计算 + 总体情况必填 + 提交转已办
// 对齐小程序评分页：五组扣分项，每项 分值 | 次数 −/＋，得分 = 100 − Σ(次数×分值) 最低 0
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useDictStore from '../store/dictStore';
import useTaskStore from '../store/taskStore';

export default function ScorePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { scoreGroups, loadDict } = useDictStore();
  const submitScore = useTaskStore((s) => s.submitScore);
  const [counts, setCounts] = useState({}); // { itemName: count }
  const [overall, setOverall] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDict().catch((e) => alert(e.message));
  }, []);

  const finalScore = useMemo(() => {
    let total = 0;
    scoreGroups.forEach((g) =>
      g.items.forEach((it) => {
        total += (counts[it.name] || 0) * it.score;
      })
    );
    return Math.max(0, 100 - total);
  }, [scoreGroups, counts]);

  function bump(name, delta) {
    setCounts((c) => ({ ...c, [name]: Math.max(0, (c[name] || 0) + delta) }));
  }

  async function handleSubmit() {
    if (!overall.trim()) return alert('请输入总体情况');
    setSubmitting(true);
    try {
      const payloadCounts = Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([name, count]) => ({ name, count }));
      await submitScore(id, { counts: payloadCounts, overall: overall.trim(), attachments: 0 });
      alert('提交成功，任务已转已办');
      nav('/workbench');
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold">评分扣分</h1>

      {/* 分组扣分项 */}
      <div className="space-y-4">
        {scoreGroups.map((g) => (
          <div key={g.name} className="card">
            <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold">
              {g.name}
            </div>
            <div className="divide-y divide-gray-50">
              {g.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="flex-1 text-sm leading-6">{it.name}</span>
                  <span className="w-10 text-center text-sm shrink-0">{it.score}</span>
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => bump(it.name, -1)}
                      className="w-7 h-7 rounded-full border border-danger text-danger text-sm hover:bg-danger/5"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{counts[it.name] || 0}</span>
                    <button
                      onClick={() => bump(it.name, 1)}
                      className="w-7 h-7 rounded-full bg-danger text-white text-sm hover:opacity-90"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {scoreGroups.length === 0 && (
          <div className="card py-16 text-center text-sm text-gray-300">评分字典加载中…</div>
        )}
      </div>

      {/* 得分 + 总体情况 */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm">最后得分</span>
          <span className="text-primary font-bold text-lg">{finalScore}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm">预览得分</span>
          <span className="text-primary font-bold">{finalScore}</span>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-sm mb-2">总体情况</div>
          <textarea
            value={overall}
            onChange={(e) => setOverall(e.target.value)}
            placeholder="请输入总体情况（必填）"
            className="w-full h-28 p-3 rounded-md bg-gray-50 border border-gray-200 text-sm outline-none focus:border-primary transition-colors resize-none placeholder:text-danger"
          />
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="text-sm">附件</span>
          <span className="text-xs text-gray-400">（拍照上传功能待接入）</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-md">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-11 rounded-md bg-success text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? '提交中…' : '提交'}
        </button>
        <button
          onClick={() => nav(-1)}
          className="h-11 rounded-md bg-amber-400 text-white text-sm hover:opacity-90 transition-opacity"
        >
          上一步
        </button>
      </div>
    </div>
  );
}
