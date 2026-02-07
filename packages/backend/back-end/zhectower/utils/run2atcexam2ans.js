const {AtcLicenseExam}=require('./SqliteDb');


const sectionToDbTable = {
      航空气象: { tableName: "航空气象", count: 500 },
      空中导航: { tableName: "空中导航", count: 375 },
      "通信、导航和监视设备": { tableName: "通信导航和监视设备", count: 480 },
      飞行原理: { tableName: "飞行原理", count: 273 },
      航空器及应用: { tableName: "航空器及应用", count: 269 },
      航空情报: { tableName: "航空情报", count: 356 },
      空中交通管制一般规定: { tableName: "空中交通管制一般规定", count: 325 },
      空域: { tableName: "空域", count: 91 },
      人为因素: { tableName: "人为因素", count: 88 },
      通用航空: { tableName: "通用航空", count: 27 },
      机场管制: { tableName: "机场管制", count: 799 },
      进近管制: { tableName: "进近管制", count: 0 },
      进近雷达管制: { tableName: "进近雷达管制", count: 0 },
      区域管制: { tableName: "区域管制", count: 0 },
      区域雷达管制: { tableName: "区域雷达管制", count: 0 },
      飞行服务: { tableName: "飞行服务", count: 0 },
      "运行监控（地区)": { tableName: "运行监控地区", count: 0 },
      "运行监控（民航局）": { tableName: "运行监控民航局", count: 0 },
      "特殊技能ADS-B": { tableName: "特殊技能ADS_B", count: 0 },
      机坪管制: { tableName: "机坪管制", count: 0 },
      英语单选: { tableName: "英语单选", count: 1389 },
      英语阅读: { tableName: "英语阅读", count: 0 },
  };



//   function _matchAns(){
//       const selectOneTableRowsSql = `select * from 机场管制`;

//       AtcLicenseExam.all(selectOneTableRowsSql, function (err, rows) {
//           if (err) {
//               console.error(err);

//               return;
//           } else {
//               for (let y = 0; y < rows.length; y++) {
//                   const { qId } = rows[y];
//                   // console.log(qId);
//                   const selectAnsSql = `select * from right_answer where qId=${qId}`;
//                   AtcLicenseExam.all(selectAnsSql, function (err, ansRows) {
//                       if (err) {
//                           console.error(err);

//                           return;
//                       } else {
//                           // console.log(ansRows);
//                           const { rightAns } = ansRows[0];

//                           const updateSql = `update 机场管制 set rightAns='${rightAns}' where qId=${qId}`;
//                           console.log(updateSql);
//                           AtcLicenseExam.run(updateSql, function (err) {
//                               if (err) {
//                                   console.error(err);

//                                   return;
//                               } else {
//                                   console.log("update success");
//                               }
//                           });
//                       }
//                   });
//               }
//           }
//       });
//   }

//   module.exports={_matchAns}