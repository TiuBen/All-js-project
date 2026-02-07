const { successResponse, errorResponse } = require("../utils/apiResponse");
const BaseController = require("./Base.Controller");
const DutyService = require("../services/Duty.Service.js");
const { sendEvent } = require("../utils/see.js");
const { DutyDb } = require("../config/sqliteDb.js");

class LogController {
    constructor() {
        this.getAll = this.getAll.bind(this);
    }

    async getAll(req, res, next) {
        // //console.log("DutyController getAll");
        // //console.log(req.query);

        const query = req.query;
        const page = parseInt(query?.page, 10) || 1;
        const limit = parseInt(query?.limit, 10) || 10;
        const offset = (page - 1) * limit;

        // ✅ 计算 offset 并拼接分页 SQL
        const pagedSql = `SELECT * FROM log ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
     

        // ✅ 同时执行两条 SQL: 一条分页，一条总数
        const countSql = `SELECT COUNT(*) AS totalCount FROM log`;

        // 查询总数
        DutyDb.get(countSql, [], (err, countResult) => {
            if (err) return res.status(500).json({ error: err.message });

            const total = countResult.total;
            const totalPages = Math.ceil(total / limit);

            // 查询分页数据
            DutyDb.all(pagedSql, [limit, offset], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });

                res.json({
                    page,
                    limit,
                    total,
                    totalPages,
                    data: rows,
                });
            });
        });
    }
}

module.exports = new LogController();
