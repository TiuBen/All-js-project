// const LastingTime = ""; // 保存时间
// const USER = ["普通用户", "经理", "财务", "老板", "管理员"];
// const ROLE = ["普通用户权限", "经理权限", "财务权限", "老板权限", "管理员权限"];

// const map1 = new Map();
// map1.set("普通用户权限", ["普通用户", "经理", "财务", "老板", "管理员"]);
// map1.set("经理权限", ["普通用户", "经理"]);
// map1.set("财务权限", ["普通用户", "财务"]);
// map1.set("老板权限", ["老板", "管理员"]);
// map1.set("管理员权限", ["管理员"]);

// const map2 = new Map();
// map2.set("普通用户", ["普通用户权限"]);
// map2.set("经理", ["普通用户权限", "经理权限"]);
// map2.set("财务", ["普通用户权限", "财务权限"]);
// map2.set("老板", ["普通用户权限", "经理权限", "财务权限", "老板权限"]);
// map2.set("管理员", ["普通用户权限", "经理权限", "财务权限", "老板权限", "管理员权限"]);

// res.send({ user: user, isLogin: true, roles: _roles });
const Upload = require("../utils/SaveFile").Upload;

const UserController = require("../controllers/user.controller");

var router = require("express").Router();

router.get("/user", UserController.GetUser);
router.put("/user", Upload, UserController.UpdateUserInfo);
router.post("/tc", UserController.SaveAvatar);
router.post("/login", UserController.Login);

module.exports = router;
