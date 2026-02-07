//! 检查执勤部分的权限的
const { UserDb } = require("../config/sqliteDb");
const { normalizeValue, normalizeRow } = require("../utils/sqliteSaveReadArrayTools.js");

async function checkDutyMiddleware(req, res, next) {
    //console.log("检查权限");

    try {
        //console.log(req.body);
        const {
            userId,
            username: wantedUsername,
            position: wantedPosition,
            dutyType: wantedDutyType, // 如果席位上没有主副班 可能就直接是 undefined
            roleType: wantedRoleType,
            relatedId,
        } = req.body;

        if (userId == null) {
            return res.status(401).json({ message: "Unauthorized" });
        } else {
            // 做两个逻辑判断 一个 只有 单人登录
            // 一个做 做 学员的判断

            await UserDb.get("SELECT * FROM user WHERE  id= ?", [userId], (err, user) => {
                try {
                    
                    //console.log("User db error"+":"+err);

                    const _user = normalizeRow(user);// { ...user, position: JSON.parse(user.position), roleType: JSON.parse(user.roleType) };
                    //console.log("数据库中检索到 权限检查的用户信息");

                    //console.log(_user);

                    // 不具备此席位上岗资格
                    // 不具备此席位见习资格
                    // 此人不具备教员资格,无法见习

                    // 先进行席位检查,再进行user的权限检查

                    const wanted = _user.position.find((x) => x.position === wantedPosition);
                    //console.log(wanted);
                    if (wanted !== undefined) {
                        //console.log("具有此席位的权限");

                        // 能在这个席位上岗
                        const { dutyType: thisD = "", roleType: thisR } = wanted; //

                        const hasRoleTypePermission = thisR === wantedRoleType;
                        const hasDutyTypePermission = thisD === wantedDutyType || thisD?.includes(wantedDutyType);
                        return next();
                    } else {
                        return res.status(422).json({ error: "", message: "不具备此席位上岗资格" });
                    }
                } catch (error) {
                    console.error("回调内部错误:", error);
                    return res.status(500).json({ error: "数据处理失败" });
                }
            });
        }
    } catch (error) {
        //console.log(error);
    }
}

//! 检查账号操作权限的
function checkAdminMiddleware(req, res, next) {
    return next();
}

module.exports = { checkDutyMiddleware, checkAdminMiddleware };
