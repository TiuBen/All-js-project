const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Salt } = require("../config/CONST");
const { db, User } = require("../models/index.js");
const { Op } = require("sequelize");

// const UserTable = db.user;
// const LoginTable = db.login;

// TODO 不知道这个方法是不是对的
function cryptFunction(x) {
    let md5 = crypto.createHash("md5");
    return md5.update(x).digest("hex");
}

const Login = async (req, res) => {
    try {
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
        // 4 尝试登录次数过多后失败
        // 5 自动延续时间
        // 6 超时登录
        if (user === null) {
            console.log("用户不存在!!!");
            res.status(401).send({ message: "用户不存在!" });
        } else {
            console.log("用户存在!!!");
            console.log(user);
            // 服务器不能保存明文密码 从服务器获取的用户密码
            // 前端 不能发送明文 密码 "解密后的密码"

            let passwordFromWebAndEncrypted = cryptFunction(_password);
            if (passwordFromWebAndEncrypted !== user.password) {
                res.status(401).send({ message: "密码错误" });
            } else {
                // 登陆成功 => 将用户信息转换成token，并设置有效期
                const token = jwt.sign({ ...user }, Salt, { expiresIn: 60 * 5 });
                console.log("生成的token");
                console.log(token);
                res.status(200).send({
                    message: "登陆成功！",
                    username: _userName,
                    uuid: user.uuid,
                    token: token,
                });
            }

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
    } catch (error) {
        console.error(error);
    }
};

const Register = async (req, res) => {
    try {
        console.log(req);
        const { username, password, email } = req.body;
        console.log(username, password, email);
        const user = await User.findOne({ where: { [Op.or]: [{ name: username }, { email: email }] } });
        if (user!==null) {
            console.log("查到类似的用户名或者email");
            console.log(user);
            res.status(401).send({message:"用户名或者email被占用"})
        }else{
            console.log("可以注册新用户");
            const encryptedPassword=cryptFunction(password);
            const newUser=await User.create({name:username,email:email,password:encryptedPassword});
            if (newUser instanceof User) {
                console.log(newUser);
                // res.status(200).send(newUser);
                res.status(301).send('/login')
            }else{
                res.status(500).send(newUser);
            }

        }


    } catch (error) {
        console.error(error);
    }
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
            res.status(200).json(user);
        }
    } else {
        res.status(400).json({ error: "query.name wrong" });
    }
};

module.exports = { Login, Register, UpdateUserInfo, GetUser, SaveAvatar };
