// 返回 需要的某列数据key 总记有多少种类
// 举个例子
// 一个数组，数组里面有object，object的某个Key有Value，但是Value的值就只有几种，现在统计出来种类的统计

function getKeyValueTypeCount(lookUpKey, arr) {
    let valueTypes = [];

    // 先确定传进来的是数组,过滤函数有效
    if (Array.isArray(arr)) {
        arr.forEach((i) => {
            //确定这个object 有 这个 key
            // console.log(typeof i);
            // console.log(lookUpKey);
            // x = JSON.parse(JSON.stringify(i));
            // console.log(x);

            if (i.hasOwnProperty(lookUpKey)) {
                // 用过滤函数淘汰去掉不满足条件的value
                let value = i[lookUpKey];
                // console.log(value);
                if (valueTypes.includes(value)) {
                } else {
                    valueTypes.push(value);
                }
            }
        });
    }
    return valueTypes;
}

function test(params) {
    console.log("这是一个测试");
}

module.exports = { getKeyValueTypeCount, test };

const _t = {
    序号: "1",
    "下单人  （必填）": "崔小荣",
    "下单时间  （必填）": "2021/10/12",
    "供应商名称 (必填）": "",
    "客户名称  （必填）": "宇恒电子",
    "客户订单号 \r\n （必填）": "CG20211012A-2",
    "客户是否已确认下单  （必填）": "是",
    "物料名称  （必填）": "变压器",
    "物料规格  （必填）": "EYH.CC220200333.0001",
    "采购订单数量  （采购必填）": "1000",
    "销售订单数量  \r\n（必填）": "1000",
    "采购单价\r\n（含税）\r\n (采购必填）": "2.35",
    "销售单价\r\n（含税）  （必填）": "¥5.3500",
    "采购总金额  （采购必填）": "¥2,350.00",
    "销售总金额 \r\n （必填）": "¥5,350.00",
    "商务主管意见 \r\n （必填）": "王娟娟\r\n21-10-12",
    "财务审核\r\n （必填）": "销售订单数量（1000）与采购订单数量（1000）一致",
    "吴总意见  \r\n（必填）": "吴莉  21-10-12",
    备注: "",
    利润: "¥3,000.0000",
    备注2: "",
    出货时间: "",
    "已出数量\r\n第1批": "",
    "已出数量\r\n第2批": "",
    "已出数量\r\n第3批": "",
    "已出数量\r\n共计": "0",
    待出数量: "1000",
};
