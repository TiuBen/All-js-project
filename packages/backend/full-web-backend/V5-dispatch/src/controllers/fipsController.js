/**
 * ============================================================
 * fips 控制器 —— 三张航班表共用一个入口
 * ------------------------------------------------------------
 * GET            : ?source=fips | ecyilang | manual_fips（**必填**）
 * POST / PUT / DELETE : 固定操作 manual_fips，不接受 source
 *
 * 控制器只做「读入参 → 调 service → 回 JSON」，错误一律由 service 抛 HttpError，
 * 交给 server.js 的全局错误中间件。
 *
 * ★ source=ecyilang 时 service 给的是**快照行**（一行 = 本站一离一进两条航段），
 *   在出口翻成 fips 形状再回（一行最多变两条腿）——映射细节全在 utils/ecyilangToFips.js。
 * ============================================================
 */
import * as fipsService from "../services/fipsService.js";
import { ecyilangToFips } from "../utils/ecyilangToFips.js";
import { asyncHandler } from "../utils/http.js";

/**
 * GET /api/fips?source=&date=&from=&to=&raw=
 * @desc 航班列表（source 必填）
 *       source=ecyilang 时把快照行翻成 fips 形状（一行变一离一进两条腿）；
 *       raw=1 时**跳过转换**，原样返回快照行（含 changelog / flight_readable_id）
 *       —— 给 RawEcyilangTable 直接铺原始数据，不做 atot 等映射
 */
export const listFlights = asyncHandler(async (req, res) => {
    const data = await fipsService.list(req.query.source, req.query, { raw: req.query.raw === "1" });
    if (!data.raw && data.source === "ecyilang") {
        data.items = ecyilangToFips(data.items);
        data.total = data.items.length; // 翻完 total 是「腿数」，跟 items 对齐
    }
    res.json(data);
});

/**
 * GET /api/fips/:id?source=
 * @desc 航班详情（:id = 航班 uuid，source 必填）
 */
export const getFlight = asyncHandler(async (req, res) => {
    res.json(await fipsService.get(req.query.source, req.params.id));
});

/**
 * POST /api/fips
 * @desc 新增手动航班（固定写 manual_fips，必填 flightNo）
 */
export const createFlight = asyncHandler(async (req, res) => {
    res.status(201).json(await fipsService.create(req.body));
});

/**
 * PUT /api/fips/:id
 * @desc 更新手动航班（局部更新）
 */
export const updateFlight = asyncHandler(async (req, res) => {
    res.json(await fipsService.update(req.params.id, req.body));
});

/**
 * DELETE /api/fips/:id
 * @desc 删除手动航班（连带清掉挂在该航班上的检查单与生鲜台账）
 */
export const deleteFlight = asyncHandler(async (req, res) => {
    res.json(await fipsService.remove(req.params.id));
});
