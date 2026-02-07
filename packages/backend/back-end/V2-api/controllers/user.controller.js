const jwt = require("jsonwebtoken");
const { Salt } = require("../../V2-api/config/CONST");
const { db, User } = require("../../V2-api/models/index.js");
// const UserTable = db.user;
// const LoginTable = db.login;

function decryptFunction(x) {
    return x;
}

const Login = async (req, res) => {
    console.log("+++++++++登录++++++++++++++++++");
    console.log(req.body);
    // @STEP
    //先从数据库验证是否存在用户
    //然后记录登录信息

    const _userName = req.body.name;
    const _password = req.body.password; // 前端

    const user = await User.findOne({ where: { name: _userName } });

    // @STEP
    // 1 用户名存在 密码错误
    // 2 用户名不存在
    // 3 用户名存在 密码正确
    if (user === null) {
        console.log("用户不存在!!!");
        res.status(400);
        res.send({ info: "用户不存在!" });
    } else {
        console.log("用户存在!!!");
        console.log(user.dataValues);
        // 服务器不能保存明文密码 从服务器获取的用户密码
        // 前端 不能发送明文 密码 "解密后的密码"

        // @STEP
        // 需要同步更新数据库的 LOGIN 表
        // const userLoginInfo = await LoginTable.findOne({ where: { name: _userName } });
        // //
        // if (userLoginInfo === null) {
        //     // 用户已经在 user表里面有了 但是没有 在 login表 里面
        //     // 存到 login表格
        //     await LoginTable.create({ name: _userName, lastLoginTime: Date.now() });
        // } else {
        //     await userLoginInfo.update({ lastLoginTime: Date.now() });
        //     await userLoginInfo.save();
    }

    // 登陆成功 => 将用户信息转换成token，并设置有效期
    const token = jwt.sign({ ...user.dataValues }, Salt, { expiresIn: 60 * 5 });
    console.log("生成的token");
    console.log(token);
    res.status(200).send({
        message: "登陆成功！",
        username: _userName,
        uuid:user.dataValues.uuid,
        token: token,
    });
    // res.status(200);
    // res.send({ ...user.dataValues, isAuth: true }); // 利用SSL HTTPS 避免篡改数据
};

const { SaveFile } = require("../utils/SaveFile.js").SaveFile;
const SaveAvatar = async (req, res) => {
    SaveFile.fields([{ name: "file1" }])(req, res, (next) => {
        console.log(req.body?.text);
        res.send({ message: "OK" });
        return next;
    });
};

//! 这里 是 formdata 还会混合有图片

const UpdateUserInfo = async (req, res) => {
    console.log("更新");
    console.log(req.body);

    // await Upload.fields([{name:"avatar"}]) (req, res, (next) => {
    //     console.log(req.body);
    //     // const _user =  UserTable.update(req.body, { where: { id: req.body.id } });
    //     // console.log(_user);
    //     return next;
    // });

    // await _user.update({ ...req.body });
    // await _user.save();
};

const GetUser = async (req, res) => {
    console.log("获取用户的所有信息");
    console.log(req.query);
    if (req.query.name) {
        const user = await User.findOne({ where: { name: req?.query?.name } });
        if (user === null) {
            res.status(400).json({ error: "something wrong" });
        } else {
            res.status(200).json(user.dataValues);
        }
    } else {
        res.status(400).json({ error: "query.name wrong" });
    }
};

module.exports = { Login, UpdateUserInfo, GetUser, SaveAvatar };
