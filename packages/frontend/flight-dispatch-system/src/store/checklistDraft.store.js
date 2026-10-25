/**
 * ============================================================
 * checklistDraft.store —— 草稿箱（未提交的检查单）
 * ------------------------------------------------------------
 * 一条草稿 = 一个「航班 × 模板类型」（切模板 = 另一条草稿），最多 MAX_DRAFTS 条。
 *
 * 两份存储各管一层（键规则见 utils/checklistCache.js）：
 *   索引  有哪些草稿 → localStorage（同步读，点「创建检查单」时要立刻判断够不够 5 条）
 *   正文  每个填写项的值 → IndexedDB，按「草稿键::节点 uuid」一条条存，
 *                         读写都走 store/cache.store.js（能被防抖 / 卸载兜底统一管住）
 * 所以本 store 只管索引，以及三个跟索引配套的动作：
 *   createDraft    建草稿（满了就拒，不建半条）
 *   switchTemplate 切模板 = 换一条草稿（满了则静默清掉旧模板那份腾位置）
 *   submitDraft    把草稿整理成待提交结构（★ 后端未接线：只打印到控制台）
 * 删除草稿（dropDraftWithData）两层一起删，不留没人认领的正文。
 * ============================================================
 */
import { create } from "zustand";

import { MAX_DRAFTS, draftKeyOf, nodeKeyPrefixOf, nodeUuidOf, readDrafts, writeDrafts } from "../utils/checklistCache";
import { checklistApi } from "../api/checklist";
import useMutilTypeInputStore from "./cache.store";
import { useAppStore } from "./app.store";
import { useSidebarStore } from "./sidebar.store";

/** 草稿箱满时的统一提示（侧栏拦截 / 页面提示共用一句，别各处自己写） */
export const draftFullHint = (max = MAX_DRAFTS) =>
    `已有${max}个未提交草稿,请让草稿数目小于等于${max}个才能创建新草稿`;

/** 草稿在界面上的航班标识：优先航班号，取不到退回 uuid 前 8 位（直连 URL 建的草稿可能没航班号） */
export const draftFlightLabel = (draft) => draft?.flightNo || String(draft?.flightUuid || "").slice(0, 8);

/** 索引按更新时间倒序 = 界面上的顺序（最近打开的排最前） */
const byUpdatedDesc = (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0);

