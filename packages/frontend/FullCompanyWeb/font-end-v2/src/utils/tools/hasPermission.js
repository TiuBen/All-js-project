
// 文字不要修改 ,服务器也用了这个配置也用了
const actions = {
    普通用户权限: "普通用户权限",
    经理权限: "经理权限",
    财务权限: "财务权限",
    老板权限: "老板权限",
    管理员权限: "管理员权限",
};

function hasPermission(user, actionName) {
    if (!user) {
        return false;
    }

    if (user.permission?.includes(actionName)) {
        return true;
    }
    return false;
}


export {actions,hasPermission}


