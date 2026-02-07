const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const server = REACT_APP_SERVER_URL;

const serverActions = {
    GetWhoIsOnDuty: "GetWhoIsOnDuty",
    GetWhoIsPrepared: "GetWhoIsPrepared",
    TakeOverTheJob: "TakeOverTheJob",
    PrepareForTheJob: "PrepareForTheJob",
    GetThisPosition: "GetThisPosition",
};

const prepareDetail = {
    bodyCondition: "良好",
    mindCondition: "良好",
    alcoholCondition: "良好",
};


const usernames = [
    "巴富毅",
    "刘琦",
    "姜文夫",
    "董志华",
    "金鼎",
    "徐万友",
    "马莲花",
    "李秋实",
    "明嘉",
    "边昊",
    "温若春",
    "李明",
    "刘国莲",
    "黄恩",
    "叶大鹏",
    "潘伟生",
    "周岸",
    "张文中",
    "詹泽彬",
    "张虎",
    "胡鑫",
    "王建超",
    "朱永春",
    "郭永杰",
    "吴疆",
    "张宗根",
    "王风瑞",
    "杜涛",
    "耿若岩",
    "邓心豪",
    "蔡昊霖",
    "张笑延",
    "严亮",
    "宋天霖",
    "沈宁",
    "蓝宇航",
    "郑文卓",
    "陈宏伟",
    "蒋露裕",
    "程卓",
];
/////////////////////////////////////
const usernamesRow0 = [
    "巴富毅",
    "刘琦",
];
const usernamesRow1 = [
    "姜文夫",
    "董志华",
    "金鼎",
    "徐万友",
    "马莲花",
    "李秋实",
    "明嘉",
    "温若春",
    "张虎",
    "李明",
    "刘国莲",
    "周岸",
    "杜涛",
    "张笑延",
    "耿若岩",
    "张文中",
    "詹泽彬"
];
const usernamesRow2 = [
    "朱永春",
    "郭永杰",
    "吴疆",
    "边昊",
    "胡鑫",
    "黄恩",
    "叶大鹏",
    "张宗根",
    "潘伟生",
    "王建超",
    "王风瑞",
    "邓心豪",
    "蔡昊霖",
    "严亮",
    "宋天霖",
    "沈宁"
];
const usernamesRow3 = [
    "蓝宇航",
    "郑文卓",
    "陈宏伟",
    "蒋露裕",
    "程卓",
];

function GetOneRandomName() {
    const index = Math.floor(Math.random() * usernames.length);

    return usernames[index];
}

const Positions = ["西塔台", "西地面", "西放行", "东塔台", "东地面", "东放行", "领班", "流控","进近高扇","进近低扇"];


const PositionsWithDutyType = [
    { position: "西塔台", dutyType: ["主班", "副班"] },
    { position: "西地面", dutyType: ["主班", "副班"] },
    { position: "西放行", dutyType: ["主班", "副班"] },
    { position: "进近高扇", dutyType: ["主班", "副班"] },
    { position: "进近低扇", dutyType: ["主班", "副班"] },
    { position: "东塔台", dutyType: ["主班", "副班"] },
    { position: "东地面", dutyType: ["主班", "副班"] },
    { position: "东放行", dutyType: ["主班", "副班"] },
    { position: "领班" },
    { position: "流控" },
];


module.exports = {
    server,
    serverActions,
    usernames,
    GetOneRandomName,
    Positions,
    usernamesRow0,
    usernamesRow1,
    usernamesRow2,
    usernamesRow3,
    PositionsWithDutyType
};

// useEffect(() => {
//     if (majorOnDuty === null && secondaryOnDuty === null) {
//         console.log("暂时未开放");
//         setPositionStatus("暂时未开放");
//     }
//     if (majorOnDuty !== null && secondaryOnDuty === null) {
//         console.log("正在执勤");
//         setPositionStatus("正在执勤");
//     }
//     if (majorOnDuty !== null && secondaryOnDuty !== null) {
//         console.log("正在交接班");
//         setPositionStatus("正在交接班");
//     }

//     return () => {};
// }, [majorOnDuty, secondaryOnDuty]);

{
    /* <select disabled={true} value={positionStatus}>
                    <option value="暂时未开放">暂时未开放</option>
                    <option value="正在执勤">正在执勤</option>
                    <option value="正在交接班">正在交接班</option>
                    <option value="超时">超时</option>
                </select> */
}
