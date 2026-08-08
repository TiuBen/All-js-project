/**
 * 检查单工作台 —— /checklist
 * 只展示草稿箱中的未完成检查单（供继续编辑）
 * 真正填写检查单跳转 /checklist/:flightId
 */
import { useNavigate } from 'react-router-dom'
import { useDraftStore } from '../../store/draftStore'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import DraftSection from './components/DraftSection'
import { Inbox, FileText, ChevronRight } from 'lucide-react'

export default function ChecklistSelectPage() {
  const navigate = useNavigate()
  const drafts = useDraftStore((s) => s.drafts)

  return (
    <div className="flex h-[calc(100vh-112px)] flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* 顶部标题 + 入口说明 */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Inbox size={20} className="text-amber-500" />
                检查单工作台
                {drafts.length > 0 && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {drafts.length} 份草稿
                  </span>
                )}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                选择下方草稿继续编辑；或从航班列表创建新的检查单
              </p>
            </div>
          </div>

          {/* 草稿区（无草稿时显示空状态） */}
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Inbox size={26} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">暂无未完成检查单</div>
                  <div className="mt-1 text-xs text-slate-400">
                    在航班列表点击"创建检查表"开始填写，会自动保存在草稿箱
                  </div>
                </div>
                <Button className="mt-2" onClick={() => navigate('/')}>
                  <FileText size={13} /> 前往航班列表
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DraftSection onContinue={(d) => navigate(`/checklist/${d.flightId}`)} />
          )}
        </div>
      </div>
    </div>
  )
}