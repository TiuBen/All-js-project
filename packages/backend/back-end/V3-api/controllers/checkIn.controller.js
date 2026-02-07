const { CheckIn, User } = require("../models/index.js");
const { Op } = require("sequelize");
// * POST /api/users: Create a new user
// * GET /api/users/:userId: Get a specific user
// * PUT /api/users/:userId: Update a specific user
// * DELETE /api/users/:userId: Delete a specific user
// * POST /api/profiles: Create a new profile
// * GET /api/profiles/:profileId: Get a specific profile
// * PUT /api/profiles/:profileId: Update a specific profile
// * DELETE /api/profiles/:profileId: Delete a specific profile

exports.getOne = async (req, res) => {
    // * 查询 考勤 记录

    if (req.query?.uuid) {
        const today = new Date();
        // console.log(today.toISOString());
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        // console.log(start.toISOString());
        // console.log(end.toISOString());
        if (req.query?.date) {
            //* 有查询日期表示只是查询
            console.log(
                "查询" +
                    req.query?.name +
                    " 考勤 " +
                    new Date(parseFloat(req.query?.date)).toLocaleDateString() +
                    " 记录"
            );
        }

        const _checkIn = await CheckIn.findOne({
            where: {
                user_uuid: { [Op.eq]: [req.query.uuid] },
                checkin_time: {
                    [Op.lt]: end,
                    [Op.gt]: start,
                },
            },
        });
        if (_checkIn === null) {
            console.log("Not found!");
            res.status(204).send({ message: "Not found!" });
        } else {
            // console.log(_checkIn.dataValues);
            // console.log(_checkIn instanceof CheckIn); // true
            res.status(200).send(_checkIn);
        }
    } else {
        res.status(500).send({ message: "something wrong" });
    }
};

exports.createOne = async (req, res, next) => {
    console.log("创建一个新的考勤记录");
    if (!req.body) {
        res.status(400).send({
            message: "创建考勤记录失败,req.body无查询内容",
        });
    } else {
        console.log(req.body);
        const user = await User.findOne({ where: { uuid: req.body.uuid } });
        // *首先检查这个员工是否存在
        if (user !== null) {
            console.log("有找到user" + user.dataValues.name);
            // *第二次检查 这个员工今天是否已经考勤了
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
            const _checkIn = await CheckIn.findOne({
                where: {
                    user_uuid: { [Op.eq]: [req.body.uuid] },
                    checkin_time: {
                        [Op.lt]: end,
                        [Op.gt]: start,
                    },
                },
            });
            if (_checkIn === null) {
                console.log("这个员工今天没有考勤");
                CheckIn.create({ user_uuid: req.body.uuid, user_name: req.body.name, userId: user.dataValues.id })
                    .then((data) => {
                        const _newCheckIn = data.dataValues;
                        console.log("这个员工今天没有考勤,刚刚创建他的考勤!");
                        console.log(_newCheckIn);
                        console.log("这个员工今天没有考勤,刚刚创建他的考勤!");
                        // !! 这里传出了next 发送通知
                        res.locals = {
                            message: `${_newCheckIn.user_name}在${new Date(_newCheckIn.checkin_time).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                            )}下班了`,
                        };
                        res.status(200).send(_newCheckIn);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send({
                            message: err.message || "创建考勤记录失败",
                        });
                    });
            } else {
                console.log("这个员工今天已经打卡");
                res.status(200).send(_checkIn.dataValues);
            }
        } else {
            console.log("没有有找到user");
            res.status(400).send({
                message: "创建考勤记录失败,未找到该用户",
            });
        }
    }
    // !! 这里传出了next 发送通知
    next();
};

exports.updateOne = async (req, res, next) => {
    console.log("更新一个新的考勤记录,一般是用来记录下班");

    if (req.body) {
        const _checkIn = await CheckIn.findOne({
            where: {
                id: req.body.id,
            },
        });
    
        if (_checkIn !== null) {
            _checkIn.set("checkout_time", Date.now());
            await _checkIn.save();
            // console.log(_checkIn.dataValues);
            res.locals = {
                message: `${_checkIn.dataValues.user_name} 在${new Date(
                    _checkIn.dataValues.checkout_time
                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} 下班了`,
            };
            res.status(200).send(_checkIn.dataValues);
            // !!! 这个地方注入websocket的通知
        } else {
            console.log("更新一个新的考勤记录,出了问题");
            res.status(204).send({ message: "更新一个新的考勤记录,出了问题" });
        }
    } else {
        console.log("更新一个考勤记录失败, req.body something wrong");
        res.status(400).send({ message: "更新一个考勤记录失败, req.body something wrong" });
    }

    next();
};

exports.getAllByUser = async (req, res) => {
    console.log("getAllByUser 通过query 的信息 获取考勤情况");
    console.log(req.query);
    try {
        console.log("req.query 有内容");
        if (req.query) {
            const checkin = await CheckIn.findAll({
                // where: { user_uuid: req.query.uuid },
                where: { user_uuid:"6fc89986-4b27-485b-a619-95b6623db9d4" },
                attributes: ["checkin_date", "checkin_time", "checkout_time"],
            });
            console.log(checkin);
            if (checkin !== null) {
                res.locals = checkin;
                res.status(200).send(checkin);
            } else {
                res.status(400).send({ message: "something wrong" });
            }
        } else {
            res.status(400).send({ message: `req.query ${req.query} 有问题!` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: `checkin getAllByUser 有问题!` });
    }
};
