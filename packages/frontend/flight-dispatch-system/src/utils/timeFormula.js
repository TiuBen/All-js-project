import dayjs from "dayjs";

/**
 * ============================================================
 * 检查单模板 v3 时间公式求值器（timeFormula）
 * ------------------------------------------------------------
 * 模板（schemaVersion 3.0-test）的节点 formula 结构：
 *   - { type: "ref", target: "var", ref: "actualLanding" }       变量引用（时间）
 *   - { type: "ref", target: "event", ref: "E002", time: "actual" } 参照节点事件（时间）
 *   - { type: "literal", value: 10, unit: "minutes" }              字面量（分钟）
 *   - { type: "lookup", param: "UNLOAD_TIME", key: { ref 机型 } }  机型参数表查询（分钟）
 *   - { type: "binary", operator: "+"|"-", left, right }           二元运算（时间±分钟 / 分钟±分钟）
 *
 * 求值结果统一为 { ok, kind: "time"|"minutes", value, reason }
 *   - kind=time：value 为 "HH:mm"（本地时间）
 *   - kind=minutes：value 为分钟数
 * ============================================================
 */

/** 时间归一：完整 datetime 或 HH:mm → dayjs 对象（当天补全） */
function toDayjs(v) {
  const s = String(v).trim();
  if (!s) return null;
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    // 纯 HH:mm → 拼当天日期，保证计算跨天正确
    return dayjs(dayjs().format("YYYY-MM-DD") + "T" + s);
  }
  const d = dayjs(s);
  return d.isValid() ? d : null;
}

function evalNode(node, ctx) {
  if (!node) return { ok: false, kind: null, value: null, reason: "无公式" };
  switch (node.type) {
    case "ref": {
      if (node.target === "var") {
        const v = ctx.vars?.[node.ref];
        if (v == null || String(v).trim() === "") {
          const name = ctx.varName?.(node.ref) || node.ref;
          return { ok: false, kind: null, value: null, reason: `需先填写「${name}」` };
        }
        const t = toDayjs(v);
        if (!t) return { ok: false, kind: null, value: null, reason: `「${node.ref}」时间无效` };
        return { ok: true, kind: "time", value: t.format("HH:mm") };
      }
      if (node.target === "event") {
        const t = ctx.getEventTime?.(node.ref);
        if (t == null || String(t).trim() === "") {
          const name = ctx.eventName?.(node.ref) || node.ref;
          return { ok: false, kind: null, value: null, reason: `需先填写「${name}」` };
        }
        const d = toDayjs(t);
        if (!d) return { ok: false, kind: null, value: null, reason: "参照时间无效" };
        return { ok: true, kind: "time", value: d.format("HH:mm") };
      }
      return { ok: false, kind: null, value: null, reason: "未知引用类型" };
    }
    case "literal":
      return { ok: true, kind: "minutes", value: Number(node.value) || 0, reason: "" };
    case "lookup": {
      const ac = ctx.vars?.aircraftType;
      const minutes = ctx.paramValue?.(node.param, ac);
      if (minutes == null) {
        return {
          ok: false,
          kind: null,
          value: null,
          reason: ac ? `缺机型「${ac}」参数` : "需先填写「机型」",
        };
      }
      return { ok: true, kind: "minutes", value: Number(minutes), reason: "" };
    }
    case "binary": {
      const l = evalNode(node.left, ctx);
      if (!l.ok) return l;
      const r = evalNode(node.right, ctx);
      if (!r.ok) return r;
      const op = node.operator === "-" ? -1 : 1;
      // 分钟 ± 分钟 → 分钟
      if (l.kind === "minutes" && r.kind === "minutes") {
        return { ok: true, kind: "minutes", value: l.value + op * r.value, reason: "" };
      }
      // 时间 ± 分钟 → 时间
      if (l.kind === "time" && r.kind === "minutes") {
        const t = toDayjs(l.value);
        const res = op === -1 ? t.subtract(r.value, "minute") : t.add(r.value, "minute");
        return { ok: true, kind: "time", value: res.format("HH:mm"), reason: "" };
      }
      return { ok: false, kind: null, value: null, reason: "公式左右类型不匹配" };
    }
    case "function":
    case "functions": {
      // 函数：min（取最早）/ max（取最晚）——"或"选项取早/晚者；
      // functions（复数）：args 中多个并列计算公式，逐个求值：
      //   能算出的 → 时间（detail.ok）；算不出的 → 提示文字（detail.reason）。
      // 返回 details：每个 args 的求值明细（供前端逐条展示"时间或提示"）。
      const isMulti = node.type === "functions";
      const name = node.name || (isMulti ? "min" : "");
      if (!isMulti && name !== "min" && name !== "max") {
        return { ok: false, kind: null, value: null, reason: `未知函数 ${name}` };
      }
      const details = (node.args || []).map((a) => evalNode(a, ctx));
      const valid = details.filter((r) => r.ok);
      if (!valid.length) {
        const first = details[0];
        return {
          ok: false,
          kind: null,
          value: null,
          reason: (first && first.reason) || "函数无可用参数",
          details,
        };
      }
      const times = valid.filter((r) => r.kind === "time");
      if (times.length) {
        // 取最早（min）/ 最晚（max）；functions 无操作符时取第一个可算时间
        let sel;
        if (name === "min" || name === "max") {
          sel = times.reduce((a, b) => {
            const cmp = toDayjs(a.value).valueOf() - toDayjs(b.value).valueOf();
            return name === "min" ? (cmp <= 0 ? a : b) : (cmp >= 0 ? a : b);
          });
        } else {
          sel = times[0];
        }
        return { ok: true, kind: "time", value: sel.value, reason: "", details };
      }
      const minutes = valid.filter((r) => r.kind === "minutes");
      if (minutes.length) {
        const vals = minutes.map((m) => m.value);
        return {
          ok: true,
          kind: "minutes",
          value: name === "min" ? Math.min(...vals) : name === "max" ? Math.max(...vals) : vals[0],
          reason: "",
          details,
        };
      }
      return { ok: false, kind: null, value: null, reason: "函数参数类型不匹配", details };
    }
    case "choice": {
      // 条件分支：按机型宽窄体匹配 options（condition: "窄体机" / "宽体机"）
      const ac = ctx.vars?.aircraftType;
      const narrow = ac ? ctx.isNarrowBody?.(ac) : null;
      const option = (node.options || []).find((o) => {
        if (o.condition === "窄体机") return narrow === true;
        if (o.condition === "宽体机") return narrow === false;
        return false;
      });
      if (!option) {
        return {
          ok: false,
          kind: null,
          value: null,
          reason: ac ? "机型宽窄无法匹配选项" : "需先填写「机型」",
        };
      }
      return evalNode(option.formula, ctx);
    }
    default:
      return { ok: false, kind: null, value: null, reason: "未知公式类型" };
  }
}

/**
 * 求值节点 formula
 * @param {Object} formula 节点 formula
 * @param {Object} ctx { vars, paramValue(code, ac), getEventTime(eventId), varName(ref), eventName(eventId) }
 * @returns {{ok:boolean, kind:'time'|'minutes'|null, value:(string|number|null), reason:string}}
 */
export function evaluateFormula(formula, ctx) {
  return evalNode(formula, ctx);
}
