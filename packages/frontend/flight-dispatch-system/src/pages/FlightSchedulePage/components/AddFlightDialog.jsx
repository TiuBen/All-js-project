import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import FlightNoInput from "../../../components/ui/FlightNoInput";
import { Loader2, X, Plane } from "lucide-react";

/**
 * 添加 / 修改航班对话框 —— 字段对齐 fips 表数据项
 * 时间字段为本地时间输入，标题标注（LOC 时间）
 * 布局：基础信息 + 时间信息（LOC）两个分区，两列紧凑排列
 *
 * @param {Object} props
 * @param {boolean} props.open      是否显示
 * @param {Object|null} props.initial 编辑模式：传入 manual_fips 行（snake_case）；null=新增
 * @param {Function} props.onClose  关闭回调
 * @param {Function} props.onSaved  保存成功回调（可在此刷新列表）
 */

// 基础信息（普通输入）
// uppercase: alpha=仅大写字母 A-Z（起飞/目的/落地站）；alnum=大写字母+数字 A-Z0-9（走廊口/停机位）
const BASE_FIELDS = [
  { key: "task", label: "任务" },
  { key: "flightNo", label: "航班号", required: true },
  { key: "checklistCategory", label: "航班类别", select: true, options: null }, // 货运/客运，决定检查单模板
  { key: "originStation", label: "起飞站", uppercase: "alpha" },
  { key: "destStation", label: "目的站", uppercase: "alpha" },
  { key: "landingStation", label: "落地站", uppercase: "alpha" },
  { key: "corridor", label: "走廊口", uppercase: "alnum" },
  { key: "runway", label: "跑道", select: true, options: null }, // 四选一：01L/01R/19L/19R
  { key: "stand", label: "停机位", uppercase: "alnum" },
  { key: "aircraftType", label: "机型", required: true, select: true, options: null }, // 机型必填：自动计算时间依赖
];

// 航班类别选项（决定检查单模板：货运 → cargo-checklist / 客运 → passenger-checklist）
const CHECKLIST_CATEGORY_OPTIONS = [
  { value: "货运航班", label: "货运航班" },
  { value: "客运航班", label: "客运航班" },
];
const DEFAULT_CHECKLIST_CATEGORY = "货运航班";

// 机型选项（值对齐模板 variables.aircraftType.options 风格，显示带中文标注）
const AIRCRAFT_TYPE_OPTIONS = [
  { value: "B747", label: "747" },
  { value: "B787", label: "787" },
  { value: "B777", label: "777" },
  { value: "B767", label: "767（330）" },
  { value: "B757", label: "757", default: true },
  { value: "B737", label: "737（320）" },
];
const DEFAULT_AIRCRAFT_TYPE = AIRCRAFT_TYPE_OPTIONS.find((o) => o.default)?.value || "B757";

// 跑道选项（仅 01L / 01R / 19L / 19R 四选一）
const RUNWAY_OPTIONS = [
  { value: "", label: "选择跑道" },
  { value: "01L", label: "01L" },
  { value: "01R", label: "01R" },
  { value: "19L", label: "19L" },
  { value: "19R", label: "19R" },
];

// 输入同步修正：强制大写，并按模式过滤（alpha=仅 A-Z；alnum=A-Z0-9）
const normalizeUpper = (raw, mode) => {
  const upper = String(raw ?? "").toUpperCase();
  return mode === "alpha" ? upper.replace(/[^A-Z]/g, "") : upper.replace(/[^A-Z0-9]/g, "");
};

// 大写约束输入框（输入时同步修正）
function UppercaseField({ value, onChange, mode }) {
  return (
    <input
      className="input w-full px-2 py-1 text-xs"
      value={value}
      onChange={(e) => onChange(normalizeUpper(e.target.value, mode))}
    />
  );
}

// 时间信息（LOC 本地时间）
const TIME_FIELDS = [
  { key: "inOutTime", label: "进/出时间" },
  { key: "sobt", label: "计划起飞 SOBT" },
  { key: "eobt", label: "预计起飞 EOBT" },
  { key: "atot", label: "实际起飞 ATOT" },
  { key: "sibt", label: "过走廊口 SIBT" },
  { key: "eldt", label: "预计落地 ELDT" },
  { key: "aldt", label: "实际落地 ALDT" },
];

const EMPTY_FORM = Object.fromEntries(
  [...BASE_FIELDS, ...TIME_FIELDS].map((f) => {
    if (f.key === "aircraftType") return [f.key, DEFAULT_AIRCRAFT_TYPE];
    if (f.key === "checklistCategory") return [f.key, DEFAULT_CHECKLIST_CATEGORY];
    return [f.key, ""];
  })
);

