const server = "http://localhost:3104";

const serverActions = {
    GetWhoIsOnDuty: "GetWhoIsOnDuty",
    GetWhoIsPrepared: "GetWhoIsPrepared",
    TakeOverTheJob:"TakeOverTheJob",
    PrepareForTheJob:"PrepareForTheJob",
    GetThisPosition:"GetThisPosition"

};

const prepareDetail = {
    bodyCondition: "良好",
    mindCondition: "良好",
    alcoholCondition: "良好",
};



const fakeNames = [
    "张三",
    "李四",
    "王五",
    "赵六",
    "钱七",
    "孙八",
    "周九",
    "吴十",
    "郑十一",
    "王十二",
    "李十三",
    "张十四",
    "李十五",
    "李十六",
    "李十七",
    "李十八",
    "李十九",
    "李二十",
    "李二十一",
    "李二十二",
    "李二十三",
    "李二十四",
    "李二十五",
];

function GetOneRandomName() {
    const index = Math.floor( Math.random() * fakeNames.length);

    return fakeNames[index];
}

const Positions=["西塔台","西地面","西放行","东塔台","东地面","东放行","领班主任","流控"]
const FakeOnDuty = [
    {
        position:"西塔台",
        username:"张三",
        dutyType:"主班"

    },
    {
        position:"西地面",
        username:"李四",
        dutyType:"副班"

    },
    {
        position:"西放行",
        username:"王五",
        dutyType:"主班"

    },
    {
        position:"东塔台",
        username:"赵六",
        dutyType:"副班"

    },
    {
        position:"东地面",
        username:"钱七",
        dutyType:"主班"

    },
    {
        position:"东放行",
        username:"孙八",
        dutyType:"副班"

    },
    {
        position:"领班主任",
        username:"周九",
        dutyType:"主班"

    },
    {
        position:"流控",
        username:"吴十",
    }


];








module.exports = { server, serverActions,fakeNames, GetOneRandomName,FakeOnDuty,Positions };



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

         {/* <select disabled={true} value={positionStatus}>
                    <option value="暂时未开放">暂时未开放</option>
                    <option value="正在执勤">正在执勤</option>
                    <option value="正在交接班">正在交接班</option>
                    <option value="超时">超时</option>
                </select> */}