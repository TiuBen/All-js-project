const { log } = require("console");
const { AtcLicenseExam } = require("../utils/SqliteDb");

const sectionToDbTable = {
    航空气象: { tableName: "航空气象", count: 500 },
    空中导航: { tableName: "空中导航", count: 375 },
    "通信、导航和监视设备": { tableName: "通信导航和监视设备", count: 480 },
    飞行原理: { tableName: "飞行原理", count: 273 },
    航空器及应用: { tableName: "航空器及应用", count: 269 },
    航空情报: { tableName: "航空情报", count: 356 },
    空中交通管制一般规定: { tableName: "空中交通管制一般规定", count: 325 },
    空域: { tableName: "空域", count: 91 },
    人为因素: { tableName: "人为因素", count: 88 },
    通用航空: { tableName: "通用航空", count: 27 },
    机场管制: { tableName: "机场管制", count: 799 },
    进近管制: { tableName: "进近管制", count: 0 },
    进近雷达管制: { tableName: "进近雷达管制", count: 0 },
    区域管制: { tableName: "区域管制", count: 0 },
    区域雷达管制: { tableName: "区域雷达管制", count: 0 },
    飞行服务: { tableName: "飞行服务", count: 0 },
    "运行监控（地区)": { tableName: "运行监控地区", count: 0 },
    "运行监控（民航局）": { tableName: "运行监控民航局", count: 0 },
    "特殊技能ADS-B": { tableName: "特殊技能ADS_B", count: 0 },
    机坪管制: { tableName: "机坪管制", count: 0 },
    英语单选: { tableName: "英语单选", count: 1389 },
    英语阅读: { tableName: "英语阅读", count: 0 },
};

function _GetTableName(section) {}

async function GetQuestion(req, res) {
    const { section, qId, id, pageIndex, count, selftest } = req.query;
    console.log(req.query);

    let sql = `SELECT * FROM "${sectionToDbTable[section]?.["tableName"]}" WHERE 1=1`;
    console.log(sql);
    const params = [];
    // // Build the query based on provided parameters

    if (qId) {
        log("qId", qId);
        sql += " AND qId = ?";
        params.push(qId);
    }

    if (id) {
        sql += " AND id = ?";
        params.push(id);
    }

    // Add pagination
    if (pageIndex && count) {
        sql += " LIMIT ? OFFSET ?";
        params.push(parseInt(count, 10));
        params.push(parseInt(pageIndex, 10) * parseInt(count, 10));
    }

    // var allCount;
    // AtcLicenseExam.all(sql,function (err, rows) {
    //     if (err) {
    //         console.error(err.message);
    //     } else {
    //         allCount=rows.length();
    //     }
    // });

    if (selftest) {
        const sql = `SELECT * FROM (
            SELECT * FROM (SELECT * from  机场管制 ORDER BY RANDOM() LIMIT 40) AS tab1 
            UNION 
            SELECT * FROM  (SELECT * FROM 空中交通管制一般规定 ORDER BY RANDOM() LIMIT 20) as tab2
            )
            UNION 
            SELECT * FROM  (SELECT * FROM 英语单选 ORDER BY RANDOM() LIMIT 40) as tab2`;
        AtcLicenseExam.all(sql, function (err, rows) {
            // console.log(params);
            if (err) {
                console.error(err.message);
                res.status(500).send({ ...err, slq: sql });
                return;
            } else {
                res.send({ count: 100, rows: rows });
                return;
            }
        });
        return;
    }

    AtcLicenseExam.all(sql, params, function (err, rows) {
        // console.log(params);
        if (err) {
            console.error(err.message);
            res.status(500).send({ ...err, slq: sql });
            return;
        } else {
            res.send({ count: sectionToDbTable[section]["count"], rows: rows });
            return;
        }
    });

    // return new Promise((resolve, reject) => {

    // });

    // res.send({});
}

async function PutToModifyQuestion(req, res) {
    const { section, qId, id, ...question } = req.body;

    console.log(req.body);

    const updateSql = `UPDATE ${sectionToDbTable[section]?.["tableName"]} SET ${Object.keys(question)
        .map((key) => `${key}='${question[key]}'`)
        .join(",")} WHERE qId=${qId} or id='${id}'`;

    console.log(updateSql);

    AtcLicenseExam.run(updateSql, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send({ ...err, slq: updateSql });
        } else {
            res.send({ ...this });
        }
    });
}

module.exports = { GetQuestion, PutToModifyQuestion };
