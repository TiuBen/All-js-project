const { start } = require("repl");
const { PositionsWithDutyType, OrderedUsername, AllSumTimeWithFilter, RoleTypes } = require("../utils/CONST");
const { GetDutyRows, SumTimeByField } = require("../utils/FromDBGetUserDutyRow");
const { db } = require("../utils/SqliteDb");
const dayjs = require("dayjs");

function GetPositions(req, res) {
    console.log("GetPositions");

    res.status(200).send(PositionsWithDutyType);
}

function GetRoles(req, res) {
    console.log("GetRoles");

    res.status(200).send(RoleTypes);
}

function GetUsers(req, res) {
    console.log("GetUsers");
    res.status(200).send(OrderedUsername);
}

async function GetAllByMonth(req, res) {
    console.log("GetAllByMonth");
    const rows = await GetDutyRows(
        {
            ...req.query,
        },
        db
    );
    if (req.query.month) {
        res.status(200).send(SumTimeByField(rows, AllSumTimeWithFilter));
        return;
    } else {
        res.status(200).send(rows);
        return;
    }
}

async function GetByID(req, res) {
    console.log("GetByID");
    console.log(req.query);
    
    const row = await GetDutyRows(
        {
            ...req.query,
        },
        db
    );

    res.status(200).send(row);
    return;
}

async function GetNow(req, res) {
    console.log("GetNowWhoIsOnDuty");

    let query = "SELECT * FROM duty WHERE outTime IS NULL";

    try {
        // Code that may throw an error
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err.message);
                res.status(500).send("Internal Server Error");
                return;
            }
            res.status(200).send(rows);
        });
    } catch (error) {
        // Handle the error
        console.error("An error occurred:", error.message);
    } finally {
        // (Optional) Code that always runs, whether an error occurred or not
        console.log("This runs no matter what.");
    }
}

module.exports = {
    GetPositions,
    GetRoles,
    GetUsers,
    GetAllByMonth,
    GetNow,
    GetByID
};
