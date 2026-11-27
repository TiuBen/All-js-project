// src/pages/train-theory/TheoryExerciseDatabase/QuestionList.jsx - 题目分页列表
// 右侧内容区：选中目录（含子目录）或全库的分页题目列表
// 后端 GET /api/theory-dbs 分页接口；题库为导入的只读数据，页面只展示不编辑
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { theoryDbApi } from '../../../api';
import useTheoryCategoryStore from '../../../store/theoryCategoryStore';

const PAGE_SIZE = 20;

// 题型中文徽标
const TYPE_LABEL = {
  SINGLE_CHOICE: { text: '单选', cls: 'bg-blue-50 text-blue-600' },
  MULTIPLE_CHOICE: { text: '多选', cls: 'bg-purple-50 text-purple-600' },
  FILL_BLANK: { text: '填空', cls: 'bg-teal-50 text-teal-600' },
  SHORT_ANSWER: { text: '问答', cls: 'bg-orange-50 text-orange-600' },
  TRUE_FALSE: { text: '判断', cls: 'bg-amber-50 text-amber-600' },
};

export default function QuestionList() {
  const { selectedNode } = useTheoryCategoryStore();
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ list: [], total: 0, page: 1, page_size: PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  const categoryId = selectedNode?.id || null;
  const title = selectedNode ? selectedNode.label : '全部题目';

  // 切换目录回第一页
  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  // 拉取当前页题目
  useEffect(() => {
    let alive = true;
    setLoading(true);
    theoryDbApi
      .list({ page, page_size: PAGE_SIZE, category_id: categoryId })
      .then((res) => {
        if (alive) setData(res); // axios 拦截器已解包出 data
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [categoryId, page]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 标题 + 总数 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText size={14} className="text-gray-400 shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">{title}</span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">共 {data.total} 题</span>
      </div>

      {/* 题目列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">加载中…</div>
        ) : data.list.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-300">
            该目录下暂无题目
          </div>
        ) : (
          <div className="space-y-2">
            {data.list.map((q, i) => {
              const t = TYPE_LABEL[q.type] || { text: q.type, cls: 'bg-gray-100 text-gray-500' };
              const no = (page - 1) * data.page_size + i + 1;
              return (
                <div key={q.id} className="rounded-md border border-gray-100 px-3 py-2 hover:bg-gray-50/60">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.cls}`}>{t.text}</span>
                    <span className="text-[11px] text-gray-400">
                      #{q.exam_no || no}
                      {q.category_name && ` · ${q.category_name}`}
                    </span>
                    <span className="ml-auto text-xs text-gray-500 shrink-0">
                      答案：<span className="text-gray-700 font-medium">{q.answer}</span>
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                    {q.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 分页条 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 shrink-0">
        <span className="text-xs text-gray-400">
          第 {data.page} / {totalPages} 页 · 每页 {data.page_size} 题
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={data.page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-7 px-2 rounded text-xs flex items-center gap-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={12} /> 上一页
          </button>
          <button
            disabled={data.page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-7 px-2 rounded text-xs flex items-center gap-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            下一页 <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
