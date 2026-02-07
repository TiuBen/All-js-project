const server = "http://localhost:3104";

const serverActions = {
    GetWhoIsOnDuty: "GetWhoIsOnDuty",
    GetWhoIsPrepared: "GetWhoIsPrepared",
    TakeOverTheJob: "TakeOverTheJob",
    PrepareForTheJob: "PrepareForTheJob",
    GetThisPosition: "GetThisPosition",
};

const usernames = [
    "巴富毅",
    "刘琦",
    "金鼎",
    "李秋实",
    "明嘉",
    "边昊",
    "温若春",
    "李明",
    "刘国莲",
    "胡鑫",
    "黄恩",
    "叶大鹏",
    "潘伟生",
    "周岸",
    "张文中",
    "张虎",
    "王建超",
    "吴疆",
    "张宗根",
    "王风瑞",
    "杜涛",
    "耿若岩",
    "邓心豪",
    "蔡昊霖",
    "张笑延",
    "严亮",
    "詹泽彬",
    "姜文夫",
    "宋天霖",
    "董志华",
    "郭永杰",
    "朱永春",
    "沈宁",
    "马莲花",
    "徐万友",
    "蓝宇航",
    "郑文卓",
    "陈宏伟",
    "蒋露裕",
    "程卓",
];


const Positions = ["西塔台", "西地面", "西放行", "东塔台", "东地面", "东放行", "领班", "流控","进近高扇","进近低扇"];



module.exports = { server, serverActions, Positions,usernames };
