/**
 * 航班信息字段区 —— 融合进顶部工具栏（无边框，与工具栏同属固定区）
 * 只保留可编辑字段（航班号/机型/起降机场在顶部标题已展示）
 */
/**
 * @param {Object} props
 * @param {Object} props.header       表头数据 { date, normalFlag, delayFlag, stand, ctot, landingTimeLocal, landingTimeUtc }
 * @param {Function} props.setHeaderField  设置字段
 * @param {Function} props.onLocalChange  落地时间本地端变化
 * @param {Function} props.onUtcChange    落地时间 UTC 端变化
 */
export default function FlightInfoCard({ header, setHeaderField, onLocalChange, onUtcChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2 sm:grid-cols-3 lg:grid-cols-6">
        {/* 日期 */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase text-slate-400">日期</label>
          <input
            className="input px-2 py-1 text-xs"
            type="date"
            value={header.date || ''}
            onChange={(e) => setHeaderField('date', e.target.value)}
          />
        </div>

        {/* 落地正常 (EOBT=COBT) */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase text-slate-400">落地正常 (EOBT=COBT)</label>
          <input
            className="input px-2 py-1 text-xs"
            type="text"
            value={header.normalFlag || ''}
            onChange={(e) => setHeaderField('normalFlag', e.target.value)}
          />
        </div>

        {/* 落地延误 (临界-15min) */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase text-slate-400">落地延误 (临界-15min)</label>
          <input
            className="input px-2 py-1 text-xs"
            type="text"
            value={header.delayFlag || ''}
            onChange={(e) => setHeaderField('delayFlag', e.target.value)}
          />
        </div>

        {/* 机位 */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase text-slate-400">机位</label>
          <input
            className="input px-2 py-1 text-xs"
            type="text"
            value={header.stand || ''}
            onChange={(e) => setHeaderField('stand', e.target.value)}
          />
        </div>

        {/* 起飞时间 CTOT */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase text-slate-400">起飞时间 (CTOT)</label>
          <input
            className="input px-2 py-1 text-xs"
            type="text"
            value={header.ctot || ''}
            onChange={(e) => setHeaderField('ctot', e.target.value)}
          />
        </div>

        {/* 落地时间（本地 / UTC 联动）跨 2 列 */}
        <div className="col-span-2">
          <label className="mb-1 block text-[10px] font-medium uppercase text-slate-400">落地时间（本地 / UTC 联动 · 东8区）</label>
          <div className="flex items-center gap-1.5">
            <input
              className="input flex-1 px-2 py-1 text-xs"
              title="本地时间（北京时间）"
              type="datetime-local"
              value={header.landingTimeLocal || ''}
              onChange={(e) => onLocalChange(e.target.value)}
            />
            <span className="text-[10px] text-slate-400">⇄</span>
            <input
              className="input flex-1 px-2 py-1 text-xs"
              title="UTC 时间"
              type="datetime-local"
              value={header.landingTimeUtc || ''}
              onChange={(e) => onUtcChange(e.target.value)}
            />
          </div>
        </div>
      </div>
  )
}