export const useDraftStore = create((set, get) => {
    /** 写索引：localStorage 是唯一真源，写完再同步一份到内存（界面渲染用） */
    function commit(list) {
        const sorted = [...list].sort(byUpdatedDesc);
        writeDrafts(sorted);
        set({ drafts: sorted });
        return sorted;
    }

    /** 现读本地索引（多标签页改过也能跟上，避免内存里那份过期） */
    function current() {
        return readDrafts().sort(byUpdatedDesc);
    }

    return {
        /** 草稿箱索引（load / 改动过才有内容，界面渲染读它） */
        drafts: [],

        /** 从本地读一遍（进编辑器 / 工作台时调一次） */
        load() {
            set({ drafts: current() });
        },

        /** 按 key 取一条草稿（没有返回 null） */
        draftOf(key) {
            return get().drafts.find((d) => d.key === key) ?? null;
        },

        /** 草稿箱满没满：满了不能再**新建**，但已存在的那条照样能打开 */
        isFull() {
            return current().length >= MAX_DRAFTS;
        },

        /**
         * 建一条草稿（已存在则复用）。
         * ★ 复用优先于上限：满 5 条时仍然允许**回到**自己原有的草稿 ——
         *   否则草稿箱一满，这 5 条草稿就全都打不开了。
         * ★ 打开会把 updatedAt 刷新一次（= 最近打开的排前面）；节点正文各自的
         *   更新时间在 IndexedDB 每条记录里，不在这里。
         * @param {{flightUuid:string, flightNo?:string, templateKey:string, templateType:string}} meta
         * @returns {{ ok: true, draft: Object } | { ok: false, reason: 'full' }}
         */
        createDraft({ flightUuid, flightNo, templateKey, templateType }) {
            const key = draftKeyOf(flightUuid, templateKey);
            const list = current();
            const exists = list.find((d) => d.key === key);

            if (exists) {
                const next = { ...exists, flightNo: flightNo || exists.flightNo, updatedAt: Date.now() };

                commit(list.map((d) => (d.key === key ? next : d)));

                return { ok: true, draft: next };
            }

            if (list.length >= MAX_DRAFTS) return { ok: false, reason: "full" };

            const now = Date.now();
            const draft = {
                key,
                flightUuid,
                // 航班号只给界面显示用：没带就借同一航班其它草稿上的（草稿箱里一眼认出是哪班）
                flightNo: flightNo || list.find((d) => d.flightUuid === flightUuid && d.flightNo)?.flightNo || "",
                templateKey,
                templateType,
                createdAt: now,
                updatedAt: now,
            };

            commit([draft, ...list]);

            return { ok: true, draft };
        },

        /** 只删索引（正文另由 clearByPrefix 清，一般别单独用，见 dropDraftWithData） */
        dropDraft(key) {
            commit(current().filter((d) => d.key !== key));
        },

        /**
         * 删一条草稿：索引 + 正文（节点值 + 图片）一起删。
         * ★ 顺序是先正文后索引：反过来的话中途失败就留下一条谁都指不到的孤儿数据。
         */
        async dropDraftWithData(key) {
            await useMutilTypeInputStore.getState().clearByPrefix(nodeKeyPrefixOf(key));
            get().dropDraft(key);
        },

        /**
         * 切模板类型时的草稿整理（在 setTemplateType 之前调）。
         * 一个航班 × 一种模板 = 一条草稿，所以切模板 = 换一条草稿：
         *   ① 目标草稿本来就在（来回切）→ 什么都不动，直接用
         *   ② 不在 + 草稿箱没满        → 新建一条空草稿；旧模板那条**原样保留**（要不要清由用户定）
         *   ③ 不在 + 草稿箱已满        → 先**静默**清掉旧模板那条（索引 + 正文）腾位置，再建新的
         *      （不静默清就会变 6 条，此时没有第三种选择）
         * @returns {{
         *   ok: boolean,
         *   draft: Object|null,
         *   cleared: { key:string, templateType:string }|null,  // 被静默清掉的那条（已处理完，调用方提示一句即可）
         *   kept: { key:string, templateType:string }|null,     // 旧草稿被保留**且本地有内容**，调用方可以问用户要不要清
         * }}
         */
        async switchTemplate({ flightUuid, flightNo, templateKey, templateType, oldKey, oldTemplateType }) {
            const targetKey = draftKeyOf(flightUuid, templateKey);
            const list = current();
            // 旧草稿还在、且确实要换到另一条上（同一个 key 不算切换）
            const switching = Boolean(oldKey) && oldKey !== targetKey && list.some((d) => d.key === oldKey);
            let cleared = null;

            if (switching && list.length >= MAX_DRAFTS && !list.some((d) => d.key === targetKey)) {
                await get().dropDraftWithData(oldKey);
                cleared = { key: oldKey, templateType: oldTemplateType };
            }

            const res = get().createDraft({ flightUuid, flightNo, templateKey, templateType });

            // 旧草稿被保留下来**且本地真有内容**，才值得问用户一句（空草稿问了也是噪音）
            const kept = !cleared && switching ? { key: oldKey, templateType: oldTemplateType } : null;
            const keptHasData = kept
                ? await useMutilTypeInputStore.getState().hasLocalData(nodeKeyPrefixOf(kept.key))
                : false;

            return { ok: res.ok, draft: res.draft ?? null, cleared, kept: keptHasData ? kept : null };
        },

        /**
         * 提交。
         * ★ 后端还没接线 —— 只把整理好的数据打进控制台，本地草稿**原样保留**
         *   （没真发出去就清草稿 = 用户白填）。接线后：换成 POST，成功回调里
         *   调 dropDraftWithData(key) 清草稿。
         * ★ 整理范围 = 这条草稿里**动过**的填写项（本地有记录的）；没动过的节点
         *   不会出现在 items 里（要连没动过的节点一起报，得把模板 schema 传进来）。
         * @returns {Object} 待提交的结构（后端接口的形状）
         */
        /**
         * 提交草稿 → **真接线后端**：
         *   ① 每张截图先 POST /checklist/uploads（原始二进制）换回 { url, … }
         *   ② POST /checklist 创建 records_checklist 一条（status='submitted'，
         *      flightUuid → 后端 resolveFlight 归一挂到 ecyilang / fips / manual_fips）
         *   ③ 成功 → dropDraftWithData 清掉本地这份草稿（含图片 blob）；失败保留可重试
         * @returns {Object} 后端建好的那条记录（records_checklist 行 + source / flight_uuid）
         */
        async submitDraft({ flightUuid, flightNo, templateKey, templateType }) {
            const key = draftKeyOf(flightUuid, templateKey);
            const values = await useMutilTypeInputStore.getState().collectByPrefix(nodeKeyPrefixOf(key));

            // ① 图片：blob → 上传 → 换回 url（记录里只留引用，不再塞二进制）
            const uploaded = [];
            for (const v of values) {
                const images = [];
                for (const img of v.images ?? []) {
                    // 已传过（断点续传场景）就不再传
                    const res = img.url ? img : await checklistApi.uploadImage(img.blob, img.name);
                    images.push({ name: res.name ?? img.name, type: res.type ?? img.type, size: res.size ?? img.size, url: res.url });
                }
                uploaded.push({ ...v, images });
            }

            // ② 组装后端形状并创建记录
            const items = uploaded.map((v) => ({
                node_uuid: nodeUuidOf(v.uuid), // 模板里的节点 uuid（后端认这个）
                node_key: v.uuid, // 本地缓存键（草稿键::节点 uuid），排查数据用
                state: v.state || "",
                time: v.time || "",
                text: v.note || "",
                images: v.images,
            }));

            // 检查人 = 当前登录人：优先 currentUserId（SwitchUserDialog 切人时登记的
            // user 表主键，严格挂外键）；没有再退回按姓名（后端在花名册里现解析，
            // 对不上留空不拦提交）；两个都没有就不带
            const { currentUser, currentUserId, source } = useAppStore.getState();
            const inspector = currentUserId != null
                ? { inspectorId: currentUserId }
                : currentUser
                  ? { inspectorName: currentUser }
                  : {};

            // 机型：ecyilang 原始快照行没有 aircraft_type 列，用进港机型 a_jx；
            // fips / manual_fips 行自带 aircraft_type
            const { selectedFlight } = useSidebarStore.getState();
            const aircraftType =
                source === "ecyilang" ? selectedFlight?.a_jx : selectedFlight?.aircraft_type;

            const record = await checklistApi.create({
                flightUuid, // 后端 resolveFlight 归一挂到三张航班表之一
                ...inspector,
                aircraft_type: aircraftType || undefined,
                callsign: flightNo || "",
                checklist_category: templateType, // 落库的 checklist_category = 模板类型中文名
                status: "submitted",
                items,
            });

            // ③ 成功才清本地草稿（含截图 blob）；失败保留，下次可重试
            await get().dropDraftWithData(key);

            console.log(
                `[提交检查单] ${flightNo || flightUuid} · ${templateType} → 已入库 #${record?.id}` +
                    `（${items.length} 个填写项 / ${uploaded.reduce((n, v) => n + v.images.length, 0)} 张图片已上传）`
            );

            return record;
        },
    };
});
