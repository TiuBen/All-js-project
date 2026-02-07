// 导出到excel的功能
// 1、先把所有员工的每月时间导出到sheet中
// 2、导出统计格式的时间
// 3、导出夜班统计

const dayjs = require("dayjs");
const Excel = require("exceljs");
const path = require("path");
const formateDecimal = require("../utils/formateDecimal");



const UserService = require("../services/User.Service");
const DutyService = require("../services/Duty.Service");
const StatisticsService = require("../services/Statistics.Service");

async function exportAsExcel(
    startDate = "2025-08-01",
    startTime = "00:00:01",
    endDate = "2025-09-01",
    endTime = "00:00:01",
    needMonth="2025-08",
    fileName = "export.xlsx"
) {
    console.log("exportAsExcel start!!!!!!!!!");
    console.log(startDate, startTime, endDate, endTime,needMonth,fileName);



    const workbook = new Excel.Workbook();

    const simpleDutyWorksheet = workbook.addWorksheet("时间统计");

    simpleDutyWorksheet.getCell("A1").value = "月份";
    simpleDutyWorksheet.getCell("B1").value = "白班	";
    simpleDutyWorksheet.mergeCells("B1:E1");
    const mergedCellB1 = simpleDutyWorksheet.getCell("B1");
    mergedCellB1.alignment = { horizontal: "center", vertical: "middle" };
    simpleDutyWorksheet.getCell("F1").value = "夜班";
    simpleDutyWorksheet.mergeCells("F1:I1");
    const mergedCellF1 = simpleDutyWorksheet.getCell("F1");
    mergedCellF1.alignment = { horizontal: "center", vertical: "middle" };

    simpleDutyWorksheet.getCell("A2").value = "姓名";
    simpleDutyWorksheet.getCell("B2").value = "带班	";
    simpleDutyWorksheet.getCell("C2").value = "席位	";
    simpleDutyWorksheet.getCell("D2").value = "教员";
    simpleDutyWorksheet.getCell("E2").value = "学员";
    simpleDutyWorksheet.getCell("F2").value = "带班	";
    simpleDutyWorksheet.getCell("G2").value = "席位	";
    simpleDutyWorksheet.getCell("H2").value = "教员";
    simpleDutyWorksheet.getCell("I2").value = "学员";
    simpleDutyWorksheet.getCell("J2").value = "现场调度";

    simpleDutyWorksheet.getCell("K2").value = "总小时数";
    simpleDutyWorksheet.getCell("L2").value = "夜班段数";

    const detailNightShiftWorksheet = workbook.addWorksheet("夜班统计");
    detailNightShiftWorksheet.getCell("A1").value = "姓名";
    detailNightShiftWorksheet.getCell("B1").value = "18:00-21:00";
    detailNightShiftWorksheet.getCell("C1").value = "21:00-24:00";
    detailNightShiftWorksheet.getCell("D1").value = "+1天00:00-08:30";
    detailNightShiftWorksheet.getCell("E1").value = "总段数";
    detailNightShiftWorksheet.getCell("F1").value = "补贴元";

    // 添加每个员工每月时间统计的sheet
    const _userService = new UserService();
    const users = await _userService.getAll({
        fields: ["id", "username"],
    });
    // 获取统计数据
    const _statisticsService = new StatisticsService();

    const _dutyService = new DutyService();
    for (let i = 0; i < users.length; i++) {
        const { username, id } = users[i];

        const userWorksheet = workbook.addWorksheet(username);
        // 设置表头
        userWorksheet.columns = [
            { header: "日期", key: "date", width: 12 }, // A1
            { header: "岗位", key: "positionDutyRole", width: 15 }, // B1
            { header: "上岗时间", key: "inTime", width: 12 }, // C1
            { header: "离岗时间", key: "outTime", width: 12 }, // D1
            { header: "时段工作小时", key: "slotTime", width: 8 }, // E1
            { header: "白班小时", key: "slotDayTime", width: 6 }, // F1
            { header: "夜班小时(00:00-08:00)", key: "slotNightTime", width: 10 }, // G1
            //第二部分表格
            { header: "统计(00:00-08:00)", key: "statisticsNightTime", width: 12 }, // H1
            { header: "各席位总小时(00:00-08:00)", key: "statisticsTotalTime", width: 12 }, // I1
            { header: "白班小时(00:00-08:00)", key: "statisticsDayTime", width: 12 }, // J1
            { header: "夜班小时(00:00-08:00)", key: "statisticsNightTime", width: 12 }, // K1
            { header: "备注", key: "statisticsRemark", width: 6 }, // L1
            //! 还有第三部分
        ];

        //#region 设置格式
        userWorksheet.getCell("E1").height = 40;
        userWorksheet.getCell("E1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        userWorksheet.getCell("F1").height = 40;
        userWorksheet.getCell("F1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        userWorksheet.getCell("G1").height = 40;
        userWorksheet.getCell("G1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        //第二部分表格

        userWorksheet.getCell("H1").height = 40;
        userWorksheet.getCell("H1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        userWorksheet.getCell("I1").height = 40;
        userWorksheet.getCell("I1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        userWorksheet.getCell("J1").height = 40;
        userWorksheet.getCell("J1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        userWorksheet.getCell("K1").height = 40;
        userWorksheet.getCell("K1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        userWorksheet.getCell("L1").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
        //#endregion 设置格式

        // 添加数据行
        const userDutyRows = await _dutyService.getAll(
            { username: username, startDate: startDate, startTime: startTime, endDate: endDate, endTime: endTime },
            true
        );
        if (userDutyRows.length > 0) {
            //! 如果有duty rows
            userDutyRows.forEach((item, index) => {
                // //console.log(item);
                userWorksheet.addRow({
                    date: dayjs(item.inTime).format("YYYY-MM-DD"),
                    positionDutyRole: `${item.position}${item.dutyType ? `(${item.dutyType})` : ""}${
                        item.roleType ? `(${item.roleType})` : ""
                    }`,
                    inTime: dayjs(item.inTime).format("MM-DD HH:mm"),
                    outTime: item.outTime ? dayjs(item.outTime).format("MM-DD HH:mm") : "",
                    slotTime: item.outTime ? dayjs(item.outTime).diff(item.inTime, "hour", true).toFixed(2) : 0,
                    slotDayTime: item.dayShift !== 0 ? item.dayShift : "",
                    slotNightTime: item.nightShift !== 0 ? item.nightShift : "",
                });

                if (!dayjs(startDate, "YYYY-MM-DD").isSame(dayjs(item.inTime, "YYYY-MM-DD"), "month")) {
                    userWorksheet.getCell(`C${index + 2}`).fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFF0000" }, // 黄色
                    };
                }
            });
        }

        // ! 添加统计后的时间的cell

        const statistics = await _statisticsService.getDurationStatisticsByUserId(id, {
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
        });

        const nightsCount = await _statisticsService.getNightShiftCountStatisticsByUserId(id, {
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
        });

        // console.log(nightsCount);
        //#region 添加统计后的时间
        userWorksheet.getCell("H2").value = "带班主任席";
        userWorksheet.getCell("I2").value = statistics.totalCommanderTime.time;
        userWorksheet.getCell("J2").value = statistics.totalCommanderTime.dayShift;
        userWorksheet.getCell("K2").value = statistics.totalCommanderTime.nightShift;
        userWorksheet.getCell("L2").value = "";

        userWorksheet.getCell("H3").value = "塔台管制席";
        userWorksheet.getCell("I3").value = statistics.totalTowerMainTime.time;
        userWorksheet.getCell("J3").value = statistics.totalTowerMainTime.dayShift;
        userWorksheet.getCell("K3").value = statistics.totalTowerMainTime.nightShift;
        userWorksheet.getCell("L3").value = "";

        userWorksheet.getCell("H4").value = "塔台协调席";
        userWorksheet.getCell("I4").value = statistics.totalTowerSubTime.time;
        userWorksheet.getCell("J4").value = statistics.totalTowerSubTime.dayShift;
        userWorksheet.getCell("K4").value = statistics.totalTowerSubTime.nightShift;
        userWorksheet.getCell("L4").value = "";

        userWorksheet.getCell("H5").value = "放行席";
        userWorksheet.getCell("I5").value = statistics.totalDeliveryTime.time;
        userWorksheet.getCell("J5").value = statistics.totalDeliveryTime.dayShift;
        userWorksheet.getCell("K5").value = statistics.totalDeliveryTime.nightShift;
        userWorksheet.getCell("L5").value = "";

        userWorksheet.getCell("H6").value = "地面席";
        userWorksheet.getCell("I6").value = statistics.totalGroundTime.time;
        userWorksheet.getCell("J6").value = statistics.totalGroundTime.dayShift;
        userWorksheet.getCell("K6").value = statistics.totalGroundTime.nightShift;
        userWorksheet.getCell("L6").value = "";

        userWorksheet.getCell("H7").value = "综合协调席";
        userWorksheet.getCell("I7").value = statistics.totalZongheTime.time;
        userWorksheet.getCell("J7").value = statistics.totalZongheTime.dayShift;
        userWorksheet.getCell("K7").value = statistics.totalZongheTime.nightShift;
        userWorksheet.getCell("L7").value = "";

        userWorksheet.getCell("H8").value = "现场调度席";
        userWorksheet.getCell("I8").value = statistics.totalAOCTime.time;
        userWorksheet.getCell("J8").value = statistics.totalAOCTime.dayShift;
        userWorksheet.getCell("K8").value = statistics.totalAOCTime.nightShift;
        userWorksheet.getCell("L8").value = "";

        userWorksheet.getCell("H9").value = "见习";
        userWorksheet.getCell("I9").value = statistics.totalStudentTime.time;
        userWorksheet.getCell("J9").value = statistics.totalStudentTime.dayShift;
        userWorksheet.getCell("K9").value = statistics.totalStudentTime.nightShift;
        userWorksheet.getCell("L9").value = "";

        userWorksheet.getCell("H10").value = "教员";
        userWorksheet.getCell("I10").value = statistics.totalTeacherTime.time;
        userWorksheet.getCell("J10").value = statistics.totalTeacherTime.dayShift;
        userWorksheet.getCell("K10").value = statistics.totalTeacherTime.nightShift;
        userWorksheet.getCell("L10").value = "";

        userWorksheet.getCell("H11").value = "月度总小时统计";
        userWorksheet.mergeCells("H11:L11");
        // 2. 合并后设置样式（如居中）
        const mergedCell = userWorksheet.getCell("H11");
        mergedCell.alignment = { horizontal: "center", vertical: "middle" }; // 设置合并后单元格的样式，例如居中对齐:cite[5]
        mergedCell.font = { bold: true };

        userWorksheet.getCell("H12").value = "统计";
        userWorksheet.getCell("I12").value = "各席位总小时";
        userWorksheet.getCell("J12").value = "白班小时";
        userWorksheet.getCell("K12").value = "夜班小时(0000-0800)";
        userWorksheet.getCell("L12").value = "备注";

        userWorksheet.getCell("H13").value = "席位";
        userWorksheet.getCell("I13").value = statistics.totalPositionTime.time;
        userWorksheet.getCell("J13").value = statistics.totalPositionTime.dayShift;
        userWorksheet.getCell("K13").value = statistics.totalPositionTime.nightShift;
        userWorksheet.getCell("L13").value = "";

        userWorksheet.getCell("H14").value = "见习";
        userWorksheet.getCell("I14").value = statistics.totalStudentTime.time;
        userWorksheet.getCell("J14").value = statistics.totalStudentTime.dayShift;
        userWorksheet.getCell("K14").value = statistics.totalStudentTime.nightShift;
        userWorksheet.getCell("L14").value = "";

        userWorksheet.getCell("H15").value = "教员";
        userWorksheet.getCell("I15").value = statistics.totalTeacherTime.time;
        userWorksheet.getCell("J15").value = statistics.totalTeacherTime.dayShift;
        userWorksheet.getCell("K15").value = statistics.totalTeacherTime.nightShift;
        userWorksheet.getCell("L15").value = "";

        userWorksheet.getCell("H16").value = "现场调度";
        userWorksheet.getCell("I16").value = statistics.totalAOCTime.time;
        userWorksheet.getCell("J16").value = statistics.totalAOCTime.dayShift;
        userWorksheet.getCell("K16").value = statistics.totalAOCTime.nightShift;
        userWorksheet.getCell("L16").value = "";

        userWorksheet.getCell("H17").value = "月度总小时";
        userWorksheet.getCell("I17").value = statistics.totalTime.time;
        userWorksheet.getCell("J17").value = statistics.totalTime.dayShift;
        userWorksheet.getCell("K17").value = statistics.totalTime.nightShift;
        userWorksheet.getCell("L17").value = "";

        //#endregion 添加统计后的时间

        simpleDutyWorksheet.getCell(`A${i + 3}`).value = username;
        simpleDutyWorksheet.getCell(`B${i + 3}`).value = statistics.totalCommanderTime.dayShift;
        simpleDutyWorksheet.getCell(`C${i + 3}`).value = statistics.totalPositionTime.dayShift;
        simpleDutyWorksheet.getCell(`D${i + 3}`).value = statistics.totalTeacherTime.dayShift;
        simpleDutyWorksheet.getCell(`E${i + 3}`).value = statistics.totalStudentTime.dayShift;
        
        simpleDutyWorksheet.getCell(`F${i + 3}`).value = statistics.totalCommanderTime.nightShift;
        simpleDutyWorksheet.getCell(`G${i + 3}`).value = statistics.totalPositionTime.nightShift;
        simpleDutyWorksheet.getCell(`H${i + 3}`).value = statistics.totalTeacherTime.nightShift;
        simpleDutyWorksheet.getCell(`I${i + 3}`).value = statistics.totalStudentTime.nightShift;
        
        simpleDutyWorksheet.getCell(`J${i + 3}`).value = statistics.totalAOCTime.time;
        simpleDutyWorksheet.getCell(`K${i + 3}`).value = statistics.totalTime.time;
        simpleDutyWorksheet.getCell(`L${i + 3}`).value = nightsCount?.[username]?.[needMonth]?.["夜班段数"] || "";

        detailNightShiftWorksheet.getCell(`A${i + 2}`).value = username;
        detailNightShiftWorksheet.getCell(`B${i + 2}`).value =
            nightsCount?.[username]?.[needMonth]?.["1800-2100次数"] || "";
        detailNightShiftWorksheet.getCell(`C${i + 2}`).value =
            nightsCount?.[username]?.[needMonth]?.["2100-2400次数"] || "";
        detailNightShiftWorksheet.getCell(`D${i + 2}`).value =
            nightsCount?.[username]?.[needMonth]?.["+1天0000-0830次数"] || "";
        detailNightShiftWorksheet.getCell(`E${i + 2}`).value = `${
            (nightsCount?.[username]?.[needMonth]?.["夜班次数"] || "") &&
            `${nightsCount[username][needMonth]["夜班次数"]}晚/`
        }          ${
            (nightsCount?.[username]?.[needMonth]?.["夜班段数"] || "") &&
            `${nightsCount[username][needMonth]["夜班段数"]}次`
        }`;
        detailNightShiftWorksheet.getCell(`F${i + 1}`).value = "补贴元";
    }

    //! 添加 每个月的 小时数的 汇总的 sheet

    // const statisticsWorksheet = workbook.addWorksheet("当月小时统计");

    // 前两行 表头部分

    // 后面用循环的方式 添加 每个人
    // 姓名->A1 白天带班时间->B1 白天席位时间->C1 白天教员时间->D1 白天学员时间->E1
    //          夜班带班时间->F1 夜班席位时间->G1 夜班教员时间->H1 夜班学员时间->I1
    //          现场调度->J1 总时间->K1 夜班段数->L1

    // users.forEach(async (user, index) => {
    //     const statistics = await _statisticsService.getDurationStatisticsByUser(user.id, {
    //         startDate: startDate,
    //         startTime: startTime,
    //         endDate: endDate,
    //         endTime: endTime,
    //     });
    //     const nightsCount = await _statisticsService.getNightShiftCountStatisticsByUser(user.id, {
    //         startDate: startDate,
    //         startTime: startTime,
    //         endDate: endDate,
    //         endTime: endTime,
    //     });

    //     statisticsWorksheet.addRow([
    //         user.username,
    //         statics.totalCommanderTime,

    //         formateDecimal(statistics?.totalCommanderTime?.dayShift),
    //         formateDecimal(statistics?.totalPositionTime?.dayShift),
    //         formateDecimal(statistics?.totalTeacherTime?.dayShift),
    //         formateDecimal(statistics?.totalStudentTime?.dayShift),
    //         // * 夜晚 *
    //         formateDecimal(statistics?.totalCommanderTime?.nightShift),
    //         formateDecimal(statistics?.totalPositionTime?.nightShift),
    //         formateDecimal(statistics?.totalTeacherTime?.nightShift),
    //         formateDecimal(statistics?.totalStudentTime?.nightShift),
    //         // * 现场调度 *
    //         formateDecimal(statistics?.totalAOCTime?.time),
    //         // * 总时间 *

    //         formateDecimal(
    //             dutyStatics?.totalCommanderTime?.dayShift +
    //                 +dutyStatics?.totalPositionTime?.dayShift +
    //                 dutyStatics?.totalTeacherTime?.dayShift +
    //                 dutyStatics?.totalStudentTime?.dayShift +
    //                 dutyStatics?.totalCommanderTime?.nightShift +
    //                 dutyStatics?.totalPositionTime?.nightShift +
    //                 dutyStatics?.totalTeacherTime?.nightShift +
    //                 dutyStatics?.totalStudentTime?.nightShift +
    //                 dutyStatics?.totalAOCTime?.nightShift +
    //                 dutyStatics?.totalAOCTime?.dayShift
    //         ),
    //         // * 夜班段数 *
    //         (nightsCount?.[username]?.[monthly]?.["夜班段数"] || 0) > 0
    //             ? `${nightsCount?.[username]?.[monthly]?.["夜班段数"]}段`
    //             : "",
    //     ]);
    // });

    //! 添加统计格式的时间的sheet

    const filePath = path.join(__dirname, "..", "src", fileName);

    await workbook.xlsx.writeFile(filePath);

    // return filePath;
}

module.exports = { exportAsExcel };
