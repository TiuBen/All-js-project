//航班数据服务
// 模拟API请求
export const getFlights = () => {
  return new Promise((resolve) => {
    // 模拟API延迟
    setTimeout(() => {
      resolve({
        arrivalFlights: [
          { number: "CA123", departure: "08:00", arrival: "10:30" },
          { number: "MU456", departure: "09:10", arrival: "11:50" },
          { number: "Q37155", departure: "01:33", arrival: "01:44" }
        ],
        departureFlights: [
          { number: "ZH789", departure: "12:10", arrival: "14:30" },
          { number: "HU321", departure: "13:00", arrival: "15:40" },
          { number: "JK987", departure: "15:20", arrival: "18:10" }
        ]
      });
    }, 500);
  });
};