// snake_case 行 → camelCase 表单（编辑模式初始化）
const rowToForm = (row) => ({
  task: row?.task || "",
  flightNo: row?.flight_no || "",
  checklistCategory: row?.checklist_category || DEFAULT_CHECKLIST_CATEGORY,
  originStation: row?.origin_station || "",
  destStation: row?.dest_station || "",
  landingStation: row?.landing_station || "",
  inOutTime: row?.in_out_time || "",
  sobt: row?.sobt || "",
  eobt: row?.eobt || "",
  atot: row?.atot || "",
  sibt: row?.sibt || "",
  eldt: row?.eldt || "",
  aldt: row?.aldt || "",
  corridor: row?.corridor || "",
  runway: row?.runway || "",
  stand: row?.stand || "",
  aircraftType: row?.aircraft_type || DEFAULT_AIRCRAFT_TYPE,
});

export default function AddFlightDialog({ open, onClose, onSaved, initial = null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 打开时初始化表单：编辑模式回填 / 新增模式清空
  useEffect(() => {
    if (open) {
      setForm(initial ? rowToForm(initial) : EMPTY_FORM);
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  // 通用字段更新（航班号大写/过滤由 FlightNoInput 组件负责）
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const reset = () => {
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.flightNo.trim()) {
      setError("请填写航班号");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { manualFipsApi } = await import("../../../api");
      if (initial?.id != null) {
        await manualFipsApi.update(initial.id, form); // 编辑
      } else {
        await manualFipsApi.create(form); // 新增
      }
      reset();
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (f) => (
    <div key={f.key}>
      <label className="mb-1 block text-[11px] font-medium text-slate-500">
        {f.label}
        {f.required && <span className="text-red-500"> *</span>}
        {f.key === "aircraftType" && (
          <span className="ml-1 text-[10px] text-amber-600">（自动计算时间依赖）</span>
        )}
      </label>
      {/* 航班号用专用组件：强制大写、仅 A-Z0-9（中文/符号不显示） */}
      {f.key === "flightNo" ? (
        <FlightNoInput
          className="w-full px-2 py-1 text-xs"
          value={form.flightNo}
          onChange={(v) => setForm((s) => ({ ...s, flightNo: v }))}
        />
      ) : f.select ? (
        /* 下拉：航班类别 / 跑道 / 机型（options 按字段 key 选择） */
        <select
          className="input w-full px-2 py-1 text-xs"
          value={form[f.key]}
          onChange={set(f.key)}
        >
          {(
            f.key === "checklistCategory"
              ? CHECKLIST_CATEGORY_OPTIONS
              : f.key === "runway"
                ? RUNWAY_OPTIONS
                : AIRCRAFT_TYPE_OPTIONS
          ).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : f.uppercase ? (
        /* 大写约束：起飞/目的/落地站（字母）/ 走廊口、停机位（字母+数字） */
        <UppercaseField
          value={form[f.key]}
          onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
          mode={f.uppercase}
        />
      ) : (
        <input
          className="input w-full px-2 py-1 text-xs"
          type={f.type || "text"}
          placeholder={f.placeholder || ""}
          value={form[f.key]}
          onChange={set(f.key)}
        />
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={handleClose}
      onKeyDown={(e) => e.key === "Escape" && handleClose()}
    >
      <div
        className="max-h-[92vh] w-[620px] max-w-full overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800">
            <Plane size={16} className="text-primary-600" />
            {initial?.id != null ? "修改航班" : "添加航班"}
            <span className="text-xs font-normal text-slate-400">（字段对齐 fips 表）</span>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 表单 */}
        <div className="max-h-[70vh] space-y-4 overflow-auto px-5 py-4">
          {/* 分区一：基础信息 */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="h-3.5 w-1 rounded bg-primary-500" />
              基础信息
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3">
              {BASE_FIELDS.map(renderField)}
            </div>
          </div>

          {/* 分区二：时间信息（LOC） */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="h-3.5 w-1 rounded bg-amber-500" />
              时间信息（LOC 本地时间）
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3">
              {TIME_FIELDS.map((f) =>
                renderField({
                  ...f,
                  type: "datetime-local",
                  placeholder: "本地时间",
                })
              )}
            </div>
          </div>

          {error && (
            <div className="rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">{error}</div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <Button variant="outline" size="sm" onClick={handleClose}>
            取消
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Plane size={14} />}
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
