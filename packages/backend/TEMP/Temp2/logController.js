const { DutyDb } = require("../config/sqliteDb.js");

exports.getAll = (req, res, next) => {
    const query = req.query;
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const pagedSql = `SELECT * FROM log ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) AS totalCount FROM log`;

    DutyDb.get(countSql, [], (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

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
};
